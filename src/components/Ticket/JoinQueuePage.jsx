import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, BellRinging, Clock, PersonSimpleWalk, Ticket, Users, Warning } from "@phosphor-icons/react";
import { UserContext } from "../../contexts/UserContext";
import { getRole, ROLES } from "../../lib/helpers/roles";
import { getQueue } from "../../services/queueService";
import { getBranch } from "../../services/branchService";
import { getBusiness } from "../../services/businessService";
import { getMyTickets, joinQueue } from "../../services/ticketService";
import { minutesText } from "./ticketHelpers";
import "./Ticket.css";

const STEPS = [
  { icon: Ticket, title: "Get your number", text: "Join from here. No need to stand in line." },
  { icon: BellRinging, title: "Watch your place", text: "Your ticket shows how many people are ahead." },
  { icon: PersonSimpleWalk, title: "Come back on time", text: "Head over at the return time and check in." },
];

export default function JoinQueuePage() {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const isCustomer = getRole(user) === ROLES.CUSTOMER;

  const [page, setPage] = useState({ status: "loading", error: "" });
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setPage({ status: "loading", error: "" });

    async function load() {
      const queue = await getQueue(queueId, { signal });
      const branch = await getBranch(queue.branch_id, { signal });
      const business = await getBusiness(branch.business_id, { signal });

      // Signed-in customer: are they already in this queue?
      let myTicket = null;
      if (isCustomer) {
        const mine = await getMyTickets({ signal }).catch(() => ({ active: [] }));
        myTicket = mine.active.find((t) => t.queue_id === queue.id) || null;
      }

      setPage({ status: "ready", queue, branch, business, myTicket });
    }

    load().catch((err) => {
      if (err.name === "AbortError") return;
      setPage({ status: err.status === 404 ? "notfound" : "error", error: err.message });
    });

    return () => controller.abort();
  }, [queueId, isCustomer, reloadKey]);

  const handleJoin = async () => {
    // Guests sign in first, then come straight back here
    if (!user) {
      navigate("/sign-in", { state: { from: location.pathname } });
      return;
    }

    setJoining(true);
    setJoinError("");
    try {
      const ticket = await joinQueue(queueId);
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setJoinError(err.message);
      setJoining(false);
    }
  };

  /* ---------- loading ---------- */
  if (page.status === "loading") {
    return (
      <main className="tk" aria-busy="true">
        <div className="tk__container">
          <div className="tk-skeleton tk-skeleton--line" />
          <div className="tk-skeleton tk-skeleton--card" />
        </div>
      </main>
    );
  }

  /* ---------- not found / error ---------- */
  if (page.status !== "ready") {
    const notFound = page.status === "notfound";
    return (
      <main className="tk">
        <div className="tk__container">
          <div className="tk-message" role={notFound ? undefined : "alert"}>
            <h1>{notFound ? "This queue isn't available" : "We couldn't load this queue"}</h1>
            <p>{notFound ? "It may have been removed." : `${page.error}. Please try again.`}</p>
            {notFound ? (
              <Link className="btn btn--primary" to="/businesses">
                Browse places
              </Link>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ---------- ready ---------- */
  const { queue, branch, business, myTicket } = page;
  const wait = queue.waiting_count * queue.average_service_minutes;
  const isFull = queue.max_capacity != null && queue.waiting_count >= queue.max_capacity;
  const canJoin = queue.status === "open" && !isFull;
  const chipLabel = { open: isFull ? "Full" : "Open", paused: "Paused" }[queue.status] || "Closed";

  let action;
  if (myTicket) {
    action = (
      <div className="tk-join__note tk-join__note--ok">
        <p>
          You're already in this queue with number <strong>{myTicket.queue_number}</strong>.
        </p>
        <Link className="btn btn--primary tk-btn-wide" to={`/tickets/${myTicket.id}`}>
          View my ticket
        </Link>
      </div>
    );
  } else if (queue.status !== "open") {
    action = (
      <div className="tk-join__note">
        <Warning size={20} weight="duotone" />
        <p>
          {queue.status === "paused"
            ? "This queue is paused for a moment. Please check back soon."
            : "This queue is closed right now."}
        </p>
      </div>
    );
  } else if (isFull) {
    action = (
      <div className="tk-join__note">
        <Warning size={20} weight="duotone" />
        <p>This queue is full right now. Please try again in a little while.</p>
      </div>
    );
  } else if (user && !isCustomer) {
    action = (
      <div className="tk-join__note">
        <Warning size={20} weight="duotone" />
        <p>Only customer accounts can join queues.</p>
      </div>
    );
  } else {
    action = (
      <>
        {joinError && (
          <div className="tk-alert" role="alert">
            <Warning size={20} weight="duotone" />
            <span>{joinError}</span>
          </div>
        )}
        <button
          type="button"
          className="btn btn--primary tk-btn-wide"
          onClick={handleJoin}
          disabled={joining}
        >
          {joining ? "Joining…" : user ? "Join queue" : "Sign in to join"}
        </button>
      </>
    );
  }

  return (
    <main className="tk">
      <div className="tk__container tk__container--narrow">
        <Link className="tk__back" to={`/branches/${branch.id}`}>
          <ArrowLeft size={18} />
          {business.name} · {branch.name}
        </Link>

        <section className="tk-join" aria-labelledby="join-title">
          <div className="tk-join__head">
            <span className={`tk-chip ${canJoin ? "tk-chip--in" : "tk-chip--off"}`}>
              {chipLabel}
            </span>
            <h1 id="join-title">{queue.name}</h1>
            <p>
              {business.name}, {branch.name}
            </p>
          </div>

          <dl className="tk-stats">
            <div>
              <dt>
                <Users size={18} weight="duotone" />
                Waiting
              </dt>
              <dd>{queue.waiting_count}</dd>
            </div>
            <div>
              <dt>
                <Clock size={18} weight="duotone" />
                About
              </dt>
              <dd>{minutesText(wait)}</dd>
            </div>
            <div>
              <dt>
                <Ticket size={18} weight="duotone" />
                Now serving
              </dt>
              <dd>{queue.current_number || "—"}</dd>
            </div>
          </dl>

          <ol className="tk-steps">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="tk-steps__icon">
                  <Icon size={20} weight="duotone" />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="tk-join__action">{action}</div>
        </section>
      </div>
    </main>
  );
}