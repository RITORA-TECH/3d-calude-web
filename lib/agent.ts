// The AI-agent conversation logic, kept behind a single swappable boundary.
//
// v1 is a deterministic lead-qualifier (greet → intent → timeline → email).
// To upgrade to an LLM: keep `nextAgentMessage`'s signature and stream the
// reply instead of returning the canned string. Everything in AgentChat.tsx
// already treats this as async, so a network/streaming call drops straight in.

import { company } from "@/lib/content";

export type Step = "intent" | "timeline" | "email" | "done";

export type Lead = {
  intent: string;
  timeline: string;
  email: string;
};

export const TIMELINE_CHOICES = ["ASAP", "1–3 months", "3–6 months", "Just exploring"];

export function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export const GREETING = `Hi! I'm ${company.shortName}'s AI agent 👋  In a few quick questions I'll get the right person to reply. First — what are you building?`;

/**
 * Given the current step and the user's answer, return the next step and the
 * agent's reply. Pure + deterministic so it's trivial to test and to swap for
 * a model later.
 */
export function advance(
  step: Step,
  value: string
): { next: Step; reply: string; valid: boolean } {
  const v = value.trim();
  switch (step) {
    case "intent":
      return {
        next: "timeline",
        valid: true,
        reply: "Love it. What's your timeline?",
      };
    case "timeline":
      return {
        next: "email",
        valid: true,
        reply: "Great. What's the best email to reach you?",
      };
    case "email":
      if (!isEmail(v)) {
        return {
          next: "email",
          valid: false,
          reply: "Hmm, that doesn't look like an email — mind trying again?",
        };
      }
      return {
        next: "done",
        valid: true,
        reply: `Thanks! We'll review this and reply within one business day. Talk soon. 🎉`,
      };
    case "done":
    default:
      return { next: "done", valid: true, reply: "" };
  }
}

/** Async wrapper = the swap point for a streaming LLM backend. */
export async function nextAgentMessage(step: Step, value: string) {
  // e.g. const res = await fetch("/api/agent", { ... }); return stream(res)
  return advance(step, value);
}

/**
 * Hand the captured lead to the backend. Tries POST /api/lead; if no endpoint
 * exists yet it falls back to a mailto so nothing is lost.
 * TODO(team): implement /api/lead (or wire to your CRM) and remove the fallback.
 */
export async function submitLead(lead: Lead): Promise<boolean> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (res.ok) return true;
  } catch {
    /* no endpoint yet — fall through */
  }
  if (typeof window !== "undefined") {
    const subject = encodeURIComponent("New lead from the AI agent");
    const body = encodeURIComponent(
      `Building: ${lead.intent}\nTimeline: ${lead.timeline}\nEmail: ${lead.email}\n`
    );
    window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;
  }
  return false;
}
