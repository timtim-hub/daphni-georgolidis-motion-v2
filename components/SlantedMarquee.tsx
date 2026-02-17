"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

type RowProps = {
  words: string[];
  direction: 1 | -1;
  rotation: number;
  speed: number;
  outlined?: boolean;
};

function MarqueeRow({ words, direction, rotation, speed, outlined = false }: RowProps) {
  const reduceMotion = useReducedMotion();
  const repeated = useMemo(() => [...words, ...words], [words]);
  const animation =
    direction === -1
      ? { x: ["0%", "-50%"] }
      : { x: ["-50%", "0%"] };
  const duration = Math.max(10, speed);

  return (
    <div className="overflow-hidden border-y-2 border-teal bg-white">
      <motion.div
        className="flex min-w-max gap-6 py-4"
        style={{ rotate: reduceMotion ? 0 : rotation }}
        animate={animation}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        {repeated.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="font-display text-3xl uppercase tracking-[0.24em] md:text-5xl"
            style={
              outlined
                ? {
                    color: "transparent",
                    WebkitTextStrokeWidth: "2px",
                    WebkitTextStrokeColor: "#19E6D4"
                  }
                : { color: "#19E6D4" }
            }
          >
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

type SlantedMarqueeProps = {
  rows: string[][];
};

export function SlantedMarquee({ rows }: SlantedMarqueeProps) {
  const safeRows = rows.length > 0 ? rows : [["DAPHNI", "LIVE", "REELS", "DARK HUMOR"]];

  return (
    <section aria-label="Marquee" className="relative z-20 -mt-3 space-y-2 pb-6">
      {safeRows.map((words, index) => (
        <MarqueeRow
          key={`marquee-row-${index}`}
          words={words}
          direction={index % 2 === 0 ? -1 : 1}
          rotation={index % 2 === 0 ? -3 + index : 3 - index}
          speed={18 + index * 3}
          outlined={index % 2 === 1}
        />
      ))}
    </section>
  );
}
