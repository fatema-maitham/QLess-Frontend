import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  PARTNER_LOGOS,
  STEPS,
  FEATURES,
  INDUSTRIES,
  PLACES,
  FAQS,
} from "./landingData";
import "./LandingPage.css";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/* =========================================================
   Hooks
   ========================================================= */

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// Fades content up once when it scrolls into view.
function Reveal({ as: Tag = "div", className = "", children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`lp-reveal ${shown ? "is-shown" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

/* =========================================================
   Icons
   ========================================================= */

const UI_ICONS = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  ticket: (
    <>
      <path d="M3.5 7.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1V10a2 2 0 0 0 0 4v2.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V14a2 2 0 0 0 0-4z" />
      <path d="M14.5 6.5v11" strokeDasharray="1.5 2.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19.5 6v6c0 4.3-3.2 7.8-7.5 9-4.3-1.2-7.5-4.7-7.5-9V6z" />
      <path d="m8.8 12 2.3 2.3 4.2-4.6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
};

function Icon({ name, className = "" }) {
  return (
    <svg
      className={`lp-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {UI_ICONS[name]}
    </svg>
  );
}

// Outlined industry icons. Fill colours come from CSS classes:
// fo = orange, fp = peach, fw = paper, fm = mist, fi = ink
const INDUSTRY_ICONS = {
  healthcare: (
    <>
      <rect x="18" y="14" width="44" height="54" rx="6" className="fw" />
      <rect x="30" y="9" width="20" height="10" rx="3" className="fp" />
      <path d="M36 30h8v8h8v8h-8v8h-8v-8h-8v-8h8z" className="fo" />
    </>
  ),
  government: (
    <>
      <path d="M28 30a12 12 0 0 1 24 0z" className="fp" />
      <path d="M40 12v6" />
      <rect x="16" y="30" width="48" height="6" className="fw" />
      <path d="M22 36v20M34 36v20M46 36v20M58 36v20" />
      <rect x="12" y="56" width="56" height="8" rx="2" className="fm" />
    </>
  ),
  banks: (
    <>
      <path d="M10 30 40 12l30 18z" className="fo" />
      <rect x="14" y="30" width="52" height="6" className="fw" />
      <path d="M20 36v20M33 36v20M47 36v20M60 36v20" />
      <rect x="12" y="56" width="56" height="8" rx="2" className="fm" />
    </>
  ),
  restaurants: (
    <>
      <path d="M18 50a22 22 0 0 1 44 0z" className="fp" />
      <circle cx="40" cy="25" r="3.5" className="fi" />
      <rect x="12" y="50" width="56" height="7" rx="3.5" className="fm" />
    </>
  ),
  veterinary: (
    <>
      <ellipse cx="40" cy="50" rx="14" ry="12" className="fo" />
      <ellipse cx="24" cy="34" rx="6" ry="8" className="fo" />
      <ellipse cx="34" cy="24" rx="6" ry="8" className="fo" />
      <ellipse cx="46" cy="24" rx="6" ry="8" className="fo" />
      <ellipse cx="56" cy="34" rx="6" ry="8" className="fo" />
    </>
  ),
  pharmacies: (
    <g transform="rotate(-35 40 40)">
      <rect x="14" y="29" width="52" height="22" rx="11" className="fw" />
      <path d="M40 29H25a11 11 0 0 0 0 22h15z" className="fo" />
    </g>
  ),
  salons: (
    <>
      <circle cx="24" cy="54" r="8" className="fp" />
      <circle cx="56" cy="54" r="8" className="fp" />
      <path d="M30 48 52 14M50 48 28 14" />
      <circle cx="40" cy="31" r="2.5" className="fi" />
    </>
  ),
  universities: (
    <>
      <path d="M8 32 40 18l32 14-32 14z" className="fi" />
      <path d="M22 38v12c0 4 8 8 18 8s18-4 18-8V38" className="fw" />
      <path d="M64 34v16" />
      <circle cx="64" cy="54" r="4" className="fo" />
    </>
  ),
  events: (
    <>
      <path d="M12 26h56v8a6 6 0 0 0 0 12v8H12v-8a6 6 0 0 0 0-12z" className="fp" />
      <path d="M50 28v24" strokeDasharray="3 4" />
      <path d="M22 36h18M22 44h12" />
    </>
  ),
  retail: (
    <>
      <path d="M14 36 38 12h22v22L36 58z" className="fo" />
      <circle cx="50" cy="22" r="4" className="fw" />
    </>
  ),
  car: (
    <>
      <path d="m16 46 6-14c1-3 4-5 7-5h22c3 0 6 2 7 5l6 14z" className="fp" />
      <rect x="10" y="44" width="60" height="14" rx="5" className="fw" />
      <circle cx="24" cy="58" r="6" className="fi" />
      <circle cx="56" cy="58" r="6" className="fi" />
    </>
  ),
  post: (
    <>
      <path d="M14 28 40 16l26 12v28L40 68 14 56z" className="fp" />
      <path d="M14 28l26 12 26-12M40 40v28" />
      <path d="m27 22 26 12v8" />
    </>
  ),
};

/* =========================================================
   1. Hero
   ========================================================= */

function HeroArt() {
  return (
    <svg
      className="lp-hero__art"
      viewBox="0 0 520 480"
      role="img"
      aria-label="Two people relaxing while a board shows the number being served"
    >
      {/* background shapes */}
      <circle cx="420" cy="120" r="70" className="h-paper" />
      <circle cx="80" cy="410" r="130" className="h-soft" />

      {/* hanging "now serving" board */}
      <path d="M215 0v52M345 0v52" className="h-line" />
      <rect x="180" y="52" width="200" height="120" rx="16" className="h-ink" />
      <text x="280" y="92" textAnchor="middle" className="h-board-label">
        NOW SERVING
      </text>
      <text x="280" y="150" textAnchor="middle" className="h-board-num">
        A107
      </text>

      {/* ground */}
      <path d="M30 440h460" className="h-line" />

      {/* cafe table and cup */}
      <path d="M330 372v68M300 440h60" className="h-line" />
      <rect x="290" y="362" width="80" height="12" rx="6" className="h-paper h-edge" />
      <path d="M318 336h22l-3 26h-16z" className="h-orange h-edge" />

      {/* person holding a ticket */}
      <g transform="translate(150 266) scale(1.6)">
        <path d="M-15 72v-38c0-11 6-17 15-17s15 6 15 17v38z" className="h-orange h-edge" />
        <path d="M-9 72v34M9 72v34" className="h-line" />
        <circle cx="0" cy="0" r="12.5" className="h-paper h-edge" />
        <path d="M-12.5 -2c0-10 6-14.5 12.5-14.5S12.5 -8 12.5 0c-6-4-15-4-25 2z" className="h-ink" />
      </g>
      <path d="M172 324l18 16" className="h-line" />
      <g transform="translate(184 330) rotate(-10)">
        <rect width="48" height="30" rx="6" className="h-paper h-edge" />
        <text x="24" y="20" textAnchor="middle" className="h-ticket">
          A107
        </text>
      </g>

      {/* person with a coffee */}
      <g transform="translate(420 266) scale(1.6)">
        <path d="M-15 72v-38c0-11 6-17 15-17s15 6 15 17v38z" className="h-ink h-edge" />
        <path d="M-9 72v34M9 72v34" className="h-line" />
        <circle cx="0" cy="0" r="12.5" className="h-paper h-edge" />
        <path d="M-12.5 -2c0-10 6-14.5 12.5-14.5S12.5 -8 12.5 0c-6-4-15-4-25 2z" className="h-ink" />
      </g>
      <path d="M398 330l-54 14" className="h-line" />

      {/* notification bubble */}
      <g transform="translate(36 160)">
        <rect width="156" height="46" rx="23" className="h-paper h-edge" />
        <circle cx="24" cy="23" r="7" className="h-orange" />
        <text x="40" y="28" className="h-bubble">
          You're next
        </text>
      </g>
    </svg>
  );
}

function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero__panel">
        <div className="lp-hero__content">
          <p className="lp-hero__eyebrow">JOIN · WAIT · GET CALLED</p>

          <h1 className="lp-hero__title">
            Join.
            <br />
            Wait anywhere.
            <br />
            <span>Skip the line.</span>
          </h1>

          <p className="lp-hero__text">
            Take a ticket from anywhere, follow your place live, and arrive
            right when it's your turn.
          </p>

          <div className="lp-hero__actions">
            <Link className="btn btn--primary" to="/businesses">
              Find a place
            </Link>
            <Link className="btn lp-btn-light" to="/register">
              Get started
            </Link>
          </div>
        </div>

        <div className="lp-hero__visual">
          <HeroArt />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   2. Logo strip (moves right, nonstop)
   ========================================================= */

function LogoItem({ logo, hidden }) {
  const [failed, setFailed] = useState(false);

  return (
    <li className="lp-logo" aria-hidden={hidden ? "true" : undefined}>
      {failed ? (
        <span className="lp-logo__name">{logo.name}</span>
      ) : (
        <img
          src={logo.src}
          alt={hidden ? "" : logo.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </li>
  );
}

function LogoStrip() {
  // Repeat the logos so the strip is always full, then double it for a seamless loop
  const repeats = Math.max(1, Math.ceil(8 / PARTNER_LOGOS.length));
  const base = Array.from({ length: repeats }).flatMap(() => PARTNER_LOGOS);
  const items = [...base, ...base];

  return (
    <section className="lp-logos" aria-labelledby="logos-title">
      <p id="logos-title" className="lp-logos__title">
        Trusted By
      </p>
      <div className="lp-marquee">
        <ul className="lp-marquee__track">
          {items.map((logo, i) => (
            <LogoItem key={`${logo.name}-${i}`} logo={logo} hidden={i >= PARTNER_LOGOS.length} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* =========================================================
   3. Three steps for visitors
   ========================================================= */

function Steps() {
  return (
    <section className="lp-section" aria-labelledby="steps-title">
      <div className="lp-container">
        <Reveal className="lp-section__head lp-section__head--center">
          <p className="lp-eyebrow">How it works</p>
          <h2 id="steps-title" className="lp-h2">
            Three steps for visitors
          </h2>
        </Reveal>

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
   4. Stacking feature cards
   ========================================================= */

function JoinVisual() {
  return (
    <div className="lp-ui">
      <div className="lp-ui__head">
        <span className="lp-ui__logo">N</span>
        <div>
          <strong>Noor Clinic</strong>
          <span>Main branch · Open now</span>
        </div>
      </div>
      <ul className="lp-services">
        <li>
          <span>General consultation</span>
          <span className="lp-badge">12 waiting</span>
        </li>
        <li className="is-selected">
          <span>Lab tests</span>
          <span className="lp-badge">4 waiting</span>
        </li>
        <li>
          <span>Pharmacy pickup</span>
          <span className="lp-badge">2 waiting</span>
        </li>
      </ul>
      <div className="lp-ui__cta">
        Take a ticket <Icon name="arrow" />
      </div>
    </div>
  );
}

function TrackVisual() {
  return (
    <div className="lp-ui">
      <div className="lp-track">
        <div className="lp-ring-wrap">
          <svg className="lp-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle className="lp-ring__bg" cx="60" cy="60" r="52" />
            <circle className="lp-ring__fg" cx="60" cy="60" r="52" pathLength="100" />
          </svg>
          <div className="lp-ring__label">
            <span>Position</span>
            <strong>#4</strong>
          </div>
        </div>
        <div className="lp-track__facts">
          <div>
            <span>Estimated wait</span>
            <strong>12 min</strong>
          </div>
          <div>
            <span>Ahead of you</span>
            <strong>3 people</strong>
          </div>
        </div>
      </div>
      <div className="lp-ui__foot">
        <Icon name="clock" /> Updates live as the line moves
      </div>
    </div>
  );
}

function NotifyVisual() {
  return (
    <div className="lp-notes">
      <div className="lp-note">
        <span className="lp-note__icon">
          <Icon name="ticket" />
        </span>
        <div>
          <strong>You're in the queue</strong>
          <span>Ticket A-107 · 7 people ahead</span>
        </div>
        <span className="lp-note__time">9:02</span>
      </div>
      <div className="lp-note">
        <span className="lp-note__icon">
          <Icon name="clock" />
        </span>
        <div>
          <strong>Getting close</strong>
          <span>About 5 minutes left</span>
        </div>
        <span className="lp-note__time">9:21</span>
      </div>
      <div className="lp-note lp-note--main">
        <span className="lp-note__icon">
          <Icon name="bell" />
        </span>
        <div>
          <strong>It's your turn</strong>
          <span>Please go to counter 2</span>
        </div>
        <span className="lp-note__time">now</span>
      </div>
    </div>
  );
}

function ManageVisual() {
  return (
    <div className="lp-ui">
      <div className="lp-ui__row">
        <strong className="lp-ui__title">Main branch</strong>
        <span className="lp-live">Live</span>
      </div>
      <div className="lp-stats">
        <div>
          <strong>18</strong>
          <span>Waiting</span>
        </div>
        <div>
          <strong>4</strong>
          <span>Serving</span>
        </div>
        <div>
          <strong>12m</strong>
          <span>Avg. wait</span>
        </div>
      </div>
      <ul className="lp-list">
        <li className="is-current">
          <span className="lp-list__code">A-104</span>
          <div>
            <strong>Now serving</strong>
            <span className="lp-list__meta">Counter 2</span>
          </div>
        </li>
        <li>
          <span className="lp-list__code">A-105</span>
          <div>
            <strong>General services</strong>
            <span className="lp-list__meta">Waiting 6 min</span>
          </div>
        </li>
      </ul>
      <div className="lp-ui__cta">Call next</div>
    </div>
  );
}

function VerifyVisual() {
  return (
    <div className="lp-ui">
      <strong className="lp-ui__title">Business approvals</strong>
      <ul className="lp-list">
        <li>
          <span className="lp-list__avatar">N</span>
          <div>
            <strong>Noor Clinic</strong>
            <span className="lp-list__meta">Healthcare · 3 branches</span>
          </div>
          <span className="lp-status lp-status--ok">Approved</span>
        </li>
        <li>
          <span className="lp-list__avatar">H</span>
          <div>
            <strong>Harbor Bank</strong>
            <span className="lp-list__meta">Banking · 5 branches</span>
          </div>
          <span className="lp-status">Pending</span>
        </li>
        <li>
          <span className="lp-list__avatar">B</span>
          <div>
            <strong>Bloom Salon</strong>
            <span className="lp-list__meta">Beauty · 1 branch</span>
          </div>
          <span className="lp-status lp-status--ok">Approved</span>
        </li>
      </ul>
      <div className="lp-ui__foot">
        <Icon name="shield" /> Every admin action is recorded
      </div>
    </div>
  );
}

const FEATURE_VISUALS = {
  join: JoinVisual,
  track: TrackVisual,
  notify: NotifyVisual,
  manage: ManageVisual,
  verify: VerifyVisual,
};

function FeatureStack({ isStatic, reduced }) {
  const cardRefs = useRef([]);
  const anchorRefs = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const cards = cardRefs.current;

    if (isStatic) {
      cards.forEach((el) => el && el.style.removeProperty("--depth"));
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;

      // How far each card has slid into its stuck position (0 → 1)
      const progress = cards.map((el, i) => {
        if (!el || i === 0) return 1;
        const top = el.getBoundingClientRect().top;
        const stickTop = parseFloat(getComputedStyle(el).top) || 0;
        return clamp((vh - top) / (vh - stickTop));
      });

      let current = 0;
      progress.forEach((k, i) => {
        if (k >= 0.6) current = i;
      });

      // A card sinks back a little for every card stacked on top of it
      cards.forEach((el, i) => {
        if (!el) return;
        let depth = 0;
        for (let j = i + 1; j < progress.length; j++) depth += progress[j];
        el.style.setProperty("--depth", Math.min(depth, 3).toFixed(3));
      });

      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [isStatic]);

  const scrollToCard = (i) => {
    const anchor = anchorRefs.current[i];
    const card = cardRefs.current[i];
    if (!anchor || !card) return;
    const stickTop = parseFloat(getComputedStyle(card).top) || 0;
    const y = anchor.getBoundingClientRect().top + window.scrollY - stickTop;
    window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section
      className={`lp-stack ${isStatic ? "lp-stack--static" : ""}`}
      aria-labelledby="stack-title"
    >
      <div className="lp-container">
        <Reveal className="lp-section__head lp-section__head--center">
          <p className="lp-eyebrow">Why QLess</p>
          <h2 id="stack-title" className="lp-h2">
            Everything a queue needs, in one place
          </h2>
          <p className="lp-section__text">
            For the people waiting, and for the teams serving them.
          </p>
        </Reveal>

        {!isStatic && (
          <div className="lp-stack__tabs">
            <nav className="lp-tabs" aria-label="Features">
              {FEATURES.map((feature, i) => (
                <button
                  key={feature.id}
                  type="button"
                  className={`lp-tab ${active === i ? "is-active" : ""}`}
                  aria-current={active === i ? "true" : undefined}
                  onClick={() => scrollToCard(i)}
                >
                  {feature.tab}
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className="lp-stack__cards">
          {FEATURES.map((feature, i) => {
            const Visual = FEATURE_VISUALS[feature.id];
            return (
              <Fragment key={feature.id}>
                <div
                  className="lp-stack__anchor"
                  ref={(el) => {
                    anchorRefs.current[i] = el;
                  }}
                />
                <article
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className={`lp-feature lp-feature--${feature.tone}`}
                >
                  <div className="lp-feature__copy">
                    <span className="lp-feature__eyebrow">{feature.eyebrow}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                    <Link className="lp-feature__link" to={feature.link.to}>
                      {feature.link.label}
                      <Icon name="arrow" />
                    </Link>
                  </div>
                  <div className="lp-feature__visual">
                    <Visual />
                  </div>
                </article>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   5. Made for every place
   ========================================================= */

function Industries() {
  return (
    <section className="lp-section" aria-labelledby="industries-title">
      <div className="lp-container">
        <Reveal className="lp-section__head lp-section__head--center">
          <p className="lp-eyebrow">Industries</p>
          <h2 id="industries-title" className="lp-h2">
            Made for every place people wait
          </h2>
          <p className="lp-section__text">
            From a single clinic to a network of public service centres.
          </p>
        </Reveal>

        <ul className="lp-inds lp-stagger">
          {INDUSTRIES.map((industry) => (
            <Reveal as="li" key={industry.name}>
              <Link
                className="lp-ind"
                to={`/businesses?category=${encodeURIComponent(industry.name)}`}
              >
                <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" focusable="false">
                  {INDUSTRY_ICONS[industry.icon]}
                </svg>
                {industry.name}
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* =========================================================
   6. Places on QLess (fake data for now)
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
              <Reveal key={place.id} className="lp-card">
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
                <Link className="btn btn--primary lp-card__btn" to={`/businesses/${place.id}`}>
                  Join queue
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   7. Questions answered
   ========================================================= */

function Faq() {
  return (
    <section className="lp-section" aria-labelledby="faq-title">
      <div className="lp-container">
        <Reveal className="lp-section__head lp-section__head--center">
          <p className="lp-eyebrow">FAQ</p>
          <h2 id="faq-title" className="lp-h2">
            Questions, answered
          </h2>
        </Reveal>

        <div className="lp-faq">
          {FAQS.map((item, i) => (
            <details key={item.q} className="lp-faq__item" open={i === 0}>
              <summary>
                {item.q}
                <span className="lp-faq__icon">
                  <Icon name="plus" />
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
   8. Orange section
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
   Page
   ========================================================= */

export default function LandingPage() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const small = useMediaQuery("(max-width: 900px)");

  return (
    <main className="lp">
      <Hero />
      <LogoStrip />
      <Steps />
      <FeatureStack isStatic={reduced || small} reduced={reduced} />
      <Industries />
      <Places />
      <Faq />
      <OrangeCta />
    </main>
  );
}