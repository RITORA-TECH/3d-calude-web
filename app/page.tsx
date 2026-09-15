import Sections from "@/components/Sections";
import Brand from "@/components/Brand";
import SiteEnhancements from "@/components/SiteEnhancements";

export default function Home() {
  return (
    <div id="top">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Brand />
      <SiteEnhancements />
      <main id="main-content" tabIndex={-1} className="relative z-10">
        <Sections />
      </main>
    </div>
  );
}
