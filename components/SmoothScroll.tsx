"use client";

import { useEffect } from "react";
import { scrollState } from "@/lib/scroll";

/** Native scrolling keeps anchors, keyboard navigation and browser history in sync. */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const story = document.getElementById("story");
    let stops: { y: number; progress: number }[] = [];
    const update = () => {
      const y = window.scrollY;
      const next = stops.findIndex((stop) => stop.y > y);
      if (next < 0) { scrollState.progress = 1; return; }
      if (next === 0) { scrollState.progress = 0; return; }
      const start = stops[next - 1];
      const end = stops[next];
      const fraction = (y - start.y) / Math.max(1, end.y - start.y);
      scrollState.progress = start.progress + fraction * (end.progress - start.progress);
    };
    const measure = () => {
      stops = [{ y: 0, progress: 0 }];
      // Map the original scene beats to actual section positions. Adding
      // content below the scene or expanding an FAQ cannot shift the animation.
      for (const [id, progress] of [["approach", .24], ["about", .48], ["services", .72]] as const) {
        const element = document.getElementById(id);
        if (element) stops.push({ y: element.getBoundingClientRect().top + window.scrollY, progress });
      }
      const end = story ? story.getBoundingClientRect().bottom + window.scrollY : document.documentElement.scrollHeight;
      stops.push({ y: Math.max((stops.at(-1)?.y ?? 0) + 1, end - window.innerHeight), progress: 1 });
      update();
    };
    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    if (story) observer.observe(story);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);
  return <>{children}</>;
}
