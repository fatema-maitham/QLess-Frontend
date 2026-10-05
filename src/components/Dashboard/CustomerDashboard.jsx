import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Bell,
  CalendarBlank,
  Heart,
  MagnifyingGlass,
  Ticket,
} from "@phosphor-icons/react";
import { UserContext } from "../../contexts/UserContext";
import { getMyTickets } from "../../services/ticketService";
import { getMyBookings } from "../../services/bookingService";
import { getFavorites } from "../../services/favoriteService";
import { getNotifications } from "../../services/notificationService";
import useNoShowStatus from "../../hooks/useNoShowStatus";
import NoShowBanner from "../NoShow/NoShowBanner";
import { TICKET_STATUS, aheadText, minutesText } from "../Ticket/ticketHelpers";
import { timeAgo } from "../Notifications/notificationHelpers";
import "../Ticket/Ticket.css";
import "./CustomerDashboard.css";

// "Good morning" / "Good afternoon" / "Good evening"
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// "2026-10-08" + "10:30:00" -> "Thu 8 Oct · 10:30 AM"
function bookingWhen(booking) {
  const date = new Date(`${booking.booking_date}T${booking.booking_time}`);
  const day = date.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

// Bookings that are still coming up, soonest first
function upcomingBookings(bookings) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return bookings
    .filter((b) => ["pending", "confirmed"].includes(b.status) && b.booking_date >= today)
    .sort((a, b) => `${a.booking_date}${a.booking_time}`.localeCompare(`${b.booking_date}${b.booking_time}`));
}

// The big card for the ticket the customer is in right now
function LiveTicket({ ticket }) {
  const status = TICKET_STATUS[ticket.status] || TICKET_STATUS.waiting;
  const isTurn = ticket.status === "called";

  let detail = aheadText(ticket.people_ahead);
  if (ticket.status === "called") detail = "It's your turn. Go to the front desk now.";
  if (ticket.status === "checked_in") detail = "You're checked in. Please stay close.";

  return (
    <Link to={`/tickets/${ticket.id}`} className={`cd-live ${isTurn ? "cd-live--turn" : ""}`}>
      <div className="cd-live__number">
        <span>Your number</span>
        <strong>{ticket.queue_number}</strong>
      </div>

      <div className="cd-live__body">
        <span className={`tk-chip ${status.className}`}>{status.label}</span>
        <h3>{ticket.business_name}</h3>
        <p>
          {ticket.branch_name} · {ticket.queue_name}
        </p>
        <p className="cd-live__detail">{detail}</p>
      </div>

      {ticket.status === "waiting" && (
        <div className="cd-live__wait">
          <span>Estimated wait</span>
          <strong>{minutesText(ticket.estimated_wait_minutes)}</strong>
        </div>
      )}

      <span className="cd-live__open">
        Open ticket <ArrowRight size={16} weight="bold" />
      </span>
    </Link>
  );
}

export default function CustomerDashboard() {
  const { user } = useContext(UserContext);
  const noShow = useNoShowStatus();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };

    // Load everything at once. If one part fails, the rest still shows.
    Promise.allSettled([
      getMyTickets(options),
      getMyBookings(options),
      getFavorites(options),
      getNotifications(options),
    ]).then(([tickets, bookings, favorites, notifications]) => {
      if (controller.signal.aborted) return;

      const failed = [tickets, bookings, favorites, notifications].find((r) => r.status === "rejected");
      if (failed) setError(failed.reason.message);

      setData({
        active: tickets.value?.active || [],
        history: tickets.value?.history || [],
        bookings: upcomingBookings(bookings.value || []),
        favorites: favorites.value || [],
        notifications: notifications.value?.notifications || [],
        unread: notifications.value?.unreadCount || 0,
      });
    });

    return () => controller.abort();
  }, []);

  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const today = new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });

  if (!data) {
    return (
      <main className="cd">
        <div className="cd__container" aria-busy="true">
          <div className="cd-skeleton cd-skeleton--head" />
          <div className="cd-skeleton cd-skeleton--card" />
        </div>
      </main>
    );
  }

  const stats = [
    { label: "In a queue", value: data.active.length, to: "/my-tickets", Icon: Ticket },
    { label: "Upcoming bookings", value: data.bookings.length, to: "/my-bookings", Icon: CalendarBlank },
    { label: "Favorites", value: data.favorites.length, to: "/favorites", Icon: Heart },
    { label: "Unread", value: data.unread, to: "/notifications", Icon: Bell },
  ];

  return (
    <main className="cd">
      <div className="cd__container">
        {/* ---------- Hello ---------- */}
        <header className="cd-head">
          <div>
            <span className="cd-head__date">{today}</span>
            <h1>
              {greeting()}
              {firstName && `, ${firstName}`}
            </h1>
            <p>Your queues, bookings and favorite places, all in one place.</p>
          </div>
          <Link to="/businesses" className="btn btn--primary cd-head__cta">
            <MagnifyingGlass size={18} weight="bold" />
            Find a place
          </Link>
        </header>

        {noShow && noShow.state !== "ok" && (
          <div className="cd-banner">
            <NoShowBanner status={noShow} />
          </div>
        )}

        {error && (
          <p className="cd-error" role="alert">
            Some of your information didn't load: {error}
          </p>
        )}

        {/* ---------- Numbers ---------- */}
        <ul className="cd-stats">
          {stats.map(({ label, value, to, Icon }) => (
            <li key={label}>
              <Link to={to} className="cd-stat">
                <span className="cd-stat__icon">
                  <Icon size={20} weight="bold" />
                </span>
                <strong>{value}</strong>
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* ---------- Right now ---------- */}
        <section className="cd-section" aria-labelledby="cd-now">
          <div className="cd-section__head">
            <h2 id="cd-now">Right now</h2>
            <Link to="/my-tickets">All my queues</Link>
          </div>

          {data.active.length > 0 ? (
            <div className="cd-live-list">
              {data.active.map((ticket) => (
                <LiveTicket key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="cd-empty">
              <span className="cd-empty__icon">
                <Ticket size={26} weight="duotone" />
              </span>
              <div>
                <h3>You're not in any queue</h3>
                <p>Find a place, join its queue, and wait wherever you like.</p>
              </div>
              <Link to="/businesses" className="btn btn--outline">
                Browse places
              </Link>
            </div>
          )}
        </section>

        <div className="cd-grid">
          {/* ---------- Bookings ---------- */}
          <section className="cd-section cd-card" aria-labelledby="cd-bookings">
            <div className="cd-section__head">
              <h2 id="cd-bookings">Upcoming bookings</h2>
              <Link to="/my-bookings">See all</Link>
            </div>

            {data.bookings.length > 0 ? (
              <ul className="cd-list">
                {data.bookings.slice(0, 3).map((booking) => (
                  <li key={booking.id} className="cd-list__row">
                    <span className="cd-list__icon">
                      <CalendarBlank size={18} weight="bold" />
                    </span>
                    <span className="cd-list__text">
                      <strong>{booking.service_name}</strong>
                      <span>
                        {booking.business_name} · {booking.branch_name}
                      </span>
                      <span className="cd-list__meta">{bookingWhen(booking)}</span>
                    </span>
                    <span className={`cd-pill cd-pill--${booking.status}`}>{booking.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cd-none">No bookings coming up. Book a service from any place's page.</p>
            )}
          </section>

          {/* ---------- Notifications ---------- */}
          <section className="cd-section cd-card" aria-labelledby="cd-notes">
            <div className="cd-section__head">
              <h2 id="cd-notes">Latest updates</h2>
              <Link to="/notifications">See all</Link>
            </div>

            {data.notifications.length > 0 ? (
              <ul className="cd-list">
                {data.notifications.slice(0, 3).map((note) => (
                  <li key={note.id} className={`cd-list__row ${note.is_read ? "" : "is-unread"}`}>
                    <span className="cd-list__icon">
                      <Bell size={18} weight="bold" />
                    </span>
                    <span className="cd-list__text">
                      <strong>{note.title}</strong>
                      {note.message && <span>{note.message}</span>}
                      <span className="cd-list__meta">{timeAgo(note.created_at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cd-none">No updates yet. We'll tell you here when your turn is close.</p>
            )}
          </section>
        </div>

        {/* ---------- Favorites ---------- */}
        <section className="cd-section" aria-labelledby="cd-favs">
          <div className="cd-section__head">
            <h2 id="cd-favs">Your favorite places</h2>
            <Link to="/favorites">See all</Link>
          </div>

          {data.favorites.length > 0 ? (
            <ul className="cd-favs">
              {data.favorites.slice(0, 4).map((fav) => (
                <li key={fav.id}>
                  <Link to={`/businesses/${fav.business_id}`} className="cd-fav">
                    <span className="cd-fav__img">
                      {fav.business.image ? (
                        <img src={fav.business.image} alt="" />
                      ) : (
                        fav.business.name.charAt(0)
                      )}
                    </span>
                    <span className="cd-fav__text">
                      <strong>{fav.business.name}</strong>
                      <span>{fav.business.category?.name || "Business"}</span>
                    </span>
                    <ArrowRight size={16} weight="bold" className="cd-fav__arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cd-none">
              Tap the heart on a place's page to keep it here. <Link to="/businesses">Browse places</Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}