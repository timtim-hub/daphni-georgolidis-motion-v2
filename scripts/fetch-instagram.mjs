#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const TARGET_URL = process.env.IG_PROFILE_URL ?? "https://www.instagram.com/daphnigg/";
const USERNAME =
  process.env.IG_USERNAME ??
  (() => {
    const parsed = new URL(TARGET_URL);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[0] || "daphnigg";
  })();

const OUTPUT_PATH = path.resolve(process.cwd(), "data", "instagram.json");
const nowIso = new Date().toISOString();

function runCommand(bin, args) {
  return execFileSync(bin, args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 200,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function getCookieArgs() {
  const cookieArgs = [];
  const cookieFile = process.env.IG_COOKIES_FILE;

  if (cookieFile) {
    if (!existsSync(cookieFile)) {
      throw new Error(`IG_COOKIES_FILE not found: ${cookieFile}`);
    }
    cookieArgs.push("--cookies", cookieFile);
    return { args: cookieArgs, cleanup: () => {} };
  }

  const sessionId = process.env.IG_SESSIONID;
  if (!sessionId) {
    return { args: cookieArgs, cleanup: () => {} };
  }

  const tempDir = mkdtempSync(path.join(tmpdir(), "ig-cookies-"));
  const tempCookiePath = path.join(tempDir, "cookies.txt");
  const dsUserId = process.env.IG_DS_USER_ID ?? "";

  const lines = [
    "# Netscape HTTP Cookie File",
    `.instagram.com\tTRUE\t/\tTRUE\t2147483647\tsessionid\t${sessionId}`
  ];

  if (dsUserId) {
    lines.push(`.instagram.com\tTRUE\t/\tTRUE\t2147483647\tds_user_id\t${dsUserId}`);
  }

  writeFileSync(tempCookiePath, `${lines.join("\n")}\n`, "utf8");
  cookieArgs.push("--cookies", tempCookiePath);

  return {
    args: cookieArgs,
    cleanup: () => {
      rmSync(tempDir, { recursive: true, force: true });
    }
  };
}

function runYtDlp(args) {
  const candidates = [
    () => runCommand(process.env.YT_DLP_BIN || "yt-dlp", args),
    () => runCommand("python3", ["-m", "yt_dlp", ...args])
  ];

  let lastError;

  for (const execFn of candidates) {
    try {
      return execFn();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function runJsonDump(url, extraArgs = []) {
  const output = runYtDlp([
    "--no-warnings",
    "--skip-download",
    "--dump-single-json",
    ...extraArgs,
    url
  ]);

  return JSON.parse(output);
}

function cleanSourceText(value) {
  return (value || "")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[@#][\w.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chooseTopic(caption) {
  const text = caption.toLowerCase();

  const topics = [
    ["live", /\b(live|show|tour|buhne|bühne|stage|crowd|applaus|set)\b/],
    ["relationships", /\b(liebe|beziehung|dating|single|paar|toxic|romance)\b/],
    ["daily-chaos", /\b(alltag|chaos|arbeit|job|montag|familie|wohnung|u-bahn|bahn)\b/],
    ["self-own", /\b(selbst|self|peinlich|awkward|ego|therapy|therapie)\b/],
    ["dark-humor", /\b(dark|dunkel|morbid|black humor|schwarz)\b/],
    ["social-commentary", /\b(politik|news|gesellschaft|trend|internet|algorithm)\b/]
  ];

  for (const [topic, matcher] of topics) {
    if (matcher.test(text)) {
      return topic;
    }
  }

  return "dark-humor";
}

function getTags(caption, type) {
  const set = new Set();
  const text = caption.toLowerCase();

  if (type === "reel") set.add("reel");
  if (type === "video") set.add("video");
  if (type === "image") set.add("post");

  set.add(chooseTopic(caption));

  if (/\b(live|show|tour|stage|crowd|applaus|buhne|bühne)\b/.test(text)) set.add("live");
  if (/\b(berlin|hamburg|koln|köln|munchen|münchen|wien|zurich|zürich|deutschland)\b/.test(text)) {
    set.add("on-tour");
  }

  if (set.size === 1) set.add("voice");

  return Array.from(set);
}

function rewriteCaption(caption, type, tags) {
  const normalized = cleanSourceText(caption);
  const topic = tags.find((tag) => !["reel", "video", "post"].includes(tag)) || "dark-humor";
  const typeDe = type === "reel" ? "Reel" : type === "video" ? "Video-Clip" : "Post";
  const typeEn = type === "reel" ? "Reel" : type === "video" ? "Video clip" : "Post";

  const topicDeMap = {
    "dark-humor": "dunklen Alltagsmomenten",
    "relationships": "Beziehungsdynamik",
    "daily-chaos": "Alltagschaos",
    "self-own": "Selbstironie",
    "social-commentary": "gesellschaftlichem Frust",
    "live": "Bühnenenergie",
    "on-tour": "Tourmomenten",
    "voice": "kompromissloser Bühnenstimme"
  };

  const topicEnMap = {
    "dark-humor": "dark everyday moments",
    "relationships": "relationship dynamics",
    "daily-chaos": "daily chaos",
    "self-own": "self-own humor",
    "social-commentary": "social frustration",
    "live": "live-stage energy",
    "on-tour": "tour moments",
    "voice": "an unfiltered stage voice"
  };

  const seed = normalized
    .split(" ")
    .filter((word) => word.length > 4)
    .slice(0, 2)
    .join(" ");

  const sourceHint = seed ? ` Impuls: ${seed}.` : "";

  return {
    de: `${typeDe} über ${topicDeMap[topic] || "dunklen Pointen"}: trockenes Timing, selbstbewusste Kante, klarer Punch.${sourceHint}`,
    en: `${typeEn} around ${topicEnMap[topic] || "dark punchlines"}: dry timing, self-aware edge, clean punch delivery.${sourceHint}`
  };
}

function pickLargestThumb(thumbnails, fallback) {
  if (!Array.isArray(thumbnails) || thumbnails.length === 0) return fallback ?? null;

  const best = [...thumbnails].sort((a, b) => {
    const areaA = (a.width || 0) * (a.height || 0);
    const areaB = (b.width || 0) * (b.height || 0);
    return areaB - areaA;
  })[0];

  return best?.url ?? fallback ?? null;
}

async function fetchProfileApi(username) {
  try {
    const response = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          "x-ig-app-id": "936619743392459",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload?.data?.user ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const { args: cookieArgs, cleanup } = getCookieArgs();

  try {
    const playlistDump = runJsonDump(TARGET_URL, [
      "--flat-playlist",
      "--playlist-end",
      process.env.IG_PLAYLIST_END || "500",
      ...cookieArgs
    ]);

    const profileApi = await fetchProfileApi(USERNAME);

    const entries = Array.isArray(playlistDump.entries) ? playlistDump.entries : [];

    const candidateUrls = entries
      .map((entry) => {
        if (entry?.url && typeof entry.url === "string" && entry.url.startsWith("http")) {
          return entry.url;
        }
        if (entry?.webpage_url) {
          return entry.webpage_url;
        }
        if (entry?.id) {
          return `https://www.instagram.com/p/${entry.id}/`;
        }
        return null;
      })
      .filter(Boolean);

    const uniqueUrls = Array.from(new Set(candidateUrls));

    const posts = [];

    for (const [index, url] of uniqueUrls.entries()) {
      try {
        const postDump = runJsonDump(url, [...cookieArgs]);

        const permalink = postDump.webpage_url || url;
        const id = String(postDump.id || postDump.display_id || permalink);
        const captionSource = postDump.description || postDump.title || "";
        const isVideo =
          permalink.includes("/reel/") ||
          permalink.includes("/tv/") ||
          (postDump.vcodec && postDump.vcodec !== "none") ||
          postDump.ext === "mp4";
        const type = permalink.includes("/reel/") ? "reel" : isVideo ? "video" : "image";
        const timestamp = postDump.timestamp
          ? new Date(postDump.timestamp * 1000).toISOString()
          : null;
        const tags = getTags(captionSource, type);
        const rewritten = rewriteCaption(captionSource, type, tags);

        posts.push({
          id,
          shortcode: postDump.display_id || postDump.id || null,
          type,
          timestamp,
          captionSource,
          permalink,
          thumbnailUrl: pickLargestThumb(postDump.thumbnails, postDump.thumbnail),
          videoUrl: isVideo && typeof postDump.url === "string" ? postDump.url : null,
          duration: typeof postDump.duration === "number" ? postDump.duration : null,
          stats: {
            likes: typeof postDump.like_count === "number" ? postDump.like_count : null,
            comments: typeof postDump.comment_count === "number" ? postDump.comment_count : null,
            views: typeof postDump.view_count === "number" ? postDump.view_count : null
          },
          rewritten,
          tags
        });

        process.stdout.write(`Fetched post ${index + 1}/${uniqueUrls.length}\r`);
      } catch (error) {
        process.stderr.write(`\nSkipping ${url} (${error.message})\n`);
      }
    }

    const sortedPosts = posts.sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return a.timestamp < b.timestamp ? 1 : -1;
    });

    const payload = {
      meta: {
        source: "yt-dlp (GitHub: yt-dlp/yt-dlp)",
        profileUrl: TARGET_URL,
        fetchedAt: nowIso,
        postCount: sortedPosts.length
      },
      profile: {
        username: profileApi?.username || playlistDump.uploader_id || USERNAME,
        displayName: profileApi?.full_name || playlistDump.uploader || USERNAME,
        bio: profileApi?.biography || playlistDump.description || "",
        followers:
          typeof profileApi?.edge_followed_by?.count === "number"
            ? profileApi.edge_followed_by.count
            : typeof playlistDump.channel_follower_count === "number"
              ? playlistDump.channel_follower_count
              : null,
        following:
          typeof profileApi?.edge_follow?.count === "number" ? profileApi.edge_follow.count : null,
        postCount:
          typeof profileApi?.edge_owner_to_timeline_media?.count === "number"
            ? profileApi.edge_owner_to_timeline_media.count
            : sortedPosts.length,
        profileImage:
          profileApi?.profile_pic_url_hd || profileApi?.profile_pic_url || playlistDump.thumbnail || null,
        externalUrl: profileApi?.external_url || null
      },
      posts: sortedPosts
    };

    mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

    console.log(`\nSaved ${sortedPosts.length} posts to ${OUTPUT_PATH}`);
  } finally {
    cleanup();
  }
}

main().catch((error) => {
  console.error("Instagram fetch failed:", error.message);
  process.exitCode = 1;
});
