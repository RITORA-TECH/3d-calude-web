"use client";

import dynamic from "next/dynamic";
import SmoothScroll from "@/components/SmoothScroll";
import Overlay from "@/components/Sections";
import Loader from "@/components/Loader";
import Brand from "@/components/Brand";
import ConnectBubble from "@/components/ConnectBubble";
import AgentChat from "@/components/AgentChat";

// WebGL must only run on the client
const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
});

export default function Home() {
  return (
    <SmoothScroll>
      <Loader />

      {/* brand mark / logo */}
      <Brand />

      {/* fixed 3D layer behind the content */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Experience />
      </div>

      {/* AI-agent intro bubble (opens the chat) */}
      <ConnectBubble />

      {/* scrolling content on top */}
      <main className="relative z-10">
        <Overlay />
      </main>

      {/* real conversational AI agent (floating launcher + chat panel) */}
      <AgentChat />
    </SmoothScroll>
  );
}
