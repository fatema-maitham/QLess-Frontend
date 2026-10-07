import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";

import { initial } from "./ownerSetup";
import { SearchBox, Tabs } from "../AdminPanel/AdminParts";
import { ago, matches } from "../AdminPanel/adminUtils";
import { Kpi, MeterCard, Stars } from "../Admin/AdminBits";
import { getBusinessReviews } from "../../services/ownerBusinessService";

import "../Admin/Admin.css";

const GROUPS = {
  positive: (rating) => rating >= 4,
  mixed: (rating) => rating === 3,
  negative: (rating) => rating <= 2,
};

const average = (reviews) =>
  reviews.length
    ? reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    ) / reviews.length
    : 0;

export default function OwnerReviews() {
  const { business } = useOutletContext();

  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!business?.id) {
      setList([]);
      return;
    }

    const controller = new AbortController();

    getBusinessReviews(
      business.id,
      controller.signal
    )
      .then((data) => {
        setList(data.reviews || []);
        setError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      });

    return () => controller.abort();
  }, [business?.id]);

  if (error) {
    return (
      <div className="empty">
        <b>Couldn't load reviews</b>
        <p>{error}</p>
      </div>
    );
  }

  if (!list) return null;

  const count = (group) =>
    list.filter((review) =>
      GROUPS[group](review.rating)
    ).length;

  const tabs = [
    {
      key: "all",
      label: "All",
      count: list.length,
    },
    {
      key: "positive",
      label: "4–5 stars",
      count: count("positive"),
    },
    {
      key: "mixed",
      label: "3 stars",
      count: count("mixed"),
    },
    {
      key: "negative",
      label: "1–2 stars",
      count: count("negative"),
    },
  ];

  const shown = list
    .filter(
      (review) =>
        tab === "all" ||
        GROUPS[tab](review.rating)
    )
    .filter((review) =>
      matches(
        `${review.author_name || ""} ${review.comment || ""
        }`,
        q
      )
    );

  const avg = average(list);

  const positive = list.length
    ? Math.round(
      (count("positive") / list.length) * 100
    )
    : 0;

  const ratingRows = [5, 4, 3, 2, 1].map(
    (rating) => {
      const amount = list.filter(
        (review) => review.rating === rating
      ).length;

      return {
        label: `${rating} star${rating === 1 ? "" : "s"}`,
        value: amount,
        shown: `${amount}`,
      };
    }
  );

  return (
    <section className="am-page">
      <div className="page-h">
        <div>
          <h1>Reviews</h1>
          <p className="am-note">
            See what visitors are saying about{" "}
            {business?.name || "your business"}.
          </p>
        </div>

        <span className="sp" />

        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Search reviews"
        />
      </div>

      <div className="am-kpis">
        <Kpi
          icon="reviews"
          value={
            list.length
              ? `${avg.toFixed(1)} ★`
              : "—"
          }
          label="Average rating"
          note="out of 5"
        />

        <Kpi
          icon="overview"
          value={list.length}
          label="Reviews"
          note="customer feedback"
        />

        <Kpi
          icon="users"
          value={`${positive}%`}
          label="Happy visitors"
          note="gave 4 or 5 stars"
        />

        <Kpi
          icon="suspicious"
          value={count("negative")}
          label="Low ratings"
          note={
            count("negative")
              ? "worth a look"
              : "nothing to check"
          }
        />
      </div>

      <div className="am-gap">
        <MeterCard
          title="Rating breakdown"
          rows={ratingRows}
          total={Math.max(list.length, 1)}
          empty="No reviews yet."
        />
      </div>

      <Tabs
        tabs={tabs}
        active={tab}
        onChange={setTab}
      />

      {shown.length ? (
        <div className="list">
          {shown.map((review) => (
            <div
              className="li am-li am-li--top"
              key={review.id}
            >
              <span className="ic am-image-icon">
                {review.author_profile_image ? (
                  <img
                    src={
                      review.author_profile_image
                    }
                    alt={`${review.author_name} profile`}
                    className="am-list-image"
                  />
                ) : (
                  initial(
                    review.author_name ||
                    "Visitor"
                  )
                )}
              </span>

              <div>
                <b>
                  {review.author_name ||
                    "Visitor"}
                </b>

                <small>
                  {ago(review.created_at)}
                </small>

                <p
                  className={`am-quote${review.comment
                      ? ""
                      : " none"
                    }`}
                >
                  {review.comment ||
                    "No comment, rating only."}
                </p>
              </div>

              <Stars rating={review.rating} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <b>
            {q
              ? "Nothing matches your search"
              : "No reviews here"}
          </b>

          <p>
            {q
              ? "Try another customer name or word."
              : "Customer reviews will appear here after visitors review your business."}
          </p>
        </div>
      )}
    </section>
  );
}