"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useVelocity,
  useTransform
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type SlantedMarqueeProps = {
  rows: string[][];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function wrap(value: number, min: number, max: number) {
  const range = max - min;
  if (range === 0) return min;
  return ((((value - min) % range) + range) % range) + min;
}

type RowProps = {
  words: string[];
  direction: 1 | -1;
  rotation: number;
  outlined?: boolean;
  baseSpeed?: number; // px/s
};

function MarqueeRow({ words, direction, rotation, outlined = false, baseSpeed = 32 }: RowProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [groupWidth, setGroupWidth] = useState(0);
  const [paused, setPaused] = useState(false);

  const groupWords = useMemo(() => {
    // Build one "cycle" group. We repeat inside the group so the loop stays dense on large screens,
    // while still wrapping seamlessly by the measured group width.
    const out: string[] = [];
    for (let i = 0; i < 4; i++) out.push(...words);
    return out;
  }, [words]);

  const x = useMotionValue(0);

  // Scroll-choreography: speed-up slightly on scroll, but clamp hard for readability.
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const vSmooth = useSpring(v, { stiffness: 220, damping: 34, mass: 0.6 });
  const vFactor = useTransform(vSmooth, (raw) => {
    const abs = Math.abs(raw);
    // raw is px/s, typical spikes can be huge; compress aggressively.
    const factor = clamp(abs / 1200, 0, 1);
    return 1 + factor * 0.12; // max +12% (readability first)
  });

  useEffect(() => {
    if (!groupRef.current) return;
    const el = groupRef.current;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setGroupWidth(rect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_t, delta) => {
    if (reduceMotion) return;
    if (paused) return;
    if (!groupWidth) return;

    const dt = delta / 1000;
    const mult = vFactor.get();
    const next = x.get() + direction * baseSpeed * mult * dt;
    x.set(next);
  });

  const xWrapped = useTransform(x, (value) => {
    // Two identical groups are rendered back-to-back.
    // Wrapping by exactly one measured group width keeps the loop seamless.
    const w = groupWidth || 1;
    return wrap(value, -w, 0);
  });

  return (
    <section
      aria-label="Marquee row"
      className="overflow-hidden border-y-2 border-teal bg-white"
      style={reduceMotion ? undefined : { transform: `rotate(${rotation}deg)` }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onPointerDown={() => setPaused((v) => !v)}
      ref={containerRef}
    >
      <motion.div
        className="flex min-w-max items-center gap-8 py-5"
        style={reduceMotion ? undefined : { x: xWrapped, willChange: "transform" }}
      >
        <div ref={groupRef} className="flex min-w-max items-center gap-8 pr-8">
          {groupWords.map((word, index) => (
            <span
              key={`a-${word}-${index}`}
              className={[
                "font-display uppercase leading-none tracking-[0.18em]",
                "text-[clamp(1.1rem,2.7vw,2.6rem)]",
                "comic-outline comic-thin",
                outlined ? "comic-hollow comic-stroke-teal" : "text-yellow comic-stroke-teal"
              ].join(" ")}
            >
              {word}
            </span>
          ))}
        </div>
        <div aria-hidden className="flex min-w-max items-center gap-8 pr-8">
          {groupWords.map((word, index) => (
            <span
              key={`b-${word}-${index}`}
              className={[
                "font-display uppercase leading-none tracking-[0.18em]",
                "text-[clamp(1.1rem,2.7vw,2.6rem)]",
                "comic-outline comic-thin",
                outlined ? "comic-hollow comic-stroke-teal" : "text-yellow comic-stroke-teal"
              ].join(" ")}
            >
              {word}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export function SlantedMarquee({ rows }: SlantedMarqueeProps) {
  const safeRows = rows.length > 0 ? rows : [["DAPHNI", "LIVE", "REELS", "DARK HUMOR"]];

  return (
    <section aria-label="Marquee" className="relative z-20 -mt-3 space-y-2 pb-6">
      {safeRows.map((words, index) => (
        <MarqueeRow
          key={`marquee-row-${index}`}
          words={words}
          direction={index % 2 === 0 ? -1 : 1}
          rotation={index % 2 === 0 ? -3 : 3}
          baseSpeed={9 + index * 1.2}
          outlined={index % 2 === 1}
        />
      ))}
    </section>
  );
}
