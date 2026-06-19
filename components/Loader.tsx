"use client";

import { useProgress } from "@react-three/drei";
import { company } from "@/lib/content";

export default function Loader() {
  const { active, progress } = useProgress();
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05070f] transition-opacity duration-700 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="mb-6 text-sm uppercase tracking-[0.5em] text-white/50">
        {company.shortName}
      </div>
      <div className="h-[2px] w-56 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-[#ff5d3b] transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 text-xs tabular-nums text-white/40">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
