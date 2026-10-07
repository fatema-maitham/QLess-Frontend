import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router";

import {
  CalendarBlank,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";

import { UserContext } from "../../contexts/UserContext";

import {
  ROLES,
  getRole,
} from "../../lib/helpers/roles";

import {
  createBooking,
  getAvailableSlots,
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


function formatDate(value) {
  if (!value) return "";

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


export default function BookServiceForm({
  services,
  onBooked,
}) {
  const { user } =
    useContext(UserContext);

  const location =
    useLocation();

  const [serviceId, setServiceId] =
    useState("");

  const [
    bookingDate,
    setBookingDate,
  ] = useState("");

  const [
    bookingTime,
    setBookingTime,
  ] = useState("");

  const [slots, setSlots] =
    useState([]);

  const [
    durationMinutes,
    setDurationMinutes,
  ] = useState(null);

  const [
    slotStatus,
    setSlotStatus,
  ] = useState("idle");

  const [status, setStatus] =
    useState("idle");

  const [error, setError] =
    useState("");

  // Store the successful booking here.
  // When this exists, we show the
  // confirmation screen instead of
  // keeping the booking form open.
  const [
    confirmedBooking,
    setConfirmedBooking,
  ] = useState(null);


  const isCustomer =
    getRole(user) ===
    ROLES.CUSTOMER;


  useEffect(() => {
    if (
      !isCustomer ||
      !serviceId ||
      !bookingDate
    ) {
      setSlots([]);
      setBookingTime("");
      setDurationMinutes(null);
      setSlotStatus("idle");

      return;
    }

    const controller =
      new AbortController();


    async function loadSlots() {
      setSlotStatus("loading");
      setError("");
      setBookingTime("");

      try {
        const data =
          await getAvailableSlots(
            serviceId,
            bookingDate,
            {
              signal:
                controller.signal,
            }
          );

        setSlots(
          data?.slots || []
        );

        setDurationMinutes(
          data?.duration_minutes ??
          null
        );

        setSlotStatus("ready");
      } catch (err) {
        if (
          err.name ===
          "AbortError"
        ) {
          return;
        }

        setSlots([]);

        setDurationMinutes(
          null
        );

        setError(
          err.message ||
          "Could not load available times."
        );

        setSlotStatus("error");
      }
    }


    loadSlots();


    return () =>
      controller.abort();
  }, [
    serviceId,
    bookingDate,
    isCustomer,
  ]);


  if (!services?.length) {
    return null;
  }


  // --------------------------------------------------
  // NOT SIGNED IN
  // --------------------------------------------------

  if (!user) {
    return (
      <section
        className="booking-form-card"
        aria-labelledby="book-service-title"
      >
        <div className="booking-section-heading">
          <div>
            <h2 id="book-service-title">
              Book a service
            </h2>

            <p>
              Sign in to choose a
              service and an available
              appointment.
            </p>
          </div>

          <CalendarBlank
            size={30}
            weight="duotone"
          />
        </div>

        <Link
          to="/sign-in"
          state={{
            from:
              location.pathname,
          }}
          className="btn btn--primary"
        >
          Sign in to book
        </Link>
      </section>
    );
  }


  // --------------------------------------------------
  // ONLY CUSTOMERS BOOK
  // --------------------------------------------------

  if (!isCustomer) {
    return null;
  }


  // --------------------------------------------------
  // BOOKING SUCCESS SCREEN
  // --------------------------------------------------

  if (confirmedBooking) {
    return (
      <section
        className="booking-form-card booking-confirmation"
        aria-labelledby="booking-confirmed-title"
      >
        <div className="booking-confirmation__icon">
          <CheckCircle
            size={52}
            weight="fill"
          />
        </div>

        <div className="booking-confirmation__content">
          <p className="booking-confirmation__eyebrow">
            Appointment booked
          </p>

          <h2 id="booking-confirmed-title">
            Booking confirmed
          </h2>

          <p className="booking-confirmation__message">
            Your appointment has
            been successfully
            confirmed.
          </p>


          <div className="booking-confirmation__details">
            <div className="booking-confirmation__service">
              <strong>
                {
                  confirmedBooking.service_name
                }
              </strong>

              {confirmedBooking.branch_name && (
                <span>
                  {
                    confirmedBooking.branch_name
                  }
                </span>
              )}
            </div>


            <div className="booking-confirmation__row">
              <span>
                <CalendarBlank
                  size={19}
                />

                {formatDate(
                  confirmedBooking.booking_date
                )}
              </span>

              <span>
                <Clock
                  size={19}
                />

                {formatTime(
                  confirmedBooking.booking_time
                )}
              </span>
            </div>
          </div>


          <div className="booking-confirmation__actions">
            <Link
              to="/my-bookings"
              className="btn btn--primary"
            >
              View my bookings
            </Link>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setConfirmedBooking(
                  null
                );

                setServiceId("");
                setBookingDate("");
                setBookingTime("");
                setSlots([]);
                setDurationMinutes(
                  null
                );
                setSlotStatus(
                  "idle"
                );
                setStatus("idle");
                setError("");
              }}
            >
              Book another service
            </button>
          </div>
        </div>
      </section>
    );
  }


  // --------------------------------------------------
  // FORM EVENTS
  // --------------------------------------------------

  function handleServiceChange(
    event
  ) {
    setServiceId(
      event.target.value
    );

    setBookingDate("");
    setBookingTime("");
    setSlots([]);
    setDurationMinutes(null);
    setError("");
  }


  function handleDateChange(
    event
  ) {
    setBookingDate(
      event.target.value
    );

    setBookingTime("");
    setError("");
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (
      !serviceId ||
      !bookingDate ||
      !bookingTime
    ) {
      setError(
        "Choose a service, date, and available time."
      );

      return;
    }


    setStatus("saving");
    setError("");


    try {
      const booking =
        await createBooking(
          serviceId,
          {
            booking_date:
              bookingDate,

            booking_time:
              bookingTime,
          }
        );


      // This replaces the form with
      // the success confirmation.
      setConfirmedBooking(
        booking
      );


      // Let parent page know a
      // booking was created.
      onBooked?.(booking);
    } catch (err) {
      setError(
        err.message ||
        "Could not create booking."
      );
    } finally {
      setStatus("idle");
    }
  }


  // --------------------------------------------------
  // BOOKING FORM
  // --------------------------------------------------

  return (
    <section
      className="booking-form-card"
      aria-labelledby="book-service-title"
    >
      <div className="booking-section-heading">
        <div>
          <h2 id="book-service-title">
            Book a service
          </h2>

          <p>
            Choose a service and
            date. Only available
            appointment times will
            be shown.
          </p>
        </div>

        <CalendarBlank
          size={30}
          weight="duotone"
        />
      </div>


      <form
        className="booking-form"
        onSubmit={handleSubmit}
      >
        {/* SERVICE */}

        <div className="booking-field">
          <label htmlFor="booking-service">
            Service
          </label>

          <select
            id="booking-service"
            value={serviceId}
            onChange={
              handleServiceChange
            }
          >
            <option value="">
              Choose a service
            </option>

            {services.map(
              (service) => (
                <option
                  key={
                    service.id
                  }
                  value={
                    service.id
                  }
                >
                  {
                    service.name
                  }
                </option>
              )
            )}
          </select>
        </div>


        {/* DATE */}

        {serviceId && (
          <div className="booking-field">
            <label htmlFor="booking-date">
              <CalendarBlank
                size={17}
              />

              Date
            </label>

            <input
              id="booking-date"
              type="date"
              min={todayString()}
              value={
                bookingDate
              }
              onChange={
                handleDateChange
              }
            />
          </div>
        )}


        {/* AVAILABLE TIMES */}

        {bookingDate && (
          <div className="booking-field">
            <label>
              <Clock
                size={17}
              />

              Available times
            </label>


            {durationMinutes && (
              <p>
                Each appointment
                takes{" "}
                {durationMinutes}{" "}
                minutes.
              </p>
            )}


            {slotStatus ===
              "loading" && (
                <p>
                  Loading available
                  times...
                </p>
              )}


            {slotStatus ===
              "ready" &&
              slots.length ===
              0 && (
                <p>
                  No available
                  appointments on
                  this date. Choose
                  another date.
                </p>
              )}


            {slotStatus ===
              "ready" &&
              slots.length >
              0 && (
                <div className="booking-slots">
                  {slots.map(
                    (slot) => (
                      <button
                        key={
                          slot
                        }
                        type="button"
                        className={
                          bookingTime ===
                            slot
                            ? "booking-slot booking-slot--selected"
                            : "booking-slot"
                        }
                        aria-pressed={
                          bookingTime ===
                          slot
                        }
                        onClick={() => {
                          setBookingTime(
                            slot
                          );

                          setError("");
                        }}
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


        {/* SELECTED APPOINTMENT */}

        {bookingTime && (
          <div className="booking-summary">
            <strong>
              Selected appointment
            </strong>

            <p>
              {formatDate(
                bookingDate
              )}
              {" at "}
              {formatTime(
                bookingTime
              )}
            </p>
          </div>
        )}


        {/* ERROR */}

        {error && (
          <p
            className="booking-message booking-message--error"
            role="alert"
          >
            {error}
          </p>
        )}


        {/* FOOTER */}

        <div className="booking-form__footer">
          <span>
            Your booking is
            confirmed immediately
            when you choose an
            available time.
          </span>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={
              status ===
              "saving" ||
              !bookingTime
            }
          >
            {status ===
              "saving"
              ? "Booking..."
              : "Confirm booking"}
          </button>
        </div>
      </form>
    </section>
  );
}