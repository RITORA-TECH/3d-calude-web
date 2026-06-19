"use client";

import dynamic from "next/dynamic";
import SmoothScroll from "@/components/SmoothScroll";
import Overlay from "@/components/Sections";
import Loader from "@/components/Loader";
import ConnectBubble from "@/components/ConnectBubble";

// WebGL must only run on the client
const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
});

export default function Home() {
  return (
    <SmoothScroll>
      <Loader />

      {/* fixed 3D layer behind the content */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Experience />
      </div>

      {/* AI-agent bubble (clickable, above everything) */}
      <ConnectBubble />

      {/* scrolling content on top */}
      <main className="relative z-10">
        <Overlay />
      </main>
    </SmoothScroll>
  );
}
