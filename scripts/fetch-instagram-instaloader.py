#!/usr/bin/env python3
"""
Fetch publicly available Instagram profile + posts using Instaloader (GitHub: instaloader/instaloader).

Outputs:
  - data/instagram.json (site-consumable, rewritten copy only)
  - public/instagram/* (downloaded media: posters + videos when available)

Auth:
  - Optional. Recommended for reliability.
  - Provide IG_USERNAME + IG_PASSWORD, OR IG_USERNAME + IG_SESSIONFILE.
  - IG_SESSIONFILE should point to an Instaloader sessionfile (created via: instaloader --login USER).
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


try:
  import instaloader  # type: ignore
except Exception as exc:  # pragma: no cover
  print("ERROR: instaloader is not installed. Install with: pip install instaloader", file=sys.stderr)
  raise


WORKDIR = Path(__file__).resolve().parents[1]
DATA_DIR = WORKDIR / "data"
PUBLIC_DIR = WORKDIR / "public"
PUBLIC_IG_DIR = PUBLIC_DIR / "instagram"
OUTPUT_JSON = DATA_DIR / "instagram.json"


def _slugify(value: str) -> str:
  value = value.strip().lower()
  value = re.sub(r"[^a-z0-9]+", "-", value)
  return value.strip("-") or "post"


def _clean_caption(value: Optional[str]) -> str:
  if not value:
    return ""
  # Remove URLs; keep hashtags separately for tags.
  value = re.sub(r"https?://\\S+", " ", value)
  value = re.sub(r"\\s+", " ", value).strip()
  return value


def _hashtags(value: str) -> List[str]:
  # Instagram hashtags: #word (unicode allowed, but we normalize to ascii-ish slug).
  tags = re.findall(r"#([\\w\\.]+)", value)
  out: List[str] = []
  for t in tags:
    out.append(_slugify(t.replace(".", "-")))
  # De-dupe preserving order.
  seen = set()
  deduped: List[str] = []
  for t in out:
    if t in seen:
      continue
    seen.add(t)
    deduped.append(t)
  return deduped


def _topic_tags(caption: str, media_type: str) -> List[str]:
  text = caption.lower()
  tags: List[str] = []

  if media_type in ("reel", "video"):
    tags.append("reel" if media_type == "reel" else "video")
  else:
    tags.append("post")

  # Minimal deterministic tagging based on keywords only (no caption reuse in rewritten copy).
  if re.search(r"\\b(live|show|tour|bühne|buhne|stage|crowd)\\b", text):
    tags.append("live")
  if re.search(r"\\b(berlin|hamburg|köln|koln|münchen|munchen|wien|zürich|zurich)\\b", text):
    tags.append("on-tour")
  if re.search(r"\\b(dark|dunkel|morbid|black\\s+humor|schwarz)\\b", text):
    tags.append("dark-humor")
  if re.search(r"\\b(date|dating|beziehung|toxic|single|paar)\\b", text):
    tags.append("relationships")
  if re.search(r"\\b(alltag|chaos|job|arbeit|bahn|u-bahn|ubahn|montag)\\b", text):
    tags.append("daily-chaos")
  if re.search(r"\\b(selbst|self|awkward|peinlich|therapy|therapie)\\b", text):
    tags.append("self-own")
  if re.search(r"\\b(politik|news|gesellschaft|internet|algorithm(us)?)\\b", text):
    tags.append("social-commentary")

  # Ensure we always have a tone tag.
  if not any(t in tags for t in ("dark-humor", "relationships", "daily-chaos", "self-own", "social-commentary")):
    tags.append("dark-humor")

  # De-dupe preserving order.
  seen = set()
  deduped: List[str] = []
  for t in tags:
    if t in seen:
      continue
    seen.add(t)
    deduped.append(t)
  return deduped


def _rewrite(tags: List[str], media_type: str) -> Dict[str, str]:
  topic = next((t for t in tags if t not in ("reel", "video", "post", "live", "on-tour")), "dark-humor")
  type_de = "Reel" if media_type == "reel" else "Video-Clip" if media_type == "video" else "Post"
  type_en = "Reel" if media_type == "reel" else "Video clip" if media_type == "video" else "Post"

  topic_de = {
    "dark-humor": "dunkle Alltagskanten",
    "relationships": "Beziehungsdynamik",
    "daily-chaos": "Alltagschaos",
    "self-own": "Selbstironie",
    "social-commentary": "gesellschaftliche Reibung",
  }.get(topic, "dunkle Pointen")

  topic_en = {
    "dark-humor": "dark everyday edges",
    "relationships": "relationship dynamics",
    "daily-chaos": "daily chaos",
    "self-own": "self-own humor",
    "social-commentary": "social friction",
  }.get(topic, "dark punchlines")

  live_hint_de = " Live-Vibe, direkt ins Timing." if "live" in tags else ""
  live_hint_en = " Live vibe, straight into timing." if "live" in tags else ""

  return {
    "de": f"{type_de} mit Fokus auf {topic_de}: trocken, scharf und ohne Sicherheitsnetz.{live_hint_de}",
    "en": f"{type_en} focused on {topic_en}: dry, sharp, and without a safety rail.{live_hint_en}",
  }


def _download(url: str, dest: Path) -> None:
  dest.parent.mkdir(parents=True, exist_ok=True)
  if dest.exists() and dest.stat().st_size > 0:
    return

  # Basic retry. Instagram/CDN can be flaky; auth handled by Instaloader session for metadata, but file URLs are public.
  for attempt in range(3):
    try:
      req = urllib.request.Request(
        url,
        headers={
          # Avoid being blocked by overly strict CDNs; keep minimal.
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        },
      )
      with urllib.request.urlopen(req, timeout=45) as resp:
        data = resp.read()
      dest.write_bytes(data)
      return
    except Exception:
      if attempt == 2:
        raise
      time.sleep(1.3 * (attempt + 1))


def _ext_from_url(url: str, fallback: str) -> str:
  # Keep it simple: trust URL extension if present.
  lower = url.lower().split("?")[0]
  for ext in (".mp4", ".jpg", ".jpeg", ".png", ".webp", ".avif"):
    if lower.endswith(ext):
      return ext.lstrip(".")
  return fallback


def _instaloader_ctx() -> "instaloader.Instaloader":
  loader = instaloader.Instaloader(
    download_pictures=False,
    download_videos=False,
    download_video_thumbnails=False,
    download_geotags=False,
    download_comments=False,
    save_metadata=False,
    compress_json=False,
    quiet=True,
  )

  username = os.environ.get("IG_USERNAME")
  password = os.environ.get("IG_PASSWORD")
  sessionfile = os.environ.get("IG_SESSIONFILE")

  if username and sessionfile:
    loader.load_session_from_file(username, sessionfile)
  elif username and password:
    loader.login(username, password)

  return loader


def _auth_help(target: str) -> str:
  return (
    "Instagram blocked unauthenticated scraping (often HTTP 403).\n"
    "Fix: use an Instaloader session file (recommended) and rerun.\n\n"
    "1) Create a session file (interactive, one-time):\n"
    f"   instaloader --login YOUR_IG_USERNAME --sessionfile ./data/ig-session-{target}\n"
    "2) Run fetch with env vars:\n"
    f"   IG_PROFILE={target} IG_USERNAME=YOUR_IG_USERNAME IG_SESSIONFILE=./data/ig-session-{target} npm run fetch:instagram\n\n"
    "Notes:\n"
    "- Do NOT commit the sessionfile.\n"
    "- If you must use a password, set IG_PASSWORD via env (not recommended).\n"
  )


def main() -> int:
  target = os.environ.get("IG_PROFILE", "daphnigg").strip().lstrip("@")
  profile_url = f"https://www.instagram.com/{target}/"
  download_videos_env = os.environ.get("IG_DOWNLOAD_VIDEOS", "0").strip()
  download_videos = download_videos_env in ("1", "true", "TRUE", "yes", "YES")
  max_video_dl_env = os.environ.get("IG_MAX_VIDEO_DOWNLOADS", "").strip()
  max_video_downloads: Optional[int]
  if max_video_dl_env == "":
    max_video_downloads = 8 if download_videos else 0
  else:
    max_video_downloads = int(max_video_dl_env) if max_video_dl_env.isdigit() else None  # None => unlimited

  DATA_DIR.mkdir(parents=True, exist_ok=True)
  PUBLIC_IG_DIR.mkdir(parents=True, exist_ok=True)

  loader = _instaloader_ctx()
  try:
    profile = instaloader.Profile.from_username(loader.context, target)
  except Exception as exc:
    msg = str(exc)
    if "403" in msg or "Forbidden" in msg or "login" in msg.lower():
      print(_auth_help(target), file=sys.stderr)
    raise

  # Profile data
  profile_data = {
    "username": profile.username,
    "displayName": profile.full_name or profile.username,
    "bio": profile.biography or "",
    "followers": int(profile.followers) if profile.followers is not None else None,
    "following": int(profile.followees) if profile.followees is not None else None,
    "postCount": int(profile.mediacount) if profile.mediacount is not None else None,
    "profileImage": str(profile.profile_pic_url) if getattr(profile, "profile_pic_url", None) else None,
    "externalUrl": profile.external_url or None,
  }

  posts_out: List[Dict[str, Any]] = []
  count = 0
  downloaded_videos = 0
  max_posts_env = os.environ.get("IG_MAX_POSTS", "").strip()
  max_posts = int(max_posts_env) if max_posts_env.isdigit() else None

  try:
    for post in profile.get_posts():
      count += 1
      if max_posts is not None and count > max_posts:
        break

      shortcode = post.shortcode
      permalink = f"https://www.instagram.com/p/{shortcode}/"
      dt = post.date_utc.replace(tzinfo=timezone.utc) if post.date_utc else None
      timestamp = dt.isoformat().replace("+00:00", "Z") if dt else None
      caption = _clean_caption(post.caption)
      media_type = "video" if post.is_video else "image"

      # Heuristic: if it’s video and looks like a reel permalink, treat as "reel".
      # Instaloader doesn't always expose productType consistently; keep deterministic.
      if post.is_video:
        media_type = "reel"

      tags = _topic_tags(caption, media_type)
      tags += _hashtags(post.caption or "")
      # Dedupe again
      seen = set()
      tags = [t for t in tags if not (t in seen or seen.add(t))]

      rewritten = _rewrite(tags, media_type)

      # Download poster (image URL) always; download video when available.
      thumb_url = str(post.url) if getattr(post, "url", None) else None
      video_url = str(post.video_url) if getattr(post, "video_url", None) else None

      local_thumb = None
      local_video = None
      try:
        if thumb_url:
          ext = _ext_from_url(thumb_url, "jpg")
          fname = f"{shortcode}-poster.{ext}"
          dest = PUBLIC_IG_DIR / fname
          _download(thumb_url, dest)
          local_thumb = f"/instagram/{fname}"
      except Exception:
        # Keep URL fallback if download fails.
        local_thumb = thumb_url

      try:
        can_download_video = bool(video_url and download_videos)
        if max_video_downloads is not None and downloaded_videos >= max_video_downloads:
          can_download_video = False

        if video_url and can_download_video:
          ext = _ext_from_url(video_url, "mp4")
          fname = f"{shortcode}-video.{ext}"
          dest = PUBLIC_IG_DIR / fname
          _download(video_url, dest)
          local_video = f"/instagram/{fname}"
          downloaded_videos += 1
        else:
          # Keep remote URL (may expire) unless explicitly asked to cache videos locally.
          local_video = video_url
      except Exception:
        local_video = video_url

      likes_raw = getattr(post, "likes", None)
      comments_raw = getattr(post, "comments", None)
      views_raw = getattr(post, "video_view_count", None)

      # Some endpoints can return sentinel negatives when counts are hidden/unavailable.
      likes = int(likes_raw) if isinstance(likes_raw, int) and likes_raw > 0 else None
      comments = int(comments_raw) if isinstance(comments_raw, int) and comments_raw > 0 else None
      views = int(views_raw) if isinstance(views_raw, int) and views_raw > 0 else None

      stats = {"likes": likes, "comments": comments, "views": views}

      posts_out.append(
        {
          "id": shortcode,
          "shortcode": shortcode,
          "type": media_type,
          "timestamp": timestamp,
          "captionSource": caption,
          "permalink": permalink,
          "thumbnailUrl": local_thumb,
          "videoUrl": local_video,
          "duration": None,
          "stats": stats,
          "rewritten": rewritten,
          "tags": tags,
        }
      )

      # Small throttle: reduces rate-limit / 403 risk without noticeably slowing small runs.
      time.sleep(0.22)
  except Exception as exc:
    msg = str(exc)
    if "403" in msg or "Forbidden" in msg or "login" in msg.lower():
      print(_auth_help(target), file=sys.stderr)
    raise

  out = {
    "meta": {
      "source": "instaloader (GitHub: instaloader/instaloader)",
      "profileUrl": profile_url,
      "fetchedAt": datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z"),
      "postCount": len(posts_out),
    },
    "profile": profile_data,
    "posts": posts_out,
  }

  OUTPUT_JSON.write_text(json.dumps(out, ensure_ascii=True, indent=2), encoding="utf-8")
  print(f"Wrote {OUTPUT_JSON} with {len(posts_out)} posts.")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
