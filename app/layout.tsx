import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { company } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// TODO(team): set the real production domain + add /public/og.png (1200×630)
// and a /public/favicon set. Until og.png exists, social cards fall back to text.
const SITE_URL = "https://ritoratech.com";
const title = `${company.name} — ${company.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s · ${company.name}`,
  },
  description: company.hero,
  keywords: [
    "software studio",
    "full-stack development",
    "cloud",
    "AI",
    "mobile apps",
    "DevOps",
    company.name,
  ],
  applicationName: company.name,
  authors: [{ name: company.name }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: company.name,
    title,
    description: company.hero,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: company.name }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: company.hero,
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
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
      <body>{children}</body>
    </html>
  );
}
