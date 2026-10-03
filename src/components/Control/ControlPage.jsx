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
export default function ControlPage({ branches, title, subtitle }) {
  const [params, setParams] = useSearchParams();
  const [queues, setQueues] = useState({ status: "loading", list: [], error: "" });

  const branchId = params.get("branch") || String(branches[0]?.id || "");

  // Load the queues of the chosen branch
  useEffect(() => {
    if (!branchId) return;
    const controller = new AbortController();
    setQueues({ status: "loading", list: [], error: "" });

    getBranchQueues(branchId, { signal: controller.signal })
      .then((list) => setQueues({ status: "ready", list, error: "" }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setQueues({ status: "error", list: [], error: err.message });
      });

    return () => controller.abort();
  }, [branchId]);

  // Default queue: the one in the URL, else the first open one, else the first one
  const list = queues.list;
  const fromUrl = list.find((q) => String(q.id) === params.get("queue"));
  const current = fromUrl || list.find((q) => q.status === "open") || list[0];

  const pickBranch = (id) => setParams({ branch: id });
  const pickQueue = (id) => setParams({ branch: branchId, queue: String(id) });

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
            <select value={branchId} onChange={(e) => pickBranch(e.target.value)}>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      {!branchId && <p className="cp-empty">You don't have any branches yet.</p>}

      {branchId && queues.status === "error" && (
        <p className="cp-empty" role="alert">
          {queues.error}
        </p>
      )}

      {branchId && queues.status === "ready" && list.length === 0 && (
        <p className="cp-empty">This branch has no queues yet. Create one in the queue settings first.</p>
      )}

      {list.length > 1 && (
        <div className="cp-tabs" role="tablist" aria-label="Queues">
          {list.map((q) => (
            <button
              key={q.id}
              type="button"
              role="tab"
              aria-selected={current?.id === q.id}
              className="cp-tabs__tab"
              onClick={() => pickQueue(q.id)}
            >
              <span className={`cp-dot cp-dot--${q.status}`} />
              {q.name}
              {q.waiting_count > 0 && <span className="cp-tabs__count">{q.waiting_count}</span>}
            </button>
          ))}
        </div>
      )}

      {current && <QueueControl key={current.id} queueId={current.id} />}
    </div>
  );
}