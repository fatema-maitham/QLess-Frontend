import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { getBranchQueues } from "../../services/branchService";
import { getQueueEntries } from "../../services/controlService";
import { clockTime, shortDate } from "../Ticket/ticketHelpers";

// Tickets that are finished: served, no-show or left the queue
const DONE = {
  completed: { label: "Served", tone: "ok", time: "completed_at" },
  no_show: { label: "No-show", tone: "warn", time: "no_show_at" },
  cancelled: { label: "Left queue", tone: "off", time: "cancelled_at" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "completed", label: "Served" },
  { id: "no_show", label: "No-shows" },
  { id: "cancelled", label: "Left queue" },
];

// minutes between two times, or null
function minutesBetween(from, to) {
  if (!from || !to) return null;
  const diff = (new Date(to) - new Date(from)) / 60000;
  return diff >= 0 ? Math.round(diff) : null;
}

function finishedAt(entry) {
  return entry[DONE[entry.status].time];
}

export default function StaffHistory() {
  const { me } = useOutletContext();
  const branchId = me.branch.id;

  const [queues, setQueues] = useState({ status: "loading", list: [], error: "" });
  const [queueId, setQueueId] = useState(null);
  const [entries, setEntries] = useState({ status: "idle", list: [], error: "" });
  const [filter, setFilter] = useState("all");

  // 1. the branch's queues
  useEffect(() => {
    const controller = new AbortController();

    getBranchQueues(branchId, { signal: controller.signal })
      .then((list) => {
        setQueues({ status: "ready", list, error: "" });
        if (list.length > 0) setQueueId(list[0].id);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setQueues({ status: "error", list: [], error: err.message });
      });

    return () => controller.abort();
  }, [branchId]);

  // 2. the finished tickets of the chosen queue
  useEffect(() => {
    if (!queueId) return;
    const controller = new AbortController();
    setEntries({ status: "loading", list: [], error: "" });

    getQueueEntries(queueId, { signal: controller.signal })
      .then((list) => {
        const done = list
          .filter((entry) => DONE[entry.status])
          .sort((a, b) => new Date(finishedAt(b)) - new Date(finishedAt(a)));
        setEntries({ status: "ready", list: done, error: "" });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setEntries({ status: "error", list: [], error: err.message });
      });

    return () => controller.abort();
  }, [queueId]);

  const all = entries.list;
  const shown = filter === "all" ? all : all.filter((entry) => entry.status === filter);

  const served = all.filter((entry) => entry.status === "completed");
  const waits = served
    .map((entry) => minutesBetween(entry.joined_at, entry.called_at))
    .filter((value) => value !== null);
  const averageWait = waits.length
    ? Math.round(waits.reduce((sum, value) => sum + value, 0) / waits.length)
    : null;

  const count = (status) => all.filter((entry) => entry.status === status).length;

  return (
    <div className="sh">
      <div className="page-h">
        <div className="cp-title">
          <h1>Queue history</h1>
          <p className="cp-sub">{me.branch.name} · {me.business.name}</p>
        </div>
      </div>

      {queues.status === "loading" && <div className="sh-skeleton" aria-busy="true" />}

      {queues.status === "error" && (
        <div className="empty" role="alert">
          <b>Could not load your queues</b>
          <p>{queues.error}</p>
        </div>
      )}

      {queues.status === "ready" && queues.list.length === 0 && (
        <div className="empty">
          <b>No queues yet</b>
          <p>Ask the owner to create a queue for this branch.</p>
        </div>
      )}

      {queues.status === "ready" && queues.list.length > 0 && (
        <>
          {/* which queue */}
          {queues.list.length > 1 && (
            <div className="tabs" role="tablist" aria-label="Queues">
              {queues.list.map((queue) => (
                <button
                  key={queue.id}
                  type="button"
                  role="tab"
                  aria-selected={queue.id === queueId}
                  className={`tab ${queue.id === queueId ? "on" : ""}`}
                  onClick={() => setQueueId(queue.id)}
                >
                  {queue.name}
                </button>
              ))}
            </div>
          )}

          {/* summary */}
          <div className="sh-stats">
            <div className="sh-stat sh-stat--main">
              <small>Served</small>
              <b>{count("completed")}</b>
            </div>
            <div className="sh-stat">
              <small>No-shows</small>
              <b>{count("no_show")}</b>
            </div>
            <div className="sh-stat">
              <small>Left the queue</small>
              <b>{count("cancelled")}</b>
            </div>
            <div className="sh-stat">
              <small>Average wait</small>
              <b>{averageWait === null ? "—" : `${averageWait} min`}</b>
            </div>
          </div>

          {/* list */}
          <section className="sh-sheet">
            <div className="sh-sheet__head">
              <h2>Finished tickets</h2>
              <div className="sh-filters" role="group" aria-label="Filter by result">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={filter === item.id}
                    className={filter === item.id ? "on" : ""}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {entries.status === "loading" && <div className="sh-skeleton sh-skeleton--in" aria-busy="true" />}

            {entries.status === "error" && (
              <p className="sh-note" role="alert">{entries.error}</p>
            )}

            {entries.status === "ready" && shown.length === 0 && (
              <p className="sh-note">
                {all.length === 0
                  ? "No finished tickets yet. They show up here after you serve someone."
                  : "Nothing matches this filter."}
              </p>
            )}

            {entries.status === "ready" && shown.length > 0 && (
              <ul className="sh-list">
                {shown.map((entry) => {
                  const done = DONE[entry.status];
                  const wait = minutesBetween(entry.joined_at, entry.called_at);
                  const when = finishedAt(entry);

                  return (
                    <li key={entry.id} className="sh-row">
                      <span className="sh-num">{entry.queue_number}</span>

                      <div className="sh-who">
                        <b>{entry.customer_name || "Visitor"}</b>
                        <span>
                          Joined {clockTime(entry.joined_at)}
                          {entry.counter_number ? ` · Counter ${entry.counter_number}` : ""}
                        </span>
                      </div>

                      <div className="sh-time">
                        <small>Waited</small>
                        <b>{wait === null ? "—" : `${wait} min`}</b>
                      </div>

                      <div className="sh-time">
                        <small>Finished</small>
                        <b>
                          {shortDate(when)} · {clockTime(when)}
                        </b>
                      </div>

                      <span className={`chip ${done.tone}`}>{done.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
