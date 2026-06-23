// Shared motion tokens so animation feels intentional, not ad-hoc.
// Used by Framer Motion (HTML) and as reference for the R3F scene easing.
import type { Variants } from "framer-motion";

/** Signature easing — a soft "settle" curve reused everywhere. */
export const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const DURATION = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
} as const;

/** Standard reveal used by every section heading/body. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, delay: i * 0.08, ease: EASE },
  }),
};

/** Reduced-motion variant: fade only, no travel. */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.fast } },
};

/** SSR-safe check for the user's reduced-motion preference. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
