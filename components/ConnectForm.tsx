"use client";

import { useState } from "react";
import { company } from "@/lib/content";
import { createEnquiryHref } from "@/lib/agent";

export default function ConnectForm() {
  const [opened, setOpened] = useState(false);

  return <form className="connect-form" action={`mailto:${company.email}`} method="post" encType="text/plain" onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    window.location.href = createEnquiryHref({
      email: String(data.get("email") ?? "").trim(),
      intent: String(data.get("project") ?? "").trim(),
      timeline: "To be discussed",
    });
    setOpened(true);
  }}>
    <h3>Start the conversation</h3>
    <p>{company.replyTime}</p>
    <label htmlFor="connect-email">Your email</label>
    <input id="connect-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" onChange={() => setOpened(false)} />
    <label htmlFor="connect-project">What do you have in mind?</label>
    <textarea id="connect-project" name="project" required minLength={10} maxLength={2000} rows={4} placeholder="A little about your project, goals and timeline…" onChange={() => setOpened(false)} />
    <button type="submit" className="button button-primary">Prepare project email <span aria-hidden="true">↗</span></button>
    <p className="form-note">Opens a draft in your email app. Review it and press send to contact our team.</p>
    <p role="status" className="form-status">{opened && <>Your email draft is ready to open. If nothing happened, email <a href={`mailto:${company.email}`}>{company.email}</a> directly.</>}</p>
  </form>;
}
