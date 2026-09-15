import { company } from "@/lib/content";

export type Step = "intent" | "timeline" | "email" | "done";
export type Lead = { intent: string; timeline: string; email: string };
export const TIMELINE_CHOICES = ["ASAP", "1–3 months", "3–6 months", "Just exploring"];

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const GREETING = `Hi! I can help you prepare a project enquiry for ${company.shortName}. This is a guided assistant. Nothing is sent until you send the email. What would you like to build?`;

/** Local guided enquiry. No network requests or claims of automatic delivery. */
export function advance(step: Step, value: string): { next: Step; reply: string; valid: boolean } {
  if (step !== "done" && !value.trim()) {
    return { next: step, reply: "Please add an answer so we can continue.", valid: false };
  }
  switch (step) {
    case "intent":
      return { next: "timeline", valid: true, reply: "What timeline do you have in mind?" };
    case "timeline":
      return { next: "email", valid: true, reply: "What email should the team reply to?" };
    case "email":
      return isEmail(value)
        ? { next: "done", valid: true, reply: "Your enquiry is ready. Review the details below, then open the email draft and press send in your email app. Nothing has been sent yet." }
        : { next: "email", valid: false, reply: "Please enter a valid email address, such as you@company.com." };
    default:
      return { next: "done", valid: true, reply: "" };
  }
}

export function createEnquiryHref(lead: Lead): string {
  const subject = encodeURIComponent("Project enquiry");
  const body = encodeURIComponent(
    `Hi ${company.shortName} team,\n\nI'd like to discuss a project.\n\nProject: ${lead.intent.trim()}\nTimeline: ${lead.timeline.trim()}\nReply to: ${lead.email.trim()}\n`
  );
  return `mailto:${company.email}?subject=${subject}&body=${body}`;
}
