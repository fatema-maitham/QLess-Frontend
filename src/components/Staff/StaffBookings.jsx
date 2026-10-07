import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";

import {
  CalendarBlank,
  CheckCircle,
  Clock,
  User,
  UserMinus,
} from "@phosphor-icons/react";

import {
  getBranchBookings,
  updateBookingStatus,
} from "../../services/bookingService";

import "../Bookings/Bookings.css";

const STATUSES = [
  {
    value: "",
    label: "All",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "no_show",
    label: "No show",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

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

  const [hour, minute] = value
    .split(":")
    .map(Number);

  return new Date(
    2000,
    0,
    1,
    hour,
    minute
  ).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  if (status === "no_show") {
    return "No show";
  }

  if (!status) return "";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

export default function StaffBookings() {
  const { me } = useOutletContext();

  const branchId = me?.branch?.id;

  const [bookings, setBookings] =
    useState([]);

  const [pageStatus, setPageStatus] =
    useState("loading");

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  async function loadBookings(signal) {
    if (!branchId) {
      setBookings([]);
      setPageStatus("ready");
      return;
    }

    try {
      const data =
        await getBranchBookings(
          branchId,
          {
            status:
              statusFilter ||
              undefined,

            bookingDate:
              dateFilter ||
              undefined,

            signal,
          }
        );

      setBookings(data);
      setPageStatus("ready");
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }

      setError(
        err.message ||
        "Could not load bookings."
      );

      setPageStatus("error");
    }
  }

  useEffect(() => {
    const controller =
      new AbortController();

    setPageStatus("loading");
    setError("");

    loadBookings(
      controller.signal
    );

    return () =>
      controller.abort();
  }, [
    branchId,
    statusFilter,
    dateFilter,
  ]);

  async function changeStatus(
    bookingId,
    nextStatus
  ) {
    setUpdatingId(bookingId);
    setError("");

    try {
      const updated =
        await updateBookingStatus(
          bookingId,
          nextStatus
        );

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? updated
            : booking
        )
      );
    } catch (err) {
      setError(
        err.message ||
        "Could not update booking."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="sb">
      <div className="page-h">
        <div className="cp-title">
          <h1>Bookings</h1>

          <p className="cp-sub">
            {me?.branch?.name}
            {me?.business?.name
              ? ` · ${me.business.name}`
              : ""}
          </p>
        </div>

        <span className="sp" />

        {pageStatus === "ready" && (
          <span className="sb-count">
            {bookings.length}{" "}
            {bookings.length === 1
              ? "booking"
              : "bookings"}
          </span>
        )}
      </div>

      <div className="sb-filters">
        <div
          className="sh-filters"
          role="group"
          aria-label="Filter bookings by status"
        >
          {STATUSES.map((item) => (
            <button
              key={item.value || "all"}
              type="button"
              className={
                statusFilter ===
                  item.value
                  ? "on"
                  : ""
              }
              aria-pressed={
                statusFilter ===
                item.value
              }
              onClick={() =>
                setStatusFilter(
                  item.value
                )
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="sb-date">
          <CalendarBlank size={18} />

          <span className="sb-sr">
            Date
          </span>

          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
          />
        </label>

        {(statusFilter ||
          dateFilter) && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
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
        <p
          className="sb-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {pageStatus === "loading" && (
        <div
          className="sh-skeleton"
          aria-busy="true"
        />
      )}

      {pageStatus === "error" && (
        <div className="empty">
          <b>
            We couldn't load these
            bookings
          </b>

          <p>{error}</p>
        </div>
      )}

      {pageStatus === "ready" &&
        bookings.length === 0 && (
          <div className="empty">
            <CalendarBlank
              size={40}
              weight="duotone"
            />

            <b>No bookings found</b>

            <p>
              There are no bookings
              matching these filters.
            </p>
          </div>
        )}

      {pageStatus === "ready" &&
        bookings.length > 0 && (
          <div className="sb-grid">
            {bookings.map(
              (booking) => {
                const busy =
                  updatingId ===
                  booking.id;

                const canAct =
                  booking.status ===
                  "confirmed";

                return (
                  <article
                    key={booking.id}
                    className={`sb-card is-${booking.status}`}
                  >
                    <div className="sb-card__top">
                      <div className="sb-when">
                        <b>
                          {formatTime(
                            booking.booking_time
                          )}
                        </b>

                        <span>
                          {formatDate(
                            booking.booking_date
                          )}
                        </span>
                      </div>

                      <span
                        className={`sb-status sb-status--${booking.status}`}
                      >
                        {statusLabel(
                          booking.status
                        )}
                      </span>
                    </div>

                    <h2>
                      {
                        booking.service_name
                      }
                    </h2>

                    <div className="sb-details">
                      <span>
                        <User size={17} />

                        {booking.customer_name ||
                          "Customer"}
                      </span>

                      <span>
                        <Clock size={17} />

                        Booking #
                        {booking.id}
                      </span>
                    </div>

                    {canAct && (
                      <div className="sb-actions">
                        <button
                          type="button"
                          className="st-btn sb-btn"
                          disabled={busy}
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

                          {busy
                            ? "Updating..."
                            : "Complete"}
                        </button>

                        <button
                          type="button"
                          className="st-btn ghost sb-btn"
                          disabled={busy}
                          onClick={() =>
                            changeStatus(
                              booking.id,
                              "no_show"
                            )
                          }
                        >
                          <UserMinus
                            size={17}
                          />

                          No show
                        </button>
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}
    </div>
  );
}