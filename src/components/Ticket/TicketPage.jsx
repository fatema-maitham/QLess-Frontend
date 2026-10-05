import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  BellRinging,
  CheckCircle,
  Clock,
  PersonSimpleWalk,
  SignOut,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import { getQueue } from "../../services/queueService";
import { checkIn, getTicket, leaveQueue, setOnTheWay } from "../../services/ticketService";
import useQueueSocket from "../../hooks/useQueueSocket";
import { LIVE_STATUSES, TICKET_STATUS, aheadText, clockTime, minutesText } from "./ticketHelpers";
import {
  alertCalled,
  askForNotifications,
  canAskForNotifications,
  stopRinging,
  unlockSound,
} from "./alerts";
import CalledAlert from "./CalledAlert";
import useNoShowStatus from "../../hooks/useNoShowStatus";
import NoShowBanner from "../NoShow/NoShowBanner";
import "./Ticket.css";

const BACKUP_REFRESH_MS = 15000; // only used while the live connection is down
const MAX_DOTS = 5;

// Dots for the people ahead, then a "You" pill
function PlaceTrack({ ahead }) {
  const dots = Math.min(ahead, MAX_DOTS);
  const extra = ahead - dots;

  return (
    <div className="tk-track" aria-hidden="true">
      {extra > 0 && <span className="tk-track__more">+{extra}</span>}
      {Array.from({ length: dots }, (_, i) => (
        <span key={i} className="tk-track__dot" />
      ))}
      <span className="tk-track__you">You</span>
    </div>
  );
}

// Joined / called / checked in / finished times
function TimesList({ ticket }) {
  const rows = [
    ["Joined", ticket.joined_at],
    ["Called", ticket.called_at],
    ["Checked in", ticket.checked_in_at],
    ["Finished", ticket.completed_at],
    ["Left", ticket.cancelled_at],
    ["Marked no-show", ticket.no_show_at],
  ].filter(([, value]) => value);

  return (
    <dl className="tk-times">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{clockTime(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

// Seconds left to check in after being called
function useCheckInTimer(calledAt, graceMinutes, active) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  const total = graceMinutes * 60;
  if (!active || !calledAt) return { total, left: total };

  const passed = Math.floor((now - new Date(calledAt).getTime()) / 1000);
  const left = Math.min(Math.max(total - passed, 0), total);
  return { total, left };
}

export default function TicketPage() {
  const { entryId } = useParams();
  const dialogRef = useRef(null);

  const [page, setPage] = useState({ status: "loading", error: "" });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [calledOpen, setCalledOpen] = useState(false);
  const [askAlerts, setAskAlerts] = useState(canAskForNotifications);

  // The last status we saw, so we notice the moment it changes to "called"
  const lastStatus = useRef(null);

  const ticket = page.ticket;
  const isLive = ticket && LIVE_STATUSES.includes(ticket.status);

  // Show a new version of the ticket, and ring if the customer was just called
  const showTicket = useCallback((fresh) => {
    const before = lastStatus.current;
    lastStatus.current = fresh.status;

    if (before && before !== "called" && fresh.status === "called") {
      setCalledOpen(true);
      alertCalled(fresh);
    }
    if (fresh.status !== "called") {
      setCalledOpen(false);
      stopRinging();
    }

    setPage((prev) => ({ ...prev, ticket: fresh }));
  }, []);

  const refreshTicket = useCallback(() => {
    return getTicket(entryId)
      .then(showTicket)
      .catch(() => {
        // keep showing the last ticket if a refresh fails
      });
  }, [entryId, showTicket]);

  // Browsers only allow sound after the customer taps the page once.
  // Also stop any ringing when they leave the page.
  useEffect(() => {
    const unlock = () => unlockSound();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      stopRinging();
    };
  }, []);

  // First load: the ticket + its queue (for the check-in time)
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setPage({ status: "loading", error: "" });

    async function load() {
      const ticket = await getTicket(entryId, { signal });
      const queue = await getQueue(ticket.queue_id, { signal }).catch(() => null);
      lastStatus.current = ticket.status;
      setPage({ status: "ready", ticket, queue });
    }

    load().catch((err) => {
      if (err.name === "AbortError") return;
      setPage({ status: err.status === 404 ? "notfound" : "error", error: err.message });
    });

    return () => controller.abort();
  }, [entryId, reloadKey]);

  // Live updates: someone joined, left, was called, or the queue paused
  const handleQueueMessage = useCallback(
    (message) => {
      // "Now serving" can change straight away
      if (message.current_number !== undefined) {
        setPage((prev) =>
          prev.ticket ? { ...prev, ticket: { ...prev.ticket, current_number: message.current_number } } : prev
        );
      }
      // Position and wait come from the server, so ask for the fresh ticket
      refreshTicket();
    },
    [refreshTicket]
  );

  const connected = useQueueSocket(ticket?.queue_id, handleQueueMessage, { enabled: Boolean(isLive) });

  // Backup: if the live connection is down, check every 15 seconds
  useEffect(() => {
    if (!isLive || connected) return;
    const id = setInterval(refreshTicket, BACKUP_REFRESH_MS);
    return () => clearInterval(id);
  }, [isLive, connected, refreshTicket]);
  // Only needed on a no-show ticket: is the customer warned or restricted now?
  const noShow = useNoShowStatus(ticket?.status === "no_show");

  const graceMinutes = page.queue?.no_show_grace_minutes ?? 5;
  const timer = useCheckInTimer(ticket?.called_at, graceMinutes, ticket?.status === "called");

  // Runs a ticket action and shows the updated ticket
  const run = async (action) => {
    setBusy(true);
    setActionError("");
    try {
      const fresh = await action();
      showTicket(fresh);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleOnTheWay = () => run(() => setOnTheWay(entryId, !ticket.on_the_way));
  const handleCheckIn = () => {
    stopRinging();
    return run(() => checkIn(entryId));
  };

  const handleTurnOnAlerts = async () => {
    await askForNotifications();
    setAskAlerts(false);
  };

  const openLeave = () => dialogRef.current?.showModal();
  const closeLeave = () => dialogRef.current?.close();
  const handleLeave = async () => {
    closeLeave();
    await run(async () => {
      await leaveQueue(entryId);
      return getTicket(entryId);
    });
  };

  /* ---------- loading ---------- */
  if (page.status === "loading") {
    return (
      <main className="tk" aria-busy="true">
        <div className="tk__container tk__container--narrow">
          <div className="tk-skeleton tk-skeleton--line" />
          <div className="tk-skeleton tk-skeleton--card" />
        </div>
      </main>
    );
  }

  /* ---------- not found / error ---------- */
  if (page.status !== "ready") {
    const notFound = page.status === "notfound";
    return (
      <main className="tk">
        <div className="tk__container tk__container--narrow">
          <div className="tk-message" role={notFound ? undefined : "alert"}>
            <h1>{notFound ? "We can't find this ticket" : "We couldn't load your ticket"}</h1>
            <p>{notFound ? "It may belong to another account." : `${page.error}. Please try again.`}</p>
            {notFound ? (
              <Link className="btn btn--primary" to="/my-tickets">
                My queues
              </Link>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ---------- ready ---------- */
  const status = TICKET_STATUS[ticket.status] || TICKET_STATUS.waiting;
  const { left, total } = timer;
  const timeLeft = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  return (
    <main className="tk">
      <div className="tk__container tk__container--narrow">
        <div className="tk__top">
          <Link className="tk__back" to="/my-tickets">
            <ArrowLeft size={18} />
            My queues
          </Link>
          {isLive && (
            <span className={`tk-live ${connected ? "" : "is-off"}`} role="status">
              <span className="tk-live__dot" />
              {connected ? "Live" : "Reconnecting"}
            </span>
          )}
        </div>

        {/* The ticket */}
        <section
          className={`tk-card ${ticket.status === "called" ? "tk-card--turn" : ""}`}
          aria-label={`Ticket number ${ticket.queue_number}`}
        >
          <div className="tk-card__head">
            <div>
              <strong>{ticket.business_name}</strong>
              <span>
                {ticket.branch_name} · {ticket.queue_name}
              </span>
            </div>
            <span className={`tk-chip ${status.className}`}>{status.label}</span>
          </div>

          <span className="tk-card__label">Your number</span>
          <strong className="tk-card__number">{ticket.queue_number}</strong>

          <div className="tk-card__foot">
            <span>Now serving</span>
            <strong key={ticket.current_number} className="tk-bump">
              {ticket.current_number || "—"}
            </strong>
          </div>
        </section>

        {actionError && (
          <div className="tk-alert" role="alert">
            <Warning size={20} weight="duotone" />
            <span>{actionError}</span>
          </div>
        )}

        {/* ---------- waiting ---------- */}
        {ticket.status === "waiting" && (
          <>
            <section className="tk-panel" aria-labelledby="place-title">
              <h2 id="place-title" className="tk-panel__title" aria-live="polite">
                <span key={ticket.people_ahead} className="tk-bump">
                  {aheadText(ticket.people_ahead)}
                </span>
              </h2>
              <PlaceTrack ahead={ticket.people_ahead || 0} />

              <dl className="tk-stats tk-stats--two">
                <div>
                  <dt>
                    <Clock size={18} weight="duotone" />
                    Wait
                  </dt>
                  <dd>~{minutesText(ticket.estimated_wait_minutes)}</dd>
                </div>
                <div>
                  <dt>
                    <BellRinging size={18} weight="duotone" />
                    Come back at
                  </dt>
                  <dd>{clockTime(ticket.recommended_return_time)}</dd>
                </div>
              </dl>
            </section>

            {askAlerts && (
              <div className="tk-notify">
                <BellRinging size={22} weight="duotone" />
                <p>Get an alert when it's your turn, even if this tab is in the background.</p>
                <button type="button" className="btn btn--outline tk-notify__btn" onClick={handleTurnOnAlerts}>
                  Turn on
                </button>
              </div>
            )}

            {ticket.on_the_way && (
              <div className="tk-banner" role="status">
                <PersonSimpleWalk size={22} weight="duotone" />
                <p>The staff know you're on your way.</p>
                <button type="button" className="tk-link" onClick={handleOnTheWay} disabled={busy}>
                  Undo
                </button>
              </div>
            )}

            <div className="tk-actions">
              {!ticket.on_the_way && (
                <button
                  type="button"
                  className="btn btn--primary tk-btn-wide"
                  onClick={handleOnTheWay}
                  disabled={busy}
                >
                  <PersonSimpleWalk size={20} weight="bold" />
                  I'm on my way
                </button>
              )}
              <button type="button" className="btn tk-btn-leave tk-btn-wide" onClick={openLeave} disabled={busy}>
                <SignOut size={20} />
                Leave queue
              </button>
            </div>
          </>
        )}

        {/* ---------- called ---------- */}
        {ticket.status === "called" && (
          <>
            <section className="tk-panel tk-panel--turn" aria-labelledby="turn-title">
              <BellRinging size={28} weight="duotone" />
              <h2 id="turn-title" className="tk-panel__title">
                It's your turn
              </h2>
              <p>
                Please go to {ticket.counter_number ? `counter ${ticket.counter_number}` : "the front desk"} now
                and check in.
              </p>
              <label className="tk-timer" htmlFor="checkin-timer">
                <span>Time to check in</span>
                <strong>{timeLeft}</strong>
              </label>
              <progress id="checkin-timer" className="tk-progress" max={total} value={left} />
              {left === 0 && (
                <p className="tk-panel__warn">
                  Your time is up. Check in now before the staff mark you as a no-show.
                </p>
              )}
            </section>

            <div className="tk-actions">
              <button
                type="button"
                className="btn btn--primary tk-btn-wide"
                onClick={handleCheckIn}
                disabled={busy}
              >
                <CheckCircle size={20} weight="bold" />
                {busy ? "Checking in…" : "Check in"}
              </button>
              <button type="button" className="btn tk-btn-leave tk-btn-wide" onClick={openLeave} disabled={busy}>
                <SignOut size={20} />
                Leave queue
              </button>
            </div>
          </>
        )}

        {/* ---------- checked in ---------- */}
        {ticket.status === "checked_in" && (
          <section className="tk-panel" aria-labelledby="in-title">
            <CheckCircle size={28} weight="duotone" className="tk-panel__icon" />
            <h2 id="in-title" className="tk-panel__title">
              You're checked in
            </h2>
            <p>Please stay close. The staff will serve you shortly.</p>
            <TimesList ticket={ticket} />
          </section>
        )}

        {/* ---------- finished ---------- */}
        {ticket.status === "completed" && (
          <section className="tk-panel" aria-labelledby="done-title">
            <CheckCircle size={28} weight="duotone" className="tk-panel__icon" />
            <h2 id="done-title" className="tk-panel__title">
              All done
            </h2>
            <p>Thanks for using QLess at {ticket.business_name}.</p>
            <TimesList ticket={ticket} />
            <div className="tk-actions">
              <Link className="btn btn--primary tk-btn-wide" to="/businesses">
                Find another place
              </Link>
            </div>
          </section>
        )}

        {ticket.status === "cancelled" && (
          <section className="tk-panel" aria-labelledby="left-title">
            <XCircle size={28} weight="duotone" className="tk-panel__icon" />
            <h2 id="left-title" className="tk-panel__title">
              You left the queue
            </h2>
            <p>Your place was given to the next person.</p>
            <TimesList ticket={ticket} />
            <div className="tk-actions">
              <Link className="btn btn--primary tk-btn-wide" to={`/queues/${ticket.queue_id}`}>
                Join again
              </Link>
            </div>
          </section>
        )}

        {ticket.status === "no_show" && (
          <section className="tk-panel tk-panel--warn" aria-labelledby="noshow-title">
            <Warning size={28} weight="duotone" className="tk-panel__icon" />
            <h2 id="noshow-title" className="tk-panel__title">
              Marked as no-show
            </h2>
            <p>
              You didn't check in in time. Repeated no-shows can stop you from joining queues for a
              while.
            </p>
            <TimesList ticket={ticket} />
            {noShow && noShow.state !== "ok" && (
              <div className="tk-ns">
                <NoShowBanner status={noShow} />
              </div>
            )}
            {noShow?.state !== "restricted" && (
              <div className="tk-actions">
                <Link className="btn btn--primary tk-btn-wide" to={`/queues/${ticket.queue_id}`}>
                  Join again
                </Link>
              </div>
            )}
          </section>
        )}

        {/* "You're called!" pop-up */}
        <CalledAlert
          open={calledOpen}
          ticket={ticket}
          graceMinutes={graceMinutes}
          busy={busy}
          onCheckIn={handleCheckIn}
          onClose={() => {
            stopRinging();
            setCalledOpen(false);
          }}
        />

        {/* Leave confirm */}
        <dialog ref={dialogRef} className="tk-sheet" aria-labelledby="leave-title">
          <h2 id="leave-title">Leave the queue?</h2>
          <p>You'll lose number {ticket.queue_number}. If you join again, you'll go to the back of the line.</p>
          <div className="tk-sheet__actions">
            <button type="button" className="btn btn--outline" onClick={closeLeave}>
              Stay in line
            </button>
            <button type="button" className="btn tk-btn-danger" onClick={handleLeave}>
              Leave queue
            </button>
          </div>
        </dialog>
      </div>
    </main>
  );
}