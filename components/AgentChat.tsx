"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { company } from "@/lib/content";
import { GREETING, TIMELINE_CHOICES, advance, createEnquiryHref, type Lead, type Step } from "@/lib/agent";

type Message = { role: "assistant" | "user"; text: string };

export default function AgentChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intent");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [lead, setLead] = useState<Lead>({ intent: "", timeline: "", email: "" });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("ritora:chat", show);
    return () => window.removeEventListener("ritora:chat", show);
  }, []);

  useEffect(() => {
    if (open && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    if (open && step !== "done") inputRef.current?.focus();
  }, [open, step]);

  function send(raw: string) {
    if (!raw.trim() || step === "done") return;
    const value = raw.trim();
    const result = advance(step, value);
    setMessages((current) => [...current, { role: "user", text: value }, { role: "assistant", text: result.reply }]);
    if (result.valid) setLead((current) => ({ ...current, [step]: value }));
    setInput("");
    setStep(result.next);
    inputRef.current?.focus();
  }

  function restart() {
    setMessages([{ role: "assistant", text: GREETING }]);
    setStep("intent");
    setInput("");
    setLead({ intent: "", timeline: "", email: "" });
  }

  return <>
    <button ref={launcherRef} onClick={() => setOpen(true)} className="chat-launcher" aria-haspopup="dialog" aria-controls="project-assistant" aria-expanded={open} aria-label="Open project enquiry assistant">
      <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-3 3V11.5A7.5 7.5 0 0 1 9.5 4h3a7.5 7.5 0 0 1 7.5 7.5Z" /><path d="M7 10h8M7 14h5" /></svg>
      <span className="chat-launcher-label">Project assistant</span>
    </button>
    <dialog id="project-assistant" ref={dialogRef} className="chat-dialog" aria-labelledby="assistant-title" aria-describedby="assistant-description" onCancel={close} onClose={() => setOpen(false)}>
      <div className="chat-inner">
        <header className="chat-header"><div><h2 id="assistant-title">{company.shortName} project assistant</h2><p id="assistant-description">A guided enquiry · sent through your email app</p></div><button onClick={close} className="chat-close" aria-label="Close project assistant">×</button></header>
        <div className="chat-log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions" aria-label="Enquiry conversation">
          {messages.map((message, index) => <p key={index} className={`chat-message chat-message-${message.role}`}><span className="sr-only">{message.role === "user" ? "You" : "Assistant"}: </span>{message.text}</p>)}
          {step === "timeline" && <div className="chat-choices">{TIMELINE_CHOICES.map((choice) => <button key={choice} onClick={() => send(choice)}>{choice}</button>)}</div>}
          {step === "done" && <div className="enquiry-review"><h3>Your project enquiry</h3><dl><dt>Project</dt><dd>{lead.intent}</dd><dt>Timeline</dt><dd>{lead.timeline}</dd><dt>Reply to</dt><dd>{lead.email}</dd></dl><a href={createEnquiryHref(lead)} className="button button-primary">Open email draft ↗</a><p>If your email app does not open, send these details to <a href={`mailto:${company.email}`}>{company.email}</a>.</p><button type="button" onClick={restart} className="text-link">Start again</button></div>}
        </div>
        {step !== "done" && <form className="chat-form" onSubmit={(event) => { event.preventDefault(); send(input); }}>
          <label htmlFor="agent-input" className="sr-only">{step === "email" ? "Your email address" : step === "timeline" ? "Your project timeline" : "What would you like to build?"}</label>
          <input id="agent-input" ref={inputRef} type={step === "email" ? "email" : "text"} autoComplete={step === "email" ? "email" : "off"} maxLength={step === "email" ? 254 : 2000} required value={input} onChange={(event) => setInput(event.target.value)} placeholder={step === "email" ? "you@company.com" : "Type your answer…"} />
          <button type="submit" disabled={!input.trim()} aria-label="Continue">↑</button>
        </form>}
      </div>
    </dialog>
  </>;
}
