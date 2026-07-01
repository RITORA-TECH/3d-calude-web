import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { company, services } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Drives canonical URL, sitemap, robots.txt, Open Graph, and JSON-LD URLs.
export const SITE_URL = "https://ritoratechnologies.com";
const title = `${company.name} — ${company.tagline}`;
const description =
  "Ritora Technologies is a full-stack software development company building " +
  "web, mobile, cloud and AI products — React, Next.js, React Native, Flutter, " +
  "Node.js, Python, AWS, Azure & GCP. From idea to scale for startups and " +
  "enterprises. India → worldwide.";

// Relevant, non-spammy keyword set spanning the studio's actual capabilities.
const keywords = [
  company.name,
  ...company.alternateNames,
  "software development company",
  "software studio",
  "custom software development",
  "full-stack development",
  "web development",
  "web app development",
  "mobile app development",
  "iOS app development",
  "Android app development",
  "React development",
  "Next.js development",
  "React Native",
  "Flutter development",
  "Node.js development",
  "Python development",
  "Java Spring Boot",
  "API development",
  "backend development",
  "frontend development",
  "UI UX design",
  "SaaS development",
  "e-commerce development",
  "cloud computing",
  "cloud-native development",
  "AWS",
  "Microsoft Azure",
  "Google Cloud Platform",
  "DevOps",
  "CI/CD",
  "Docker",
  "Kubernetes",
  "AI development",
  "artificial intelligence",
  "machine learning",
  "generative AI",
  "LLM",
  "RAG",
  "AI chatbot development",
  "AI agents",
  "automation",
  "startup software development",
  "enterprise software",
  "software development India",
  "hire software developers",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s · ${company.name}`,
  },
  description,
  keywords,
  applicationName: company.name,
  category: "technology",
  authors: [{ name: company.name, url: SITE_URL }],
  creator: company.name,
  publisher: company.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: company.name,
    title,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${company.name} — ${company.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
  // Favicon is provided by the file-based convention at app/icon.png
  // (the Ritora "R" symbol).
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/** Organization + service structured data for rich results. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${SITE_URL}/#organization`,
      name: company.name,
      alternateName: [...company.alternateNames],
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      image: `${SITE_URL}/og.png`,
      description,
      slogan: company.tagline,
      email: company.email,
      telephone: company.phoneHref,
      foundingLocation: "India",
      areaServed: "Worldwide",
      address: { "@type": "PostalAddress", addressCountry: "IN" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: company.email,
        telephone: company.phoneHref,
        availableLanguage: ["en"],
      },
      sameAs: [company.instagram, company.youtube].filter((u) => u && u !== "#"),
      knowsAbout: keywords,
      makesOffer: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.blurb },
      })),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: company.name,
      alternateName: [...company.alternateNames],
      description,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-R4PNQRWRW4"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-R4PNQRWRW4');
            `,
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
