"use client";

import Image from "next/image";
import { company } from "@/lib/content";

/**
 * Fixed brand mark (logo) shown top-left across the site.
 * The Ritora "R" symbol + wordmark; clicking scrolls back to the top.
 */
export default function Brand() {
  return (
    <a
      href="#top"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      aria-label={`${company.name} — home`}
      className="fixed left-[8vw] top-5 z-30 flex items-center gap-2.5"
    >
      <Image
        src="/ritora-symbol.png"
        alt=""
        width={40}
        height={40}
        priority
        className="h-9 w-9 drop-shadow-[0_2px_8px_rgba(255,93,59,0.35)]"
      />
      <span className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight text-white">
          {company.shortName}
        </span>
        <span className="mt-[3px] text-[8px] font-medium uppercase tracking-[0.3em] text-[#ff5d3b]">
          Technologies
        </span>
      </span>
    </a>
  );
}
