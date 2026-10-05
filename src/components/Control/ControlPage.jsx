import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { getBranchQueues } from "../../services/branchService";
import QueueControl from "./QueueControl";
import "./Control.css";

export default function ControlPage({
  branches,
  title = "Live Queues",
  subtitle = "",
  onQueueChange,
  showSettings = false,
  // where the Bookings button goes (staff stay inside their own dashboard)
  bookingsTo = "",
  // the analytics page is owner only
  showAnalytics = true,
}) {
  const [params, setParams] = useSearchParams();

  const [queues, setQueues] = useState({
    status: "loading",
    list: [],
    error: "",
  });

  const branchId =
    params.get("branch") || String(branches[0]?.id || "");

  useEffect(() => {
    if (!branchId) return;

    const controller = new AbortController();

    setQueues({
      status: "loading",
      list: [],
      error: "",
    });

    getBranchQueues(branchId, {
      signal: controller.signal,
    })
      .then((list) => {
        setQueues({
          status: "ready",
          list,
          error: "",
        });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;

        setQueues({
          status: "error",
          list: [],
          error: err.message,
        });
      });

    return () => controller.abort();
  }, [branchId]);

  const list = queues.list;

  const fromUrl = list.find(
    (queue) => String(queue.id) === params.get("queue")
  );

  const current =
    fromUrl ||
    list.find((queue) => queue.status === "open") ||
    list[0];

  useEffect(() => {
    onQueueChange?.(current || null);
  }, [current, onQueueChange]);

  function pickBranch(id) {
    setParams({ branch: String(id) });
  }

  function pickQueue(id) {
    setParams({
      branch: branchId,
      queue: String(id),
    });
  }

  const settingsLink = `/owner/branches/${branchId}/queues`;

  return (
    <section className="cp-page">
      <div className="page-h cp-page-head">
        <div className="cp-title">
          <h1>{title}</h1>
          {subtitle && <p className="cp-sub">{subtitle}</p>}
        </div>

        <span className="sp" />

        {branches.length > 1 && (
          <select
            className="sel"
            aria-label="Choose branch"
            value={branchId}
            onChange={(event) => pickBranch(event.target.value)}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        )}
        {branchId && (
          <Link className="btn btn-ghost" to={bookingsTo || `/branches/${branchId}/bookings`}>
            Bookings
          </Link>
        )}

        {showSettings && branchId && (
          <Link className="btn btn--primary" to={settingsLink}>
            Manage queues
          </Link>
        )}
      </div>

      {!branchId && (
        <div className="empty cp-empty-page">
          <b>No branches yet</b>
          <p>Add a branch before running a queue.</p>
        </div>
      )}

      {branchId && queues.status === "error" && (
        <div className="empty cp-empty-page" role="alert">
          <b>Could not load queues</b>
          <p>{queues.error}</p>
        </div>
      )}

      {branchId &&
        queues.status === "ready" &&
        list.length === 0 && (
          <div className="empty cp-empty-page">
            <b>No queues yet</b>
            {showSettings ? (
              <p>
                <Link to={settingsLink}>Create your first queue</Link>
              </p>
            ) : (
              <p>Ask the owner to create a queue for this branch.</p>
            )}
          </div>
        )}

      {list.length > 0 && (
        <>
          <div
            className="tabs cp-tabs"
            role="tablist"
            aria-label="Queues"
          >
            {list.map((queue) => (
              <button
                key={queue.id}
                type="button"
                role="tab"
                aria-selected={current?.id === queue.id}
                className={`tab ${current?.id === queue.id ? "on" : ""
                  }`}
                onClick={() => pickQueue(queue.id)}
              >
                {queue.name}

                {queue.waiting_count > 0 && (
                  <span className="n">
                    {queue.waiting_count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {current && (
            <QueueControl
              key={current.id}
              queueId={current.id}
              showAnalytics={showAnalytics}
            />
          )}
        </>
      )}
    </section>
  );
}