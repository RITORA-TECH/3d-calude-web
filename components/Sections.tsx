import { company, services, clientsLine, techStack, testimonials, team, faqs } from "@/lib/content";
import { MailIcon, PhoneIcon, WhatsAppIcon, InstagramIcon, YouTubeIcon } from "./Icons";
import ConnectForm from "./ConnectForm";

function Hero() {
  return (
    <section className="hero section-shell" aria-labelledby="hero-title">
      <div className="hero-copy text-scrim">
        <p className="eyebrow">Software development · India to worldwide</p>
        <h1 id="hero-title">We build software that <span>survives production.</span></h1>
        <p className="hero-description">{company.sub}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#contact">Discuss your project <span aria-hidden="true">↗</span></a>
          <a className="button button-secondary" href="#services">Explore our services</a>
        </div>
        <p className="hero-note">Web. Mobile. Cloud. AI. <span>One connected team.</span></p>
      </div>
      <a href="#approach" className="scroll-cue"><span aria-hidden="true">↓</span> Built for what comes next</a>
    </section>
  );
}

function Approach() {
  return (
    <section id="approach" className="story-section section-shell" aria-labelledby="approach-title">
      <div className="story-copy text-scrim">
        <p className="eyebrow">Beyond the first launch</p>
        <h2 id="approach-title">Good software holds up <span className="muted-heading">in the real world.</span></h2>
        <p className="section-description">Real users. Growing traffic. Changing requirements. We bring the interface, services and infrastructure together, so your product is ready for what comes next.</p>
        <a href="#services" className="text-link">See what we build <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="about-section section-shell" aria-labelledby="about-title">
      <div className="about-copy text-scrim">
        <p className="eyebrow">One team, the whole stack</p>
        <h2 id="about-title">From your first idea <span className="muted-heading">to your next stage.</span></h2>
        <p className="section-description">{company.about}</p>
        <p className="sector-line">{clientsLine}</p>
      </div>
      <div className="capability-strip" aria-label="Our focus">
        <span>Product-minded engineering</span><span>Connected systems</span><span>Built to grow</span>
      </div>
      {team.length > 0 && <div className="team-grid">{team.map((member) => <article key={member.name}>
        {member.photo && <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={member.photo} alt={`${member.name}, ${member.role}`} width="240" height="240" loading="lazy" className="team-photo" />
        </>}
        <h3>{member.name}</h3><p>{member.role}</p>
      </article>)}</div>}
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="services-section section-shell" aria-labelledby="services-title">
      <div className="section-heading">
        <div><p className="eyebrow">What we build</p><h2 id="services-title">Every layer.<br /><span className="muted-heading">Working together.</span></h2></div>
        <p className="section-description">Start with the expertise you need. Connect the rest as your product grows.</p>
      </div>
      <div className="services-grid">
        {services.map((service, index) => <article key={service.id} id={`service-${service.id}`} className="service-card">
          <span className="card-number" aria-hidden="true">0{index + 1}</span>
          <h3>{service.title}</h3><p>{service.blurb}</p>
          <p className="service-stack">{service.stack}</p>
        </article>)}
        <div className="service-card service-cta"><span className="card-number">Your next project</span><h3>Not sure where to start?</h3><p>Tell us what you want to build. We can talk through the technical pieces together.</p><a className="text-link" href="#contact">Let&apos;s figure it out <span aria-hidden="true">↗</span></a></div>
      </div>
      <div className="tech-stack"><p>Tools we work with</p><ul aria-label="Technologies">{techStack.map((tech) => <li key={tech}>{tech}</li>)}</ul></div>
    </section>
  );
}

function Testimonials() {
  if (testimonials.length === 0) return null;
  return <section className="section-shell testimonials-section" aria-labelledby="testimonials-title"><p className="eyebrow">In their words</p><h2 id="testimonials-title">From the teams we work with.</h2><div className="quote-grid">{testimonials.map((quote) => <figure className="quote-card" key={`${quote.name}-${quote.company}`}><blockquote>“{quote.quote}”</blockquote><figcaption>{quote.name} — {quote.role}, {quote.company}</figcaption></figure>)}</div></section>;
}

function FAQ() {
  return <section id="faq" className="faq-section section-shell" aria-labelledby="faq-title"><div><p className="eyebrow">A few useful answers</p><h2 id="faq-title">Before we<br /><span className="muted-heading">get started.</span></h2></div><div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>;
}

function Contact() {
  return <section id="contact" className="contact-section section-shell" aria-labelledby="contact-title">
    <div className="contact-copy"><p className="eyebrow">Let&apos;s build something useful</p><h2 id="contact-title">What are<br />you <span>building?</span></h2><p className="section-description">A new idea, a product that needs to grow, or a technical challenge. Tell us where you are and where you want to go.</p>
      <div className="contact-links"><a href={`mailto:${company.email}`}><MailIcon />{company.email}</a><a href={`tel:${company.phoneHref}`}><PhoneIcon />{company.phone}</a><a href={`https://wa.me/${company.whatsappHref}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />Start a WhatsApp conversation <span className="sr-only">(opens in a new tab)</span><span aria-hidden="true">↗</span></a></div>
    </div><ConnectForm />
  </section>;
}

export default function Sections() {
  return <>
    <div id="story"><Hero /><Approach /><About /><Services /></div>
    <div className="content-surface"><Testimonials /><FAQ /><Contact />
      <footer className="site-footer section-shell"><div><p>© {company.year} {company.name}.</p><p>India to worldwide.</p></div><nav aria-label="Footer navigation"><a href="#faq">FAQs</a><a href={company.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${company.shortName} on Instagram (opens in a new tab)`}><InstagramIcon /></a><a href={company.youtube} target="_blank" rel="noopener noreferrer" aria-label={`${company.shortName} on YouTube (opens in a new tab)`}><YouTubeIcon /></a><a href="#top">Back to top ↑</a></nav></footer>
    </div>
  </>;
}
