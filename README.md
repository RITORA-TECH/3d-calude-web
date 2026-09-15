# Ritora Technologies website

Company website built with Next.js 16, React 19 and an optional React Three Fiber scene.

## Run locally

```sh
npm ci
npm run dev
```

## Production checks

```sh
npm run build
npm start
```

The build downloads Geist fonts from Google, then self-hosts them. Network access is required at build time. The main route, sitemap and robots file are prerendered; the existing Next.js deployment flow is preserved.

## Content and SEO

- `lib/content.ts`: company details, services and FAQs. Project names are intentionally not displayed. Add only real team members and consented testimonials.
- `lib/site.ts`: production URL, page title, description and Organization / WebSite / WebPage / Service structured data.
- `app/layout.tsx`: metadata, existing social card and analytics.
- `app/sitemap.ts` and `app/robots.ts`: share the same production URL. The sitemap omits `lastModified` until a genuine content revision date is maintained.
- `public/og.png`, `public/ritora-symbol.png` and `app/icon.png`: existing brand assets.

The repository identifies the company as **Ritora Technologies**, at `https://ritoratechnologies.com`. A request referred to Exciter Technologies; branding, domain and contact changes await confirmation. Update content, SEO configuration and assets together if a rebrand is intended.

SEO follows [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) and [Next.js metadata conventions](https://nextjs.org/docs/app/getting-started/metadata-and-og-images). The main content is rendered on the server and visible without JavaScript. Metadata and structured data describe the visible services; no ranking or rich-result guarantees are implied.

## Enquiries

The contact form and guided project assistant prepare an email draft. Visitors review it and press send in their email app. There is no lead API, database, automatic submission or language-model integration. Email, telephone and WhatsApp links are also available directly. The contact form has a native `mailto:` fallback when JavaScript is unavailable.

## Motion and accessibility

The 3D scene is deferred until after the initial content, then runs on desktop and mobile by default. It remains off for users who explicitly request reduced motion, and visitors can switch it on or off. Rendering pauses only when the tab is hidden. A scene error does not replace the page content.

Native scrolling preserves fragment navigation. The page includes a skip link, semantic sections, visible focus indicators, labelled form inputs, native FAQ disclosures and a native modal dialog for the enquiry assistant.

Before publishing, check the site at mobile and desktop sizes, keyboard navigation, 200% zoom, reduced motion, and the email handoff in a real email client. Submit `/sitemap.xml` in the production domain's Google Search Console after deployment.
