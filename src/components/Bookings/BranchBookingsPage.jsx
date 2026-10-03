import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  CalendarBlank,
  Check,
  CheckCircle,
  Clock,
  Phone,
  User,
  X,
} from "@phosphor-icons/react";

import {
  getBranchBookings,
  updateBookingStatus,
} from "../../services/bookingService";

import { getBranch } from "../../services/branchService";

import "./Bookings.css";

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

export default function BranchBookingsPage() {
  const { branchId } = useParams();

  const [branch, setBranch] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [pageStatus, setPageStatus] = useState("loading");
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setPageStatus("loading");
      setError("");

      try {
        const [branchData, bookingData] = await Promise.all([
          getBranch(branchId, {
            signal: controller.signal,
          }),

          getBranchBookings(branchId, {
            status: statusFilter || undefined,
            bookingDate: dateFilter || undefined,
            signal: controller.signal,
          }),
        ]);

        setBranch(branchData);
        setBookings(bookingData);
        setPageStatus("ready");
      } catch (err) {
        if (err.name === "AbortError") return;

        setError(err.message);
        setPageStatus("error");
      }
    }

    load();

    return () => controller.abort();
  }, [branchId, statusFilter, dateFilter]);

  async function changeStatus(bookingId, nextStatus) {
    setUpdatingId(bookingId);
    setError("");

    try {
      const updated = await updateBookingStatus(
        bookingId,
        nextStatus
      );

      if (
        statusFilter &&
        updated.status !== statusFilter
      ) {
        setBookings((current) =>
          current.filter(
            (booking) => booking.id !== bookingId
          )
        );
      } else {
        setBookings((current) =>
          current.map((booking) =>
            booking.id === bookingId ? updated : booking
          )
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (pageStatus === "loading") {
    return (
      <main className="bookings-page">
        <div className="bookings-container">
          <p>Loading branch bookings...</p>
        </div>
      </main>
    );
  }

  if (pageStatus === "error" && !branch) {
    return (
      <main className="bookings-page">
        <div className="bookings-container">
          <div className="bookings-empty" role="alert">
            <h1>We couldn't load these bookings</h1>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bookings-page">
      <div className="bookings-container">
        <nav className="booking-back">
          <Link to="/">← Back to dashboard</Link>
        </nav>

        <header className="bookings-header">
          <div>
            <p className="booking-eyebrow">
              Branch management
            </p>

            <h1>Bookings</h1>

            <p>
              {branch?.name}
            </p>
          </div>

          <span className="bookings-count">
            {bookings.length} shown
          </span>
        </header>

        <div className="booking-filters">
          <div className="booking-field">
            <label htmlFor="booking-status-filter">
              Status
            </label>

            <select
              id="booking-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="booking-field">
            <label htmlFor="booking-date-filter">
              Date
            </label>

            <input
              id="booking-date-filter"
              type="date"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value)
              }
            />
          </div>

          {(statusFilter || dateFilter) && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setStatusFilter("");
                setDateFilter("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <p className="booking-message booking-message--error">
            {error}
          </p>
        )}

        {bookings.length === 0 ? (
          <section className="bookings-empty">
            <CalendarBlank size={42} weight="duotone" />

            <h2>No bookings found</h2>

            <p>
              There are no bookings matching these filters.
            </p>
          </section>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <article
                className="booking-card booking-card--manager"
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

                    <p>
                      Booking #{booking.id}
                    </p>
                  </div>
                </div>

                <div className="booking-card__details">
                  <span>
                    <User size={17} />
                    {booking.customer_name}
                  </span>

                  {booking.customer_phone && (
                    <span>
                      <Phone size={17} />
                      {booking.customer_phone}
                    </span>
                  )}

                  <span>
                    <CalendarBlank size={17} />
                    {formatDate(booking.booking_date)}
                  </span>

                  <span>
                    <Clock size={17} />
                    {formatTime(booking.booking_time)}
                  </span>
                </div>

                <div className="booking-actions">
                  {booking.status === "pending" && (
                    <button
                      type="button"
                      className="btn btn--primary"
                      disabled={updatingId === booking.id}
                      onClick={() =>
                        changeStatus(
                          booking.id,
                          "confirmed"
                        )
                      }
                    >
                      <Check size={17} weight="bold" />
                      Confirm
                    </button>
                  )}

                  {booking.status === "confirmed" && (
                    <button
                      type="button"
                      className="btn btn--primary"
                      disabled={updatingId === booking.id}
                      onClick={() =>
                        changeStatus(
                          booking.id,
                          "completed"
                        )
                      }
                    >
                      <CheckCircle
                        size={17}
                        weight="bold"
                      />
                      Complete
                    </button>
                  )}

                  {(booking.status === "pending" ||
                    booking.status === "confirmed") && (
                      <button
                        type="button"
                        className="btn btn--secondary booking-cancel-btn"
                        disabled={updatingId === booking.id}
                        onClick={() =>
                          changeStatus(
                            booking.id,
                            "cancelled"
                          )
                        }
                      >
                        <X size={17} />
                        Cancel
                      </button>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}