"use client";

import { SlantedMarquee } from "@/components/SlantedMarquee";
import type { InstagramData, InstagramPost } from "@/lib/instagram";
import { copyByLocale, type Locale, portraitUrl } from "@/lib/i18n";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

type SocialLink = {
  label: string;
  url: string;
};

type MotionSiteProps = {
  locale: Locale;
  data: InstagramData;
  featuredReel: InstagramPost | null;
  filterTags: string[];
  socialLinks: SocialLink[];
};

const tagLabelMap: Record<string, { de: string; en: string }> = {
  reel: { de: "Reel", en: "Reel" },
  video: { de: "Video", en: "Video" },
  post: { de: "Post", en: "Post" },
  "dark-humor": { de: "Dark Humor", en: "Dark Humor" },
  relationships: { de: "Beziehungen", en: "Relationships" },
  "daily-chaos": { de: "Alltagschaos", en: "Daily Chaos" },
  "self-own": { de: "Selbstironie", en: "Self-Aware" },
  "social-commentary": { de: "Kommentar", en: "Commentary" },
  live: { de: "Live", en: "Live" },
  "on-tour": { de: "On Tour", en: "On Tour" },
  voice: { de: "Stimme", en: "Voice" }
};

const formatNumber = (value: number | null) => {
  if (value === null) return "-";
  return new Intl.NumberFormat("de-DE").format(value);
};

const formatDate = (value: string | null, locale: Locale) => {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
};

const labelForTag = (tag: string, locale: Locale) => tagLabelMap[tag]?.[locale] ?? tag;

type MagneticButtonProps = {
  reduceMotion: boolean | null;
  children: ReactNode;
  className: string;
  onClick?: () => void;
};

function MagneticButton({ reduceMotion, children, className, onClick }: MagneticButtonProps) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 220, damping: 16, mass: 0.4 });
  const smoothY = useSpring(pointerY, { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={className}
      style={reduceMotion ? undefined : { x: smoothX, y: smoothY }}
      onPointerMove={(event) => {
        if (reduceMotion) return;
        const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect();
        const offsetX = event.clientX - (rect.left + rect.width / 2);
        const offsetY = event.clientY - (rect.top + rect.height / 2);
        pointerX.set(offsetX * 0.12);
        pointerY.set(offsetY * 0.12);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      whileHover={reduceMotion ? undefined : { scale: 1.03, rotate: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

type MediaCardProps = {
  post: InstagramPost;
  index: number;
  locale: Locale;
  onSelect: (post: InstagramPost) => void;
  reduceMotion: boolean | null;
  playClipLabel: string;
  openInstagramLabel: string;
};

function MediaCard({
  post,
  index,
  locale,
  onSelect,
  reduceMotion,
  playClipLabel,
  openInstagramLabel
}: MediaCardProps) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 150, damping: 14 });
  const smoothY = useSpring(pointerY, { stiffness: 150, damping: 14 });
  const rotateX = useTransform(smoothY, [-28, 28], [5, -5]);
  const rotateY = useTransform(smoothX, [-28, 28], [-5, 5]);
  const yLift = useTransform(smoothY, [-28, 28], [-2, 2]);

  return (
    <motion.article
      layoutId={`post-${post.id}`}
      className="group relative overflow-hidden border-2 border-teal bg-white"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      style={
        reduceMotion
          ? undefined
          : {
              rotateX,
              rotateY,
              y: yLift,
              transformPerspective: 900
            }
      }
      onPointerMove={(event) => {
        if (reduceMotion) return;
        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        const localX = event.clientX - rect.left - rect.width / 2;
        const localY = event.clientY - rect.top - rect.height / 2;
        pointerX.set((localX / rect.width) * 52);
        pointerY.set((localY / rect.height) * 52);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 border-2 border-yellow"
        initial={false}
        animate={reduceMotion ? undefined : { x: [0, 4, 0], y: [0, 3, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 }}
      />

      <button type="button" onClick={() => onSelect(post)} className="relative block w-full text-left">
        <div className="relative aspect-[4/5] w-full border-b-2 border-teal bg-teal/10">
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt={`Instagram ${post.type}`}
              fill
              unoptimized
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs uppercase tracking-[0.2em]">
              Instagram
            </div>
          )}

          <motion.div
            className="absolute inset-0 flex items-end justify-between gap-2 p-3"
            whileHover={reduceMotion ? undefined : { paddingBottom: 16 }}
          >
            <span className="border-2 border-teal bg-yellow px-2 py-1 text-[10px] uppercase tracking-[0.16em]">
              {labelForTag(post.type === "image" ? "post" : post.type, locale)}
            </span>
            <span className="border-2 border-teal bg-teal px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
              {post.videoUrl ? playClipLabel : openInstagramLabel}
            </span>
          </motion.div>
        </div>

        <div className="space-y-3 p-4">
          <p className="min-h-[5.75rem] text-sm leading-relaxed">{locale === "de" ? post.rewritten.de : post.rewritten.en}</p>

          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={`${post.id}-${tag}`}
                className="rounded-full border-2 border-teal bg-white px-2 py-1 text-[10px] uppercase tracking-[0.13em]"
              >
                {labelForTag(tag, locale)}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.13em] text-teal/70">
            <span>{formatDate(post.timestamp, locale)}</span>
            <span>♥ {formatNumber(post.stats.likes)}</span>
            <span>▶ {formatNumber(post.stats.views)}</span>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

export function MotionSite({ locale, data, featuredReel, filterTags, socialLinks }: MotionSiteProps) {
  const copy = copyByLocale[locale];
  const reduceMotion = useReducedMotion();
  const [activeTag, setActiveTag] = useState("all");
  const [selected, setSelected] = useState<InstagramPost | null>(null);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const closeLabel = locale === "de" ? "Schließen" : "Close";
  const commandLabel = "npm run fetch:instagram";

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 60]);
  const heroScale = useTransform(scrollYProgress, [0, 0.28], [1, 1.03]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const reverseGlowY = useTransform(glowY, (value) => -value * 0.55);
  const progressScale = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  const titleX = useMotionValue(0);
  const titleY = useMotionValue(0);
  const smoothTitleX = useSpring(titleX, { stiffness: 120, damping: 16 });
  const smoothTitleY = useSpring(titleY, { stiffness: 120, damping: 16 });
  const titleRotateX = useTransform(smoothTitleY, [-45, 45], [8, -8]);
  const titleRotateY = useTransform(smoothTitleX, [-45, 45], [-9, 9]);

  const profileStats = [
    {
      label: locale === "de" ? "Follower:innen" : "Followers",
      value: formatNumber(data.profile.followers)
    },
    {
      label: locale === "de" ? "Folgt" : "Following",
      value: formatNumber(data.profile.following)
    },
    {
      label: locale === "de" ? "Posts" : "Posts",
      value: formatNumber(data.profile.postCount)
    }
  ];

  const filteredPosts = useMemo(() => {
    if (activeTag === "all") return data.posts;
    return data.posts.filter((post) => post.tags.includes(activeTag));
  }, [activeTag, data.posts]);

  const languageHref = locale === "de" ? "/en" : "/";
  const legalHref = locale === "de" ? "/impressum" : "/en/legal";

  const bannerRows = useMemo(
    () => [
      copy.banners,
      [copy.banners[2], copy.banners[0], copy.banners[5], copy.banners[1], copy.banners[6], copy.banners[3]],
      [copy.banners[7], copy.banners[4], copy.banners[0], copy.banners[2], copy.banners[1], copy.banners[6]],
      [copy.banners[5], copy.banners[3], copy.banners[7], copy.banners[0], copy.banners[1], copy.banners[2]]
    ],
    [copy.banners]
  );

  return (
    <LayoutGroup>
      <div className="relative min-h-screen overflow-x-hidden bg-white text-teal">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute -left-24 top-20 h-64 w-64 rounded-full border-2 border-teal bg-yellow/45 blur-3xl"
            style={reduceMotion ? undefined : { y: glowY }}
          />
          <motion.div
            className="absolute -right-20 top-[45vh] h-72 w-72 rounded-full border-2 border-yellow bg-teal/30 blur-3xl"
            style={reduceMotion ? undefined : { y: reverseGlowY }}
          />
          <div className="absolute inset-0 bg-grid-lines opacity-35" />
        </div>

        <header className="sticky top-0 z-50 border-b-2 border-teal bg-white/90 backdrop-blur">
          <motion.div className="h-1 origin-left bg-yellow" style={{ scaleX: progressScale }} />
          <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8">
            <a href="#top" className="font-display text-2xl uppercase tracking-[0.24em] md:text-3xl">
              DAPHNI
            </a>

            <ul className="hidden items-center gap-6 text-xs uppercase tracking-[0.2em] md:flex">
              <li>
                <a href="#about">{copy.nav.about}</a>
              </li>
              <li>
                <a href="#media">{copy.nav.media}</a>
              </li>
              <li>
                <a href="#contact">{copy.nav.contact}</a>
              </li>
            </ul>

            <Link
              href={languageHref}
              className="rounded-full border-2 border-teal bg-yellow px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
            >
              <motion.span layoutId="language-pill">{copy.nav.languageSwitch}</motion.span>
            </Link>
          </nav>
        </header>

        <main id="top">
          <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-8 md:px-8 md:pb-20 md:pt-12">
            <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
              <motion.div
                className="space-y-7"
                style={reduceMotion ? undefined : { y: heroY }}
                onPointerMove={(event) => {
                  if (reduceMotion) return;
                  const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const localX = event.clientX - rect.left - rect.width / 2;
                  const localY = event.clientY - rect.top - rect.height / 2;
                  titleX.set((localX / rect.width) * 95);
                  titleY.set((localY / rect.height) * 95);
                }}
                onPointerLeave={() => {
                  titleX.set(0);
                  titleY.set(0);
                }}
              >
                <div className="inline-flex items-center gap-3 border-2 border-teal bg-yellow px-3 py-2 text-xs uppercase tracking-[0.24em]">
                  <span>{copy.hero.kicker}</span>
                  <span className="h-1 w-1 rounded-full bg-teal" />
                  <span>{locale === "de" ? "Live + Reels" : "Live + Reels"}</span>
                </div>

                <motion.div
                  className="origin-left"
                  style={
                    reduceMotion
                      ? undefined
                      : {
                          rotateX: titleRotateX,
                          rotateY: titleRotateY,
                          transformPerspective: 900
                        }
                  }
                >
                  <h1 className="font-display text-[18vw] uppercase leading-[0.74] tracking-[0.08em] md:text-[9vw]">
                    <motion.span layoutId="headline-a" className="block text-teal">
                      {copy.hero.headlineA}
                    </motion.span>
                    <motion.span
                      layoutId="headline-b"
                      className="inline-block border-y-4 border-teal bg-yellow px-3 text-teal"
                    >
                      {copy.hero.headlineB}
                    </motion.span>
                  </h1>
                </motion.div>

                <p className="max-w-2xl text-lg leading-relaxed md:text-xl">{copy.hero.intro}</p>

                <div className="flex flex-wrap gap-3">
                  {featuredReel ? (
                    <MagneticButton
                      reduceMotion={reduceMotion}
                      onClick={() => setSelected(featuredReel)}
                      className="rounded-full border-2 border-teal bg-teal px-6 py-3 text-sm font-semibold uppercase tracking-[0.19em] text-white"
                    >
                      <motion.span layoutId={`featured-${featuredReel.id}`}>{copy.hero.primaryCta}</motion.span>
                    </MagneticButton>
                  ) : null}

                  <a
                    href="#media"
                    className="rounded-full border-2 border-teal bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.19em]"
                  >
                    {copy.hero.secondaryCta}
                  </a>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {profileStats.map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="border-2 border-teal bg-white p-3"
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] text-teal/70">{item.label}</p>
                      <p className="mt-2 font-display text-2xl uppercase tracking-[0.08em]">{item.value}</p>
                    </motion.div>
                  ))}
                </div>

                <p className="text-xs uppercase tracking-[0.2em] text-teal/70">{copy.hero.reelHint}</p>
              </motion.div>

              <motion.figure
                className="relative overflow-hidden border-2 border-teal bg-white"
                style={reduceMotion ? undefined : { scale: heroScale }}
              >
                <div className="relative aspect-[4/5] w-full border-b-2 border-teal">
                  {portraitFailed ? (
                    <div className="flex h-full items-center justify-center bg-yellow p-6 text-center">
                      <div>
                        <p className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">DAPHNI</p>
                        <p className="mt-2 border-2 border-teal bg-white px-3 py-2 text-xs uppercase tracking-[0.18em]">
                          {locale === "de" ? "Portrait wird nachgeladen" : "Portrait loading fallback"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={portraitUrl}
                      alt="Daphni Georgolidis portrait"
                      fill
                      unoptimized
                      priority
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                      onError={() => setPortraitFailed(true)}
                    />
                  )}

                  <motion.div
                    className="absolute -left-3 top-5 border-2 border-teal bg-yellow px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
                    animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {locale === "de" ? "Dark Humor" : "Dark Humor"}
                  </motion.div>

                  <motion.div
                    className="absolute -right-3 bottom-20 border-2 border-yellow bg-teal px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white"
                    animate={reduceMotion ? undefined : { y: [0, 10, 0], rotate: [1, -2, 1] }}
                    transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {locale === "de" ? "Bühne" : "Stage"}
                  </motion.div>
                </div>

                <figcaption className="grid gap-3 border-t-2 border-teal p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-display text-3xl uppercase tracking-[0.08em]">Daphni Georgolidis</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-teal/70">
                      {locale === "de" ? "Komikerin · @daphnigg" : "Comedian · @daphnigg"}
                    </p>
                  </div>
                  <a
                    href={`https://www.instagram.com/${data.profile.username}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex border-2 border-teal bg-yellow px-3 py-2 text-[10px] uppercase tracking-[0.18em]"
                  >
                    Instagram
                  </a>
                </figcaption>
              </motion.figure>
            </div>
          </section>

          <SlantedMarquee rows={bannerRows} />

          <section id="about" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-5xl uppercase leading-[0.85] tracking-[0.08em] md:text-7xl lg:max-w-4xl">
                {copy.about.title}
              </h2>
              <p className="border-2 border-teal bg-yellow px-3 py-2 text-[10px] uppercase tracking-[0.2em]">
                {locale === "de" ? "Voice + Timing + Haltung" : "Voice + Timing + Presence"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-6">
              {[copy.about.textA, copy.about.textB, copy.about.textC].map((text, index) => (
                <motion.article
                  key={text}
                  className={`relative overflow-hidden border-2 border-teal p-6 ${
                    index === 2 ? "bg-yellow" : "bg-white"
                  } md:col-span-2`}
                  initial={reduceMotion ? false : { opacity: 0, y: 20, rotate: index === 1 ? -1.5 : 1.5 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.52, delay: index * 0.08 }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                >
                  <div className="pointer-events-none absolute -right-10 top-4 rotate-12 border-2 border-teal bg-white px-2 py-1 text-[9px] uppercase tracking-[0.18em]">
                    {index === 0 ? "Sharp" : index === 1 ? "Fearless" : "Live"}
                  </div>
                  <p className="leading-relaxed">{text}</p>
                </motion.article>
              ))}
            </div>
          </section>

          <section id="media" className="mx-auto w-full max-w-7xl px-5 pb-20 md:px-8">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-5xl uppercase tracking-[0.08em] md:text-7xl">{copy.media.title}</h2>
                <p className="mt-3 max-w-3xl leading-relaxed">{copy.media.intro}</p>
              </div>
              <p className="border-2 border-teal bg-white px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-teal/70">
                {data.meta.fetchedAt ? new Date(data.meta.fetchedAt).toLocaleString() : locale === "de" ? "Noch kein Abruf" : "No fetch yet"}
              </p>
            </div>

            {featuredReel ? (
              <motion.article
                layoutId={`featured-${featuredReel.id}`}
                className="mb-8 border-2 border-teal bg-teal p-5 text-white"
                whileHover={reduceMotion ? undefined : { y: -2 }}
              >
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-yellow">{copy.media.featured}</p>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed md:text-base">
                      {locale === "de" ? featuredReel.rewritten.de : featuredReel.rewritten.en}
                    </p>
                  </div>

                  <MagneticButton
                    reduceMotion={reduceMotion}
                    onClick={() => setSelected(featuredReel)}
                    className="rounded-full border-2 border-yellow bg-yellow px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal"
                  >
                    {copy.media.playClip}
                  </MagneticButton>
                </div>
              </motion.article>
            ) : null}

            <div className="mb-7 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTag("all")}
                className={`relative rounded-full border-2 border-teal px-4 py-2 text-xs uppercase tracking-[0.16em] ${
                  activeTag === "all" ? "bg-yellow" : "bg-white"
                }`}
              >
                {activeTag === "all" ? (
                  <motion.span
                    layoutId="active-filter"
                    className="absolute inset-0 -z-10 rounded-full border-2 border-teal bg-yellow"
                  />
                ) : null}
                {copy.media.filterAll}
              </button>

              {filterTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`relative rounded-full border-2 border-teal px-4 py-2 text-xs uppercase tracking-[0.16em] ${
                    activeTag === tag ? "bg-teal text-white" : "bg-white"
                  }`}
                >
                  {activeTag === tag ? (
                    <motion.span
                      layoutId="active-filter"
                      className="absolute inset-0 -z-10 rounded-full border-2 border-teal bg-teal"
                    />
                  ) : null}
                  {labelForTag(tag, locale)}
                </button>
              ))}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <motion.article
                  className="border-2 border-teal bg-yellow p-6"
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                >
                  <p className="font-display text-3xl uppercase tracking-[0.08em] md:text-5xl">
                    {locale === "de" ? "Reels laden" : "Load reels"}
                  </p>
                  <p className="mt-4 leading-relaxed">{copy.media.fallback}</p>
                  <p className="mt-4 inline-flex border-2 border-teal bg-white px-3 py-2 text-xs uppercase tracking-[0.16em]">
                    {commandLabel}
                  </p>
                </motion.article>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[0, 1, 2].map((block) => (
                    <motion.div
                      key={`placeholder-${block}`}
                      className="relative overflow-hidden border-2 border-teal bg-white p-4"
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ delay: block * 0.08 }}
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0 w-24 bg-teal/20"
                        animate={reduceMotion ? undefined : { x: [0, 180, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: block * 0.18 }}
                      />
                      <div className="relative h-5 w-2/3 border-2 border-teal bg-white" />
                      <div className="relative mt-3 h-12 border-2 border-teal bg-white" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post, index) => (
                  <MediaCard
                    key={post.id}
                    post={post}
                    index={index}
                    locale={locale}
                    reduceMotion={reduceMotion}
                    onSelect={setSelected}
                    playClipLabel={copy.media.playClip}
                    openInstagramLabel={copy.media.openInstagram}
                  />
                ))}
              </div>
            )}
          </section>

          <section id="contact" className="mx-auto w-full max-w-7xl px-5 pb-24 md:px-8">
            <div className="grid gap-6 border-2 border-teal bg-teal p-6 text-white md:p-9 lg:grid-cols-[1fr_1fr]">
              <div>
                <h2 className="font-display text-5xl uppercase tracking-[0.08em] text-yellow md:text-7xl">
                  {copy.contact.title}
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed">{copy.contact.intro}</p>

                <div className="mt-6 border-2 border-yellow bg-yellow p-3 text-xs uppercase tracking-[0.15em] text-teal">
                  {copy.contact.legalPlaceholder}
                </div>

                <ul className="mt-6 space-y-2 text-sm">
                  {socialLinks.map((social) => (
                    <li key={social.url}>
                      <a href={social.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <form className="grid gap-3 border-2 border-white bg-white p-4 text-teal md:p-5">
                <label className="text-xs uppercase tracking-[0.15em]" htmlFor="contact-name">
                  {copy.contact.nameLabel}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  required
                  className="border-2 border-teal bg-white px-3 py-2 text-sm outline-none"
                />

                <label className="text-xs uppercase tracking-[0.15em]" htmlFor="contact-email">
                  {copy.contact.emailLabel}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  className="border-2 border-teal bg-white px-3 py-2 text-sm outline-none"
                />

                <label className="text-xs uppercase tracking-[0.15em]" htmlFor="contact-message">
                  {copy.contact.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  className="border-2 border-teal bg-white px-3 py-2 text-sm outline-none"
                />

                <button
                  type="submit"
                  className="mt-2 rounded-full border-2 border-teal bg-yellow px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  {copy.contact.submitLabel}
                </button>
              </form>
            </div>
          </section>
        </main>

        <footer className="border-t-2 border-teal px-5 py-6 text-xs uppercase tracking-[0.15em] md:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
            <p>
              © {new Date().getFullYear()} Daphni Georgolidis. {copy.footer.rights}
            </p>
            <div className="flex items-center gap-4">
              <Link href={legalHref}>{copy.footer.legal}</Link>
              <Link href={languageHref}>{copy.nav.languageSwitch}</Link>
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-teal/90 p-4"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              layoutId={`post-${selected.id}`}
              className="w-full max-w-5xl overflow-hidden border-2 border-yellow bg-white"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
                <div className="relative aspect-video w-full border-b-2 border-teal bg-teal/10 md:border-b-0 md:border-r-2">
                  {selected.videoUrl ? (
                    <video
                      controls
                      autoPlay={!reduceMotion}
                      playsInline
                      preload="metadata"
                      poster={selected.thumbnailUrl || undefined}
                      className="h-full w-full"
                      src={selected.videoUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center">
                      <a
                        href={selected.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border-2 border-teal bg-yellow px-6 py-3 text-xs uppercase tracking-[0.2em]"
                      >
                        {copy.media.reelFallback}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-5 p-4 text-teal">
                  <div>
                    <p className="mb-3 inline-flex border-2 border-teal bg-yellow px-2 py-1 text-[10px] uppercase tracking-[0.16em]">
                      {selected.type === "image"
                        ? labelForTag("post", locale)
                        : labelForTag(selected.type, locale)}
                    </p>
                    <p className="text-sm leading-relaxed">
                      {locale === "de" ? selected.rewritten.de : selected.rewritten.en}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {selected.tags.map((tag) => (
                        <span
                          key={`${selected.id}-${tag}-modal`}
                          className="rounded-full border-2 border-teal bg-white px-2 py-1 text-[10px] uppercase tracking-[0.13em]"
                        >
                          {labelForTag(tag, locale)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.13em] text-teal/70">
                    <span>{formatDate(selected.timestamp, locale)}</span>
                    <span>♥ {formatNumber(selected.stats.likes)}</span>
                    <span>▶ {formatNumber(selected.stats.views)}</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={selected.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border-2 border-teal bg-yellow px-4 py-2 text-xs uppercase tracking-[0.16em]"
                    >
                      {copy.media.openInstagram}
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="rounded-full border-2 border-teal bg-white px-4 py-2 text-xs uppercase tracking-[0.16em]"
                    >
                      {closeLabel}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}
