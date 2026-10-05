import { useContext, useState } from "react";
import { Star, PencilSimple, Trash } from "@phosphor-icons/react";
import { UserContext } from "../../contexts/UserContext";
import { ROLES, getRole } from "../../lib/helpers/roles";
import {
  createReview,
  updateReview,
  deleteReview,
} from "../../services/reviewService";
import "./Reviews.css";

export default function ReviewsSection({
  businessId,
  reviews,
  onReviewsChanged,
}) {
  const { user } = useContext(UserContext);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reviewList = reviews?.reviews || [];

  const myReview = user
    ? reviewList.find((review) => review.user_id === user.id)
    : null;

  const isCustomer = getRole(user) === ROLES.CUSTOMER;
  async function handleSubmit(event) {
    event.preventDefault();

    if (!rating) {
      setError("Choose a rating first.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createReview(businessId, {
        rating,
        comment: comment.trim() || null,
      });

      setRating(0);
      setComment("");
      onReviewsChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(review) {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
    setError("");

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setRating(0);
    setComment("");
    setError("");
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!rating) {
      setError("Choose a rating first.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateReview(editingId, {
        rating,
        comment: comment.trim() || null,
      });

      setEditingId(null);
      setRating(0);
      setComment("");
      onReviewsChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(reviewId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteReview(reviewId);

      if (editingId === reviewId) {
        cancelEditing();
      }

      onReviewsChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <div className="reviews__heading">
        <h2 id="reviews-title">Reviews</h2>

        {reviews?.review_count > 0 && (
          <div className="reviews__summary">
            <Star size={20} weight="fill" />
            <strong>{reviews.average_rating?.toFixed(1)}</strong>
            <span>
              {reviews.review_count}{" "}
              {reviews.review_count === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      {reviewList.length === 0 ? (
        <div className="reviews__empty">
          <Star size={28} weight="duotone" />
          <h3>No reviews yet</h3>
          <p>Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="reviews__list">
          {reviewList.map((review) => {
            const isMine = user && review.user_id === user.id;

            return (
              <article
                key={review.id}
                className={`review-card ${isMine ? "review-card--mine" : ""
                  }`}
              >
                <div className="review-card__top">
                  <div className="review-card__author">
                    <div className="review-card__avatar">
                      {review.author_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <div className="review-card__name-row">
                        <h3>{review.author_name || "Customer"}</h3>

                        {isMine && (
                          <span className="review-card__you">Your review</span>
                        )}
                      </div>

                      {review.created_at && (
                        <time dateTime={review.created_at}>
                          {new Date(review.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </time>
                      )}
                    </div>
                  </div>

                  <div
                    className="review-card__rating"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={17}
                        weight={star <= review.rating ? "fill" : "regular"}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="review-card__comment">{review.comment}</p>
                )}

                {isMine && (
                  <div className="review-card__actions">
                    <button
                      type="button"
                      onClick={() => startEditing(review)}
                      className="review-action"
                    >
                      <PencilSimple size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="review-action review-action--danger"
                    >
                      <Trash size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {error && !isCustomer && (
        <p className="review-form__error" role="alert">
          {error}
        </p>
      )}

      {isCustomer && (!myReview || editingId) && (
        <div className="review-form-wrap">
          <div className="review-form-wrap__head">
            <h3>{editingId ? "Edit your review" : "Leave a review"}</h3>

            <p>
              {editingId
                ? "Update your rating or comment."
                : "You can review this business after a completed visit or booking."}
            </p>
          </div>

          <form
            className="review-form"
            onSubmit={editingId ? handleUpdate : handleSubmit}
          >
            <fieldset className="review-form__fieldset">
              <legend>Your rating</legend>

              <div className="review-form__stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`review-star ${star <= rating ? "review-star--active" : ""
                      }`}
                    onClick={() => setRating(star)}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                  >
                    <Star
                      size={30}
                      weight={star <= rating ? "fill" : "regular"}
                    />
                  </button>
                ))}

                {rating > 0 && (
                  <span className="review-form__rating-text">
                    {rating}/5
                  </span>
                )}
              </div>
            </fieldset>

            <label className="review-form__label" htmlFor="review-comment">
              Comment
              <span>Optional</span>
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="How was your experience?"
            />

            <div className="review-form__count">
              {comment.length}/1000
            </div>

            {error && (
              <p className="review-form__error" role="alert">
                {error}
              </p>
            )}

            <div className="review-form__actions">
              {editingId && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={saving || !rating}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Post review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isCustomer && myReview && !editingId && (
        <p className="reviews__already-reviewed">
          You've already reviewed this business. You can edit or delete your
          review above.
        </p>
      )}
    </section>
  );
}