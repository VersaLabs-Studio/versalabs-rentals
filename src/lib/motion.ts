import type { Variants } from "framer-motion";

/**
 * Project-wide motion language.
 * Use these for any Framer Motion entry to keep animation cohesive.
 */

const easeOutSoft = [0.22, 1, 0.36, 1] as const;
const easeInOutSoft = [0.65, 0, 0.35, 1] as const;

export const transitions = {
  fast: { duration: 0.15, ease: easeOutSoft },
  base: { duration: 0.22, ease: easeOutSoft },
  slow: { duration: 0.36, ease: easeOutSoft },
  spring: { type: "spring" as const, stiffness: 260, damping: 26 },
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: easeOutSoft },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: easeOutSoft } },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutSoft } },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: easeOutSoft } },
};

export const hoverLift = {
  y: -2,
  transition: { duration: 0.2, ease: easeOutSoft },
};

export const tapPress = {
  scale: 0.98,
  transition: { duration: 0.1, ease: easeInOutSoft },
};
