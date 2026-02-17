import { MotionSite } from "@/components/MotionSite";
import { getFilterTags, getFeaturedReel, getInstagramData, getSocialLinks } from "@/lib/instagram";
import { copyByLocale, siteUrl } from "@/lib/i18n";
import { getPersonSchema, getWebsiteSchema } from "@/lib/schema";
import type { Metadata } from "next";

const copy = copyByLocale.de;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  alternates: {
    canonical: "/",
    languages: {
      de: "/",
      en: "/en"
    }
  },
  keywords: ["Daphni Georgolidis", "Dark Humor", "Comedy", "Instagram Reels"],
  openGraph: {
    title: copy.ogTitle,
    description: copy.ogDescription,
    url: siteUrl,
    locale: "de_DE",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: copy.ogTitle }]
  },
  twitter: {
    card: "summary_large_image",
    title: copy.ogTitle,
    description: copy.ogDescription,
    images: ["/og-image.svg"]
  }
};

export default function GermanPage() {
  const data = getInstagramData();
  const featuredReel = getFeaturedReel();
  const filterTags = getFilterTags();
  const socialLinks = getSocialLinks();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPersonSchema("de")) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebsiteSchema("de")) }}
      />
      <MotionSite
        locale="de"
        data={data}
        featuredReel={featuredReel}
        filterTags={filterTags}
        socialLinks={socialLinks}
      />
    </>
  );
}
