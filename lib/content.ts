// Central content for the Ritora Technologies site.
// Single source of truth — every component reads copy/data from here.

export const company = {
  name: "Ritora Technologies",
  shortName: "Ritora",

  // TODO(team): confirm primary market & phone country. The number below is a
  // +1 (US) line — if the studio is India-based, a local +91 number usually
  // reads as more trustworthy to domestic buyers.
  location: "India → worldwide",

  // hero
  eyebrow: "Software studio · India → worldwide",
  headline: "We build software that survives production.",
  sub: "A cross-functional team shipping web, mobile, cloud and AI products — from idea to scale — for startups and enterprises.",
  scrollCue: "Scroll to meet our agent",

  // short line reused in meta / loader
  tagline: "Software that survives production.",
  hero: "A cross-functional team shipping web, mobile, cloud and AI products — from idea to scale — for startups and enterprises.",

  about:
    "Ritora is a cross-functional team building scalable, cloud-native products with modern frontends, robust backends and AI built in.",

  experience: "5+ years across cloud solutions & full-stack development",

  email: "ritoratechnologies@gmail.com",
  phone: "+91 93815 16771", // display
  phoneHref: "+919381516771", // tel: (digits only, no spaces)
  whatsapp: "+91 93815 16771",
  whatsappHref: "919381516771", // wa.me format
  // TODO(team): drop in the real Instagram / YouTube URLs when available.
  instagram: "#",
  youtube: "#",
  replyTime: "We reply within one business day.",
  year: 2026,
};

/** The three scroll-narrative beats (concrete, outcome-led). */
export const narrative: string[] = [
  "Things break in production. We architect so they don't — and ship the fix fast when they do.",
  "One team, the whole stack: mobile, backend, frontend, cloud, and AI.",
  "Designed, built and battle-tested — shipped straight to production.",
];

export type Service = {
  id: string;
  title: string;
  /** one-line capability */
  line: string;
  blurb: string;
  stack: string;
  // which exploded car part this service is "attached" to (for the 3D narrative)
  part: string;
};

export const services: Service[] = [
  {
    id: "mobile",
    title: "Mobile Apps",
    line: "Native-feel iOS & Android, React Native / Flutter.",
    blurb: "Native-grade iOS & Android apps that feel fast and look sharp.",
    stack: "React Native · Flutter · Expo",
    part: "Wheels — built for motion",
  },
  {
    id: "backend",
    title: "Backend & APIs",
    line: "Scalable services, clean APIs, the data layer underneath.",
    blurb: "Resilient services and APIs engineered for scale and uptime.",
    stack: "Java Spring Boot · Node.js · Python FastAPI",
    part: "Engine — the powertrain",
  },
  {
    id: "frontend",
    title: "Frontend & Web",
    line: "Fast, modern, accessible interfaces.",
    blurb: "Pixel-perfect UIs and design systems people love to use.",
    stack: "React.js · Vue · Next.js",
    part: "Body — the form you see",
  },
  {
    id: "devops",
    title: "DevOps & Cloud",
    line: "AWS/GCP, CI/CD, observability, infra that holds.",
    blurb: "Automated, secure cloud infrastructure across every major provider.",
    stack: "AWS · Azure · GCP · Hostinger",
    part: "Chassis — the foundation",
  },
  {
    id: "ai",
    title: "AI & Intelligent Apps",
    line: "RAG, agents, and AI features wired into real products.",
    blurb: "Chatbots, automation and predictive features wired into your product.",
    stack: "LLMs · RAG · Automation",
    part: "Brain — the intelligence",
  },
];

export type Project = {
  title: string;
  category: string;
  /** one-line outcome (replaces generic mood copy) */
  description: string;
  accent: string;
  /** true when a claim still needs team sign-off (e.g. a hard metric) */
  unverified?: boolean;
};

// TODO(team): confirm any hard metrics below (e.g. "sub-100ms") before relying
// on them in sales/marketing. Items flagged `unverified` render without the
// number until confirmed.
export const projects: Project[] = [
  {
    title: "Parashu",
    category: "E-commerce",
    description: "High-conversion storefront with a custom checkout pipeline.",
    accent: "#ff5d3b",
  },
  {
    title: "NAH44 Platform",
    category: "SaaS",
    description: "Multi-tenant SaaS with role-based workspaces.",
    accent: "#3b82f6",
  },
  {
    title: "Modern LMS",
    category: "Education",
    description: "Interactive learning with live progress tracking.",
    accent: "#22c55e",
  },
  {
    title: "Krushi",
    category: "Gig Economy",
    description: "On-demand marketplace connecting workers and employers.",
    accent: "#eab308",
  },
  {
    title: "HasCart",
    category: "E-commerce",
    // TODO(team): target was "sub-100ms catalog search" — confirm the figure,
    // then it can replace this metric-free line.
    description: "Headless commerce with a blazing-fast catalog.",
    accent: "#a855f7",
    unverified: true,
  },
  {
    title: "MedTech",
    category: "Telemedicine",
    description: "Secure video consults + patient records in one platform.",
    accent: "#06b6d4",
  },
  {
    title: "RAG Document Q&A",
    category: "Artificial Intelligence",
    description: "Assistant that answers from your own documents.",
    accent: "#ec4899",
  },
  {
    title: "Rakshak Solutions",
    category: "Corporate",
    description: "Brand-forward corporate site on a custom CMS.",
    accent: "#f97316",
  },
];

/** Sectors strip (approved copy — safe to show). */
export const clientsLine =
  "Teams in e-commerce, health, education and logistics ship with Ritora.";

/** Tech-stack badges (factual capabilities — safe to show). */
export const techStack: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "React Native",
  "Flutter",
  "Node.js",
  "Python",
  "PostgreSQL",
  "AWS",
  "GCP",
  "Docker",
  "LLMs / RAG",
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

// TODO(team): add REAL quotes with consent. The testimonials section is hidden
// while this array is empty — do NOT ship invented quotes.
export const testimonials: Testimonial[] = [];

export type TeamMember = {
  name: string;
  role: string;
  /** /public path to a real photo, e.g. "/team/anita.jpg" */
  photo?: string;
};

// TODO(team): add REAL people + photos. The team section is hidden while this
// array is empty — do NOT ship invented names/headshots.
export const team: TeamMember[] = [];
