import type { Variants, Transition } from "framer-motion";

export const SNAP_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const blurFadeVariants: Variants = {
  initial: { opacity: 0, filter: "blur(12px)", y: 40, scale: 0.96 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 },
  exit: { opacity: 0, filter: "blur(8px)", scale: 0.95 },
};

export const blurFadeTransition: Transition = {
  duration: 0.35,
  ease: SNAP_EASE,
  filter: { duration: 0.4 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const fadeBlurItem: Variants = {
  initial: { opacity: 0, filter: "blur(8px)", y: 16 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
};

export const fadeBlurItemTransition: Transition = {
  duration: 0.3,
  ease: SNAP_EASE,
  filter: { duration: 0.35 },
};

export const subtleFade: Variants = {
  initial: { opacity: 0, filter: "blur(4px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
};

export const subtleFadeTransition: Transition = {
  duration: 0.25,
  ease: SNAP_EASE,
};
