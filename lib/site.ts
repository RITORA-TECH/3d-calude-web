import { company, services } from "./content";

// Keep canonical, structured-data, sitemap and robots URLs in one place.
// Preserve the existing production domain until a replacement is confirmed.
export const SITE_URL = "https://ritoratechnologies.com";
export const siteTitle = `${company.name} | Web, Mobile & AI Development`;
export const siteDescription = `${company.name} builds custom web and mobile apps, backend APIs, cloud infrastructure and AI products for startups and enterprises. India to worldwide.`;

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: company.name,
      alternateName: company.alternateNames,
      url: SITE_URL,
      logo: `${SITE_URL}/ritora-symbol.png`,
      image: `${SITE_URL}/og.png`,
      description: company.about,
      slogan: company.tagline,
      email: company.email,
      telephone: company.phoneHref,
      address: { "@type": "PostalAddress", addressCountry: "IN" },
      sameAs: [company.instagram, company.youtube],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: company.email,
        telephone: company.phoneHref,
        availableLanguage: ["English"],
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Software development services",
        itemListElement: services.map((service) => ({
          "@type": "Offer",
          itemOffered: { "@id": `${SITE_URL}/#service-${service.id}` },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: company.name,
      alternateName: company.alternateNames,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: siteTitle,
      description: siteDescription,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    ...services.map((service) => ({
      "@type": "Service",
      "@id": `${SITE_URL}/#service-${service.id}`,
      url: `${SITE_URL}/#service-${service.id}`,
      name: service.title,
      description: service.blurb,
      serviceType: service.title,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: "Worldwide",
    })),
  ],
};
