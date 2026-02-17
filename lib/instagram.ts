import rawData from "@/data/instagram.json";

export type InstagramPost = {
  id: string;
  shortcode: string | null;
  type: "reel" | "video" | "image";
  timestamp: string | null;
  captionSource: string;
  permalink: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  duration: number | null;
  stats: {
    likes: number | null;
    comments: number | null;
    views: number | null;
  };
  rewritten: {
    de: string;
    en: string;
  };
  tags: string[];
};

export type InstagramData = {
  meta: {
    source: string;
    profileUrl: string;
    fetchedAt: string;
    postCount: number;
    note?: string;
  };
  profile: {
    username: string;
    displayName: string;
    bio: string;
    followers: number | null;
    following: number | null;
    postCount: number | null;
    profileImage: string | null;
    externalUrl: string | null;
  };
  posts: InstagramPost[];
};

const instagramData = rawData as InstagramData;

export const getInstagramData = () => instagramData;

const getScore = (post: InstagramPost) => {
  const views = post.stats.views ?? 0;
  const likes = post.stats.likes ?? 0;
  const comments = post.stats.comments ?? 0;
  return views * 1 + likes * 3 + comments * 6;
};

export const getFeaturedReel = () => {
  const data = getInstagramData();
  const reels = data.posts.filter((post) => post.type === "reel" || post.type === "video");

  if (reels.length === 0) {
    return null;
  }

  return [...reels].sort((a, b) => {
    const scoreDiff = getScore(b) - getScore(a);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    if (a.timestamp && b.timestamp) {
      return a.timestamp < b.timestamp ? 1 : -1;
    }

    return 0;
  })[0];
};

export const getFilterTags = () => {
  const data = getInstagramData();
  const tags = new Set<string>();

  data.posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
};

export const getSocialLinks = () => {
  const data = getInstagramData();
  const links = [{ label: "Instagram", url: `https://www.instagram.com/${data.profile.username}/` }];

  if (data.profile.externalUrl) {
    links.push({ label: "Official Link", url: data.profile.externalUrl });
  }

  return links;
};
