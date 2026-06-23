"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { scrollState } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const reduce = prefersReducedMotion();
    const lenis = new Lenis({
      // reduced-motion: effectively native, instant scrolling
      duration: reduce ? 0 : 1.15,
      smoothWheel: !reduce,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ({ progress }: { progress: number }) => {
      scrollState.progress = progress;
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // AI-agent bubble → smooth-scroll to the contact section
    const connect = () => {
      const el = document.getElementById("contact");
      if (el) lenis.scrollTo(el, { offset: -80 });
      else lenis.scrollTo(document.body.scrollHeight);
    };
    window.addEventListener("ritora:connect", connect);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("ritora:connect", connect);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
