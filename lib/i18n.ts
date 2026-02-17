export type Locale = "de" | "en";

export const siteUrl = "https://daphni-georgolidis.netlify.app";

export const portraitUrl =
  "https://imgproxy.filmmakers.eu/0TCR-cp50phRRZcZoVCniSvBjxkIsJkWSU6othubd20/rt:fit/w:3840/h:2160/czM6Ly9maWxtbWFr/ZXJzLWV1LXdlc3Qt/MS9wcm9kdWN0aW9u/LzIwOWUyODE5LWNjODUtNDhkOS05MTE1LTIyZTc1N2QyYjU0Zi5qcGc.avif";

type LocaleCopy = {
  lang: Locale;
  htmlLang: string;
  dirLabel: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  nav: {
    about: string;
    media: string;
    contact: string;
    languageSwitch: string;
  };
  hero: {
    kicker: string;
    headlineA: string;
    headlineB: string;
    intro: string;
    primaryCta: string;
    secondaryCta: string;
    reelHint: string;
  };
  banners: string[];
  about: {
    title: string;
    textA: string;
    textB: string;
    textC: string;
  };
  media: {
    title: string;
    intro: string;
    filterAll: string;
    fallback: string;
    openInstagram: string;
    playClip: string;
    reelFallback: string;
    featured: string;
  };
  contact: {
    title: string;
    intro: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    submitLabel: string;
    legalPlaceholder: string;
  };
  footer: {
    rights: string;
    legal: string;
  };
};

export const copyByLocale: Record<Locale, LocaleCopy> = {
  de: {
    lang: "de",
    htmlLang: "de-DE",
    dirLabel: "DE",
    title: "Daphni Georgolidis | Dark-Humor-Comedy & Reels",
    description:
      "Offizielle Seite von Daphni Georgolidis: darke Pointen, Live-Energie, Reels und Booking-Kontakt.",
    ogTitle: "Daphni Georgolidis | Bühne, Reels, Dark Humor",
    ogDescription:
      "Motion-led Portfolio mit Live-Momenten, ausgewählten Reels und Booking-Bereich für Veranstalter:innen.",
    nav: {
      about: "Über Daphni",
      media: "Media",
      contact: "Kontakt",
      languageSwitch: "EN"
    },
    hero: {
      kicker: "@daphnigg",
      headlineA: "DARK",
      headlineB: "HUMOR",
      intro:
        "Daphni Georgolidis spielt die Pointe dorthin, wo es kurz still wird: scharf, selbstironisch und ohne Sicherheitsabstand.",
      primaryCta: "Featured Reel",
      secondaryCta: "Zu den Clips",
      reelHint: "Basierend auf lokal extrahierten Instagram-Inhalten"
    },
    banners: [
      "DARK HUMOR",
      "LIVE",
      "REELS",
      "ON TOUR",
      "UNFILTERED",
      "CROWD WORK",
      "SHARP",
      "DAPHNI"
    ],
    about: {
      title: "Mutig im Ton, präzise im Timing.",
      textA:
        "Daphni steht für Comedy mit Risiko: klare Beobachtung, trockene Haltung und Punchlines, die nicht nach Erlaubnis fragen.",
      textB:
        "Ihr öffentlicher Content zeigt eine deutliche Bühnenenergie: schneller Aufbau, direkter Treffer, kontrollierter Kontrollverlust.",
      textC:
        "Diese Seite übersetzt genau das in Interaktion: kinetische Typografie, schiefe Rhythmen und Spannung bis zum nächsten Lacher."
    },
    media: {
      title: "Instagram-Media",
      intro:
        "Alle Karten stammen aus dem lokalen Datensatz. Captions sind neu formuliert und werden nicht 1:1 übernommen.",
      filterAll: "Alle",
      fallback:
        "Noch keine Posts lokal verfügbar. Bitte `npm run fetch:instagram` mit Session/Cookies ausführen.",
      openInstagram: "Auf Instagram öffnen",
      playClip: "Clip abspielen",
      reelFallback: "Direkt zum Reel",
      featured: "Featured Reel"
    },
    contact: {
      title: "Booking & Kontakt",
      intro:
        "Anfragen von Veranstalter:innen, Redaktionen und Partner:innen. Impressum-Daten folgen separat.",
      nameLabel: "Name",
      emailLabel: "E-Mail",
      messageLabel: "Nachricht",
      submitLabel: "Anfrage senden",
      legalPlaceholder: "Impressum-Platzhalter: Rechtsdaten werden ergänzt."
    },
    footer: {
      rights: "Alle Rechte vorbehalten.",
      legal: "Impressum"
    }
  },
  en: {
    lang: "en",
    htmlLang: "en-US",
    dirLabel: "EN",
    title: "Daphni Georgolidis | Dark Humor Comedy & Reels",
    description:
      "Official site for Daphni Georgolidis: dark humor voice, live energy, reels, and booking contact.",
    ogTitle: "Daphni Georgolidis | Stage, Reels, Dark Humor",
    ogDescription:
      "Motion-led portfolio with featured reels, media grid, and booking section for promoters and media teams.",
    nav: {
      about: "About",
      media: "Media",
      contact: "Contact",
      languageSwitch: "DE"
    },
    hero: {
      kicker: "@daphnigg",
      headlineA: "DARK",
      headlineB: "HUMOR",
      intro:
        "Daphni Georgolidis lands jokes exactly where people flinch: self-aware edge, fearless pacing, and zero soft exits.",
      primaryCta: "Featured Reel",
      secondaryCta: "Browse clips",
      reelHint: "Built from locally extracted Instagram material"
    },
    banners: [
      "DARK HUMOR",
      "LIVE",
      "REELS",
      "ON TOUR",
      "UNFILTERED",
      "CROWD WORK",
      "SHARP",
      "DAPHNI"
    ],
    about: {
      title: "Fearless tone, cleaner timing.",
      textA:
        "Daphni's voice leans into risk: direct observations, dry confidence, and punchlines that hit before the room can brace.",
      textB:
        "Her public output signals a defined stage posture: quick setup, sharp payoff, and a playful but unapologetic edge.",
      textC:
        "This site translates that pulse into motion: kinetic type, slanted momentum, and controlled tension across every section."
    },
    media: {
      title: "Instagram Media",
      intro:
        "Every card is rendered from the local extraction dataset. Captions are rewritten and never copied verbatim.",
      filterAll: "All",
      fallback:
        "No local posts yet. Run `npm run fetch:instagram` with session/cookies to populate the grid.",
      openInstagram: "Open on Instagram",
      playClip: "Play clip",
      reelFallback: "Open reel",
      featured: "Featured Reel"
    },
    contact: {
      title: "Booking & Contact",
      intro:
        "For promoters, media teams, and partners. Legal notice details will be added separately.",
      nameLabel: "Name",
      emailLabel: "Email",
      messageLabel: "Message",
      submitLabel: "Send request",
      legalPlaceholder: "Legal notice placeholder: details will be provided later."
    },
    footer: {
      rights: "All rights reserved.",
      legal: "Legal"
    }
  }
};
