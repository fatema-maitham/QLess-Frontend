import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bank,
  Bell,
  Buildings,
  CalendarCheck,
  Car,
  ChatCircleText,
  CheckCircle,
  ForkKnife,
  GraduationCap,
  Hospital,
  Lightning,
  Megaphone,
  Package,
  PawPrint,
  PiggyBank,
  Pill,
  Plus,
  Quotes,
  Scales,
  SimCard,
  Smiley,
  Stack,
  Star,
  Storefront,
  TestTube,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";
import {
  TRUST_POINTS,
  PARTNER_LOGOS,
  REVIEWS,
  QUEUE_SCROLL,
  STEPS,
  AUDIENCES,
  FEATURES,
  VALUES,
  STATS,
  INDUSTRIES,
  PLACES,
  FAQS,
  FOOTER_LINKS,
} from "./landingData";
import "./LandingPage.css";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/* =========================================================
   Icon map (data uses short names)
   ========================================================= */

const ICONS = {
  bell: Bell,
  calendar: CalendarCheck,
  buildings: Buildings,
  users: UsersThree,
  megaphone: Megaphone,
  star: Star,
  smile: Smiley,
  scales: Scales,
  stack: Stack,
  chat: ChatCircleText,
  government: Bank,
  banks: PiggyBank,
  healthcare: Hospital,
  pharmacies: Pill,
  telecom: SimCard,
  universities: GraduationCap,
  car: Car,
  restaurants: ForkKnife,
  labs: TestTube,
  veterinary: PawPrint,
  post: Package,
  utilities: Lightning,
};

/* =========================================================
   Hooks
   ========================================================= */

function useReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

// true once the element has scrolled into view
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

// Counts from 0 to target once `start` is true
function useCountUp(target, start, reduced, duration = 1800) {
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setValue(target);
      return;
    }

    let frame;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target, reduced, duration]);

  return value;
}

// Fades content up once when it scrolls into view
function Reveal({ as: Tag = "div", className = "", children }) {
  const [ref, inView] = useInView();

  return (
    <Tag ref={ref} className={`lp-reveal ${inView ? "is-shown" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

function SectionHead({ eyebrow, title, text, id, children }) {
  return (
    <Reveal className="lp-section__head lp-section__head--center">
      <p className="lp-eyebrow">
        {eyebrow}
        {children}
      </p>
      <h2 id={id} className="lp-h2">
        {title}
      </h2>
      {text && <p className="lp-section__text">{text}</p>}
    </Reveal>
  );
}

/* =========================================================
   1. Hero (static)
   ========================================================= */
function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero__panel">
        <div className="lp-hero__content">

          <h1 className="lp-hero__title">
            Your time is
            <br />
            worth more
            <br />
            <span>than a line.</span>
          </h1>

          <p className="lp-hero__text">
            QLess holds your place while you get on with your day. We'll tell
            you when it's your turn.
          </p>

          <div className="lp-hero__actions">
            <Link className="btn btn--primary" to="/businesses">
              Find a place
            </Link>
            <Link className="btn lp-btn-light" to="/business/register">
              For businesses
            </Link>
          </div>
        </div>

        <div className="lp-hero__visual">
          <img src="/hero.png" alt="QLess hero" />
        </div>
      </div>
    </section>
  );
}
/* =========================================================
   3. Three steps
   ========================================================= */

function Steps() {
  return (
    <section className="lp-section" aria-labelledby="steps-title">
      <div className="lp-container">
        <SectionHead id="steps-title" eyebrow="How it works" title="Three steps for visitors" />

        <ol className="lp-steps lp-stagger">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} className="lp-step">
              <span className="lp-step__dot">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* =========================================================
   4. Visitors and businesses
   ========================================================= */

function SideCard({ data, variant, Icon }) {
  return (
    <article className={`lp-side lp-side--${variant}`}>
      <span className="lp-side__icon">
        <Icon size={34} weight="duotone" />
      </span>
      <span className="lp-side__tag">{data.tag}</span>
      <h3>{data.title}</h3>
      <p>{data.text}</p>

      <ul className="lp-side__points">
        {data.points.map((point) => (
          <li key={point}>
            <CheckCircle size={22} weight="fill" />
            {point}
          </li>
        ))}
      </ul>

      <Link
        className={`btn ${variant === "business" ? "btn--primary" : "lp-btn-dark"} lp-side__btn`}
        to={data.button.to}
      >
        {data.button.label}
      </Link>
    </article>
  );
}

function Audiences() {
  return (
    <section className="lp-section lp-section--tight" aria-labelledby="audience-title">
      <div className="lp-container">
        <SectionHead
          id="audience-title"
          eyebrow="Who it's for"
          title="Built for both sides of the counter"
        />

        <div className="lp-audience__grid lp-stagger">
          <Reveal>
            <SideCard data={AUDIENCES.visitors} variant="visitors" Icon={UserCircle} />
          </Reveal>
          <Reveal>
            <SideCard data={AUDIENCES.business} variant="business" Icon={Storefront} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   5. Features
   ========================================================= */

function Features() {
  return (
    <section className="lp-section" aria-labelledby="features-title">
      <div className="lp-container">
        <SectionHead
          id="features-title"
          eyebrow="Features"
          title="Everything a queue needs"
          text="Simple for visitors, powerful for your team."
        />

        <div className="lp-feats lp-stagger">
          {FEATURES.map((feature) => {
            const FeatureIcon = ICONS[feature.icon];
            return (
              <Reveal key={feature.title}>
                <article className="lp-feat">
                  <span className="lp-feat__icon">
                    <FeatureIcon size={28} weight="duotone" />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   6. Why QLess
   ========================================================= */

function Values() {
  return (
    <section className="lp-section lp-section--tight" aria-labelledby="values-title">
      <div className="lp-container">
        <SectionHead
          id="values-title"
          eyebrow="Why QLess"
          title="Simple, fair and built for real counters"
        />

        <div className="lp-values lp-stagger">
          {VALUES.map((value) => {
            const ValueIcon = ICONS[value.icon];
            return (
              <Reveal key={value.title} className="lp-value">
                <span className="lp-value__icon">
                  <ValueIcon size={28} weight="duotone" />
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   7. Numbers (count up)
   ========================================================= */

function StatNumber({ stat, start, reduced }) {
  const value = useCountUp(stat.value, start, reduced);

  return (
    <div className="lp-num">
      <b>
        {value.toLocaleString()}
        {stat.suffix}
      </b>
      <span>{stat.label}</span>
    </div>
  );
}

function Numbers({ reduced }) {
  const [ref, inView] = useInView();

  return (
    <section className="lp-numbers" aria-labelledby="numbers-title">
      <div className="lp-container">
        <div ref={ref} className="lp-band">
          <p className="lp-band__eyebrow">QLess in numbers</p>
          <h2 id="numbers-title" className="lp-band__title">
            Less waiting for visitors.
            <br />
            Less pressure on staff.
          </h2>

          <div className="lp-nums">
            {STATS.map((stat) => (
              <StatNumber key={stat.label} stat={stat} start={inView} reduced={reduced} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   8. Trusted by: logos + reviews
   ========================================================= */

function LogoItem({ logo, hidden }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null; // missing file: hide the spot, no text

  return (
    <li className="lp-logo" aria-hidden={hidden ? "true" : undefined}>
      <img
        src={logo.src}
        alt={hidden ? "" : logo.name}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </li>
  );
}

function LogoStrip() {
  const repeats = Math.max(1, Math.ceil(8 / PARTNER_LOGOS.length));
  const base = Array.from({ length: repeats }).flatMap(() => PARTNER_LOGOS);
  const logos = [...base, ...base];

  return (
    <section className="lp-logos-section" aria-labelledby="trust-title">
      <p id="trust-title" className="lp-trust__title">
        Trusted by
      </p>

      <div className="lp-marquee">
        <ul className="lp-marquee__track">
          {logos.map((logo, i) => (
            <LogoItem key={`${logo.name}-${i}`} logo={logo} hidden={i >= PARTNER_LOGOS.length} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="lp-section" aria-labelledby="reviews-title">
      <div className="lp-container">
        <SectionHead id="reviews-title" eyebrow="Reviews" title="Happy businesses, happy visitors">
          <span className="lp-sample">Sample</span>
        </SectionHead>

        <div className="lp-reviews">
          {REVIEWS.map((review) => (
            <Reveal key={review.name} className="lp-review-wrap">
              <figure className="lp-review">
                <Quotes size={32} weight="fill" className="lp-review__icon" />
                <blockquote>
                  “{review.before}
                  <mark>{review.highlight}</mark>
                  {review.after}”
                </blockquote>
                <figcaption>
                  <strong>{review.name}</strong>
                  <span>{review.place}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   9. Industries
   ========================================================= */

function Industries() {
  return (
    <section className="lp-section lp-section--tight" aria-labelledby="industries-title">
      <div className="lp-container">
        <SectionHead
          id="industries-title"
          eyebrow="Industries"
          title="Made for every place people wait"
          text="From a single clinic to a network of public service centres."
        />

        <ul className="lp-inds lp-stagger">
          {INDUSTRIES.map((industry) => {
            const IndustryIcon = ICONS[industry.icon];
            return (
              <Reveal as="li" key={industry.name}>
                <Link
                  className="lp-ind"
                  to={`/businesses?category=${encodeURIComponent(industry.name)}`}
                >
                  <span className="lp-ind__icon">
                    <IndustryIcon size={36} weight="duotone" />
                  </span>
                  {industry.name}
                </Link>
              </Reveal>
            );
          })}
        </ul>

        <div className="lp-more">
          <Link className="btn btn--outline" to="/businesses">
            See all industries <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   10. Places
   ========================================================= */

function Places() {
  // Later: replace PLACES with data from GET /api/businesses
  const places = PLACES;

  return (
    <section className="lp-section lp-places" aria-labelledby="places-title">
      <div className="lp-container">
        <Reveal className="lp-places__head">
          <div>
            <p className="lp-eyebrow">Places on QLess</p>
            <h2 id="places-title" className="lp-h2">
              Skip the line here
            </h2>
          </div>
          <Link className="btn btn--outline" to="/businesses">
            See all places
          </Link>
        </Reveal>

        {places.length === 0 ? (
          <div className="lp-message">
            <h3>No places yet</h3>
            <p>Businesses appear here once they're approved. Check back soon.</p>
          </div>
        ) : (
          <div className="lp-cards lp-stagger">
            {places.map((place) => (
              <Reveal key={place.id}>
                <article className="lp-card">
                  <div className="lp-card__top">
                    <span className="lp-card__logo">{place.name.charAt(0)}</span>
                    <div>
                      <h3>{place.name}</h3>
                      <span className="lp-card__meta">{place.city}</span>
                    </div>
                  </div>
                  <div className="lp-card__tags">
                    <span className="lp-badge">{place.category}</span>
                    <span className="lp-badge lp-badge--peach">{place.waiting} waiting</span>
                  </div>
                  <p>{place.description}</p>
                  <Link className="lp-card__link" to={`/businesses/${place.id}`}>
                    Join queue <ArrowRight size={18} weight="bold" />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   11. FAQ
   ========================================================= */

function Faq() {
  return (
    <section id="faq" className="lp-section" aria-labelledby="faq-title">
      <div className="lp-container">
        <SectionHead id="faq-title" eyebrow="FAQ" title="Questions, answered" />

        <div className="lp-faq">
          {FAQS.map((item, i) => (
            <details key={item.q} className="lp-faq__item" open={i === 0}>
              <summary>
                {item.q}
                <span className="lp-faq__icon">
                  <Plus size={18} weight="bold" />
                </span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   12. Orange section
   ========================================================= */

function OrangeCta() {
  return (
    <section className="lp-cta">
      <div className="lp-container">
        <Reveal className="lp-cta__panel">
          <span className="lp-cta__ring lp-cta__ring--top" aria-hidden="true" />
          <span className="lp-cta__ring lp-cta__ring--bottom" aria-hidden="true" />

          <h2 className="lp-cta__title">
            Your place in line,
            <br />
            without standing in it.
          </h2>

          <p className="lp-cta__text">
            Register your business, add your first branch and start serving
            visitors in minutes.
          </p>

          <div className="lp-cta__actions">
            <Link className="btn lp-btn-dark" to="/business/register">
              Register your business
            </Link>
            <Link className="btn btn--outline" to="/register">
              Join a queue
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================
   13. Footer
   ========================================================= */

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer__grid">
          <div className="lp-footer__brand">
            <Link className="lp-footer__logo" to="/">
              <i aria-hidden="true">Q</i>QLess
            </Link>
            <p>
              The virtual waiting room for clinics, banks, government offices
              and every place people wait.
            </p>
          </div>

          {FOOTER_LINKS.map((column) => (
            <nav key={column.title} className="lp-footer__col" aria-label={column.title}>
              <b>{column.title}</b>
              {column.links.map((link) => (
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="lp-footer__legal">
          <span>© 2026 QLess</span>
          <span>Your place. Your time.</span>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   Page
   ========================================================= */

export default function LandingPage() {
  const reduced = useReducedMotion();

  return (
    <main className="lp">
      <Hero />
      <LogoStrip />
      <Steps />
      <Audiences />
      <Features />
      <Values />
      <Numbers reduced={reduced} />
      <Reviews />
      <Industries />
      <Places />
      <Faq />
      <OrangeCta />
      <Footer />
    </main>
  );
}