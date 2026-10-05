import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Bell,
  Buildings,
  CalendarCheck,
  CheckCircle,
  ClockCounterClockwise,
  LockSimple,
  Megaphone,
  Plus,
  ShieldCheck,
  Star,
  Ticket,
  UserGear,
  UsersThree,
} from "@phosphor-icons/react";
import ColorIcon from "./ColorIcon";
import logo from "../../assets/qless-logo.png";
import qIcon from "../../assets/Q.png";
import {
  PARTNER_LOGOS,
  REVIEWS,
  STEPS,
  FEATURES,
  VALUES,
  STATS,
  PLACES,
  FAQS,
} from "./landingData";
import "./LandingPage.css";

// The 8 industries shown on the landing page (icon names match ColorIcon.jsx)
const INDUSTRIES = [
  { name: "Healthcare", icon: "healthcare" },
  { name: "Government", icon: "government" },
  { name: "Banks", icon: "banks" },
  { name: "Restaurants", icon: "restaurants" },
  { name: "Veterinary", icon: "veterinary" },
  { name: "Pharmacies", icon: "pharmacies" },
  { name: "Salons and beauty", icon: "salons" },
  { name: "Universities", icon: "universities" },
];

// Simple line icons for the Features cards (names match landingData.js)
const FEATURE_ICONS = {
  bell: Bell,
  calendar: CalendarCheck,
  buildings: Buildings,
  users: UsersThree,
  megaphone: Megaphone,
  star: Star,
};

// "Who it's for" stacking cards. tone sets the card colour in CSS.
const ROLES = [
  {
    id: "visitors",
    tone: "light",
    tag: "For visitors",
    title: "Join from anywhere and arrive on time.",
    text: "No crowded waiting rooms. Visitors always know their number, how many people are ahead and when to come back.",
    points: ["Join with a QR code or link", "Live place in line and wait time", "A message when it's almost your turn"],
    button: { label: "Find a place", to: "/businesses" },
  },
  {
    id: "staff",
    tone: "peach",
    tag: "For staff",
    title: "Call the next visitor in one tap.",
    text: "A focused screen for front-line teams, with the queue, the next number and the service always in view.",
    points: ["Call next, complete or mark no-show", "Pause or resume the queue", "Only sees the branches they work at"],
  },
  {
    id: "owners",
    tone: "ink",
    tag: "For business owners",
    title: "Every branch in one dashboard.",
    text: "Set up branches, services and opening hours, invite staff and post announcements yourself.",
    points: ["Branches, services and hours", "Staff invitations", "Announcements on every ticket"],
    button: { label: "Register your business", to: "/business/register" },
  },
  {
    id: "admins",
    tone: "orange",
    tag: "For administrators",
    title: "Oversight you can trust.",
    text: "Approve new businesses, manage users and review a full record of every change on the platform.",
    points: ["Business approvals", "User and role management", "Searchable audit log"],
  },
];

/* ---------- Privacy and security ---------- */
const TRUST = [
  {
    icon: ShieldCheck,
    title: "Verified businesses",
    text: "An admin reviews every new business before it can open a queue.",
  },
  {
    icon: UserGear,
    title: "Role-based access",
    text: "Admins, owners and staff each see only what their role allows.",
  },
  {
    icon: ClockCounterClockwise,
    title: "Full audit log",
    text: "Approvals and changes are recorded with who made them and when.",
  },
  {
    icon: LockSimple,
    title: "Minimal visitor data",
    text: "Visitors share only what the queue needs to call them.",
  },
];

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

const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Runs `update` on scroll and resize, at most once per frame
function useScrollFrame(update, enabled) {
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }
    };

    update();
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [update, enabled]);
}

/*
  Sets two CSS variables on an element while you scroll:
  --enter  0 → 1  as the element comes up into the screen
  --exit   0 → 1  as the element scrolls away off the top
  LandingPage.css uses them to drive the scroll animations.
*/
function useScrollVars(ref, reduced) {
  const update = useRef(() => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const screen = window.innerHeight;
    el.style.setProperty("--enter", clamp01((screen - box.top) / (screen * 0.65)).toFixed(3));
    el.style.setProperty("--exit", clamp01(-box.top / box.height).toFixed(3));
  }).current;

  useScrollFrame(update, !reduced);
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

// Stacking cards: as the next card slides over a card,
// the card underneath shrinks and darkens a little.
// Sets --stack (0 to 1) on each card for LandingPage.css.
function useStackCards(listRef, reduced) {
  const update = useRef(() => {
    const list = listRef.current;
    if (!list) return;
    const cards = Array.from(list.children);
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const a = card.getBoundingClientRect();
      const b = next.getBoundingClientRect();
      card.style.setProperty("--stack", clamp01((a.bottom - b.top) / a.height).toFixed(3));
    });
  }).current;

  useScrollFrame(update, !reduced);
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

// Splits a title into words that slide up one after another
function SplitWords({ text }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={`${word}-${i}`}>
      <span className="lp-word">
        <span>{word}</span>
      </span>{" "}
    </Fragment>
  ));
}

function SectionHead({ eyebrow, title, text, id, children }) {
  return (
    <Reveal className="lp-section__head lp-section__head--center">
      <p className="lp-eyebrow">
        {eyebrow}
        {children}
      </p>
      <h2 id={id} className="lp-h2" aria-label={title}>
        <span aria-hidden="true">
          <SplitWords text={title} />
        </span>
      </h2>
      {text && <p className="lp-section__text">{text}</p>}
    </Reveal>
  );
}

/* =========================================================
   1. Hero
   ========================================================= */
function Hero({ reduced }) {
  const heroRef = useRef(null);
  useScrollVars(heroRef, reduced);

  return (
    <section ref={heroRef} className="lp-hero">
      <div className="lp-hero__content">
        <h1 className="lp-hero__title">
          Your time is worth more <span>than a line.</span>
        </h1>

        <p className="lp-hero__text">
          QLess holds your place while you get on with your day. Join from your phone, watch
          your place move live and arrive right when it's your turn.
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
    </section>
  );
}

/* =========================================================
   Privacy and security
   ========================================================= */

function Trust() {
  return (
    <section id="privacy" className="lp-section lp-section--tight" aria-labelledby="trust-heading">
      <div className="lp-container lp-trust2">
        <Reveal className="lp-trust2__intro">
          <p className="lp-eyebrow">Privacy and security</p>
          <h2 id="trust-heading" className="lp-h2">
            Trusted with public and private services
          </h2>
          <p className="lp-section__text">
            Visitors share only what the queue needs. Every business is reviewed before it goes
            live, and every change is recorded.
          </p>
        </Reveal>

        <div className="lp-trust2__grid lp-stagger">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <Reveal key={title} className="lp-trust2__item">
              <span className="lp-feat__icon">
                <Icon size={26} weight="duotone" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   2. Three steps
   ========================================================= */

function Steps({ reduced }) {
  const stepsRef = useRef(null);
  useScrollVars(stepsRef, reduced);

  return (
    <section id="how" className="lp-section" aria-labelledby="steps-title">
      <div className="lp-container">
        <SectionHead id="steps-title" eyebrow="How it works" title="Three steps for visitors" />

        <ol ref={stepsRef} className="lp-steps lp-stagger">
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
   3. Who it's for (stacking cards)
   ========================================================= */

// Small example screens shown on the right of each card
function RoleMini({ id }) {
  if (id === "visitors") {
    return (
      <div className="lp-mini">
        <span className="lp-mini__label">Your number</span>
        <span className="lp-mini__big">A107</span>
        <span className="lp-mini__bar">
          <i />
        </span>
        <span className="lp-mini__note">3 ahead · about 12 min</span>
      </div>
    );
  }

  if (id === "staff") {
    return (
      <div className="lp-mini">
        <span className="lp-mini__label">Counter 2</span>
        <MiniRow number="A104" text="General services" tag="Called" tone="called" />
        <MiniRow number="A105" text="Payments" tag="Waiting" tone="waiting" />
        <MiniRow number="A106" text="General services" tag="Waiting" tone="waiting" />
      </div>
    );
  }

  if (id === "owners") {
    return (
      <div className="lp-mini">
        <span className="lp-mini__label">Branches</span>
        <MiniRow text="Main Branch" tag="Open" tone="open" />
        <MiniRow text="City Centre" tag="Open" tone="open" />
        <MiniRow text="North Branch" tag="Closed" tone="closed" />
      </div>
    );
  }

  return (
    <div className="lp-mini">
      <span className="lp-mini__label">Pending approvals</span>
      <MiniRow text="Green Leaf Clinic" sub="Submitted today" tag="Review" tone="waiting" />
      <div className="lp-mini__actions">
        <span className="lp-mini__btn lp-mini__btn--dark">Approve</span>
        <span className="lp-mini__btn">Reject</span>
      </div>
    </div>
  );
}

function MiniRow({ number, text, sub, tag, tone }) {
  return (
    <div className="lp-mini__row">
      {number && <b>{number}</b>}
      <span className="lp-mini__text">
        {text}
        {sub && <small>{sub}</small>}
      </span>
      <span className={`lp-mini__tag lp-mini__tag--${tone}`}>{tag}</span>
    </div>
  );
}

function Roles({ reduced }) {
  const listRef = useRef(null);
  useStackCards(listRef, reduced);

  return (
    <section className="lp-section lp-section--tight" aria-labelledby="roles-title">
      <div className="lp-container">
        <SectionHead
          id="roles-title"
          eyebrow="Who it's for"
          title="Built for every side of the counter"
        />

        <div ref={listRef} className="lp-roles">
          {ROLES.map((role) => (
            <article key={role.id} className={`lp-role lp-role--${role.tone}`}>
              <div className="lp-role__body">
                <span className="lp-role__tag">{role.tag}</span>
                <h3>{role.title}</h3>
                <p>{role.text}</p>

                <ul className="lp-role__points">
                  {role.points.map((point) => (
                    <li key={point}>
                      <CheckCircle size={22} weight="fill" />
                      {point}
                    </li>
                  ))}
                </ul>

                {role.button && (
                  <Link className="btn lp-role__btn" to={role.button.to}>
                    {role.button.label}
                  </Link>
                )}
              </div>

              <div className="lp-role__visual" aria-hidden="true">
                <RoleMini id={role.id} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4. Features
   ========================================================= */

/*
  Interactive phone: the feature list sits on both sides of a phone.
  Click a feature (or wait 6 seconds) and the phone shows that screen.
*/
const FEATURE_TIME = 6000;

function PhoneScreen({ icon, serving, onCallNext }) {
  if (icon === "bell") {
    return (
      <div className="lp-ph__lock">
        <div className="lp-ph__time">6:08</div>
        <div className="lp-ph__date">Friday, 2 October</div>
        <div className="lp-ph__ntf">
          <i>
            <img src={qIcon} alt="" />
          </i>
          <div>
            <span>You joined the queue at City Centre Branch. Your number is A107.</span>
          </div>
        </div>
        <div className="lp-ph__ntf">
          <i>
            <img src={qIcon} alt="" />
          </i>
          <div>
            <span>2 people are ahead of you. About 8 minutes left.</span>
          </div>
        </div>
        <div className="lp-ph__ntf lp-ph__ntf--hot">
          <i>
            <img src={qIcon} alt="" />
          </i>
          <div>
            <b>It's almost your turn</b>
            <span>Please head to counter 2.</span>
          </div>
        </div>
      </div>
    );
  }

  if (icon === "calendar") {
    return (
      <>
        <PhoneHead title="Book a time" sub="Pearl Bank · Manama Branch" />
        <div className="lp-ph__days">
          <span>Thu 1</span>
          <span className="is-on">Fri 2</span>
          <span>Sat 3</span>
          <span>Sun 4</span>
        </div>
        <div className="lp-ph__slots">
          <span>9:00</span>
          <span className="is-off">9:30</span>
          <span>10:00</span>
          <span className="is-on">10:30</span>
          <span>11:00</span>
          <span className="is-off">11:30</span>
        </div>
        <div className="lp-ph__card">
          <small>Open an account · 20 min</small>
          <b>Friday at 10:30 AM</b>
        </div>
        <span className="lp-ph__btn">Confirm booking</span>
      </>
    );
  }

  if (icon === "buildings") {
    return (
      <>
        <PhoneHead title="Your branches" sub="3 branches · 4 services" />
        {[
          { name: "Manama Branch", load: "70", info: "7 waiting · 8:00 AM – 4:00 PM", open: true },
          { name: "Riffa Branch", load: "40", info: "4 waiting · 9:00 AM – 9:00 PM", open: true },
          { name: "Seef Branch", load: "0", info: "Opens tomorrow at 8:00 AM", open: false },
        ].map((branch) => (
          <div key={branch.name} className="lp-ph__card">
            <div className="lp-ph__row">
              <b>{branch.name}</b>
              <em className={branch.open ? "lp-ph__ok" : "lp-ph__off"}>
                {branch.open ? "Open" : "Closed"}
              </em>
            </div>
            <span className={`lp-ph__load lp-ph__load--${branch.load}`}>
              <i />
            </span>
            <small>{branch.info}</small>
          </div>
        ))}
      </>
    );
  }

  if (icon === "users") {
    const next = [1, 2, 3].map((k) => serving + k);
    const names = ["Sara M.", "Ali H.", "Noor K.", "Yousif A.", "Mariam S.", "Hasan J."];
    return (
      <>
        <PhoneHead title="Counter 2" sub="General services" />
        <div className="lp-ph__serve">
          <small>Now serving</small>
          <b key={serving}>A{serving}</b>
        </div>
        {next.map((n) => (
          <div key={n} className="lp-ph__person">
            <span className="lp-ph__avatar">{names[n % names.length].charAt(0)}</span>
            <b>A{n}</b>
            <span>{names[n % names.length]}</span>
          </div>
        ))}
        {/* real button: try it */}
        <button type="button" className="lp-ph__btn" onClick={onCallNext}>
          Call next
        </button>
      </>
    );
  }

  if (icon === "megaphone") {
    return (
      <>
        <PhoneHead title="City Centre Branch" sub="Your ticket" />
        <div className="lp-ph__banner">
          <b>Closing early today</b>
          The branch closes at 2:00 PM. Everyone in the queue will still be served.
        </div>
        <div className="lp-ph__card lp-ph__card--ticket">
          <div>
            <small>Your number</small>
            <b className="lp-ph__big">A107</b>
          </div>
          <span>
            <b>3 ahead</b>
            ~12 min
          </span>
        </div>
      </>
    );
  }

  // star: reviews and favourites
  return (
    <>
      <PhoneHead title="Pearl Bank" sub="Banking · Manama" />
      <div className="lp-ph__rating">
        <b>4.8</b>
        <span className="lp-ph__stars" aria-hidden="true">★★★★★</span>
        <small>128 reviews</small>
      </div>
      <div className="lp-ph__card">
        <span className="lp-ph__stars lp-ph__stars--small">★★★★★</span>
        <span>"I waited at home and walked in right on time. So easy."</span>
        <small>Fatima A. · 2 days ago</small>
      </div>
      <span className="lp-ph__btn lp-ph__btn--outline">♥ Saved to favourites</span>
    </>
  );
}

function PhoneHead({ title, sub }) {
  return (
    <div className="lp-ph__head">
      <i>
        <img src={qIcon} alt="" />
      </i>
      <div>
        <b>{title}</b>
        <small>{sub}</small>
      </div>
    </div>
  );
}

function Features({ reduced }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [serving, setServing] = useState(104);
  const count = FEATURES.length;

  // Move to the next feature every 6 seconds until someone clicks one
  useEffect(() => {
    if (paused || reduced || count === 0) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % count), FEATURE_TIME);
    return () => clearTimeout(id);
  }, [active, paused, reduced, count]);

  const choose = (i) => {
    setActive(i);
    setPaused(true);
  };

  const half = Math.ceil(count / 2);
  const columns = [FEATURES.slice(0, half), FEATURES.slice(half)];
  const current = FEATURES[active];

  return (
    <section id="features" className="lp-section" aria-labelledby="features-title">
      <div className="lp-container">
        <SectionHead
          id="features-title"
          eyebrow="Features"
          title="Everything a queue needs"
          text="Tap a feature to see it on the phone."
        />

        <div className={`lp-orbit ${paused || reduced ? "is-paused" : ""}`}>
          {columns.map((column, c) => (
            <div key={c} className={`lp-orbit__col ${c === 0 ? "lp-orbit__col--left" : ""}`}>
              {column.map((feature, j) => {
                const i = c * half + j;
                const Icon = FEATURE_ICONS[feature.icon] || Star;
                const on = i === active;
                return (
                  <button
                    key={feature.title}
                    type="button"
                    className={`lp-orbit__item ${on ? "is-on" : ""}`}
                    aria-pressed={on}
                    onClick={() => choose(i)}
                  >
                    <span className="lp-feat__icon">
                      <Icon size={24} weight="duotone" />
                    </span>
                    <b>{feature.title}</b>
                    <span className="lp-orbit__text">{feature.text}</span>
                    {on && (
                      <span className="lp-orbit__progress" key={active}>
                        <i />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="lp-orbit__phone" aria-live="polite">
            <span className="lp-orbit__glow" aria-hidden="true" />
            <div className={`lp-ph ${current?.icon === "bell" ? "is-dark" : ""}`}>
              <span className="lp-ph__island" aria-hidden="true" />
              <div className="lp-ph__status" aria-hidden="true">
                <span>9:41</span>
                <img className="lp-ph__logo" src={logo} alt="" />
              </div>
              <div className="lp-ph__screen" key={active}>
                {current && (
                  <PhoneScreen
                    icon={current.icon}
                    serving={serving}
                    onCallNext={() => setServing((n) => n + 1)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Rolling number, like a car odometer */
function Odometer({ value }) {
  const digits = String(value).split("");

  return (
    <span className="qm-odo" aria-hidden="true">
      {digits.map((digit, i) => (
        <span key={digits.length - i} className="qm-odo__col">
          <span className="qm-odo__strip" style={{ "--n": digit }}>
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

/* =========================================================
   2. Ticket printer (magnetic button)
   ========================================================= */
const FIRST_TICKET = 107;

function TicketPrinter({ reduced }) {
  const btnRef = useRef(null);
  const [count, setCount] = useState(FIRST_TICKET);
  const [ticket, setTicket] = useState(null);

  const onMove = (e) => {
    if (reduced || e.pointerType !== "mouse") return;
    const el = btnRef.current;
    const box = el.getBoundingClientRect();
    const x = e.clientX - (box.left + box.width / 2);
    const y = e.clientY - (box.top + box.height / 2);
    el.style.setProperty("--mx", `${x * 0.25}px`);
    el.style.setProperty("--my", `${y * 0.35}px`);
  };

  const onLeave = () => {
    const el = btnRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  };

  const takeTicket = () => {
    const next = count + 1;
    const ahead = (next % 4) + 2;
    setCount(next);
    setTicket({ id: next, number: `A${next}`, ahead, wait: ahead * 4 });
  };

  return (
    <section className="qm-printer" aria-labelledby="qm-printer-title">
      <div className="qm-wrap qm-printer__layout">
        <div>
          <p className="qm-eyebrow">Try it yourself</p>
          <h2 id="qm-printer-title" className="qm-h2">
            Take a ticket.
            <br />
            <span>Keep your day.</span>
          </h2>
          <p className="qm-text">
            Press the button. That&apos;s all it takes to hold your place in line.
          </p>

          <button
            ref={btnRef}
            type="button"
            className="qm-magnet"
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            onClick={takeTicket}
          >
            {count > FIRST_TICKET && (
              <span key={count} className="qm-magnet__ripple" aria-hidden="true" />
            )}
            <Ticket size={22} weight="bold" />
            <span className="qm-magnet__label">Take a ticket</span>
          </button>
        </div>

        <div className="qm-machine" aria-live="polite">
          <div className="qm-machine__body">
            <div className="qm-machine__brand">
              City Centre
            </div>
            <div className="qm-machine__screen">
              <span>Last ticket</span>
              <b>A{count}</b>
            </div>
            <div className="qm-machine__slot" aria-hidden="true" />
          </div>

          <div className="qm-machine__out">
            {ticket && (
              <div key={ticket.id} className="qm-ticket">
                <small>Your number</small>
                <strong>{ticket.number}</strong>
                <div className="qm-ticket__line" />
                <div className="qm-ticket__stats">
                  <span>
                    <small>Ahead</small>
                    <b>{ticket.ahead}</b>
                  </span>
                  <span>
                    <small>Est. wait</small>
                    <b>~{ticket.wait} min</b>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   5. Horizontal scroll: a day with six queues
   ========================================================= */
const DAY_STOPS = [
  { time: "8:00", place: "Clinic", text: "Joined from home. Left the house at 8:40.", saved: 35 },
  { time: "9:30", place: "Bank", text: "Joined from the car. Walked straight to counter 3.", saved: 22 },
  { time: "11:00", place: "Ministry", text: "Booked an 11:20 slot. In and out in 15 minutes.", saved: 48 },
  { time: "13:15", place: "Pharmacy", text: "Got the alert at the café next door.", saved: 12 },
  { time: "16:00", place: "Salon", text: "Finished work first, then walked in on time.", saved: 30 },
  { time: "18:30", place: "Vet", text: "Waited in the car with the dog, not the waiting room.", saved: 25 },
];

function DayAcrossTown({ reduced }) {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const flat = () => reduced || window.matchMedia("(max-width: 900px)").matches;

    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      const track = trackRef.current;
      if (!section || !sticky || !track) return;

      // tablet, phone and reduced motion: normal swipe row, show the full total
      if (flat()) {
        section.style.setProperty("--h-shift", "0px");
        section.style.removeProperty("--h-progress");
        setActive(DAY_STOPS.length - 1);
        return;
      }

      const rect = section.getBoundingClientRect();
      const progress = clamp01(-rect.top / Math.max(1, rect.height - window.innerHeight));
      const maxShift = Math.max(0, track.scrollWidth - sticky.clientWidth);

      section.style.setProperty("--h-shift", `${(-progress * maxShift).toFixed(1)}px`);
      section.style.setProperty("--h-progress", progress.toFixed(3));
      setActive(Math.min(DAY_STOPS.length - 1, Math.floor(progress * DAY_STOPS.length)));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const saved = DAY_STOPS.slice(0, active + 1).reduce((sum, stop) => sum + stop.saved, 0);

  return (
    <section ref={sectionRef} className="qm-h" aria-labelledby="qm-h-title">
      <div ref={stickyRef} className="qm-h__sticky">
        <div className="qm-wrap qm-h__head">
          <div>
            <p className="qm-eyebrow">One day, six queues</p>
            <h2 id="qm-h-title" className="qm-h2">
              A whole day
              <br />
              <span>without a waiting room.</span>
            </h2>
          </div>

          <div className="qm-h__total">
            <small>Minutes not spent standing</small>
            <Odometer value={saved} />
            <span className="qm-sr">{saved} minutes</span>
          </div>
        </div>

        <div ref={trackRef} className="qm-h__track">
          {DAY_STOPS.map((stop, i) => (
            <article
              key={stop.time}
              className={`qm-h__card ${i === active ? "is-on" : ""}`}
              style={{ "--tilt": `${i % 2 ? 2 : -2}deg` }}
            >
              <span className="qm-h__time">{stop.time}</span>
              <h3>{stop.place}</h3>
              <p>{stop.text}</p>
              <span className="qm-h__saved">+{stop.saved} min back</span>
            </article>
          ))}
        </div>

        <div className="qm-wrap">
          <span className="qm-h__bar" aria-hidden="true">
            <i />
          </span>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   5. Why QLess
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
            return (
              <Reveal key={value.title} className="lp-value">
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
   6. Numbers (count up)
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
  const sectionRef = useRef(null);
  useScrollVars(sectionRef, reduced);

  return (
    <section ref={sectionRef} className="lp-numbers" aria-labelledby="numbers-title">
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
   7. Trusted by: logos + reviews
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

function ReviewCard({ review, hidden }) {
  return (
    <li className="lp-review-item" aria-hidden={hidden ? "true" : undefined}>
      <figure className="lp-review">
        <div className="lp-review__top">
          <span className="lp-review__mark" aria-hidden="true">
            “
          </span>
          <span className="lp-review__stars" role="img" aria-label="5 out of 5 stars">
            ★★★★★
          </span>
        </div>
        <blockquote>
          {review.before}
          {review.highlight}
          {review.after}
        </blockquote>
        <figcaption>
          <strong>{review.name}</strong>
          <span>{review.place}</span>
        </figcaption>
      </figure>
    </li>
  );
}

// Reviews move slowly in one line, like the logo strip.
// The list is shown twice so the loop has no gap. Hover to pause.
function Reviews() {
  return (
    <section className="lp-section" aria-labelledby="reviews-title">
      <div className="lp-container">
        <SectionHead id="reviews-title" eyebrow="Reviews" title="Happy businesses, happy visitors">
          <span className="lp-sample">Sample</span>
        </SectionHead>
      </div>

      <div className="lp-reviews">
        <ul className="lp-reviews__track">
          {[...REVIEWS, ...REVIEWS].map((review, i) => (
            <ReviewCard
              key={`${review.name}-${i}`}
              review={review}
              hidden={i >= REVIEWS.length}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* =========================================================
   8. Industries
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
          {INDUSTRIES.map((industry) => (
            <Reveal as="li" key={industry.name}>
              <Link
                className="lp-ind"
                to={`/businesses?category=${encodeURIComponent(industry.name)}`}
              >
                <ColorIcon name={industry.icon} size={64} />
                <span className="lp-ind__name">{industry.name}</span>
              </Link>
            </Reveal>
          ))}
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
   9. Places
   ========================================================= */

// Makes the "waiting" numbers move a little, like a live queue
function useLiveWaiting(places, reduced) {
  const [waiting, setWaiting] = useState(() => places.map((place) => place.waiting));

  useEffect(() => {
    if (reduced || places.length === 0) return;
    const id = setInterval(() => {
      setWaiting((prev) => {
        const next = [...prev];
        const i = Math.floor(Math.random() * next.length);
        const change = Math.random() < 0.5 ? -1 : 1;
        next[i] = Math.max(1, next[i] + change);
        return next;
      });
    }, 2600);
    return () => clearInterval(id);
  }, [places.length, reduced]);

  return waiting;
}

function Places({ reduced }) {
  // Later: replace PLACES with data from GET /api/businesses
  const places = PLACES;
  const waiting = useLiveWaiting(places, reduced);

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
            {places.map((place, i) => (
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
                    <span className="lp-badge lp-badge--peach lp-badge--live">
                      <i aria-hidden="true" />
                      <span key={waiting[i]} className="lp-tick">
                        {waiting[i]}
                      </span>{" "}
                      waiting
                    </span>
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
   10. FAQ
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
   11. Orange section
   ========================================================= */

function OrangeCta({ reduced }) {
  const ctaRef = useRef(null);
  useScrollVars(ctaRef, reduced);

  return (
    <section ref={ctaRef} className="lp-cta">
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
            <Link className="btn btn--outline" to="/sign-up">
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
  const reduced = useReducedMotion();

  return (
    <main className="lp">
      <Hero reduced={reduced} />
      <LogoStrip />
      <Steps reduced={reduced} />
      <Roles reduced={reduced} />
      <Features reduced={reduced} />
      <TicketPrinter reduced={reduced} />
      <DayAcrossTown reduced={reduced} />
      <Values />
      <Numbers reduced={reduced} />
      <Reviews />
      <Industries />
      <Trust />
      <Places reduced={reduced} />
      <Faq />
      <OrangeCta reduced={reduced} />
    </main>
  );
}