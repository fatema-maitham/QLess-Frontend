import { useEffect, useState } from "react";
import { ChatCircleText, Star, Trash } from "@phosphor-icons/react";
import AdminTabs from "./AdminTabs";
import { getAdminReviews } from "../../services/adminService";
import { deleteReview } from "../../services/reviewService";
import { formatDate } from "./adminHelpers";
import "./Admin.css";

const RATINGS = ["", "5", "4", "3", "2", "1"];

function Stars({ rating }) {
  return (
    <span className="ad-stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={16} weight={n <= rating ? "fill" : "regular"} aria-hidden="true" />
      ))}
    </span>
  );
}

// One review, with a two-step remove button
function ReviewCard({ review, busy, onRemove }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="ad-card">
      <div className="ad-card__top">
        <div>
          <h2 className="ad-card__title">{review.business_name}</h2>
          <p className="ad-card__sub">
            by {review.author_name} · {formatDate(review.created_at)}
          </p>
        </div>
        <Stars rating={review.rating} />
      </div>

      <p>{review.comment || <em>No comment, rating only.</em>}</p>

      <div className="ad-actions__buttons">
        {confirming ? (
          <>
            <span className="ad-confirm">Remove this review for everyone?</span>
            <button
              type="button"
              className="ad-btn ad-btn--primary"
              disabled={busy}
              onClick={() => onRemove(review)}
            >
              Yes, remove
            </button>
            <button
              type="button"
              className="ad-btn"
              disabled={busy}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="ad-btn" onClick={() => setConfirming(true)}>
            <Trash size={16} /> Remove
          </button>
        )}
      </div>
    </li>
  );
}

export default function AdminReviewsPage() {
  const [rating, setRating] = useState("");
  const [page, setPage] = useState({ status: "loading", list: [], error: "" });
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    getAdminReviews({ rating, signal: controller.signal })
      .then((list) => setPage({ status: "ready", list, error: "" }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setPage({ status: "error", list: [], error: err.message });
      });

    return () => controller.abort();
  }, [rating]);

  async function remove(review) {
    setBusyId(review.id);
    setActionError("");

    try {
      await deleteReview(review.id);
      setPage((prev) => ({ ...prev, list: prev.list.filter((row) => row.id !== review.id) }));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const count = page.list.length;

  return (
    <main className="ad-page">
      <header className="ad-head">
        <p className="ad-eyebrow">Admin</p>
        <h1 className="ad-title">Reviews</h1>
        <p className="ad-sub">All customer reviews, newest first. Remove any that are inappropriate.</p>
      </header>

      <AdminTabs />

      <div className="ad-filters">
        <span className="ad-updated">
          {page.status === "ready" && `${count} ${count === 1 ? "review" : "reviews"}`}
        </span>

        <label className="ad-field ad-field--inline">
          <span>Rating</span>
          <select
            className="ad-select"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          >
            {RATINGS.map((value) => (
              <option key={value || "any"} value={value}>
                {value ? `${value} stars` : "Any"}
              </option>
            ))}
          </select>
        </label>
      </div>

      {actionError && (
        <p className="ad-error" role="alert">
          {actionError}
        </p>
      )}

      {page.status === "loading" && <p className="ad-empty">Loading reviews…</p>}

      {page.status === "error" && (
        <div className="ad-empty" role="alert">
          <b>Could not load reviews</b>
          <p>{page.error}</p>
        </div>
      )}

      {page.status === "ready" && count === 0 && (
        <div className="ad-empty">
          <ChatCircleText size={32} weight="duotone" />
          <b>No reviews</b>
          <p>No reviews match this filter.</p>
        </div>
      )}

      {page.status === "ready" && count > 0 && (
        <ul className="ad-list">
          {page.list.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              busy={busyId === review.id}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
    </main>
  );
}