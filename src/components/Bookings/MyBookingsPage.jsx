import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  CalendarBlank,
  Clock,
  MapPin,
  PencilSimple,
  X,
} from "@phosphor-icons/react";

import {
  cancelBooking,
  getMyBookings,
  rescheduleBooking,
} from "../../services/bookingService";

import "./Bookings.css";

const OPEN_STATUSES = ["pending", "confirmed"];

function formatDate(value) {
  if (!value) return "";

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    undefined,
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(value) {
  if (!value) return "";

  const [hour, minute] = value.split(":").map(Number);

  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [pageStatus, setPageStatus] = useState("loading");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [savingId, setSavingId] = useState(null);

  async function loadBookings(signal) {
    try {
      const data = await getMyBookings({ signal });
      setBookings(data);
      setPageStatus("ready");
    } catch (err) {
      if (err.name === "AbortError") return;

      setError(err.message);
      setPageStatus("error");
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    loadBookings(controller.signal);

    return () => controller.abort();
  }, []);

  function startReschedule(booking) {
    setEditingId(booking.id);
    setEditDate(booking.booking_date);
    setEditTime(booking.booking_time?.slice(0, 5) || "");
    setError("");
  }

  function stopReschedule() {
    setEditingId(null);
    setEditDate("");
    setEditTime("");
  }

  async function handleReschedule(event, bookingId) {
    event.preventDefault();

    if (!editDate || !editTime) {
      setError("Choose a new date and time.");
      return;
    }

    setSavingId(bookingId);
    setError("");

    try {
      const updated = await rescheduleBooking(bookingId, {
        booking_date: editDate,
        booking_time: editTime,
      });

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId ? updated : booking
        )
      );

      stopReschedule();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleCancel(bookingId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setSavingId(bookingId);
    setError("");

    try {
      await cancelBooking(bookingId);

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      if (editingId === bookingId) {
        stopReschedule();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  if (pageStatus === "loading") {
    return (
      <main className="bookings-page">
        <div className="bookings-container bookings-container--list">
          <p>Loading your bookings...</p>
        </div>
      </main>
    );
  }

  if (pageStatus === "error" && bookings.length === 0) {
    return (
      <main className="bookings-page">
        <div className="bookings-container">
          <div className="bookings-empty" role="alert">
            <h1>We couldn't load your bookings</h1>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bookings-page">
      <div className="bookings-container">
        <header className="bookings-header">
          <div>
            <h1>My bookings</h1>
            <p>
              View, reschedule, or cancel your service bookings.
            </p>
          </div>

          <span className="bookings-count">
            {bookings.length}{" "}
            {bookings.length === 1 ? "booking" : "bookings"}
          </span>
        </header>

        {error && (
          <p className="booking-message booking-message--error">
            {error}
          </p>
        )}

        {bookings.length === 0 ? (
          <section className="bookings-empty">
            <CalendarBlank size={42} weight="duotone" />

            <h2>No bookings yet</h2>

            <p>
              Browse a business and choose a service to make your first
              booking.
            </p>

            <Link to="/businesses" className="btn btn--primary">
              Browse places
            </Link>
          </section>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const canChange = OPEN_STATUSES.includes(
                booking.status
              );

              const editing = editingId === booking.id;

              return (
                <article
                  className="booking-card"
                  key={booking.id}
                >
                  <div className="booking-card__header">
                    <div>
                      <span
                        className={`booking-status booking-status--${booking.status}`}
                      >
                        {booking.status}
                      </span>

                      <h2>{booking.service_name}</h2>

                      <p>{booking.business_name}</p>
                    </div>
                  </div>

                  <div className="booking-card__details">
                    <span>
                      <MapPin size={17} />
                      {booking.branch_name}
                    </span>

                    <span>
                      <CalendarBlank size={17} />
                      {formatDate(booking.booking_date)}
                    </span>

                    <span>
                      <Clock size={17} />
                      {formatTime(booking.booking_time)}
                    </span>
                  </div>

                  {editing && (
                    <form
                      className="booking-reschedule"
                      onSubmit={(event) =>
                        handleReschedule(event, booking.id)
                      }
                    >
                      <h3>Choose a new time</h3>

                      <div className="booking-form__row">
                        <div className="booking-field">
                          <label
                            htmlFor={`edit-date-${booking.id}`}
                          >
                            Date
                          </label>

                          <input
                            id={`edit-date-${booking.id}`}
                            type="date"
                            value={editDate}
                            onChange={(event) =>
                              setEditDate(event.target.value)
                            }
                          />
                        </div>

                        <div className="booking-field">
                          <label
                            htmlFor={`edit-time-${booking.id}`}
                          >
                            Time
                          </label>

                          <input
                            id={`edit-time-${booking.id}`}
                            type="time"
                            value={editTime}
                            onChange={(event) =>
                              setEditTime(event.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="booking-actions">
                        <button
                          type="button"
                          className="btn btn--secondary"
                          onClick={stopReschedule}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="btn btn--primary"
                          disabled={savingId === booking.id}
                        >
                          {savingId === booking.id
                            ? "Saving..."
                            : "Save new time"}
                        </button>
                      </div>
                    </form>
                  )}

                  {canChange && !editing && (
                    <div className="booking-actions">
                      <button
                        type="button"
                        className="booking-action"
                        onClick={() =>
                          startReschedule(booking)
                        }
                      >
                        <PencilSimple size={17} />
                        Reschedule
                      </button>

                      <button
                        type="button"
                        className="booking-action booking-action--danger"
                        onClick={() =>
                          handleCancel(booking.id)
                        }
                        disabled={savingId === booking.id}
                      >
                        <X size={17} />
                        {savingId === booking.id
                          ? "Cancelling..."
                          : "Cancel booking"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}