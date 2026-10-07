import {
  useEffect,
  useState,
} from "react";

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
  getAvailableSlots,
  getMyBookings,
  rescheduleBooking,
} from "../../services/bookingService";

import "./Bookings.css";

function todayString() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "";

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
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
  ).toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
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

export default function MyBookingsPage() {
  const [bookings, setBookings] =
    useState([]);

  const [pageStatus, setPageStatus] =
    useState("loading");

  const [error, setError] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [editDate, setEditDate] =
    useState("");

  const [editTime, setEditTime] =
    useState("");

  const [editSlots, setEditSlots] =
    useState([]);

  const [
    editDuration,
    setEditDuration,
  ] = useState(null);

  const [
    editSlotStatus,
    setEditSlotStatus,
  ] = useState("idle");

  const [savingId, setSavingId] =
    useState(null);

  async function loadBookings(signal) {
    try {
      const data =
        await getMyBookings({
          signal,
        });

      setBookings(data);
      setPageStatus("ready");
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }

      setError(err.message);
      setPageStatus("error");
    }
  }

  useEffect(() => {
    const controller =
      new AbortController();

    loadBookings(
      controller.signal
    );

    return () =>
      controller.abort();
  }, []);

  useEffect(() => {
    if (
      !editingId ||
      !editDate
    ) {
      setEditSlots([]);
      setEditTime("");
      setEditDuration(null);
      setEditSlotStatus("idle");
      return;
    }

    const booking =
      bookings.find(
        (item) =>
          item.id === editingId
      );

    if (!booking) return;

    const controller =
      new AbortController();

    async function loadSlots() {
      setEditSlotStatus(
        "loading"
      );

      setEditTime("");
      setEditSlots([]);
      setError("");

      try {
        const data =
          await getAvailableSlots(
            booking.service_id,
            editDate,
            {
              signal:
                controller.signal,
            }
          );

        setEditSlots(
          data?.slots || []
        );

        setEditDuration(
          data?.duration_minutes ??
          null
        );

        setEditSlotStatus(
          "ready"
        );
      } catch (err) {
        if (
          err.name ===
          "AbortError"
        ) {
          return;
        }

        setEditSlotStatus(
          "error"
        );

        setError(
          err.message ||
          "Could not load available times."
        );
      }
    }

    loadSlots();

    return () =>
      controller.abort();
  }, [
    editingId,
    editDate,
    bookings,
  ]);

  function startReschedule(
    booking
  ) {
    setEditingId(booking.id);
    setEditDate("");
    setEditTime("");
    setEditSlots([]);
    setEditDuration(null);
    setEditSlotStatus("idle");
    setError("");
  }

  function stopReschedule() {
    setEditingId(null);
    setEditDate("");
    setEditTime("");
    setEditSlots([]);
    setEditDuration(null);
    setEditSlotStatus("idle");
  }

  async function handleReschedule(
    event,
    bookingId
  ) {
    event.preventDefault();

    if (
      !editDate ||
      !editTime
    ) {
      setError(
        "Choose a new date and available time."
      );
      return;
    }

    setSavingId(bookingId);
    setError("");

    try {
      const updated =
        await rescheduleBooking(
          bookingId,
          {
            booking_date:
              editDate,

            booking_time:
              editTime,
          }
        );

      setBookings(
        (current) =>
          current.map(
            (booking) =>
              booking.id ===
                bookingId
                ? updated
                : booking
          )
      );

      stopReschedule();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleCancel(
    bookingId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this booking?"
      );

    if (!confirmed) return;

    setSavingId(bookingId);
    setError("");

    try {
      await cancelBooking(
        bookingId
      );

      setBookings(
        (current) =>
          current.map(
            (booking) =>
              booking.id ===
                bookingId
                ? {
                  ...booking,
                  status:
                    "cancelled",
                }
                : booking
          )
      );

      if (
        editingId ===
        bookingId
      ) {
        stopReschedule();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  if (
    pageStatus === "loading"
  ) {
    return (
      <main className="page bookings-page">
        <div className="page__container">
          <div
            className="page__narrow"
            aria-busy="true"
          >
            <header className="page-head">
              <div>
                <h1>
                  My bookings
                </h1>

                <p>
                  View, reschedule
                  or cancel your
                  service bookings.
                </p>
              </div>
            </header>

            <div className="page-skeleton" />
            <div className="page-skeleton" />
          </div>
        </div>
      </main>
    );
  }

  if (
    pageStatus === "error" &&
    bookings.length === 0
  ) {
    return (
      <main className="page bookings-page">
        <div className="page__container">
          <div className="page__narrow">
            <header className="page-head">
              <div>
                <h1>
                  My bookings
                </h1>

                <p>
                  View, reschedule
                  or cancel your
                  service bookings.
                </p>
              </div>
            </header>

            <div
              className="page-empty"
              role="alert"
            >
              <h2>
                We couldn't load
                your bookings
              </h2>

              <p>{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page bookings-page">
      <div className="page__container">
        <div className="page__narrow">
          <header className="page-head">
            <div>
              <h1>
                My bookings
              </h1>

              <p>
                View, reschedule
                or cancel your
                service bookings.
              </p>
            </div>
          </header>

          {error && (
            <p className="booking-message booking-message--error">
              {error}
            </p>
          )}

          {bookings.length ===
            0 ? (
            <section className="page-empty">
              <span className="page-empty__icon">
                <CalendarBlank
                  size={28}
                  weight="duotone"
                />
              </span>

              <h2>
                No bookings yet
              </h2>

              <p>
                Browse a business
                and choose a
                service to make
                your first
                booking.
              </p>

              <Link
                to="/businesses"
                className="btn btn--primary"
              >
                Browse places
              </Link>
            </section>
          ) : (
            <div className="bookings-list">
              {bookings.map(
                (booking) => {
                  const canChange =
                    booking.status ===
                    "confirmed";

                  const editing =
                    editingId ===
                    booking.id;

                  return (
                    <article
                      className="booking-card"
                      key={
                        booking.id
                      }
                    >
                      <div className="booking-card__header">
                        <div>
                          <span
                            className={`booking-status booking-status--${booking.status}`}
                          >
                            {statusLabel(
                              booking.status
                            )}
                          </span>

                          <h2>
                            {
                              booking.service_name
                            }
                          </h2>

                          <p>
                            {
                              booking.business_name
                            }
                          </p>
                        </div>
                      </div>

                      <div className="booking-card__details">
                        <span>
                          <MapPin
                            size={17}
                          />

                          {
                            booking.branch_name
                          }
                        </span>

                        <span>
                          <CalendarBlank
                            size={17}
                          />

                          {formatDate(
                            booking.booking_date
                          )}
                        </span>

                        <span>
                          <Clock
                            size={17}
                          />

                          {formatTime(
                            booking.booking_time
                          )}
                        </span>
                      </div>

                      {editing && (
                        <form
                          className="booking-reschedule"
                          onSubmit={(
                            event
                          ) =>
                            handleReschedule(
                              event,
                              booking.id
                            )
                          }
                        >
                          <h3>
                            Choose a
                            new
                            appointment
                          </h3>

                          <div className="booking-field">
                            <label
                              htmlFor={`edit-date-${booking.id}`}
                            >
                              Date
                            </label>

                            <input
                              id={`edit-date-${booking.id}`}
                              type="date"
                              min={todayString()}
                              value={
                                editDate
                              }
                              onChange={(
                                event
                              ) => {
                                setEditDate(
                                  event
                                    .target
                                    .value
                                );

                                setEditTime(
                                  ""
                                );
                              }}
                            />
                          </div>

                          {editDate && (
                            <div className="booking-field">
                              <label>
                                Available
                                times
                              </label>

                              {editDuration && (
                                <p>
                                  Appointment
                                  duration:{" "}
                                  {
                                    editDuration
                                  }{" "}
                                  minutes
                                </p>
                              )}

                              {editSlotStatus ===
                                "loading" && (
                                  <p>
                                    Loading
                                    available
                                    times...
                                  </p>
                                )}

                              {editSlotStatus ===
                                "ready" &&
                                editSlots.length ===
                                0 && (
                                  <p>
                                    No
                                    available
                                    appointments
                                    on this
                                    date.
                                  </p>
                                )}

                              {editSlotStatus ===
                                "ready" &&
                                editSlots.length >
                                0 && (
                                  <div className="booking-slots">
                                    {editSlots.map(
                                      (
                                        slot
                                      ) => (
                                        <button
                                          key={
                                            slot
                                          }
                                          type="button"
                                          className={
                                            editTime ===
                                              slot
                                              ? "booking-slot booking-slot--selected"
                                              : "booking-slot"
                                          }
                                          aria-pressed={
                                            editTime ===
                                            slot
                                          }
                                          onClick={() =>
                                            setEditTime(
                                              slot
                                            )
                                          }
                                        >
                                          {formatTime(
                                            slot
                                          )}
                                        </button>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          )}

                          <div className="booking-actions">
                            <button
                              type="button"
                              className="btn btn--secondary"
                              onClick={
                                stopReschedule
                              }
                            >
                              Cancel
                            </button>

                            <button
                              type="submit"
                              className="btn btn--primary"
                              disabled={
                                savingId ===
                                booking.id ||
                                !editTime
                              }
                            >
                              {savingId ===
                                booking.id
                                ? "Saving..."
                                : "Save new time"}
                            </button>
                          </div>
                        </form>
                      )}

                      {canChange &&
                        !editing && (
                          <div className="booking-actions">
                            <button
                              type="button"
                              className="booking-action"
                              onClick={() =>
                                startReschedule(
                                  booking
                                )
                              }
                            >
                              <PencilSimple
                                size={
                                  17
                                }
                              />

                              Reschedule
                            </button>

                            <button
                              type="button"
                              className="booking-action booking-action--danger"
                              onClick={() =>
                                handleCancel(
                                  booking.id
                                )
                              }
                              disabled={
                                savingId ===
                                booking.id
                              }
                            >
                              <X
                                size={
                                  17
                                }
                              />

                              {savingId ===
                                booking.id
                                ? "Cancelling..."
                                : "Cancel booking"}
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
      </div>
    </main>
  );
}