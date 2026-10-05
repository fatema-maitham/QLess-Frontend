import { useEffect, useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  Bell,
  Buildings,
  CalendarCheck,
  ChartBar,
  Check,
  Megaphone,
  QrCode,
  ShieldCheck,
  Star,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import "./ExtraQLessSections.css";

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

// true once the element has scrolled into view
function useInView(threshold = 0.35) {
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
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* =========================================================
   1. Crowd → Queue
   ========================================================= */

// same "random" numbers every time, so the crowd always looks the same
const rand = (n) => {
  const x = Math.sin(n * 12.9898 + 4.1) * 43758.5453;
  return x - Math.floor(x);
};

const YOU = 9;

const CROWD = Array.from({ length: 24 }, (_, i) => ({
  x: 50 + (rand(i) - 0.5) * 70,
  y: 32 + rand(i + 99) * 55,
  r: (rand(i + 7) - 0.5) * 30,
  ox: 10 + (i % 6) * 16,
  oy: 24 + Math.floor(i / 6) * 19,
  number: `A${98 + i}`,
}));

function CrowdToQueue() {
  const [ref, inView] = useInView();
  const [ordered, setOrdered] = useState(false);
  const touched = useRef(false);

  // turns into a queue by itself the first time you see it
  useEffect(() => {
    if (!inView || touched.current) return;
    const id = setTimeout(() => setOrdered(true), 900);
    return () => clearTimeout(id);
  }, [inView]);

  const choose = (value) => {
    touched.current = true;
    setOrdered(value);
  };

  return (
    <section className="qx-crowd" aria-labelledby="qx-crowd-title">
      <div className="qx-wrap qx-layout">
        <div>
          <p className="qx-eyebrow">From chaos to order</p>
          <h2 id="qx-crowd-title" className="qx-h2">
            Everyone gets
            <br />
            <span>a fair place.</span>
          </h2>
          <p className="qx-text">
            No pushing to the front, no guessing who was first. Every visitor gets a number
            and keeps it.
          </p>

          <div className="qx-switch">
            <button type="button" aria-pressed={!ordered} onClick={() => choose(false)}>
              Without QLess
            </button>
            <button type="button" aria-pressed={ordered} onClick={() => choose(true)}>
              With QLess
            </button>
          </div>
        </div>

        <div ref={ref} className={`qx-stage ${ordered ? "is-ordered" : ""}`} aria-hidden="true">
          <span className="qx-stage__label">{ordered ? "LIVE QUEUE" : "COUNTER"}</span>

          {CROWD.map((dot, i) => (
            <span
              key={dot.number}
              className={`qx-dot ${i === YOU ? "is-you" : ""}`}
              style={{
                "--x": `${dot.x}%`,
                "--y": `${dot.y}%`,
                "--r": `${dot.r}deg`,
                "--ox": `${dot.ox}%`,
                "--oy": `${dot.oy}%`,
                "--delay": `${i * 30}ms`,
              }}
            >
              {dot.number}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   2. Scroll fill text
   ========================================================= */
const FILL_LINES = ["Wait less.", "Live more.", "Be on time."];

function ScrollFillText() {
  const ref = useRef(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const section = ref.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const progress = clamp01(-rect.top / Math.max(1, rect.height - window.innerHeight));
      section.style.setProperty("--p", progress.toFixed(3));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="qx-fill" aria-label="Wait less. Live more. Be on time.">
      <div className="qx-fill__sticky">
        <div className="qx-wrap" aria-hidden="true">
          {FILL_LINES.map((line, i) => (
            <p key={line} className="qx-fill__line" style={{ "--i": i }}>
              {line}
            </p>
          ))}
          <p className="qx-fill__note">
            That&apos;s the whole idea behind QLess. Keep scrolling.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   3. Swipe deck (staff demo)
   ========================================================= */
const SWIPE_SERVICES = ["General services", "Payments", "Documents", "New account"];
const SWIPE_NAMES = ["Sara M.", "Ali H.", "Noor K.", "Yousif A.", "Mariam S.", "Hasan J."];
const THRESHOLD = 110;

const ticketInfo = (n) => ({
  number: `A${n}`,
  service: SWIPE_SERVICES[n % SWIPE_SERVICES.length],
  name: SWIPE_NAMES[n % SWIPE_NAMES.length],
  wait: 3 + (n % 5) * 2,
});

function SwipeDeck({ reduced }) {
  const [queue, setQueue] = useState([104, 105, 106, 107]);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(null);
  const [tally, setTally] = useState({ served: 0, skipped: 0 });
  const startX = useRef(null);

  const finish = (dir) => {
    if (leaving) return;
    setLeaving(dir);
    setTimeout(() => {
      setQueue((q) => [...q.slice(1), q[q.length - 1] + 1]);
      setTally((t) =>
        dir === "right" ? { ...t, served: t.served + 1 } : { ...t, skipped: t.skipped + 1 }
      );
      setLeaving(null);
      setDragX(0);
    }, reduced ? 0 : 320);
  };

  const onDown = (e) => {
    if (leaving) return;
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e) => {
    if (startX.current === null) return;
    setDragX(e.clientX - startX.current);
  };

  const onUp = () => {
    if (startX.current === null) return;
    startX.current = null;
    setDragging(false);
    if (dragX > THRESHOLD) finish("right");
    else if (dragX < -THRESHOLD) finish("left");
    else setDragX(0);
  };

  const onKey = (e) => {
    if (e.key === "ArrowRight") finish("right");
    if (e.key === "ArrowLeft") finish("left");
  };

  const topStyle = leaving
    ? {
      transform: `translateX(${leaving === "right" ? 140 : -140}%) rotate(${leaving === "right" ? 24 : -24}deg)`,
      opacity: 0,
    }
    : { transform: `translateX(${dragX}px) rotate(${dragX / 14}deg)` };

  const current = ticketInfo(queue[0]);

  return (
    <section className="qx-swipe" aria-labelledby="qx-swipe-title">
      <div className="qx-wrap qx-layout">
        <div>
          <p className="qx-eyebrow">Try the staff screen</p>
          <h2 id="qx-swipe-title" className="qx-h2">
            Swipe to call
            <br />
            <span>the next visitor.</span>
          </h2>
          <p className="qx-text">
            Drag the ticket right to serve it, or left for a no-show. You can also use the
            buttons or the arrow keys.
          </p>

          <div className="qx-tally" aria-live="polite">
            <span>
              <b>{tally.served}</b>
              Served
            </span>
            <span>
              <b>{tally.skipped}</b>
              No-shows
            </span>
          </div>
        </div>

        <div>
          <div className="qx-deck">
            {queue.map((n, i) => {
              const info = ticketInfo(n);
              const isTop = i === 0;

              return (
                <article
                  key={n}
                  className={`qx-card ${isTop ? "is-top" : ""} ${isTop && dragging ? "is-dragging" : ""}`}
                  style={{ "--i": i, zIndex: queue.length - i, ...(isTop ? topStyle : {}) }}
                  tabIndex={isTop ? 0 : -1}
                  aria-hidden={!isTop}
                  aria-label={isTop ? `Ticket ${info.number}. Right arrow to serve, left arrow for no-show.` : undefined}
                  onPointerDown={isTop ? onDown : undefined}
                  onPointerMove={isTop ? onMove : undefined}
                  onPointerUp={isTop ? onUp : undefined}
                  onPointerCancel={isTop ? onUp : undefined}
                  onKeyDown={isTop ? onKey : undefined}
                >
                  {isTop && (
                    <>
                      <span
                        className="qx-card__stamp qx-card__stamp--serve"
                        style={{ opacity: leaving === "right" ? 1 : clamp01(dragX / THRESHOLD) }}
                      >
                        SERVE
                      </span>
                      <span
                        className="qx-card__stamp qx-card__stamp--skip"
                        style={{ opacity: leaving === "left" ? 1 : clamp01(-dragX / THRESHOLD) }}
                      >
                        NO-SHOW
                      </span>
                    </>
                  )}

                  <small>Next in line · {info.service}</small>
                  <strong>{info.number}</strong>

                  <div className="qx-card__person">
                    <span className="qx-card__avatar">{info.name.charAt(0)}</span>
                    <span>{info.name}</span>
                    <span>{info.wait} min</span>
                  </div>

                  <div className="qx-card__hint">
                    <span>← No-show</span>
                    <span>Serve →</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="qx-deck__actions">
            <button type="button" className="qx-round" onClick={() => finish("left")}>
              <X size={18} weight="bold" /> No-show
            </button>
            <button type="button" className="qx-round qx-round--serve" onClick={() => finish("right")}>
              <Check size={18} weight="bold" /> Serve {current.number}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4. Orbit
   ========================================================= */
const RINGS = [
  {
    r: 0.2,
    speed: "26s",
    dir: "normal",
    items: [
      { label: "Live queue", icon: UsersThree },
      { label: "Alerts", icon: Bell },
    ],
  },
  {
    r: 0.33,
    speed: "38s",
    dir: "reverse",
    items: [
      { label: "QR join", icon: QrCode },
      { label: "Bookings", icon: CalendarCheck },
      { label: "Reviews", icon: Star },
    ],
  },
  {
    r: 0.46,
    speed: "52s",
    dir: "normal",
    items: [
      { label: "Announcements", icon: Megaphone },
      { label: "Insights", icon: ChartBar },
      { label: "Approvals", icon: ShieldCheck },
      { label: "Branches", icon: Buildings },
    ],
  },
];

function Orbit() {
  return (
    <section className="qx-orbit-section" aria-labelledby="qx-orbit-title">
      <div className="qx-wrap qx-layout">
        <div>
          <p className="qx-eyebrow">All in one place</p>
          <h2 id="qx-orbit-title" className="qx-h2">
            Everything turns
            <br />
            <span>around the queue.</span>
          </h2>
          <p className="qx-text">
            Alerts, bookings, branches and approvals all connect to one live queue. Hover the
            circle to pause it.
          </p>
          <p className="qx-sr">
            Features: live queue, alerts, QR join, bookings, reviews, announcements, insights,
            approvals and branches.
          </p>
        </div>

        <div className="qx-orbit" aria-hidden="true">
          {RINGS.map((ring, r) => (
            <div
              key={r}
              className="qx-orbit__ring"
              style={{
                "--r": `calc(var(--size) * ${ring.r})`,
                "--speed": ring.speed,
                "--dir": ring.dir,
                "--cdir": ring.dir === "normal" ? "reverse" : "normal",
              }}
            >
              {ring.items.map((item, j) => {
                const Icon = item.icon;
                const angle = (360 / ring.items.length) * j + r * 40;
                return (
                  <div key={item.label} className="qx-orbit__item" style={{ "--a": `${angle}deg` }}>
                    <div className="qx-orbit__chip">
                      <i>
                        <Icon size={18} weight="duotone" />
                      </i>
                      <span>{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="qx-orbit__core">Q</div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   5. Chat bubbles
   ========================================================= */
const CHAT = [
  { from: "q", text: "You're in! Ticket A107 at Pearl Bank, Seef. 6 people ahead, about 24 min." },
  { from: "q", text: "Your queue is moving. 3 people ahead now." },
  { from: "q", text: "Almost your turn. Are you still coming?" },
  { from: "me", text: "Yes, 5 minutes away!" },
  { from: "q", text: "Great. Please head to Counter 2 when you arrive." },
];

function ChatBubbles({ reduced }) {
  const [ref, inView] = useInView(0.4);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setShown(CHAT.length);
      return;
    }

    let cancelled = false;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    (async () => {
      setTyping(false);
      setShown(0);
      await sleep(400);

      for (let i = 0; i < CHAT.length; i += 1) {
        if (cancelled) return;
        if (CHAT[i].from === "q") {
          setTyping(true);
          await sleep(1000);
          if (cancelled) return;
          setTyping(false);
        } else {
          await sleep(700);
          if (cancelled) return;
        }
        setShown(i + 1);
        await sleep(900);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, reduced, run]);

  return (
    <section className="qx-chat" aria-labelledby="qx-chat-title">
      <div className="qx-wrap qx-layout">
        <div>
          <p className="qx-eyebrow">Updates that feel human</p>
          <h2 id="qx-chat-title" className="qx-h2">
            Like a text
            <br />
            from a friend.
          </h2>
          <p className="qx-text">
            Short, clear messages tell visitors exactly where they are and when to come back.
          </p>

          <button type="button" className="qx-replay" onClick={() => setRun((n) => n + 1)}>
            <ArrowCounterClockwise size={18} weight="bold" /> Replay
          </button>
        </div>

        <div ref={ref} className="qx-phone">
          <div className="qx-phone__screen">
            <div className="qx-phone__top">
              <i aria-hidden="true">Q</i>
              QLess
              <small>Text message</small>
            </div>

            <div className="qx-thread" aria-live="polite">
              {CHAT.slice(0, shown).map((message, i) => (
                <p key={`${run}-${i}`} className={`qx-bubble qx-bubble--${message.from}`}>
                  {message.text}
                </p>
              ))}

              {typing && (
                <span className="qx-typing" aria-label="QLess is typing">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>

            <div className="qx-phone__input" aria-hidden="true">
              Text message
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   All extra sections
   Delete any line below to remove that section
   ========================================================= */
export default function ExtraQLessSections() {
  const reduced = useReducedMotion();

  return (
    <>
      <CrowdToQueue />
      <ScrollFillText />
      <SwipeDeck reduced={reduced} />
      <Orbit />
      <ChatBubbles reduced={reduced} />
    </>
  );
}