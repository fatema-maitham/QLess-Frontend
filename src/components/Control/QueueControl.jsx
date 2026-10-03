import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ChartBar,
  CheckCircle,
  Megaphone,
  Pause,
  PersonSimpleWalk,
  Play,
  Stop,
  UserMinus,
  Warning,
} from "@phosphor-icons/react";
import {
  getQueue,
  setQueueStatus,
} from "../../services/queueService";

import {
  callNext,
  getQueueEntries,
  markEntry,
} from "../../services/controlService";

import useQueueSocket from "../../hooks/useQueueSocket";
import { clockTime } from "../Ticket/ticketHelpers";
import { Link } from "react-router";

const BACKUP_REFRESH_MS = 15000;

const STATUS_ACTIONS = {
  closed: [
    {
      to: "open",
      label: "Open queue",
      Icon: Play,
    },
  ],
  open: [
    {
      to: "paused",
      label: "Pause",
      Icon: Pause,
    },
    {
      to: "closed",
      label: "Close",
      Icon: Stop,
    },
  ],
  paused: [
    {
      to: "open",
      label: "Resume",
      Icon: Play,
    },
    {
      to: "closed",
      label: "Close",
      Icon: Stop,
    },
  ],
};

function mmss(seconds) {
  const safe = Math.max(seconds, 0);

  return `${Math.floor(safe / 60)}:${String(
    safe % 60
  ).padStart(2, "0")}`;
}

function minutesSince(value, now) {
  if (!value) return "";

  const minutes = Math.max(
    Math.floor(
      (now - new Date(value).getTime()) / 60000
    ),
    0
  );

  return minutes < 1 ? "just now" : `${minutes} min`;
}

function useNow(active) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;

    const id = setInterval(
      () => setNow(Date.now()),
      1000
    );

    return () => clearInterval(id);
  }, [active]);

  return now;
}

function DeskCard({
  entry,
  graceMinutes,
  now,
  busy,
  confirming,
  onMark,
  onConfirm,
}) {
  const isCalled = entry.status === "called";

  const since = entry.called_at
    ? Math.floor(
      (now - new Date(entry.called_at).getTime()) / 1000
    )
    : 0;

  const graceLeft = graceMinutes * 60 - since;
  const late = isCalled && graceLeft <= 0;

  return (
    <li className={`cp-row ${late ? "late" : ""}`}>
      <span className="cp-number">
        {entry.queue_number}
      </span>

      <div className="cp-person">
        <b>{entry.customer_name}</b>

        <span>
          {isCalled ? (
            late ? (
              <span className="cp-late">
                <Warning size={13} weight="fill" />
                Grace time over
              </span>
            ) : (
              <>
                Called {mmss(since)} ago ·{" "}
                {mmss(graceLeft)} left
              </>
            )
          ) : (
            <>
              Checked in at{" "}
              {clockTime(entry.checked_in_at)}
            </>
          )}
        </span>

        {isCalled && entry.on_the_way && (
          <small className="cp-way">
            <PersonSimpleWalk size={13} weight="bold" />
            On the way
          </small>
        )}
      </div>

      <div className="cp-actions">
        {confirming ? (
          <>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onMark(entry, "no_show")}
              disabled={busy}
            >
              Confirm no-show
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onConfirm(null)}
              disabled={busy}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {isCalled && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  onMark(entry, "checked_in")
                }
                disabled={busy}
              >
                Check in
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() =>
                onMark(entry, "completed")
              }
              disabled={busy}
            >
              <CheckCircle size={15} />
              Complete
            </button>

            {isCalled && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onConfirm(entry.id)}
                disabled={busy}
              >
                <UserMinus size={15} />
                No-show
              </button>
            )}
          </>
        )}
      </div>
    </li>
  );
}

export default function QueueControl({ queueId }) {
  const [data, setData] = useState({
    status: "loading",
    error: "",
  });

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const refresh = useCallback(
    async ({ signal } = {}) => {
      const [queue, entries] = await Promise.all([
        getQueue(queueId, { signal }),
        getQueueEntries(queueId, { signal }),
      ]);

      setData({
        status: "ready",
        queue,
        entries,
      });
    },
    [queueId]
  );

  useEffect(() => {
    const controller = new AbortController();

    setData({
      status: "loading",
      error: "",
    });

    refresh({
      signal: controller.signal,
    }).catch((err) => {
      if (err.name === "AbortError") return;

      setData({
        status: "error",
        error: err.message,
      });
    });

    return () => controller.abort();
  }, [refresh]);

  const onMessage = useCallback(() => {
    refresh().catch(() => { });
  }, [refresh]);

  const connected = useQueueSocket(
    queueId,
    onMessage
  );

  useEffect(() => {
    if (connected) return;

    const id = setInterval(
      onMessage,
      BACKUP_REFRESH_MS
    );

    return () => clearInterval(id);
  }, [connected, onMessage]);

  useEffect(() => {
    if (notice?.type !== "success") return;

    const id = setTimeout(
      () => setNotice(null),
      4000
    );

    return () => clearTimeout(id);
  }, [notice]);

  const entries = data.entries || [];

  const waiting = entries.filter(
    (entry) => entry.status === "waiting"
  );

  const atDesk = entries.filter(
    (entry) =>
      entry.status === "called" ||
      entry.status === "checked_in"
  );

  const now = useNow(
    atDesk.length > 0 || waiting.length > 0
  );

  async function run(action, successText) {
    setBusy(true);
    setNotice(null);

    try {
      const result = await action();

      const text =
        typeof successText === "function"
          ? successText(result)
          : successText;

      if (text) {
        setNotice({
          type: "success",
          text,
        });
      }

      await refresh();
    } catch (err) {
      setNotice({
        type: "error",
        text: err.message,
      });
    } finally {
      setBusy(false);
      setConfirmId(null);
    }
  }

  const handleStatus = (to) =>
    run(
      () => setQueueStatus(queueId, to),
      `Queue is now ${to}.`
    );

  const handleCallNext = () =>
    run(
      () => callNext(queueId),
      (result) =>
        `Called number ${result.entry.queue_number}.`
    );

  const MARK_TEXT = {
    checked_in: "checked in",
    completed: "completed",
    no_show: "marked as no-show",
  };

  const handleMark = (entry, status) =>
    run(
      () => markEntry(entry.id, status),
      `Number ${entry.queue_number} ${MARK_TEXT[status]}.`
    );

  if (data.status === "loading") {
    return <div className="cp-loading" />;
  }

  if (data.status === "error") {
    return (
      <div className="empty" role="alert">
        <b>Could not load this queue</b>
        <p>{data.error}</p>
      </div>
    );
  }

  const { queue } = data;

  const isOpen = queue.status === "open";
  const next = waiting[0];

  const finished = entries.filter(
    (entry) => entry.status === "completed"
  ).length;

  const noShows = entries.filter(
    (entry) => entry.status === "no_show"
  ).length;

  return (
    <div className="cp-control">
      <div className="cp-toolbar">
        <div className="cp-summary">
          <span className={`st ${queue.status}`}>
            {queue.status}
          </span>

          <span>
            <b>{waiting.length}</b> waiting
          </span>

          <span className="cp-divider" />

          <span>
            <b>{queue.average_service_minutes}</b> min
            average
          </span>

          <span className="cp-divider" />

          <span
            className={`cp-live ${connected ? "" : "off"
              }`}
          >
            <i />
            {connected ? "Live" : "Reconnecting"}
          </span>
        </div>

        <div className="cp-toolbar-actions">
          <Link
            to={`/owner/queues/${queue.id}/analytics`}
            className="btn cp-analytics-btn"
          >
            <ChartBar size={16} />
            View analytics
          </Link>

          {(STATUS_ACTIONS[queue.status] || []).map(
            ({ to, label, Icon }) => (
              <button
                key={to}
                type="button"
                className={
                  to === "open"
                    ? "btn btn-primary"
                    : "btn btn-ghost"
                }
                onClick={() => handleStatus(to)}
                disabled={busy}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {notice && (
        <div
          className={`cp-notice ${notice.type}`}
          role="status"
        >
          {notice.text}
        </div>
      )}

      <div className="cp-serving">
        <div>
          <span>Now serving</span>
          <strong>
            {queue.current_number || "—"}
          </strong>
        </div>

        <button
          type="button"
          className="btn btn-primary cp-call"
          onClick={handleCallNext}
          disabled={busy || !isOpen || !next}
        >
          <Megaphone size={18} weight="fill" />

          {next
            ? `Call next · ${next.queue_number}`
            : "Call next"}
        </button>
      </div>

      <div className="cp-mini-stats">
        <span>
          <b>{finished}</b> completed
        </span>

        <span>
          <b>{noShows}</b> no-shows
        </span>
      </div>

      <section className="cp-section">
        <div className="cp-section-head">
          <h2>At the desk</h2>
          <span className="n">{atDesk.length}</span>
        </div>

        {atDesk.length === 0 ? (
          <div className="cp-section-empty">
            No one is being served right now.
          </div>
        ) : (
          <ul className="cp-list">
            {atDesk.map((entry) => (
              <DeskCard
                key={entry.id}
                entry={entry}
                graceMinutes={
                  queue.no_show_grace_minutes
                }
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

      <section className="cp-section">
        <div className="cp-section-head">
          <h2>Waiting</h2>
          <span className="n">{waiting.length}</span>
        </div>

        {waiting.length === 0 ? (
          <div className="cp-section-empty">
            The line is empty.
          </div>
        ) : (
          <ol className="cp-list">
            {waiting.map((entry, index) => (
              <li
                key={entry.id}
                className={`cp-row ${index === 0 ? "next" : ""
                  }`}
              >
                <span className="cp-number">
                  {entry.queue_number}
                </span>

                <div className="cp-person">
                  <b>{entry.customer_name}</b>

                  <span>
                    Joined {clockTime(entry.joined_at)} ·{" "}
                    {minutesSince(entry.joined_at, now)}
                  </span>
                </div>

                <div className="cp-tags">
                  {entry.on_the_way && (
                    <span className="cp-way">
                      <PersonSimpleWalk size={13} />
                      On the way
                    </span>
                  )}

                  {index === 0 && (
                    <span className="cp-next">
                      Next
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}