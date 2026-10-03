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
  if (value === null || value === undefined) {
    return "No data";
  }

  return `${value} min`;
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="qa-card">
      <span className="qa-card__icon">
        <Icon size={21} weight="duotone" />
      </span>

      <div className="qa-card__content">
        <span className="qa-card__label">{label}</span>
        <strong className="qa-card__value">{value}</strong>

        {detail && (
          <span className="qa-card__detail">{detail}</span>
        )}
      </div>
    </article>
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
        <div className="qa-container">
          <div className="qa-skeleton qa-skeleton--head" />

          <div className="qa-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="qa-skeleton qa-skeleton--card"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (page.status === "error") {
    return (
      <section className="qa-page">
        <div className="qa-container">
          <div className="qa-message" role="alert">
            <Warning size={32} weight="duotone" />

            <h1>Could not load analytics</h1>

            <p>{page.error}</p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const { queue, analytics } = page;

  const active =
    analytics.waiting +
    analytics.called +
    analytics.checked_in;

  const finished =
    analytics.completed +
    analytics.no_show +
    analytics.cancelled;

  return (
    <section className="qa-page">
      <div className="qa-container">
        <Link
          className="qa-back"
          to={`/owner/queues?branch=${queue.branch_id}&queue=${queue.id}`}
        >
          <ArrowLeft size={16} weight="bold" />
          Live Queues
        </Link>

        <div className="qa-head">
          <div>
            <h1>{queue.name} Analytics</h1>
            <p>Queue performance and customer activity.</p>
          </div>

          <span
            className={`qa-status qa-status--${queue.status}`}
          >
            {queue.status}
          </span>
        </div>

        <section
          className="qa-grid"
          aria-label="Queue overview"
        >
          <MetricCard
            icon={Users}
            label="Total entries"
            value={analytics.total_entries}
            detail="All customers who joined"
          />

          <MetricCard
            icon={Users}
            label="Currently active"
            value={active}
            detail="Waiting, called or checked in"
          />

          <MetricCard
            icon={CheckCircle}
            label="Completed"
            value={analytics.completed}
            detail="Successfully served"
          />

          <MetricCard
            icon={UserMinus}
            label="No-shows"
            value={analytics.no_show}
            detail={`${analytics.no_show_rate}% no-show rate`}
          />

          <MetricCard
            icon={Hourglass}
            label="Average wait"
            value={formatMinutes(analytics.average_wait_minutes)}
            detail="Joining until called"
          />

          <MetricCard
            icon={Clock}
            label="Average service"
            value={formatMinutes(analytics.average_service_minutes)}
            detail="Check-in until completion"
          />
        </section>

        <section className="qa-section">
          <div className="qa-section__head">
            <h2>Entry status</h2>

            <span className="qa-section__total">
              {analytics.total_entries} total
            </span>
          </div>

          <div className="qa-breakdown">
            <div className="qa-breakdown__row">
              <div>
                <span className="qa-dot qa-dot--waiting" />
                <span>Waiting</span>
              </div>
              <strong>{analytics.waiting}</strong>
            </div>

            <div className="qa-breakdown__row">
              <div>
                <span className="qa-dot qa-dot--called" />
                <span>Called</span>
              </div>
              <strong>{analytics.called}</strong>
            </div>

            <div className="qa-breakdown__row">
              <div>
                <span className="qa-dot qa-dot--checked" />
                <span>Checked in</span>
              </div>
              <strong>{analytics.checked_in}</strong>
            </div>

            <div className="qa-breakdown__row">
              <div>
                <span className="qa-dot qa-dot--completed" />
                <span>Completed</span>
              </div>
              <strong>{analytics.completed}</strong>
            </div>

            <div className="qa-breakdown__row">
              <div>
                <span className="qa-dot qa-dot--cancelled" />
                <span>Cancelled</span>
              </div>
              <strong>{analytics.cancelled}</strong>
            </div>

            <div className="qa-breakdown__row">
              <div>
                <span className="qa-dot qa-dot--no-show" />
                <span>No-show</span>
              </div>
              <strong>{analytics.no_show}</strong>
            </div>
          </div>
        </section>

        <section className="qa-summary">
          <div>
            <span>Active entries</span>
            <strong>{active}</strong>
          </div>

          <div>
            <span>Finished entries</span>
            <strong>{finished}</strong>
          </div>

          <div>
            <span>No-show rate</span>
            <strong>{analytics.no_show_rate}%</strong>
          </div>
        </section>
      </div>
    </section>
  );
}