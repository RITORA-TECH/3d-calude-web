// Central content for the Ritora Technologies site.
// Single source of truth — every component reads copy/data from here.

export const company = {
  name: "Ritora Technologies",
  shortName: "Ritora",
  /** Brand spellings Google should associate with this site (schema + meta). */
  alternateNames: ["Ritora", "ritoratechnologies", "RitoraTechnologies"] as const,

  location: "India → worldwide",

  // hero
  eyebrow: "Ritora Technologies · India → worldwide",
  headline: "We build software that survives production.",
  sub: "A cross-functional team shipping web, mobile, cloud and AI products — from idea to scale — for startups and enterprises.",
  scrollCue: "Explore our services",

  // short line reused in meta / loader
  tagline: "Software that survives production.",
  hero: "A cross-functional team shipping web, mobile, cloud and AI products — from idea to scale — for startups and enterprises.",

  about:
    "Ritora Technologies is a cross-functional team building scalable, cloud-native products with modern frontends, robust backends and AI built in.",

  experience: "5+ years across cloud solutions & full-stack development",

  email: "ritoratechnologies@gmail.com",
  phone: "+91 93815 16771", // display
  phoneHref: "+919381516771", // tel: (digits only, no spaces)
  whatsapp: "+91 93815 16771",
  whatsappHref: "919381516771", // wa.me format
  instagram: "https://www.instagram.com/ritoratechnologies?utm_source=qr&igsh=dDVmZ3BkMWk1M3Rz",
  youtube: "https://www.youtube.com/@RitoraTechnologies",
  replyTime: "We reply within one business day.",
  year: new Date().getFullYear(),
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
    blurb: "iOS and Android app development with shared codebases, responsive interfaces and the integrations your product needs.",
    stack: "React Native · Flutter · Expo",
    part: "Wheels — built for motion",
  },
  {
    id: "backend",
    title: "Backend & APIs",
    line: "Scalable services, clean APIs, the data layer underneath.",
    blurb: "Custom APIs, business logic and data systems that connect your product and support its growth.",
    stack: "Java Spring Boot · Node.js · Python FastAPI",
    part: "Engine — the powertrain",
  },
  {
    id: "frontend",
    title: "Frontend & Web",
    line: "Fast, modern, accessible interfaces.",
    blurb: "Custom websites and web applications with accessible interfaces, reusable design systems and performance in mind.",
    stack: "React.js · Vue · Next.js",
    part: "Body — the form you see",
  },
  {
    id: "devops",
    title: "DevOps & Cloud",
    line: "AWS/GCP, CI/CD, observability, infra that holds.",
    blurb: "Cloud infrastructure, automated deployments and monitoring to help your team release and operate software with confidence.",
    stack: "AWS · Azure · GCP · Hostinger",
    part: "Chassis — the foundation",
  },
  {
    id: "ai",
    title: "AI & Intelligent Apps",
    line: "RAG, agents, and AI features wired into real products.",
    blurb: "Document assistants, chatbots and workflow automation that connect AI models to your product and business data.",
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
    description: "An e-commerce storefront with a custom checkout pipeline.",
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

/** Answers grounded in the capabilities and contact process on this page. */
export const faqs = [
  { question: "What can you help us build?", answer: "We build web applications, iOS and Android apps, backend services and APIs, cloud infrastructure, and AI features. You can come to us with a new product idea or a part of an existing product that needs attention." },
  { question: "Can you work with our existing technology?", answer: "Our stack includes React, Next.js, React Native, Flutter, Node.js, Python, Java Spring Boot and major cloud platforms. Share your current setup and the problem you want to solve so we can discuss the right fit." },
  { question: "Do you work with teams outside India?", answer: "Yes. We are based in India and work with teams worldwide. Include your location and time zone in your enquiry so we can coordinate a conversation." },
  { question: "What should I include in a project enquiry?", answer: "Tell us what you want to build, who it is for, and your preferred timeline. If you have an existing product, a brief or a budget range, include those too. We reply within one business day after receiving your email." },
];
