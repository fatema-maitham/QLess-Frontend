import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Bell,
  BellRinging,
  CalendarBlank,
  CaretRight,
  Clock,
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
import { TICKET_STATUS, aheadText, clockTime, minutesText } from "../Ticket/ticketHelpers";
import { timeAgo, typeInfo } from "../Notifications/notificationHelpers";
import "../Ticket/Ticket.css";
import "../Bookings/Bookings.css";
import "./CustomerDashboard.css";

const MAX_DOTS = 5;

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

// Today as "2026-10-05" in the user's own time zone
function todayText() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Bookings that are still coming up, soonest first
function upcomingBookings(bookings) {
  const today = todayText();
  return bookings
    .filter((b) => ["pending", "confirmed"].includes(b.status) && b.booking_date >= today)
    .sort((a, b) => `${a.booking_date}${a.booking_time}`.localeCompare(`${b.booking_date}${b.booking_time}`));
}

// Grey dots for the people ahead, then "You" (same as the ticket page)
function PlaceTrack({ ahead }) {
  const dots = Math.min(ahead, MAX_DOTS);
  const extra = ahead - dots;

  return (
    <div className="tk-track" aria-hidden="true">
      {extra > 0 && <span className="tk-track__more">+{extra}</span>}
      {Array.from({ length: dots }, (_, i) => (
        <span key={i} className="tk-track__dot" />
      ))}
      <span className="tk-track__you">You</span>
    </div>
  );
}

// The ticket the customer is in right now: the same ticket as the ticket page,
// with the place in line next to it
function LiveTicket({ ticket }) {
  const status = TICKET_STATUS[ticket.status] || TICKET_STATUS.waiting;
  const isTurn = ticket.status === "called";

  return (
    <div className="cd-now">
      <Link
        to={`/tickets/${ticket.id}`}
        className={`tk-card cd-now__ticket ${isTurn ? "tk-card--turn" : ""}`}
        aria-label={`Open ticket number ${ticket.queue_number}`}
      >
        <div className="tk-card__head">
          <div>
            <strong>{ticket.business_name}</strong>
            <span>
              {ticket.branch_name} · {ticket.queue_name}
            </span>
          </div>
          <span className={`tk-chip ${status.className}`}>{status.label}</span>
        </div>

        <span className="tk-card__label">Your number</span>
        <strong className="tk-card__number">{ticket.queue_number}</strong>

        <div className="tk-card__foot">
          <span>Now serving</span>
          <strong>{ticket.current_number || "—"}</strong>
        </div>
      </Link>

      <section className={`tk-panel cd-now__panel ${isTurn ? "tk-panel--turn" : ""}`}>
        {ticket.status === "waiting" && (
          <>
            <h2 className="tk-panel__title">{aheadText(ticket.people_ahead)}</h2>
            <PlaceTrack ahead={ticket.people_ahead || 0} />

            <dl className="tk-stats tk-stats--two">
              <div>
                <dt>
                  <Clock size={18} weight="duotone" />
                  Wait
                </dt>
                <dd>~{minutesText(ticket.estimated_wait_minutes)}</dd>
              </div>
              <div>
                <dt>
                  <BellRinging size={18} weight="duotone" />
                  Come back at
                </dt>
                <dd>{clockTime(ticket.recommended_return_time)}</dd>
              </div>
            </dl>
          </>
        )}

        {ticket.status === "called" && (
          <>
            <BellRinging size={28} weight="duotone" />
            <h2 className="tk-panel__title">It's your turn</h2>
            <p>
              Please go to {ticket.counter_number ? `counter ${ticket.counter_number}` : "the front desk"} now
              and check in.
            </p>
          </>
        )}

        {ticket.status === "checked_in" && (
          <>
            <h2 className="tk-panel__title">You're checked in</h2>
            <p>Please stay close. The staff will serve you soon.</p>
          </>
        )}

        <Link to={`/tickets/${ticket.id}`} className="btn btn--primary cd-now__btn">
          Open my ticket <ArrowRight size={18} weight="bold" />
        </Link>
      </section>
    </div>
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

  const header = (
    <header className="page-head">
      <div>
        <h1>
          {greeting()}
          {firstName && `, ${firstName}`}
        </h1>
        <p>{today}. Here's everything about your queues and bookings.</p>
      </div>
      <Link to="/businesses" className="btn btn--primary cd-cta">
        <MagnifyingGlass size={18} weight="bold" />
        Find a place
      </Link>
    </header>
  );

  if (!data) {
    return (
      <main className="page cd">
        <div className="page__container" aria-busy="true">
          {header}
          <div className="page-skeleton" />
          <div className="page-skeleton cd-skeleton-big" />
        </div>
      </main>
    );
  }

  const [current, ...otherTickets] = data.active;

  const stats = [
    { label: "Queues you're in", value: data.active.length, to: "/my-tickets", Icon: Ticket },
    { label: "Upcoming bookings", value: data.bookings.length, to: "/my-bookings", Icon: CalendarBlank },
    { label: "Favorite places", value: data.favorites.length, to: "/favorites", Icon: Heart },
    { label: "Unread updates", value: data.unread, to: "/notifications", Icon: Bell },
  ];

  return (
    <main className="page cd">
      <div className="page__container">
        {header}

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

        {/* ---------- Numbers (same boxes as the ticket page) ---------- */}
        <div className="cd-stats">
          {stats.map(({ label, value, to, Icon }) => (
            <Link key={label} to={to} className="cd-stat">
              <span className="cd-stat__label">
                <Icon size={18} weight="duotone" />
                {label}
              </span>
              <strong>{value}</strong>
            </Link>
          ))}
        </div>

        {/* ---------- Right now ---------- */}
        <section className="cd-section" aria-labelledby="cd-now-title">
          <div className="cd-section__head">
            <h2 id="cd-now-title">Right now</h2>
            <Link to="/my-tickets">All my queues</Link>
          </div>

          {current ? (
            <>
              <LiveTicket ticket={current} />

              {otherTickets.length > 0 && (
                <ul className="tk-list">
                  {otherTickets.map((ticket) => (
                    <li key={ticket.id}>
                      <Link className="tk-row" to={`/tickets/${ticket.id}`}>
                        <span className="tk-row__number">{ticket.queue_number}</span>
                        <span className="tk-row__body">
                          <strong>{ticket.business_name}</strong>
                          <span>
                            {ticket.branch_name} · {ticket.queue_name}
                          </span>
                          <span className="tk-row__detail">{aheadText(ticket.people_ahead)}</span>
                        </span>
                        <CaretRight size={18} className="tk-row__arrow" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="page-empty page-empty--small">
              <span className="page-empty__icon">
                <Ticket size={28} weight="duotone" />
              </span>
              <h3>You're not in any queue</h3>
              <p>Find a place, join its queue, and wait wherever you like.</p>
              <Link to="/businesses" className="btn btn--primary">
                Browse places
              </Link>
            </div>
          )}
        </section>

        <div className="cd-grid">
          {/* ---------- Bookings ---------- */}
          <section className="cd-section" aria-labelledby="cd-bookings-title">
            <div className="cd-section__head">
              <h2 id="cd-bookings-title">Upcoming bookings</h2>
              <Link to="/my-bookings">See all</Link>
            </div>

            {data.bookings.length > 0 ? (
              <ul className="cd-list">
                {data.bookings.slice(0, 3).map((booking) => (
                  <li key={booking.id}>
                    <Link to="/my-bookings" className="cd-item">
                      <span className="cd-item__icon">
                        <CalendarBlank size={20} weight="duotone" />
                      </span>
                      <span className="cd-item__text">
                        <strong>{booking.service_name}</strong>
                        <span>
                          {booking.business_name} · {booking.branch_name}
                        </span>
                        <span className="cd-item__meta">{bookingWhen(booking)}</span>
                      </span>
                      <span className={`booking-status booking-status--${booking.status}`}>
                        {booking.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="page-empty page-empty--small">
                <p>No bookings coming up. Book a service from any place's page.</p>
              </div>
            )}
          </section>

          {/* ---------- Notifications ---------- */}
          <section className="cd-section" aria-labelledby="cd-updates-title">
            <div className="cd-section__head">
              <h2 id="cd-updates-title">Latest updates</h2>
              <Link to="/notifications">See all</Link>
            </div>

            {data.notifications.length > 0 ? (
              <ul className="cd-list">
                {data.notifications.slice(0, 3).map((note) => {
                  const { Icon } = typeInfo(note.type);
                  return (
                    <li key={note.id}>
                      <Link to="/notifications" className={`cd-item ${note.is_read ? "" : "is-unread"}`}>
                        <span className="cd-item__icon">
                          <Icon size={20} weight="duotone" />
                        </span>
                        <span className="cd-item__text">
                          <strong>{note.title}</strong>
                          {note.message && <span>{note.message}</span>}
                          <span className="cd-item__meta">{timeAgo(note.created_at)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="page-empty page-empty--small">
                <p>No updates yet. We'll tell you here when your turn is close.</p>
              </div>
            )}
          </section>
        </div>

        {/* ---------- Favorites ---------- */}
        <section className="cd-section" aria-labelledby="cd-favs-title">
          <div className="cd-section__head">
            <h2 id="cd-favs-title">Your favorite places</h2>
            <Link to="/favorites">See all</Link>
          </div>

          {data.favorites.length > 0 ? (
            <ul className="cd-favs">
              {data.favorites.slice(0, 4).map((fav) => (
                <li key={fav.id}>
                  <Link to={`/businesses/${fav.business_id}`} className="cd-item cd-item--fav">
                    <span className="cd-fav__logo">
                      {fav.business.image ? (
                        <img src={fav.business.image} alt="" />
                      ) : (
                        fav.business.name.charAt(0)
                      )}
                    </span>
                    <span className="cd-item__text">
                      <strong>{fav.business.name}</strong>
                      <span>{fav.business.category?.name || "Business"}</span>
                    </span>
                    <ArrowRight size={16} weight="bold" className="cd-item__arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="page-empty page-empty--small">
              <p>Tap the heart on a place's page to keep it here.</p>
              <Link to="/businesses" className="btn btn--primary">
                Browse places
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}