"use client";

import { motion, type Variants } from "framer-motion";
import { company, services, projects } from "@/lib/content";

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
    <section className="relative flex h-screen w-full flex-col justify-center px-[8vw]">
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
        Scroll — take it apart
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
        className="max-w-[16ch] text-right text-[clamp(1.8rem,5vw,3.5rem)] font-medium leading-tight text-white/90"
      >
        Every great product is more than its surface.
        <span className="text-[#ff5d3b]"> Watch ours come apart.</span>
      </motion.h2>
    </section>
  );
}

function Services() {
  return (
    <section className="flex min-h-screen w-full flex-col justify-center px-[8vw] py-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="mb-12"
      >
        <p className="mb-2 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]">
          What we build
        </p>
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-white">
          Every part has a purpose.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <motion.div
            key={s.id}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="group relative bg-[#080b16]/80 p-8 backdrop-blur-sm transition-colors hover:bg-[#0d1222]"
          >
            <div className="mb-6 text-xs uppercase tracking-[0.25em] text-[#ff5d3b]/80">
              {s.part}
            </div>
            <h3 className="mb-3 text-2xl font-semibold text-white">{s.title}</h3>
            <p className="mb-5 text-sm leading-relaxed text-white/55">{s.blurb}</p>
            <p className="text-xs font-medium tracking-wide text-white/40">{s.stack}</p>
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#ff5d3b] transition-all duration-500 group-hover:w-full" />
          </motion.div>
        ))}
      </div>
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
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="mt-24 flex flex-col items-start gap-6 px-[8vw] md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h2 className="text-[clamp(2rem,6vw,4rem)] font-semibold leading-none text-white">
            Let&apos;s build yours.
          </h2>
          <p className="mt-4 max-w-[40ch] text-white/55">{company.about}</p>
        </div>
        <div className="flex flex-col gap-2 text-right text-sm text-white/60">
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

export default function Overlay() {
  return (
    <div className="w-screen text-white">
      <Hero />
      <Transition />
      <Services />
      <Projects />
    </div>
  );
}
