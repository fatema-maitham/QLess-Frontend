import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  Megaphone,
  Pause,
  PersonSimpleWalk,
  Play,
  Stop,
  UserMinus,
  Warning,
} from "@phosphor-icons/react";
import { getQueue, setQueueStatus } from "../../services/queueService";
import { callNext, getQueueEntries, markEntry } from "../../services/controlService";
import useQueueSocket from "../../hooks/useQueueSocket";
import { clockTime } from "../Ticket/ticketHelpers";

const BACKUP_REFRESH_MS = 15000; // only used while the live connection is down

const QUEUE_STATUS = {
  open: { label: "Open", className: "cp-chip--open" },
  paused: { label: "Paused", className: "cp-chip--paused" },
  closed: { label: "Closed", className: "cp-chip--closed" },
};

// Buttons for each queue status (matches what the backend allows)
const STATUS_ACTIONS = {
  closed: [{ to: "open", label: "Open queue", Icon: Play }],
  open: [
    { to: "paused", label: "Pause", Icon: Pause },
    { to: "closed", label: "Close", Icon: Stop },
  ],
  paused: [
    { to: "open", label: "Resume", Icon: Play },
    { to: "closed", label: "Close", Icon: Stop },
  ],
};

// 125 seconds -> "2:05"
function mmss(seconds) {
  const s = Math.max(seconds, 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Minutes since a time, e.g. "12 min"
function minutesSince(value, now) {
  if (!value) return "";
  const minutes = Math.max(Math.floor((now - new Date(value).getTime()) / 60000), 0);
  return minutes < 1 ? "just now" : `${minutes} min`;
}

// A clock that ticks every second while `active` is true
function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

/* ---------- one person at the desk (called or checked in) ---------- */
function DeskCard({ entry, graceMinutes, now, busy, confirming, onMark, onConfirm }) {
  const isCalled = entry.status === "called";
  const since = entry.called_at ? Math.floor((now - new Date(entry.called_at).getTime()) / 1000) : 0;
  const graceLeft = graceMinutes * 60 - since;
  const late = isCalled && graceLeft <= 0;

  return (
    <li className={`cp-desk ${late ? "is-late" : ""}`}>
      <span className="cp-desk__number">{entry.queue_number}</span>

      <div className="cp-desk__body">
        <strong>{entry.customer_name}</strong>
        <span className="cp-desk__meta">
          {isCalled ? (
            late ? (
              <>
                <Warning size={14} weight="fill" /> Grace time over
              </>
            ) : (
              <>Called {mmss(since)} ago · {mmss(graceLeft)} left to check in</>
            )
          ) : (
            <>Checked in at {clockTime(entry.checked_in_at)}</>
          )}
        </span>
        {isCalled && entry.on_the_way && (
          <span className="cp-tag cp-tag--way">
            <PersonSimpleWalk size={14} weight="bold" /> On the way
          </span>
        )}
      </div>

      <div className="cp-desk__actions">
        {confirming ? (
          <>
            <span className="cp-desk__ask">Mark as no-show?</span>
            <button type="button" className="btn cp-btn cp-btn--ink" onClick={() => onMark(entry, "no_show")} disabled={busy}>
              Yes, no-show
            </button>
            <button type="button" className="btn btn--outline cp-btn" onClick={() => onConfirm(null)} disabled={busy}>
              Cancel
            </button>
          </>
        ) : (
          <>
            {isCalled && (
              <button type="button" className="btn btn--outline cp-btn" onClick={() => onMark(entry, "checked_in")} disabled={busy}>
                Check in
              </button>
            )}
            <button type="button" className="btn btn--primary cp-btn" onClick={() => onMark(entry, "completed")} disabled={busy}>
              <CheckCircle size={16} weight="bold" />
              Complete
            </button>
            {isCalled && (
              <button
                type="button"
                className={`btn cp-btn ${late ? "cp-btn--ink" : "cp-btn--quiet"}`}
                onClick={() => onConfirm(entry.id)}
                disabled={busy}
              >
                <UserMinus size={16} />
                No-show
              </button>
            )}
          </>
        )}
      </div>
    </li>
  );
}

/* ---------- the control panel for one queue ---------- */
export default function QueueControl({ queueId }) {
  const [data, setData] = useState({ status: "loading", error: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }
  const [confirmId, setConfirmId] = useState(null);

  // Loads the queue and its tickets
  const refresh = useCallback(
    async ({ signal } = {}) => {
      const [queue, entries] = await Promise.all([
        getQueue(queueId, { signal }),
        getQueueEntries(queueId, { signal }),
      ]);
      setData({ status: "ready", queue, entries });
    },
    [queueId]
  );

  useEffect(() => {
    const controller = new AbortController();
    setData({ status: "loading", error: "" });
    setNotice(null);
    setConfirmId(null);

    refresh({ signal: controller.signal }).catch((err) => {
      if (err.name === "AbortError") return;
      setData({ status: "error", error: err.message });
    });

    return () => controller.abort();
  }, [refresh]);

  // Live: someone joined, left, said "on the way", or was called on another screen
  const onMessage = useCallback(() => {
    refresh().catch(() => {
      // keep showing the last list if a refresh fails
    });
  }, [refresh]);

  const connected = useQueueSocket(queueId, onMessage);

  // Backup: if the live connection is down, check every 15 seconds
  useEffect(() => {
    if (connected) return;
    const id = setInterval(onMessage, BACKUP_REFRESH_MS);
    return () => clearInterval(id);
  }, [connected, onMessage]);

  // Hide success messages after a few seconds
  useEffect(() => {
    if (notice?.type !== "success") return;
    const id = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const entries = data.entries || [];
  const waiting = entries.filter((e) => e.status === "waiting");
  const atDesk = entries.filter((e) => e.status === "called" || e.status === "checked_in");
  const now = useNow(atDesk.length > 0 || waiting.length > 0);

  // Runs an action, shows a message, then reloads the list
  const run = async (action, successText) => {
    setBusy(true);
    setNotice(null);
    try {
      const result = await action();
      const text = typeof successText === "function" ? successText(result) : successText;
      if (text) setNotice({ type: "success", text });
      await refresh();
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setBusy(false);
      setConfirmId(null);
    }
  };

  const handleStatus = (to) =>
    run(() => setQueueStatus(queueId, to), `Queue is now ${QUEUE_STATUS[to].label.toLowerCase()}.`);

  const handleCallNext = () =>
    run(() => callNext(queueId), (result) => `Called number ${result.entry.queue_number}.`);

  const MARK_TEXT = { checked_in: "checked in", completed: "completed", no_show: "marked as no-show" };
  const handleMark = (entry, status) =>
    run(() => markEntry(entry.id, status), `Number ${entry.queue_number} ${MARK_TEXT[status]}.`);

  /* ---------- loading / error ---------- */
  if (data.status === "loading") {
    return (
      <div className="cp" aria-busy="true">
        <div className="cp-skeleton cp-skeleton--head" />
        <div className="cp-skeleton cp-skeleton--body" />
      </div>
    );
  }

  if (data.status === "error") {
    return (
      <div className="cp cp-message" role="alert">
        <h2>We couldn't load this queue</h2>
        <p>{data.error}</p>
        <button type="button" className="btn btn--primary" onClick={onMessage}>
          Try again
        </button>
      </div>
    );
  }

  /* ---------- ready ---------- */
  const { queue } = data;
  const status = QUEUE_STATUS[queue.status] || QUEUE_STATUS.closed;
  const isOpen = queue.status === "open";
  const next = waiting[0];
  const finished = entries.filter((e) => e.status === "completed").length;
  const noShows = entries.filter((e) => e.status === "no_show").length;
  const left = entries.filter((e) => e.status === "cancelled").length;
  const onTheWay = waiting.filter((e) => e.on_the_way).length;

  let callHint = "";
  if (!isOpen) callHint = queue.status === "paused" ? "Resume the queue to call people." : "Open the queue to call people.";
  else if (!next) callHint = "Nobody is waiting right now.";

  return (
    <div className="cp">
      {/* Queue header */}
      <header className="cp-head">
        <div className="cp-head__info">
          <div className="cp-head__row">
            <span className={`cp-chip ${status.className}`}>{status.label}</span>
            <span className={`cp-live ${connected ? "" : "is-off"}`} role="status">
              <span className="cp-live__dot" />
              {connected ? "Live" : "Reconnecting"}
            </span>
          </div>
          <h2>{queue.name}</h2>
          <p>
            {waiting.length} waiting · about {waiting.length * queue.average_service_minutes} min ·{" "}
            {queue.average_service_minutes} min per person
          </p>
        </div>

        <div className="cp-head__actions">
          {(STATUS_ACTIONS[queue.status] || []).map(({ to, label, Icon }) => (
            <button
              key={to}
              type="button"
              className={`btn cp-btn ${to === "open" ? "btn--primary" : "btn--outline"}`}
              onClick={() => handleStatus(to)}
              disabled={busy}
            >
              <Icon size={16} weight="fill" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="cp-notice" aria-live="polite">
        {notice && (
          <p className={`cp-notice__text cp-notice__text--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
            {notice.text}
          </p>
        )}
      </div>

      <div className="cp-grid">
        {/* Left: now serving + call next + today's numbers */}
        <div className="cp-col">
          <section className="cp-now" aria-labelledby="now-title">
            <span id="now-title" className="cp-now__label">
              Now serving
            </span>
            <strong key={queue.current_number} className="cp-now__number">
              {queue.current_number || "—"}
            </strong>

            <button
              type="button"
              className="btn btn--primary cp-now__call"
              onClick={handleCallNext}
              disabled={busy || !isOpen || !next}
            >
              <Megaphone size={22} weight="fill" />
              {next ? `Call next · ${next.queue_number}` : "Call next"}
            </button>
            {callHint && <p className="cp-now__hint">{callHint}</p>}
          </section>

          <dl className="cp-stats">
            <div>
              <dt>Done</dt>
              <dd>{finished}</dd>
            </div>
            <div>
              <dt>No-shows</dt>
              <dd>{noShows}</dd>
            </div>
            <div>
              <dt>Left</dt>
              <dd>{left}</dd>
            </div>
          </dl>
        </div>

        {/* Right: at the desk + waiting list */}
        <div className="cp-col">
          <section className="cp-section" aria-labelledby="desk-title">
            <div className="cp-section__head">
              <h3 id="desk-title">At the desk</h3>
              <span>{atDesk.length}</span>
            </div>
            {atDesk.length === 0 ? (
              <p className="cp-empty">No one is being served. Press “Call next” to start.</p>
            ) : (
              <ul className="cp-list">
                {atDesk.map((entry) => (
                  <DeskCard
                    key={entry.id}
                    entry={entry}
                    graceMinutes={queue.no_show_grace_minutes}
                    now={now}
                    busy={busy}
                    confirming={confirmId === entry.id}
                    onMark={handleMark}
                    onConfirm={setConfirmId}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="cp-section" aria-labelledby="line-title">
            <div className="cp-section__head">
              <h3 id="line-title">Waiting</h3>
              <span>{waiting.length}</span>
              {onTheWay > 0 && (
                <span className="cp-tag cp-tag--way">
                  <PersonSimpleWalk size={14} weight="bold" /> {onTheWay} on the way
                </span>
              )}
            </div>
            {waiting.length === 0 ? (
              <p className="cp-empty">The line is empty.</p>
            ) : (
              <ol className="cp-list">
                {waiting.map((entry, i) => (
                  <li key={entry.id} className={`cp-row ${i === 0 ? "is-next" : ""}`}>
                    <span className="cp-row__number">{entry.queue_number}</span>
                    <div className="cp-row__body">
                      <strong>{entry.customer_name}</strong>
                      <span>
                        Joined {clockTime(entry.joined_at)} · waiting {minutesSince(entry.joined_at, now)}
                      </span>
                    </div>
                    {entry.on_the_way && (
                      <span className="cp-tag cp-tag--way">
                        <PersonSimpleWalk size={14} weight="bold" /> On the way
                      </span>
                    )}
                    {i === 0 && <span className="cp-tag cp-tag--next">Next</span>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}