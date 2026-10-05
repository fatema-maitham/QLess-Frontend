import { useContext, useState } from "react";
import { Link, useLocation } from "react-router";
import { CalendarBlank, Clock } from "@phosphor-icons/react";
import { UserContext } from "../../contexts/UserContext";
import { ROLES, getRole } from "../../lib/helpers/roles";
import { createBooking } from "../../services/bookingService";
import "./Bookings.css";

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function BookServiceForm({
  services,
  onBooked,
}) {
  const { user } = useContext(UserContext);
  const location = useLocation();

  const [serviceId, setServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isCustomer = getRole(user) === ROLES.CUSTOMER;

  // Nothing to book
  if (!services?.length) {
    return null;
  }

  // Guests: show that booking exists, and send them back here after signing in
  if (!user) {
    return (
      <section className="booking-form-card" aria-labelledby="book-service-title">
        <div className="booking-section-heading">
          <div>
            <h2 id="book-service-title">Book a service</h2>
            <p>Sign in to choose a service and a time that works for you.</p>
          </div>

          <CalendarBlank size={30} weight="duotone" />
        </div>

        <Link to="/sign-in" state={{ from: location.pathname }} className="btn btn--primary">
          Sign in to book
        </Link>
      </section>
    );
  }

  // Owners, staff and admins can't book
  if (!isCustomer) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!serviceId || !bookingDate || !bookingTime) {
      setError("Choose a service, date, and time.");
      return;
    }

    setStatus("saving");
    setError("");
    setSuccess("");

    try {
      const booking = await createBooking(serviceId, {
        booking_date: bookingDate,
        booking_time: bookingTime,
      });

      setSuccess(
        `Booking requested for ${booking.service_name}. Waiting for confirmation.`
      );

      setServiceId("");
      setBookingDate("");
      setBookingTime("");

      onBooked?.(booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section
      className="booking-form-card"
      aria-labelledby="book-service-title"
    >
      <div className="booking-section-heading">
        <div>
          <h2 id="book-service-title">Book a service</h2>
          <p>
            Choose a service and request a time that works for you.
          </p>
        </div>

        <CalendarBlank size={30} weight="duotone" />
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="booking-field">
          <label htmlFor="booking-service">Service</label>

          <select
            id="booking-service"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
          >
            <option value="">Choose a service</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div className="booking-form__row">
          <div className="booking-field">
            <label htmlFor="booking-date">
              <CalendarBlank size={17} />
              Date
            </label>

            <input
              id="booking-date"
              type="date"
              min={todayString()}
              value={bookingDate}
              onChange={(event) =>
                setBookingDate(event.target.value)
              }
            />
          </div>

          <div className="booking-field">
            <label htmlFor="booking-time">
              <Clock size={17} />
              Time
            </label>

            <input
              id="booking-time"
              type="time"
              value={bookingTime}
              onChange={(event) =>
                setBookingTime(event.target.value)
              }
            />
          </div>
        </div>

        {error && (
          <p className="booking-message booking-message--error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="booking-message booking-message--success">
            {success}
          </p>
        )}

        <div className="booking-form__footer">
          <span>
            Your booking will be pending until the business confirms it.
          </span>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={status === "saving"}
          >
            {status === "saving"
              ? "Requesting..."
              : "Request booking"}
          </button>
        </div>
      </form>
    </section>
  );
}