import type { Transition, Variants } from "framer-motion";

/**
 * Shared Framer Motion presets. Animations are intentionally fast and small;
 * `MotionConfig reducedMotion="user"` (set in the root layout) neutralises them
 * for visitors who prefer reduced motion.
 */

export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.7,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOutExpo } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease: easeOutExpo } },
};

/** Parent that reveals children one after another. */
export const staggerContainer = (stagger = 0.05, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Standard overlay + panel transitions for modals / dropdowns. */
export const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

export const dialogMotion = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 4 },
  transition: { duration: 0.18, ease: easeOutExpo },
};

export const popoverMotion = {
  initial: { opacity: 0, scale: 0.96, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -2 },
  transition: { duration: 0.14, ease: easeOutExpo },
};
