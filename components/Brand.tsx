import Image from "next/image";
import { company } from "@/lib/content";

/**
 * Fixed brand mark (logo) shown top-left across the site.
 * The Ritora "R" symbol + wordmark; clicking scrolls back to the top.
 */
export default function Brand() {
  return (
    <header className="site-header">
    <a
      href="#top"
      aria-label={`${company.name} — home`}
      className="brand-link"
    >
      <Image
        src="/ritora-symbol.png"
        alt=""
        width={40}
        height={40}
        priority
        className="h-9 w-9 drop-shadow-[0_2px_8px_rgba(255,93,59,0.35)]"
      />
      <span className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight text-white">
          {company.shortName}
        </span>
        <span className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#ff805f]">
          Technologies
        </span>
      </span>
    </a>
    <nav aria-label="Main navigation" className="main-nav">
      <a href="#services">Services</a>
      <a href="#about">About us</a>
      <a href="#faq" className="nav-about">FAQs</a>
      <a href="#contact" className="nav-contact">Let&apos;s talk <span aria-hidden="true">↗</span></a>
    </nav>
    </header>
  );
}
