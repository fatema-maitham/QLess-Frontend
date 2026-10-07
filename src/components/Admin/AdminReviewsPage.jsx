import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import { getAdminReviews } from "../../services/adminService";
import { deleteReview } from "../../services/reviewService";
import { initial } from "../Owner/ownerSetup";
import { SearchBox, Tabs } from '../AdminPanel/AdminParts';
import { ago, matches } from '../AdminPanel/adminUtils';
import { Kpi, MeterCard, Stars } from "./AdminBits";
import "./Admin.css";

// Which tab a rating belongs to
const GROUPS = {
  positive: (rating) => rating >= 4,
  mixed: (rating) => rating === 3,
  negative: (rating) => rating <= 2,
};

const average = (reviews) =>
  reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

export default function AdminReviewsPage() {
  const { toast } = useOutletContext();
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const dialog = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    getAdminReviews({ signal: controller.signal })
      .then((data) => { setList(data); setError(""); })
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, []);

  function askRemove(review) {
    setRemoving(review);
    dialog.current?.showModal();
  }

  function closeDialog() {
    dialog.current?.close();
    setRemoving(null);
  }

  async function confirmRemove(event) {
    event.preventDefault();
    const review = removing;
    setBusy(true);
    try {
      await deleteReview(review.id);
      setList((prev) => prev.filter((row) => row.id !== review.id));
      toast(`Review by ${review.author_name} was removed`);
      closeDialog();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="empty"><b>Couldn't load reviews</b><p>{error}</p></div>;
  if (!list) return null;

  const count = (group) => list.filter((review) => GROUPS[group](review.rating)).length;
  const tabs = [
    { key: "all", label: "All", count: list.length },
    { key: "positive", label: "4–5 stars", count: count("positive") },
    { key: "mixed", label: "3 stars", count: count("mixed") },
    { key: "negative", label: "1–2 stars", count: count("negative") },
  ];

  const shown = list
    .filter((review) => tab === "all" || GROUPS[tab](review.rating))
    .filter((review) => matches(`${review.business_name} ${review.author_name} ${review.comment}`, q));

  // Businesses with the lowest average (at least one review), worst first
  const byBusiness = {};
  list.forEach((review) => {
    (byBusiness[review.business_name] ||= []).push(review);
  });
  const lowest = Object.entries(byBusiness)
    .map(([name, reviews]) => ({ name, avg: average(reviews), n: reviews.length }))
    .sort((a, b) => a.avg - b.avg || b.n - a.n)
    .slice(0, 5)
    .map((row) => ({
      label: row.name,
      value: row.avg,
      shown: `${row.avg.toFixed(1)} ★`,
      color: row.avg >= 4 ? "#2F6B37" : row.avg >= 3 ? "#F7C98B" : undefined,
    }));

  const avg = average(list);
  const positive = list.length ? Math.round((count("positive") / list.length) * 100) : 0;

  return (
    <section className="am-page">
      <div className="page-h">
        <h1>Reviews</h1>
        <span className="sp" />
        <SearchBox value={q} onChange={setQ} placeholder="Search reviews" />
      </div>

      <div className="am-kpis">
        <Kpi icon="reviews" value={list.length ? `${avg.toFixed(1)} ★` : "—"} label="Average rating" note="out of 5" />
        <Kpi icon="overview" value={list.length} label="Reviews" note="newest first below" />
        <Kpi icon="users" value={`${positive}%`} label="Happy visitors" note="gave 4 or 5 stars" />
        <Kpi icon="suspicious" value={count("negative")} label="Low ratings" note={count("negative") ? "worth a look" : "nothing to check"} />
      </div>

      <div className="am-gap">
        <MeterCard title="Average rating by business (lowest first)" rows={lowest} total={5} empty="No reviews yet." />
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {shown.length ? (
        <div className="list">
          {shown.map((review) => (
            <div className="li am-li am-li--top" key={review.id}>
              <span className="ic am-image-icon">
                {review.author_profile_image ? (
                  <img
                    src={review.author_profile_image}
                    alt={`${review.author_name} profile`}
                    className="am-list-image"
                  />
                ) : (
                  initial(review.author_name)
                )}
              </span>              <div>
                <b>{review.business_name}</b>
                <small>by {review.author_name} · {ago(review.created_at)}</small>
                <p className={`am-quote${review.comment ? "" : " none"}`}>
                  {review.comment || "No comment, rating only."}
                </p>
              </div>
              <Stars rating={review.rating} />
              <span className="am-acts">
                <button className="no" type="button" onClick={() => askRemove(review)}>
                  Remove
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <b>{q ? "Nothing matches your search" : "No reviews here"}</b>
          <p>{q ? "Try another business, name or word." : "Reviews show up here when visitors rate a business."}</p>
        </div>
      )}

      <dialog className="am-dlg" ref={dialog} onClose={() => setRemoving(null)}>
        <form onSubmit={confirmRemove}>
          <h2>Remove this review?</h2>
          <p>
            The review by <b>{removing?.author_name}</b> for <b>{removing?.business_name}</b> will be deleted for
            everyone, and the author gets a notification. This can't be undone.
          </p>
          <div className="fa">
            <button className="btn btn-ghost" type="button" onClick={closeDialog}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={busy}>Remove review</button>
          </div>
        </form>
      </dialog>
    </section>
  );
}