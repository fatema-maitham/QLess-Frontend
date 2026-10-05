import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  Coffee,
  Briefcase,
  ShoppingBag,
  PersonSimpleWalk,
  Check,
  MapPin,
} from "@phosphor-icons/react";


/* =========================================================
   HELPER
   ========================================================= */

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function useScrollProgress(ref, callback) {
  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);

      const progress = clamp01(-rect.top / distance);

      callback(progress);
    };

    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, callback]);
}


/* =========================================================
   1. PHYSICAL LINE → DIGITAL TICKET
   ========================================================= */

function LineToTicket() {
  const ref = useRef(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const section = ref.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);

      const progress = clamp01(-rect.top / distance);

      section.style.setProperty("--line-progress", progress.toFixed(3));
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
  }, []);

  const people = Array.from({ length: 8 });

  return (
    <section ref={ref} className="ql-new-line">
      <div className="ql-new-line__sticky">
        <div className="ql-new-wrap">

          <div className="ql-new-line__heading">
            <p className="ql-new-eyebrow">The old way vs QLess</p>

            <h2>
              A line you
              <br />
              don&apos;t have to
              <br />
              <span>stand in.</span>
            </h2>

            <p>
              Your place can stay in the queue even when you don&apos;t.
            </p>
          </div>

          <div className="ql-new-line__scene">

            <div className="ql-new-line__people">
              {people.map((_, index) => (
                <div
                  className="ql-new-person"
                  key={index}
                  style={{
                    "--person-index": index,
                  }}
                >
                  <span className="ql-new-person__head" />
                  <span className="ql-new-person__body" />
                </div>
              ))}

              <div className="ql-new-counter">
                <span>COUNTER</span>
                <b>02</b>
              </div>
            </div>

            <div className="ql-new-line__physical">
              <span />
            </div>

            <div className="ql-new-ticket">
              <div className="ql-new-ticket__top">
                <span className="ql-new-ticket__logo">Q</span>
                <span>QLess</span>
              </div>

              <small>Your ticket</small>

              <strong>A107</strong>

              <div className="ql-new-ticket__stats">
                <span>
                  <small>People ahead</small>
                  <b>2</b>
                </span>

                <span>
                  <small>Est. wait</small>
                  <b>8 min</b>
                </span>
              </div>

              <div className="ql-new-ticket__live">
                <i />
                Live queue
              </div>
            </div>

          </div>
        </div>

        <div className="ql-new-scroll">
          Scroll to leave the line
          <span>↓</span>
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   2. WHAT CAN YOU DO WITH 20 MINUTES?
   ========================================================= */

const TIME_STAGES = [
  {
    time: 20,
    title: "Grab a coffee.",
    text: "Your place stays safe in the queue.",
    icon: Coffee,
  },
  {
    time: 15,
    title: "Finish some work.",
    text: "Check your live position whenever you want.",
    icon: Briefcase,
  },
  {
    time: 10,
    title: "Pick something up.",
    text: "You don't need to watch the counter.",
    icon: ShoppingBag,
  },
  {
    time: 5,
    title: "Start heading over.",
    text: "QLess lets you know when you're getting close.",
    icon: PersonSimpleWalk,
  },
  {
    time: 0,
    title: "Right on time.",
    text: "Walk in when they're ready for you.",
    icon: Check,
  },
];

function TwentyMinutes() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const section = ref.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);

      const progress = clamp01(-rect.top / distance);

      const index = Math.min(
        TIME_STAGES.length - 1,
        Math.floor(progress * TIME_STAGES.length)
      );

      setActive(index);

      section.style.setProperty("--time-progress", progress.toFixed(3));
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
  }, []);

  const stage = TIME_STAGES[active];
  const Icon = stage.icon;

  return (
    <section ref={ref} className="ql-new-time">
      <div className="ql-new-time__sticky">

        <div className="ql-new-time__heading">
          <p className="ql-new-eyebrow">
            Your time belongs to you
          </p>

          <h2>
            What can you do
            <br />
            with 20 minutes?
          </h2>
        </div>

        <div className="ql-new-time__stage">

          <div
            key={stage.time}
            className={`ql-new-time__clock ${stage.time === 0 ? "is-done" : ""
              }`}
          >
            {stage.time === 0 ? (
              <>
                <Check size={58} weight="bold" />
                <small>YOUR TURN</small>
              </>
            ) : (
              <>
                <strong>{stage.time}</strong>
                <small>MIN</small>
              </>
            )}
          </div>

          <div
            key={stage.title}
            className="ql-new-time__activity"
          >
            <span className="ql-new-time__icon">
              <Icon size={32} weight="duotone" />
            </span>

            <span className="ql-new-time__index">
              0{active + 1} / 0{TIME_STAGES.length}
            </span>

            <h3>{stage.title}</h3>

            <p>{stage.text}</p>
          </div>

        </div>

        <div className="ql-new-time__dots">
          {TIME_STAGES.map((item, index) => (
            <span
              key={item.title}
              className={index <= active ? "is-on" : ""}
            />
          ))}
        </div>

      </div>
    </section>
  );
}


/* =========================================================
   3. BEFORE QLESS / WITH QLESS
   ========================================================= */

function BeforeAfterQLess() {
  const ref = useRef(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const section = ref.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);

      const progress = clamp01(-rect.top / distance);

      section.style.setProperty(
        "--compare-progress",
        progress.toFixed(3)
      );
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
  }, []);

  return (
    <section ref={ref} className="ql-new-compare">
      <div className="ql-new-compare__sticky">

        <div className="ql-new-compare__title">
          <p className="ql-new-eyebrow">A better way to wait</p>
          <h2>Same queue. Completely different day.</h2>
        </div>

        <div className="ql-new-compare__stage">

          <div className="ql-new-compare__before">
            <span className="ql-new-compare__label">
              BEFORE QLESS
            </span>

            <div className="ql-new-compare__content">
              <strong>01</strong>
              <h3>Stand in line.</h3>
              <p>Stay close because you don&apos;t know when you&apos;ll be called.</p>

              <div className="ql-new-compare__bad-list">
                <span>Stand</span>
                <i />
                <span>Wait</span>
                <i />
                <span>Check</span>
                <i />
                <span>Wait again</span>
              </div>
            </div>
          </div>

          <div className="ql-new-compare__after">
            <span className="ql-new-compare__label">
              WITH QLESS
            </span>

            <div className="ql-new-compare__content">
              <strong>01</strong>
              <h3>Join. Then go.</h3>
              <p>
                Your digital ticket keeps your place while you use
                your time somewhere else.
              </p>

              <div className="ql-new-compare__good-list">
                <span>Join</span>
                <i />
                <span>Leave</span>
                <i />
                <span>Get notified</span>
                <i />
                <span>Arrive</span>
              </div>
            </div>
          </div>

          <div className="ql-new-compare__divider">
            <span>
              <ArrowRight size={20} weight="bold" />
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}


/* =========================================================
   4. THE QUEUE MOVES WITH YOU
   ========================================================= */

const JOURNEY_STEPS = [
  {
    number: "A107",
    title: "Joined",
    detail: "You're in the queue.",
  },
  {
    number: "8",
    title: "8 ahead",
    detail: "Plenty of time.",
  },
  {
    number: "5",
    title: "5 ahead",
    detail: "Your queue is moving.",
  },
  {
    number: "2",
    title: "2 ahead",
    detail: "Time to head over.",
  },
  {
    number: "NEXT",
    title: "You're next",
    detail: "Stay nearby.",
  },
  {
    number: "02",
    title: "Counter 2",
    detail: "They're ready for you.",
  },
];

function QueueJourney() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const section = ref.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);

      const progress = clamp01(-rect.top / distance);

      section.style.setProperty(
        "--journey-progress",
        progress.toFixed(3)
      );

      const index = Math.min(
        JOURNEY_STEPS.length - 1,
        Math.floor(progress * JOURNEY_STEPS.length)
      );

      setActive(index);
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
  }, []);

  const current = JOURNEY_STEPS[active];

  return (
    <section ref={ref} className="ql-new-journey">
      <div className="ql-new-journey__sticky">

        <div className="ql-new-wrap">

          <div className="ql-new-journey__heading">
            <p className="ql-new-eyebrow">
              Live from join to counter
            </p>

            <h2>
              The queue
              <br />
              <span>moves with you.</span>
            </h2>
          </div>

          <div className="ql-new-journey__map">

            <svg
              className="ql-new-journey__svg"
              viewBox="0 0 1000 420"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="ql-new-journey__path-bg"
                d="M40 300 C180 80 310 80 430 240 S700 390 960 100"
              />

              <path
                className="ql-new-journey__path-live"
                pathLength="1"
                d="M40 300 C180 80 310 80 430 240 S700 390 960 100"
              />
            </svg>

            <div className="ql-new-journey__points">
              {JOURNEY_STEPS.map((step, index) => (
                <button
                  type="button"
                  key={step.title}
                  className={`ql-new-journey__point ql-new-journey__point--${index + 1} ${index <= active ? "is-on" : ""
                    }`}
                  onClick={() => setActive(index)}
                >
                  <i />
                  <span>{step.title}</span>
                </button>
              ))}
            </div>

            <div
              key={current.title}
              className="ql-new-journey__ticket"
            >
              <div className="ql-new-journey__ticket-top">
                <span>QLess</span>
                <span>LIVE</span>
              </div>

              <strong>{current.number}</strong>
              <h3>{current.title}</h3>
              <p>{current.detail}</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}


/* =========================================================
   5. LIVE NOTIFICATION STORY
   ========================================================= */

const NOTIFICATIONS = [
  {
    time: "10:02",
    title: "You're in — A107",
    text: "8 people are ahead of you.",
  },
  {
    time: "10:11",
    title: "Your queue is moving",
    text: "5 people are ahead of you.",
  },
  {
    time: "10:20",
    title: "About 8 minutes",
    text: "Start wrapping up what you're doing.",
  },
  {
    time: "10:25",
    title: "Almost your turn",
    text: "There are 2 people ahead.",
  },
  {
    time: "10:31",
    title: "It's your turn",
    text: "Please head to Counter 2.",
  },
];

function NotificationStory() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const section = ref.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);

      const progress = clamp01(-rect.top / distance);

      const index = Math.min(
        NOTIFICATIONS.length - 1,
        Math.floor(progress * NOTIFICATIONS.length)
      );

      setActive(index);
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
  }, []);

  return (
    <section ref={ref} className="ql-new-notifications">
      <div className="ql-new-notifications__sticky">

        <div className="ql-new-wrap ql-new-notifications__layout">

          <div className="ql-new-notifications__copy">
            <p className="ql-new-eyebrow">
              No need to keep checking
            </p>

            <h2>
              We&apos;ll tell you
              <br />
              when it matters.
            </h2>

            <p>
              QLess keeps visitors updated as their place changes,
              so they know when to keep going and when to come back.
            </p>

            <div className="ql-new-notifications__counter">
              0{active + 1}
              <span>/</span>
              0{NOTIFICATIONS.length}
            </div>
          </div>

          <div className="ql-new-notifications__phone">

            <div className="ql-new-notifications__phone-top">
              <span>9:41</span>
              <span className="ql-new-notifications__island" />
              <span>●●●</span>
            </div>

            <div className="ql-new-notifications__wallpaper">
              <span className="ql-new-notifications__date">
                Monday, October 5
              </span>

              <strong>10:31</strong>
            </div>

            <div className="ql-new-notifications__stack">
              {NOTIFICATIONS.slice(0, active + 1)
                .reverse()
                .map((notification, reverseIndex) => {
                  const originalIndex = active - reverseIndex;

                  return (
                    <div
                      key={notification.title}
                      className={`ql-new-notification ${originalIndex === active ? "is-current" : ""
                        }`}
                      style={{
                        "--notification-index": reverseIndex,
                      }}
                    >
                      <div className="ql-new-notification__head">
                        <span className="ql-new-notification__logo">
                          Q
                        </span>

                        <b>QLess</b>

                        <small>{notification.time}</small>
                      </div>

                      <strong>{notification.title}</strong>
                      <p>{notification.text}</p>
                    </div>
                  );
                })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}


/* =========================================================
   6. ONE QUEUE — FOUR PERSPECTIVES
   ========================================================= */

const PERSPECTIVES = [
  {
    role: "Visitor",
    headline: "A107",
    text: "2 ahead · about 8 min",
    side: "left",
  },
  {
    role: "Staff",
    headline: "A105",
    text: "Now serving · Counter 2",
    side: "right",
  },
  {
    role: "Owner",
    headline: "12 min",
    text: "Average wait · 18 visitors today",
    side: "left",
  },
  {
    role: "Admin",
    headline: "24",
    text: "Active businesses · platform healthy",
    side: "right",
  },
];

function Perspectives() {
  return (
    <section className="ql-new-perspectives">

      <div className="ql-new-wrap ql-new-perspectives__heading">
        <p className="ql-new-eyebrow">Connected experience</p>

        <h2>
          One queue.
          <br />
          Four perspectives.
        </h2>

        <p>
          Everyone sees what they need, without making the system
          complicated.
        </p>
      </div>

      <div className="ql-new-perspectives__rows">

        {PERSPECTIVES.map((item, index) => (
          <div
            key={item.role}
            className={`ql-new-perspective ql-new-perspective--${item.side}`}
          >
            <div className="ql-new-perspective__track">

              <span className="ql-new-perspective__role">
                0{index + 1} · {item.role}
              </span>

              <strong>{item.headline}</strong>

              <span className="ql-new-perspective__detail">
                {item.text}
              </span>

              <span className="ql-new-perspective__role">
                {item.role}
              </span>

              <strong>{item.headline}</strong>

              <span className="ql-new-perspective__detail">
                {item.text}
              </span>

            </div>
          </div>
        ))}

      </div>
    </section>
  );
}


/* =========================================================
   7. A DAY WITH QLESS
   ========================================================= */

const DAY_DATA = [
  {
    time: "8 AM",
    waiting: 3,
    wait: "5 min",
    message: "Morning starts quietly.",
  },
  {
    time: "10 AM",
    waiting: 8,
    wait: "12 min",
    message: "Demand starts building.",
  },
  {
    time: "12 PM",
    waiting: 16,
    wait: "22 min",
    message: "Lunch-hour rush.",
  },
  {
    time: "2 PM",
    waiting: 11,
    wait: "16 min",
    message: "The queue starts easing.",
  },
  {
    time: "4 PM",
    waiting: 6,
    wait: "9 min",
    message: "Afternoon slows down.",
  },
  {
    time: "6 PM",
    waiting: 2,
    wait: "4 min",
    message: "Almost clear.",
  },
];

function QLessDay() {
  const [active, setActive] = useState(2);
  const current = DAY_DATA[active];

  return (
    <section className="ql-new-day">

      <div className="ql-new-wrap">

        <div className="ql-new-day__heading">
          <div>
            <p className="ql-new-eyebrow">A day on QLess</p>

            <h2>
              See the queue
              <br />
              before it sees you.
            </h2>
          </div>

          <p>
            Live queue information helps visitors choose when to
            go and helps businesses understand demand.
          </p>
        </div>

        <div className="ql-new-day__dashboard">

          <div className="ql-new-day__summary">
            <span>City Centre Branch</span>

            <div>
              <small>{current.time}</small>
              <strong>{current.waiting}</strong>
              <span>waiting</span>
            </div>

            <p>{current.message}</p>

            <div className="ql-new-day__wait">
              <small>Estimated wait</small>
              <b>{current.wait}</b>
            </div>
          </div>

          <div className="ql-new-day__chart">

            <div className="ql-new-day__bars">
              {DAY_DATA.map((item, index) => (
                <button
                  type="button"
                  key={item.time}
                  className={index === active ? "is-active" : ""}
                  onClick={() => setActive(index)}
                  aria-label={`${item.time}: ${item.waiting} waiting`}
                >
                  <span
                    style={{
                      height: `${Math.max(
                        18,
                        (item.waiting / 16) * 100
                      )}%`,
                    }}
                  />

                  <small>{item.time}</small>
                </button>
              ))}
            </div>

            <div className="ql-new-day__legend">
              <span>
                <i />
                Live demand
              </span>

              <span>
                Click a time to explore
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}


/* =========================================================
   ALL NEW SECTIONS
   Put <CreativeQLessSections /> in LandingPage
   ========================================================= */

export default function CreativeQLessSections() {
  return (
    <>
      <LineToTicket />

      <TwentyMinutes />

      <BeforeAfterQLess />

      <QueueJourney />

      <NotificationStory />

      <Perspectives />

      <QLessDay />
    </>
  );
}