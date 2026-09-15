"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";
import AgentChat from "./AgentChat";

const Experience = dynamic(() => import("./Experience"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function SiteEnhancements() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      // The 3D narrative is the site's primary experience, including on
      // phones. Respect an explicit reduced-motion preference, but do not
      // disable the scene just because the viewport is small or the network
      // reports a slower connection.
      setEnabled(!motion.matches);
    };
    // Let the readable page render before downloading the optional 3D scene.
    const timer = window.setTimeout(() => { sync(); setReady(true); }, 1200);
    motion.addEventListener("change", sync);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    const story = document.getElementById("story");
    if (story) observer.observe(story);
    return () => {
      window.clearTimeout(timer);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, []);

  return <>
    <SmoothScroll>
      <div className="scene-layer" aria-hidden="true">
        {ready && enabled && <SceneBoundary><Experience paused={!visible || !inView} /></SceneBoundary>}
      </div>
    </SmoothScroll>
    {ready && <button type="button" className="scene-toggle" aria-pressed={enabled} onClick={() => setEnabled((value) => !value)}>
      <span aria-hidden="true">{enabled ? "Ⅱ" : "▷"}</span> {enabled ? "Turn off 3D" : "Enable 3D"}
    </button>}
    {ready && <AgentChat />}
  </>;
}
