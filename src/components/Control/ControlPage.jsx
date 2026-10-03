import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { getBranchQueues } from "../../services/branchService";
import QueueControl from "./QueueControl";
import "./Control.css";

/**
 * Pick a branch and a queue, then control it.
 * - branches: [{ id, name }] the user can manage
 * - title / subtitle: page heading
 * The choice is kept in the URL (?branch=1&queue=2) so a refresh keeps it.
 */
export default function ControlPage({
  branches,
  title,
  subtitle,
  onQueueChange,
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
    if (onQueueChange) {
      onQueueChange(current || null);
    }
  }, [current, onQueueChange]);

  const pickBranch = (id) => {
    setParams({ branch: String(id) });
  };

  const pickQueue = (id) => {
    setParams({
      branch: branchId,
      queue: String(id),
    });
  };

  return (
    <div className="cp-page">
      <header className="cp-page__head">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {branches.length > 1 && (
          <label className="cp-select">
            <span>Branch</span>

            <select
              value={branchId}
              onChange={(event) =>
                pickBranch(event.target.value)
              }
            >
              {branches.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                >
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      {!branchId && (
        <p className="cp-empty">
          You don't have any branches yet.
        </p>
      )}

      {branchId && queues.status === "error" && (
        <p className="cp-empty" role="alert">
          {queues.error}
        </p>
      )}

      {branchId &&
        queues.status === "ready" &&
        list.length === 0 && (
          <p className="cp-empty">
            This branch has no queues yet. Create one in the
            queue settings first.
          </p>
        )}

      {list.length > 1 && (
        <div
          className="cp-tabs"
          role="tablist"
          aria-label="Queues"
        >
          {list.map((queue) => (
            <button
              key={queue.id}
              type="button"
              role="tab"
              aria-selected={current?.id === queue.id}
              className="cp-tabs__tab"
              onClick={() => pickQueue(queue.id)}
            >
              <span
                className={`cp-dot cp-dot--${queue.status}`}
              />

              {queue.name}

              {queue.waiting_count > 0 && (
                <span className="cp-tabs__count">
                  {queue.waiting_count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {current && (
        <QueueControl
          key={current.id}
          queueId={current.id}
        />
      )}
    </div>
  );
}