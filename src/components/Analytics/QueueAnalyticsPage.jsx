import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Hourglass,
  UserMinus,
  Users,
  Warning,
} from "@phosphor-icons/react";
import {
  getQueue,
  getQueueAnalytics,
} from "../../services/queueService";
import "./QueueAnalytics.css";

function formatMinutes(value) {
  if (value === null || value === undefined) return "—";
  return `${value} min`;
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <article className="qa-metric">
      <span className="qa-metric__icon">
        <Icon size={19} weight="duotone" />
      </span>

      <div>
        <span className="qa-metric__label">{label}</span>
        <strong className="qa-metric__value">{value}</strong>
      </div>
    </article>
  );
}

function PerformanceRow({ label, value, total, type }) {
  const percentage =
    total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <div className="qa-performance-row">
      <span className="qa-performance-row__label">{label}</span>

      <div className="qa-performance-row__track">
        <span
          className={`qa-performance-row__fill qa-performance-row__fill--${type}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <strong>{value}</strong>
    </div>
  );
}

export default function QueueAnalyticsPage() {
  const { queueId } = useParams();

  const [page, setPage] = useState({
    status: "loading",
    queue: null,
    analytics: null,
    error: "",
  });

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setPage({
      status: "loading",
      queue: null,
      analytics: null,
      error: "",
    });

    Promise.all([
      getQueue(queueId, { signal: controller.signal }),
      getQueueAnalytics(queueId, { signal: controller.signal }),
    ])
      .then(([queue, analytics]) => {
        setPage({
          status: "ready",
          queue,
          analytics,
          error: "",
        });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;

        setPage({
          status: "error",
          queue: null,
          analytics: null,
          error: err.message,
        });
      });

    return () => controller.abort();
  }, [queueId, reloadKey]);

  if (page.status === "loading") {
    return (
      <section className="qa-page" aria-busy="true">
        <div className="qa-loading-head" />

        <div className="qa-metrics">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="qa-loading-card" />
          ))}
        </div>

        <div className="qa-loading-panel" />
      </section>
    );
  }

  if (page.status === "error") {
    return (
      <section className="qa-page">
        <div className="qa-error" role="alert">
          <Warning size={30} weight="duotone" />

          <h2>Could not load analytics</h2>

          <p>{page.error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const { queue, analytics } = page;

  const active =
    analytics.waiting +
    analytics.called +
    analytics.checked_in;

  return (
    <section className="qa-page">
      {/* Page heading */}
      <div className="page-h qa-page-head">
        <h1>Analytics</h1>

        <span className="sp" />

        <span
          className={`qa-status qa-status--${queue.status}`}
        >
          {queue.status}
        </span>
      </div>

      {/* Queue heading */}
      <div className="qa-queue-head">
        <div>
          <h2>{queue.name}</h2>
          <p>Performance overview</p>
        </div>

        <Link
          className="qa-back"
          to={`/owner/queues?branch=${queue.branch_id}&queue=${queue.id}`}
        >
          <ArrowLeft size={15} weight="bold" />
          Live Queues
        </Link>
      </div>

      {/* Main metrics */}
      <div className="qa-metrics">
        <MetricCard
          icon={CheckCircle}
          label="Served"
          value={analytics.completed}
        />

        <MetricCard
          icon={Hourglass}
          label="Avg. wait"
          value={formatMinutes(analytics.average_wait_minutes)}
        />

        <MetricCard
          icon={UserMinus}
          label="No-shows"
          value={analytics.no_show}
        />

        <MetricCard
          icon={Users}
          label="Total entries"
          value={analytics.total_entries}
        />
      </div>

      {/* Main analytics area */}
      <div className="qa-main-grid">
        <section className="qa-panel qa-performance">
          <div className="qa-panel__head">
            <div>
              <h2>Queue performance</h2>
              <p>Entry status breakdown</p>
            </div>

            <span className="qa-total">
              {analytics.total_entries} total
            </span>
          </div>

          <div className="qa-performance__body">
            <PerformanceRow
              label="Completed"
              value={analytics.completed}
              total={analytics.total_entries}
              type="completed"
            />

            <PerformanceRow
              label="Waiting"
              value={analytics.waiting}
              total={analytics.total_entries}
              type="waiting"
            />

            <PerformanceRow
              label="Called"
              value={analytics.called}
              total={analytics.total_entries}
              type="called"
            />

            <PerformanceRow
              label="Checked in"
              value={analytics.checked_in}
              total={analytics.total_entries}
              type="checked"
            />

            <PerformanceRow
              label="Cancelled"
              value={analytics.cancelled}
              total={analytics.total_entries}
              type="cancelled"
            />

            <PerformanceRow
              label="No-show"
              value={analytics.no_show}
              total={analytics.total_entries}
              type="no-show"
            />
          </div>

          <div className="qa-performance__footer">
            <Clock size={16} weight="duotone" />

            <span>Average service time</span>

            <strong>
              {formatMinutes(analytics.average_service_minutes)}
            </strong>
          </div>
        </section>

        {/* Right summary */}
        <aside className="qa-panel qa-glance">
          <div className="qa-panel__head">
            <div>
              <h2>At a glance</h2>
              <p>Current queue activity</p>
            </div>
          </div>

          <div className="qa-glance__main">
            <span>Active entries</span>
            <strong>{active}</strong>
          </div>

          <div className="qa-glance__rows">
            <div>
              <span>
                <i className="qa-dot qa-dot--waiting" />
                Waiting
              </span>
              <strong>{analytics.waiting}</strong>
            </div>

            <div>
              <span>
                <i className="qa-dot qa-dot--called" />
                Called
              </span>
              <strong>{analytics.called}</strong>
            </div>

            <div>
              <span>
                <i className="qa-dot qa-dot--checked" />
                Checked in
              </span>
              <strong>{analytics.checked_in}</strong>
            </div>
          </div>

          <div className="qa-glance__rate">
            <span>No-show rate</span>
            <strong>{analytics.no_show_rate}%</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}