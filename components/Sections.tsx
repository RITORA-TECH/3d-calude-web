"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { company, services, projects } from "@/lib/content";

/** End-of-page "let's connect" capture — the returning agent's ask. */
function ConnectForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const subject = encodeURIComponent("Let's connect — new project");
    const body = encodeURIComponent(
      `Hi ${company.shortName} team,\n\nI'd like to talk about a project.\n\nMy email: ${email}\n`
    );
    window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <p className="mb-3 text-sm text-white/55">
        Drop your email and our agent will take it from here.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#ff5d3b]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#ff5d3b] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          {sent ? "Opening…" : "Let's connect"}
        </button>
      </div>
    </form>
  );
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* shared motion presets */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.08, ease: EASE },
  }),
};

function Hero() {
  return (
    <section className="relative flex h-screen w-full flex-col justify-end pb-28 px-[8vw] md:justify-center md:pb-0">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mb-4 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]"
      >
        {company.tagline}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.45 }}
        className="max-w-[14ch] text-[clamp(2.8rem,9vw,7rem)] font-semibold leading-[0.95] tracking-tight text-white"
      >
        {company.name}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mt-6 max-w-[42ch] text-lg text-white/60"
      >
        {company.hero}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="absolute bottom-10 left-[8vw] flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/40"
      >
        <span className="inline-block h-8 w-[1px] animate-pulse bg-white/40" />
        Scroll — meet our agent
      </motion.div>
    </section>
  );
}

function Transition() {
  return (
    <section className="flex h-screen w-full items-center justify-end px-[8vw]">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        className="max-w-[18ch] text-right text-[clamp(1.8rem,5vw,3.5rem)] font-medium leading-tight text-white/90"
      >
        Building real products means surviving real impact.
        <span className="text-[#ff5d3b]"> Watch what happens next.</span>
      </motion.h2>
    </section>
  );
}

function Services() {
  // The service cards themselves are rendered in 3D (ServiceChips), bursting
  // out of the repaired car. Here we just frame that moment with copy and a
  // compact legend, so the two layers don't fight for attention.
  return (
    <section className="flex min-h-screen w-full flex-col justify-end px-[8vw] pb-16">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <p className="mb-2 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]">
          What we build
        </p>
        <h2 className="mb-6 max-w-[18ch] text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight text-white">
          Fixed, refined and ready —
          <span className="text-[#ff5d3b]"> straight out of the build.</span>
        </h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55">
          {services.map((s) => (
            <span key={s.id} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5d3b]" />
              {s.title}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Projects() {
  // duplicated list for a seamless marquee
  const row = [...projects, ...projects];
  return (
    <section className="flex min-h-screen w-full flex-col justify-center overflow-hidden py-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="mb-14 px-[8vw]"
      >
        <p className="mb-2 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]">
          Selected work
        </p>
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-white">
          Things we&apos;ve shipped.
        </h2>
      </motion.div>

      <div className="relative w-full">
        <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-6 px-[8vw] hover:[animation-play-state:paused]">
          {row.map((p, i) => (
            <article
              key={i}
              className="group relative h-72 w-80 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e1c] p-7"
            >
              <div
                className="absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: p.accent }}
              />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.25em]"
                    style={{ color: p.accent }}
                  >
                    {p.category}
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{p.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/55">{p.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* contact */}
      <motion.div
        id="contact"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="mt-24 flex scroll-mt-24 flex-col items-start gap-10 px-[8vw] md:flex-row md:justify-between"
      >
        <div className="max-w-xl">
          <p className="mb-2 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]">
            Let&apos;s connect
          </p>
          <h2 className="text-[clamp(2rem,6vw,4rem)] font-semibold leading-none text-white">
            Let&apos;s build yours.
          </h2>
          <p className="mb-7 mt-4 max-w-[40ch] text-white/55">{company.about}</p>
          <ConnectForm />
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/60 md:text-right">
          <a href={`mailto:${company.email}`} className="hover:text-[#ff5d3b]">
            {company.email}
          </a>
          <a href={`tel:${company.phone}`} className="hover:text-[#ff5d3b]">
            {company.phone}
          </a>
          <span className="text-white/30">WhatsApp {company.whatsapp}</span>
        </div>
      </motion.div>

      <div className="mt-16 border-t border-white/10 px-[8vw] pt-6 text-xs text-white/30">
        © {company.year} {company.name}. All rights reserved.
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="flex h-screen w-full flex-col justify-end px-[8vw] pb-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
      >
        <p className="mb-2 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]">
          The team
        </p>
        <h2 className="max-w-[20ch] text-[clamp(1.8rem,5vw,3.2rem)] font-semibold leading-tight text-white">
          Things break. Our developers ship the fix —
          <span className="text-[#ff5d3b]"> every single time.</span>
        </h2>
      </motion.div>
    </section>
  );
}

export default function Overlay() {
  return (
    <div className="w-screen text-white">
      <Hero />
      <Transition />
      <Team />
      <Services />
      <Projects />
    </div>
  );
}
