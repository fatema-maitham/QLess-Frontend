import { useEffect, useState } from "react";
import { getStaffMe } from "../../services/controlService";
import ControlPage from "./ControlPage";
import "./Control.css";

// Staff home: the queues of the branch they work at
export default function StaffQueues() {
  const [page, setPage] = useState({ status: "loading", error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setPage({ status: "loading", error: "" });

    getStaffMe({ signal: controller.signal })
      .then((me) => setPage({ status: "ready", me }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setPage({ status: err.status === 404 ? "unassigned" : "error", error: err.message });
      });

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <main className="cp-staff">
      <div className="cp-staff__container">
        {page.status === "loading" && <div className="cp-skeleton cp-skeleton--body" aria-busy="true" />}

        {page.status === "unassigned" && (
          <div className="cp-message">
            <h1>You're not assigned to a branch yet</h1>
            <p>Ask the business owner to add you to a branch.</p>
          </div>
        )}

        {page.status === "error" && (
          <div className="cp-message" role="alert">
            <h1>We couldn't load your branch</h1>
            <p>{page.error}</p>
            <button type="button" className="btn btn--primary" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        )}

        {page.status === "ready" && (
          <ControlPage
            branches={[page.me.branch]}
            title={page.me.branch.name}
            subtitle={`${page.me.business.name}${page.me.position ? ` · ${page.me.position}` : ""}`}
          />
        )}
      </div>
    </main>
  );
}