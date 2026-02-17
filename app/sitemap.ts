import { siteUrl } from "@/lib/i18n";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/impressum`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/en/legal`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    }
  ];
}
