"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  company,
  services,
  narrative,
  clientsLine,
  techStack,
  testimonials,
  team,
} from "@/lib/content";
import { fadeUp } from "@/lib/motion";
import {
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
  InstagramIcon,
  YouTubeIcon,
} from "./Icons";

/* ---------------------------------------------------------------- Hero --- */
function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col justify-end px-[8vw] pb-28 pt-28 md:justify-center md:pb-20">
      <div className="max-w-[46ch]">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-4 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]"
        >
          {company.eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45 }}
          className="max-w-[16ch] text-[clamp(2.2rem,7.5vw,6.2rem)] font-semibold leading-[0.98] tracking-tight text-white"
        >
          {company.headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 max-w-[44ch] text-lg text-white/70"
        >
          {company.sub}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="absolute bottom-10 left-[8vw] flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/50"
      >
        <span className="inline-block h-8 w-[1px] animate-pulse bg-white/40" />
        {company.scrollCue}
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------- Transition --- */
function Transition() {
  return (
    <section className="flex h-screen w-full items-center justify-end px-[8vw]">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        className="max-w-[20ch] text-right text-[clamp(1.8rem,5vw,3.4rem)] font-medium leading-tight text-white/90"
      >
        {narrative[0]}
      </motion.h2>
    </section>
  );
}

/* ---------------------------------------------------------------- Team --- */
function TeamGrid() {
  // Hidden until real people are added (see TODO in lib/content.ts).
  if (team.length === 0) return null;
  return (
    <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {team.map((m) => (
        <div key={m.name} className="flex flex-col items-start gap-3">
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {m.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.photo} alt={`${m.name}, ${m.role}`} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{m.name}</div>
            <div className="text-xs text-white/50">{m.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Team() {
  return (
    <section className="flex min-h-screen w-full flex-col justify-end px-[8vw] pb-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <p className="mb-2 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]">
          One team, the whole stack
        </p>
        <h2 className="max-w-[22ch] text-[clamp(1.8rem,5vw,3.2rem)] font-semibold leading-tight text-white">
          {narrative[1]}
        </h2>
        <p className="mt-5 max-w-[48ch] text-white/55">{clientsLine}</p>
      </motion.div>
      <TeamGrid />
    </section>
  );
}

/* ------------------------------------------------------------ Services --- */
function Services() {
  return (
    <section className="flex min-h-screen w-full flex-col justify-end px-[8vw] pb-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="mb-2 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]">
          What we build
        </p>
        <h2 className="mb-10 max-w-[20ch] text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-tight text-white">
          {narrative[2]}
        </h2>
      </motion.div>

      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <motion.div
            key={s.id}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="border-l border-white/10 pl-4"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5d3b]" />
              <h3 className="text-lg font-semibold text-white">{s.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{s.line}</p>
          </motion.div>
        ))}
      </div>

      {/* tech-stack badges — technical-buyer trust */}
      <div className="mt-12 flex flex-wrap gap-2">
        {techStack.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Testimonials --- */
function Testimonials() {
  // Hidden until real, consented quotes exist (see TODO in lib/content.ts).
  if (testimonials.length === 0) return null;
  return (
    <section className="flex w-full flex-col justify-center px-[8vw] py-24">
      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mb-10 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]"
      >
        In their words
      </motion.p>
      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <motion.figure
            key={i}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="rounded-2xl border border-white/10 bg-[#0a0e1c] p-7"
          >
            <blockquote className="text-lg leading-relaxed text-white/85">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 text-sm text-white/50">
              <span className="text-white/80">{t.name}</span> — {t.role}, {t.company}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------- Connect (form) --- */
function ConnectForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const subject = encodeURIComponent("Start the conversation — new project");
    const body = encodeURIComponent(
      `Hi ${company.shortName} team,\n\nI'd like to talk about a project.\n\nMy email: ${email}\n`
    );
    window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <p className="mb-3 text-sm text-white/55">{company.replyTime}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="connect-email" className="sr-only">
          Your email address
        </label>
        <input
          id="connect-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#ff5d3b]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#ff5d3b] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5d3b]"
        >
          {sent ? "Opening…" : "Start the conversation"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------ Contact --- */
function Projects() {
  return (
    <section className="flex min-h-screen w-full flex-col justify-center overflow-hidden py-24">
      {/* contact */}
      <motion.div
        id="contact"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="mt-24 flex scroll-mt-24 flex-col items-start gap-10 px-[8vw] md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-xl">
          <p className="mb-2 text-sm uppercase tracking-[0.4em] text-[#ff5d3b]">
            Let&apos;s connect
          </p>
          <h2 className="text-[clamp(2rem,6vw,4rem)] font-semibold leading-none text-white">
            Tell us what you&apos;re building.
          </h2>
          <p className="mb-7 mt-4 max-w-[46ch] text-white/55">
            {company.about} Drop your email — we reply within one business day.
          </p>
          <ConnectForm />
        </div>
        <div className="flex flex-wrap gap-2.5 md:justify-end">
          {[
            {
              href: `mailto:${company.email}`,
              label: `Email ${company.email}`,
              icon: <MailIcon className="h-[18px] w-[18px]" />,
              external: false,
            },
            {
              href: `tel:${company.phoneHref}`,
              label: `Call ${company.phone}`,
              icon: <PhoneIcon className="h-[18px] w-[18px]" />,
              external: false,
            },
            {
              href: `https://wa.me/${company.whatsappHref}`,
              label: `WhatsApp ${company.whatsapp}`,
              icon: <WhatsAppIcon className="h-[18px] w-[18px]" />,
              external: true,
            },
            {
              href: company.instagram,
              label: "Ritora on Instagram",
              icon: <InstagramIcon className="h-[18px] w-[18px]" />,
              external: true,
            },
            {
              href: company.youtube,
              label: "Ritora on YouTube",
              icon: <YouTubeIcon className="h-[18px] w-[18px]" />,
              external: true,
            },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href}
              aria-label={c.label}
              title={c.label}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition-colors hover:border-[#ff5d3b] hover:text-[#ff5d3b]"
            >
              {c.icon}
            </a>
          ))}
        </div>
      </motion.div>

      <div className="mt-16 border-t border-white/10 px-[8vw] pt-6 text-xs text-white/30">
        © {company.year} {company.name}. All rights reserved.
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Overlay --- */
export default function Overlay() {
  return (
    <div className="w-screen text-white">
      <Hero />
      <Transition />
      <Team />
      <Services />
      <Testimonials />
      <Projects />
    </div>
  );
}
