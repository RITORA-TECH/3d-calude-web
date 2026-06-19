// Central content for the Ritora Technologies site.
// Edit copy here — components read from these arrays.

export const company = {
  name: "Ritora Technologies",
  shortName: "Ritora",
  tagline: "Scalable. Global. Engineered to last.",
  hero: "Full-stack development, cloud solutions & AI. We build products that scale.",
  about:
    "Ritora is a cross-functional team building scalable applications from idea to production. We specialise in cloud-native architecture, modern frontends, robust backends and AI-integrated products for enterprises and startups worldwide.",
  experience: "5+ years across cloud solutions & full-stack development",
  email: "hello@ritoratech.com",
  phone: "+1 656 204 4178",
  whatsapp: "+1 656 204 4178",
  year: 2026,
};

export type Service = {
  id: string;
  title: string;
  blurb: string;
  stack: string;
  // which exploded car part this service is "attached" to (for narrative)
  part: string;
};

export const services: Service[] = [
  {
    id: "mobile",
    title: "Mobile Apps",
    blurb: "Native-grade iOS & Android apps that feel fast and look sharp.",
    stack: "React Native · Flutter · Expo",
    part: "Wheels — built for motion",
  },
  {
    id: "backend",
    title: "Backend & APIs",
    blurb: "Resilient services and APIs engineered for scale and uptime.",
    stack: "Java Spring Boot · Node.js · Python FastAPI",
    part: "Engine — the powertrain",
  },
  {
    id: "frontend",
    title: "Frontend & Web",
    blurb: "Pixel-perfect UIs and design systems people love to use.",
    stack: "React.js · Vue · Next.js",
    part: "Body — the form you see",
  },
  {
    id: "devops",
    title: "DevOps & Cloud",
    blurb: "Automated, secure cloud infrastructure across every major provider.",
    stack: "AWS · Azure · GCP · Hostinger",
    part: "Chassis — the foundation",
  },
  {
    id: "ai",
    title: "AI & Intelligent Apps",
    blurb: "Chatbots, automation and predictive features wired into your product.",
    stack: "LLMs · RAG · Automation",
    part: "Brain — the intelligence",
  },
];

export type Project = {
  title: string;
  category: string;
  description: string;
  accent: string; // tailwind/hex accent
};

export const projects: Project[] = [
  {
    title: "Parashu",
    category: "E-commerce",
    description: "A high-conversion storefront with a custom checkout pipeline.",
    accent: "#ff5d3b",
  },
  {
    title: "NAH44 Platform",
    category: "SaaS",
    description: "Multi-tenant SaaS platform with role-based workspaces.",
    accent: "#3b82f6",
  },
  {
    title: "Modern LMS",
    category: "Education",
    description: "Interactive learning system with live progress tracking.",
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
    description: "Headless commerce engine with blazing-fast catalog search.",
    accent: "#a855f7",
  },
  {
    title: "MedTech",
    category: "Telemedicine",
    description: "Secure video consults and patient records in one platform.",
    accent: "#06b6d4",
  },
  {
    title: "RAG Document Q&A",
    category: "Artificial Intelligence",
    description: "Retrieval-augmented assistant that answers from your documents.",
    accent: "#ec4899",
  },
  {
    title: "Rakshak Solutions",
    category: "Corporate",
    description: "Brand-forward corporate presence with a custom CMS.",
    accent: "#f97316",
  },
];
