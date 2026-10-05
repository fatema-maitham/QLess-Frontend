import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CaretRight, Ticket } from "@phosphor-icons/react";
import { getMyTickets } from "../../services/ticketService";
import useNoShowStatus from "../../hooks/useNoShowStatus";
import NoShowBanner from "../NoShow/NoShowBanner";
import { TICKET_STATUS, aheadText, clockTime, shortDate } from "./ticketHelpers";
import "./Ticket.css";

const TABS = [
  { key: "active", label: "Active" },
  { key: "history", label: "History" },
];

// One row in the list
function TicketRow({ ticket }) {
  const status = TICKET_STATUS[ticket.status] || TICKET_STATUS.waiting;

  let detail = `${shortDate(ticket.joined_at)}, ${clockTime(ticket.joined_at)}`;
  if (ticket.status === "waiting") detail = aheadText(ticket.people_ahead);
  if (ticket.status === "called") detail = "Go to the front desk now";
  if (ticket.status === "checked_in") detail = "Checked in, please stay close";

  return (
    <li>
      <Link
        className={`tk-row ${ticket.status === "called" ? "tk-row--turn" : ""}`}
        to={`/tickets/${ticket.id}`}
      >
        <span className="tk-row__number">{ticket.queue_number}</span>
        <span className="tk-row__body">
          <strong>{ticket.business_name}</strong>
          <span>
            {ticket.branch_name} · {ticket.queue_name}
          </span>
          <span className="tk-row__detail">{detail}</span>
        </span>
        <span className={`tk-chip ${status.className}`}>{status.label}</span>
        <CaretRight size={18} className="tk-row__arrow" />
      </Link>
    </li>
  );
}

export default function MyTicketsPage() {
  const [tab, setTab] = useState("active");
  const [page, setPage] = useState({ status: "loading", error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const noShow = useNoShowStatus();

  useEffect(() => {
    const controller = new AbortController();
    setPage({ status: "loading", error: "" });

    getMyTickets({ signal: controller.signal })
      .then((tickets) => {
        setPage({ status: "ready", ...tickets });
        // Nothing active? Show the history straight away
        if (tickets.active.length === 0 && tickets.history.length > 0) setTab("history");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setPage({ status: "error", error: err.message });
      });

    return () => controller.abort();
  }, [reloadKey]);

  const list = page.status === "ready" ? page[tab] : [];

  return (
    <main className="page tk">
      <div className="page__container">
        <div className="page__narrow">
          <header className="page-head">
            <div>
              <h1>My queues</h1>
              <p>Your places in line, and the queues you joined before.</p>
            </div>
          </header>

          {noShow && noShow.state !== "ok" && (
            <div className="tk-ns">
              <NoShowBanner status={noShow} />
            </div>
          )}

          <div className="tk-tabs" role="tablist" aria-label="Tickets">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                id={`tab-${key}`}
                aria-selected={tab === key}
                aria-controls="tickets-panel"
                className="tk-tabs__tab"
                onClick={() => setTab(key)}
              >
                {label}
                {page.status === "ready" && <span className="tk-tabs__count">{page[key].length}</span>}
              </button>
            ))}
          </div>

          <div id="tickets-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            {page.status === "loading" && (
              <div aria-busy="true">
                <div className="page-skeleton" />
                <div className="page-skeleton" />
              </div>
            )}

            {page.status === "error" && (
              <div className="page-empty" role="alert">
                <h2>We couldn't load your queues</h2>
                <p>{page.error}. Please try again.</p>
                <button type="button" className="btn btn--primary" onClick={() => setReloadKey((k) => k + 1)}>
                  Try again
                </button>
              </div>
            )}

            {page.status === "ready" && list.length === 0 && (
              <div className="page-empty">
                <span className="page-empty__icon">
                  <Ticket size={28} weight="duotone" />
                </span>
                <h2>{tab === "active" ? "You're not in any queue" : "No past queues yet"}</h2>
                <p>Find a place and join its queue from your phone.</p>
                <Link className="btn btn--primary" to="/businesses">
                  Browse places
                </Link>
              </div>
            )}

            {page.status === "ready" && list.length > 0 && (
              <ul className="tk-list">
                {list.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}