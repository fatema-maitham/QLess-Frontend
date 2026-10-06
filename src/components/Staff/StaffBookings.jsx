import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
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

const STATUSES = [
  { id: "", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(value) {
  if (!value) return "";
  const [hour, minute] = value.split(":").map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Staff: bookings for their branch, inside the staff dashboard
export default function StaffBookings() {
  const { me } = useOutletContext();
  const branchId = me.branch.id;

  const [bookings, setBookings] = useState([]);
  const [pageStatus, setPageStatus] = useState("loading");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
    const controller = new AbortController();

    getBranchBookings(branchId, {
      status: statusFilter || undefined,
      bookingDate: dateFilter || undefined,
      signal: controller.signal,
    })
      .then((list) => {
        setBookings(list);
        setPageStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setPageStatus("error");
      });

    return () => controller.abort();
  }, [branchId, statusFilter, dateFilter]);

  async function changeStatus(bookingId, nextStatus) {
    setUpdatingId(bookingId);
    setError("");

    try {
      const updated = await updateBookingStatus(bookingId, nextStatus);
      setBookings((current) =>
        statusFilter && updated.status !== statusFilter
          ? current.filter((booking) => booking.id !== bookingId)
          : current.map((booking) => (booking.id === bookingId ? updated : booking))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="sb">
      <div className="page-h">
        <div className="cp-title">
          <h1>Bookings</h1>
          <p className="cp-sub">{me.branch.name} · {me.business.name}</p>
        </div>
        <span className="sp" />
        {pageStatus === "ready" && (
          <span className="sb-count">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
          </span>
        )}
      </div>

      {/* filters */}
      <div className="sb-filters">
        <div className="sh-filters" role="group" aria-label="Filter by status">
          {STATUSES.map((item) => (
            <button
              key={item.id || "all"}
              type="button"
              aria-pressed={statusFilter === item.id}
              className={statusFilter === item.id ? "on" : ""}
                            onClick={() => {
                if (item.id === statusFilter) return;

                setPageStatus("loading");
                setError("");
                setStatusFilter(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="sb-date">
          <CalendarBlank size={18} />
          <span className="sb-sr">Date</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </label>

        {(statusFilter || dateFilter) && (
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

      {error && pageStatus === "ready" && (
        <p className="sb-error" role="alert">{error}</p>
      )}

      {pageStatus === "loading" && <div className="sh-skeleton" aria-busy="true" />}

      {pageStatus === "error" && (
        <div className="empty" role="alert">
          <b>We couldn't load these bookings</b>
          <p>{error}</p>
        </div>
      )}

      {pageStatus === "ready" && bookings.length === 0 && (
        <div className="empty">
          <CalendarBlank size={40} weight="duotone" />
          <b>No bookings found</b>
          <p>
            {statusFilter || dateFilter
              ? "There are no bookings matching these filters."
              : "When visitors book a time at your branch, they'll show up here."}
          </p>
        </div>
      )}

      {pageStatus === "ready" && bookings.length > 0 && (
        <div className="sb-grid">
          {bookings.map((booking) => {
            const busy = updatingId === booking.id;
            const open = booking.status === "pending" || booking.status === "confirmed";

            return (
              <article key={booking.id} className={`sb-card is-${booking.status}`}>
                <div className="sb-card__top">
                  <div className="sb-when">
                    <b>{formatTime(booking.booking_time)}</b>
                    <span>{formatDate(booking.booking_date)}</span>
                  </div>
                  <span className={`sb-status sb-status--${booking.status}`}>
                    {booking.status}
                  </span>
                </div>

                <h2>{booking.service_name}</h2>

                <div className="sb-details">
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
                    <Clock size={17} />
                    Booking #{booking.id}
                  </span>
                </div>

                {open && (
                  <div className="sb-actions">
                    {booking.status === "pending" && (
                      <button
                        type="button"
                        className="st-btn sb-btn"
                        disabled={busy}
                        onClick={() => changeStatus(booking.id, "confirmed")}
                      >
                        <Check size={17} weight="bold" />
                        Confirm
                      </button>
                    )}

                    {booking.status === "confirmed" && (
                      <button
                        type="button"
                        className="st-btn sb-btn"
                        disabled={busy}
                        onClick={() => changeStatus(booking.id, "completed")}
                      >
                        <CheckCircle size={17} weight="bold" />
                        Complete
                      </button>
                    )}

                    <button
                      type="button"
                      className="st-btn ghost sb-btn"
                      disabled={busy}
                      onClick={() => changeStatus(booking.id, "cancelled")}
                    >
                      <X size={17} />
                      Cancel
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
