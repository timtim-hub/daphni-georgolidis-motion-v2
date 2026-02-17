"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0.96 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="pointer-events-none fixed inset-0 z-[120]"
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 0 }
              : {
                  opacity: [0, 1, 0],
                  x: ["100%", "0%", "-100%"]
                }
          }
          transition={{ duration: 0.85, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="h-full w-full border-y-4 border-yellow bg-teal/40" />
        </motion.div>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
