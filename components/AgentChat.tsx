"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { company } from "@/lib/content";
import {
  GREETING,
  TIMELINE_CHOICES,
  nextAgentMessage,
  submitLead,
  type Lead,
  type Step,
} from "@/lib/agent";

type Msg = { role: "agent" | "user"; text: string };

export default function AgentChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intent");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const lead = useRef<Partial<Lead>>({});

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  /* ---- open / close ---- */
  const openChat = useCallback(() => {
    setOpen(true);
    setMsgs((m) => (m.length ? m : [{ role: "agent", text: GREETING }]));
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  // let the in-scene speech bubble / CTAs open the chat
  useEffect(() => {
    const onConnect = () => openChat();
    window.addEventListener("ritora:connect", onConnect);
    window.addEventListener("ritora:chat", onConnect);
    return () => {
      window.removeEventListener("ritora:connect", onConnect);
      window.removeEventListener("ritora:chat", onConnect);
    };
  }, [openChat]);

  // focus input on open; keep the latest message in view
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [msgs, typing]);

  // ESC to close + focus trap while open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeChat();
        return;
      }
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const f = root.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeChat]);

  /* ---- conversation ---- */
  const send = useCallback(
    async (raw: string) => {
      const value = raw.trim();
      if (!value || typing || step === "done") return;
      setInput("");
      setMsgs((m) => [...m, { role: "user", text: value }]);

      // remember the answer for the current step
      if (step === "intent") lead.current.intent = value;
      if (step === "timeline") lead.current.timeline = value;

      setTyping(true);
      const { next, reply, valid } = await nextAgentMessage(step, value);
      // tiny delay so it reads as a reply, not an instant echo
      await new Promise((r) => setTimeout(r, 350));
      setTyping(false);
      setMsgs((m) => [...m, { role: "agent", text: reply }]);

      if (step === "email" && valid) {
        lead.current.email = value;
        submitLead(lead.current as Lead);
      }
      setStep(next);
    },
    [step, typing]
  );

  return (
    <>
      {/* floating launcher */}
      <button
        ref={launcherRef}
        onClick={() => (open ? closeChat() : openChat())}
        aria-label={open ? "Close Ritora AI agent" : "Open Ritora AI agent"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5d3b] text-2xl shadow-2xl transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span aria-hidden>{open ? "✕" : "💬"}</span>
      </button>

      {/* chat panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${company.shortName} AI agent`}
          className="fixed inset-x-3 bottom-24 z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b1020]/95 shadow-2xl backdrop-blur-md sm:inset-x-auto sm:right-5 sm:w-[380px]"
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" aria-hidden />
              <span className="text-sm font-semibold text-white">
                {company.shortName} · AI Agent
              </span>
            </div>
            <button
              onClick={closeChat}
              aria-label="Close"
              className="rounded-md px-2 py-1 text-white/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff5d3b]"
            >
              ✕
            </button>
          </header>

          <div
            ref={logRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {msgs.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <p
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#ff5d3b] text-white"
                      : "bg-white/8 text-white/85"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <p className="rounded-2xl bg-white/8 px-3.5 py-2 text-sm text-white/50">
                  …
                </p>
              </div>
            )}

            {/* quick replies for the timeline step */}
            {step === "timeline" && !typing && (
              <div className="flex flex-wrap gap-2 pt-1">
                {TIMELINE_CHOICES.map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-[#ff5d3b] hover:text-white"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {step !== "done" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-white/10 p-3"
            >
              <label htmlFor="agent-input" className="sr-only">
                Your message
              </label>
              <input
                id="agent-input"
                ref={inputRef}
                type={step === "email" ? "email" : "text"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  step === "email" ? "you@company.com" : "Type your answer…"
                }
                className="min-h-[44px] w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#ff5d3b]"
              />
              <button
                type="submit"
                aria-label="Send"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#ff5d3b] text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                ↑
              </button>
            </form>
          ) : (
            <div className="border-t border-white/10 p-3">
              <a
                href={`mailto:${company.email}`}
                className="block rounded-xl bg-white/8 px-4 py-3 text-center text-sm text-white/80 hover:text-white"
              >
                Or email us directly →
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
