import { getInstagramData } from "@/lib/instagram";
import { copyByLocale, siteUrl, type Locale } from "@/lib/i18n";

const localePath = (locale: Locale) => (locale === "de" ? "" : "/en");

export const getPersonSchema = (locale: Locale) => {
  const copy = copyByLocale[locale];
  const data = getInstagramData();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Daphni Georgolidis",
    alternateName: data.profile.username ? `@${data.profile.username}` : undefined,
    jobTitle: locale === "de" ? "Comedian" : "Comedian",
    description: copy.description,
    url: `${siteUrl}${localePath(locale) || "/"}`,
    sameAs: [`https://www.instagram.com/${data.profile.username}/`],
    interactionStatistic:
      typeof data.profile.followers === "number"
        ? {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/FollowAction",
            userInteractionCount: data.profile.followers
          }
        : undefined
  };
};

export const getWebsiteSchema = (locale: Locale) => {
  const copy = copyByLocale[locale];

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: copy.title,
    url: `${siteUrl}${localePath(locale) || "/"}`,
    inLanguage: copy.htmlLang
  };
};
