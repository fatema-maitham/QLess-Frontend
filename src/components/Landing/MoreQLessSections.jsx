import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Bank,
  GraduationCap,
  PawPrint,
  Pill,
  Scissors,
  Stethoscope,
  Ticket,
} from "@phosphor-icons/react";
import "./MoreQLessSections.css";

const clamp01 = (value) => Math.min(1, Math.max(0, value));

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
   1. Scramble words
   ========================================================= */
const SCRAMBLE_WORDS = ["clinic", "bank", "salon", "pharmacy", "ministry", "vet", "university"];
const GLYPHS = "abcdefghijkmnopqrstuvwxyz0123456789";

function useScramble(words, reduced) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(words[0]);

  // pick the next word every few seconds
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words, reduced]);

  // scramble letters until they land on the word
  useEffect(() => {
    const target = words[index];
    if (reduced) {
      setText(target);
      return;
    }

    let frame = 0;
    const frames = 16;
    const id = setInterval(() => {
      frame += 1;
      const fixed = Math.floor((frame / frames) * target.length);
      setText(
        target
          .split("")
          .map((ch, i) => (i < fixed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join("")
      );
      if (frame >= frames) {
        clearInterval(id);
        setText(target);
      }
    }, 45);

    return () => clearInterval(id);
  }, [index, words, reduced]);

  return { text, index };
}

function ScrambleStrip({ reduced }) {
  const { text, index } = useScramble(SCRAMBLE_WORDS, reduced);

  return (
    <section className="qm-scramble" aria-label="Places that use QLess">
      <div className="qm-wrap">
        <p className="qm-eyebrow">One app, every counter</p>
        <h2 className="qm-scramble__title">
          No more waiting at the{" "}
          <span className="qm-scramble__word" aria-hidden="true">
            {text}
          </span>
          <span className="qm-sr">clinic, bank, salon, pharmacy or ministry</span>
        </h2>

        <ul className="qm-scramble__chips" aria-hidden="true">
          {SCRAMBLE_WORDS.map((word, i) => (
            <li key={word} className={i === index ? "is-on" : ""}>
              {word}
            </li>
          ))}
        </ul>
      </div>
    </section>
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
              <i aria-hidden="true">Q</i>
              QLess · City Centre
            </div>
            <div className="qm-machine__screen">
              <span>Last ticket</span>
              <b>A{count}</b>
            </div>
            <div className="qm-machine__slot" aria-hidden="true" />
          </div>

          <div className="qm-machine__out">
            {ticket ? (
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
            ) : (
              <div className="qm-ticket--empty">Your ticket will print here</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   3. Split-flap "Now serving" board
   ========================================================= */
const FLAP_SERVICES = ["GENERAL", "PAYMENTS", "DOCUMENTS", "ACCOUNTS"];

const FLAP_COLUMNS = [
  { label: "Ticket", key: "number", length: 4 },
  { label: "Service", key: "service", length: 9 },
  { label: "Counter", key: "counter", length: 2 },
  { label: "Status", key: "status", length: 4 },
];

function boardRows(tick) {
  return [0, 1, 2, 3, 4].map((i) => {
    const n = 104 + tick + i;
    return {
      number: `A${n}`,
      service: FLAP_SERVICES[n % FLAP_SERVICES.length],
      counter: i === 0 ? `0${(n % 3) + 1}` : "--",
      status: i === 0 ? "NOW" : i === 1 ? "NEXT" : "WAIT",
    };
  });
}

// Only the letters that change get a new key, so only they flip
function FlapText({ text, length }) {
  const chars = text.padEnd(length, " ").slice(0, length).split("");

  return (
    <span className="qm-flap">
      {chars.map((ch, i) => (
        <span key={`${i}-${ch}`} className="qm-flap__cell" style={{ "--d": `${i * 40}ms` }}>
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
    </span>
  );
}

function SplitFlapBoard({ reduced }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(id);
  }, [reduced]);

  const rows = boardRows(tick);
  const now = rows[0];

  return (
    <section className="qm-board" aria-labelledby="qm-board-title">
      <div className="qm-wrap">
        <div className="qm-board__head">
          <div>
            <p className="qm-eyebrow">The waiting room screen, reimagined</p>
            <h2 id="qm-board-title" className="qm-h2">
              Now serving,
              <br />
              <span>on every screen.</span>
            </h2>
          </div>
          <p className="qm-text">
            The same live board shows on the branch TV and on every visitor&apos;s phone,
            so nobody has to stare at the counter.
          </p>
        </div>

        <div className="qm-board__panel">
          <div className="qm-board__bar">
            <span className="qm-board__live">Live</span>
            <span>City Centre Branch · Example data</span>
          </div>

          <p className="qm-sr" aria-live="polite">
            Now serving {now.number} at counter {now.counter}
          </p>

          <div className="qm-board__grid" aria-hidden="true">
            {FLAP_COLUMNS.map((col) => (
              <span key={col.label} className="qm-board__label">
                {col.label}
              </span>
            ))}

            {rows.map((row, r) => (
              <Fragment key={r}>
                {FLAP_COLUMNS.map((col) => (
                  <span key={col.key} className={`qm-board__cell ${r === 0 ? "is-now" : ""}`}>
                    <FlapText text={row[col.key]} length={col.length} />
                  </span>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4. 3D tilt service cards
   ========================================================= */
const SERVICES = [
  { name: "Clinic check-up", category: "Healthcare", wait: 35, icon: Stethoscope },
  { name: "Open an account", category: "Banks", wait: 25, icon: Bank },
  { name: "Haircut", category: "Salons and beauty", wait: 30, icon: Scissors },
  { name: "Prescription pickup", category: "Pharmacies", wait: 15, icon: Pill },
  { name: "Pet vaccination", category: "Veterinary", wait: 20, icon: PawPrint },
  { name: "Student services", category: "Universities", wait: 40, icon: GraduationCap },
];

function TiltCard({ service, reduced }) {
  const ref = useRef(null);
  const Icon = service.icon;

  const onMove = (e) => {
    if (reduced || e.pointerType !== "mouse") return;
    const el = ref.current;
    const box = el.getBoundingClientRect();
    const px = (e.clientX - box.left) / box.width;
    const py = (e.clientY - box.top) / box.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 14}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <Link
      ref={ref}
      className="qm-tilt"
      to={`/businesses?category=${encodeURIComponent(service.category)}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="qm-tilt__icon">
        <Icon size={30} weight="duotone" />
      </span>
      <span className="qm-tilt__tag">{service.category}</span>
      <h3>{service.name}</h3>

      <div className="qm-tilt__compare">
        <span>
          <small>Usual line</small>
          <b>~{service.wait} min</b>
        </span>
        <span>
          <small>With QLess</small>
          <b>0 min standing</b>
        </span>
      </div>

      <span className="qm-tilt__go">
        Join a queue <ArrowRight size={18} weight="bold" />
      </span>
    </Link>
  );
}

function TiltServices({ reduced }) {
  return (
    <section className="qm-tilt-section" aria-labelledby="qm-tilt-title">
      <div className="qm-wrap">
        <p className="qm-eyebrow">Pick a place</p>
        <h2 id="qm-tilt-title" className="qm-h2">
          Same errands.
          <br />
          <span>No standing.</span>
        </h2>

        <div className="qm-tilt-grid">
          {SERVICES.map((service) => (
            <TiltCard key={service.name} service={service} reduced={reduced} />
          ))}
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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
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
   6. Wait calculator
   ========================================================= */
function TimeCalculator() {
  const [visits, setVisits] = useState(3);
  const [wait, setWait] = useState(25);

  const hours = Math.max(1, Math.round((visits * 12 * wait) / 60));
  const days = Math.round(hours / 8);
  const fill = Math.min(1, hours / 150);
  const daysText = days < 1 ? "Less than a working day" : `About ${days} full working ${days === 1 ? "day" : "days"}`;

  return (
    <section className="qm-calc" aria-labelledby="qm-calc-title">
      <div className="qm-wrap qm-calc__layout">
        <div>
          <p className="qm-eyebrow">Do the maths</p>
          <h2 id="qm-calc-title" className="qm-h2">
            How much of your year
            <br />
            <span>is spent in line?</span>
          </h2>
          <p className="qm-text">
            Move the sliders. With QLess, you spend that time wherever you like instead of on
            your feet.
          </p>

          <div className="qm-calc__field">
            <label htmlFor="qm-visits">
              <span>Visits per month</span>
              <b>{visits}</b>
            </label>
            <input
              id="qm-visits"
              type="range"
              min="1"
              max="12"
              value={visits}
              onChange={(e) => setVisits(Number(e.target.value))}
            />
          </div>

          <div className="qm-calc__field">
            <label htmlFor="qm-wait">
              <span>Average wait per visit</span>
              <b>{wait} min</b>
            </label>
            <input
              id="qm-wait"
              type="range"
              min="5"
              max="90"
              step="5"
              value={wait}
              onChange={(e) => setWait(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="qm-ring" style={{ "--fill": fill }}>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle className="qm-ring__bg" cx="100" cy="100" r="86" />
            <circle className="qm-ring__fg" cx="100" cy="100" r="86" pathLength="1" />
          </svg>

          <div className="qm-ring__center">
            <Odometer value={hours} />
            <span>hours a year</span>
            <small>{daysText}</small>
          </div>

          <p className="qm-sr" aria-live="polite">
            {hours} hours a year. {daysText}.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   All new sections
   Put <MoreQLessSections /> in LandingPage
   ========================================================= */
export default function MoreQLessSections() {
  const reduced = useReducedMotion();

  return (
    <>
      <ScrambleStrip reduced={reduced} />
      <TicketPrinter reduced={reduced} />
      <SplitFlapBoard reduced={reduced} />
      <TiltServices reduced={reduced} />
      <DayAcrossTown reduced={reduced} />
      <TimeCalculator />
    </>
  );
}