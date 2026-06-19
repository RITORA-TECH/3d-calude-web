"use client";

import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/scroll";
import { company } from "@/lib/content";

/**
 * The AI-agent speech bubble. Lives above the canvas so it's always
 * clickable, and fades out once you scroll past the intro.
 */
export default function ConnectBubble() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const p = scrollState.progress;
        const vis = 1 - Math.min(1, Math.max(0, (p - 0.06) / 0.05));
        el.style.opacity = String(vis);
        el.style.pointerEvents = vis > 0.5 ? "auto" : "none";
        el.style.transform = `translateY(${(1 - vis) * -12}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed right-[6vw] top-[20vh] z-30 md:right-[16vw] md:top-[33vh]">
      <div ref={ref} style={{ transition: "opacity .25s" }} className="w-56 md:w-64">
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("ritora:connect"))
          }
          className="group relative block w-full rounded-2xl border border-white/15 bg-[#0b1020]/90 px-5 py-4 text-left shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.03]"
        >
          <div className="mb-1 text-[10px] uppercase tracking-[0.3em] text-[#ff5d3b]">
            {company.shortName} · AI Agent
          </div>
          <div className="text-sm font-medium leading-snug text-white">
            Hi! I&apos;m {company.shortName}&apos;s AI agent 👋
          </div>
          <div className="mt-1 text-xs text-white/60">
            Click me to connect with the team →
          </div>
          {/* tail pointing down toward the robot */}
          <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/15 bg-[#0b1020]/90" />
        </button>
      </div>
    </div>
  );
}
