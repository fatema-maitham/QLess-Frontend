import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  Clock,
  HourglassMedium,
  Pause,
  PencilSimple,
  Play,
  Plus,
  Stop,
  Trash,
  UsersThree,
} from "@phosphor-icons/react";
import { getMe } from "../../services/accountService";
import { getBusiness } from "../../services/businessService";
import { getBranch, getBranchQueues, getBranchServices } from "../../services/branchService";
import {
  createQueue,
  deleteQueue,
  setQueueStatus,
  updateQueue,
} from "../../services/queueService";
import QueueForm from "./QueueForm";
import "../Details/Details.css";
import "./QueueSettings.css";

const QUEUE_STATUS = {
  open: { label: "Open", className: "dt__status--open" },
  paused: { label: "Paused", className: "dt__status--paused" },
  closed: { label: "Closed", className: "dt__status--closed" },
};

// Buttons for each status (matches what the backend allows)
const STATUS_ACTIONS = {
  closed: [{ to: "open", label: "Open", Icon: Play }],
  open: [
    { to: "paused", label: "Pause", Icon: Pause },
    { to: "closed", label: "Close", Icon: Stop },
  ],
  paused: [
    { to: "open", label: "Resume", Icon: Play },
    { to: "closed", label: "Close", Icon: Stop },
  ],
};

const byName = (a, b) => a.name.localeCompare(b.name);

export default function QueueSettingsPage() {
  const { branchId } = useParams();
  const [page, setPage] = useState({ status: "loading", error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [queues, setQueues] = useState([]);

  // null = form hidden, { queue: null } = new queue, { queue } = editing
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  /* ---------- load everything ---------- */
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setPage({ status: "loading", error: "" });

    async function load() {
      const branch = await getBranch(branchId, { signal });

      const [business, services, branchQueues, me] = await Promise.all([
        getBusiness(branch.business_id, { signal }),
        getBranchServices(branchId, { signal }),
        getBranchQueues(branchId, { signal }),
        // Not signed in -> null instead of an error
        getMe({ signal }).catch((err) => {
          if (err.status === 401) return null;
          throw err;
        }),
      ]);

      if (!me) {
        setPage({ status: "signin" });
        return;
      }

      if (me.role !== "owner" || me.id !== business.owner_id) {
        setPage({ status: "forbidden" });
        return;
      }

      setQueues([...branchQueues].sort(byName));
      setPage({ status: "ready", branch, business, services });
    }

    load().catch((err) => {
      if (err.name === "AbortError") return;
      setPage({
        status: err.status === 404 ? "notfound" : "error",
        error: err.message,
      });
    });

    return () => controller.abort();
  }, [branchId, reloadKey]);

  // Hide the success message after a few seconds
  useEffect(() => {
    if (notice?.type !== "success") return;
    const id = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  /* ---------- helpers ---------- */
  function putQueue(saved) {
    setQueues((prev) => [...prev.filter((q) => q.id !== saved.id), saved].sort(byName));
  }

  function openEditor(queue = null) {
    setFormError("");
    setConfirmId(null);
    setEditor({ queue });
  }

  function closeEditor() {
    setEditor(null);
    setFormError("");
  }

  /* ---------- create / edit ---------- */
  async function handleSubmit(payload, { openNow }) {
    setSaving(true);
    setFormError("");

    try {
      if (editor.queue) {
        const saved = await updateQueue(editor.queue.id, payload);
        putQueue(saved);
        setNotice({ type: "success", text: `${saved.name} saved.` });
        closeEditor();
        return;
      }

      const created = await createQueue(branchId, payload);
      putQueue(created);
      closeEditor();

      if (!openNow) {
        setNotice({ type: "success", text: `${created.name} created. Open it when you're ready.` });
        return;
      }

      try {
        const opened = await setQueueStatus(created.id, "open");
        putQueue(opened);
        setNotice({ type: "success", text: `${opened.name} is open. Customers can join now.` });
      } catch (err) {
        // Created, but couldn't open (e.g. business not approved yet)
        setNotice({ type: "error", text: `${created.name} was created but is still closed: ${err.message}` });
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  /* ---------- open / pause / close ---------- */
  async function handleStatus(queue, nextStatus) {
    setBusyId(queue.id);
    setNotice(null);

    try {
      const saved = await setQueueStatus(queue.id, nextStatus);
      putQueue(saved);
      setNotice({ type: "success", text: `${saved.name} is now ${QUEUE_STATUS[saved.status].label.toLowerCase()}.` });
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setBusyId(null);
    }
  }

  /* ---------- delete ---------- */
  async function handleDelete(queue) {
    setBusyId(queue.id);
    setNotice(null);

    try {
      await deleteQueue(queue.id);
      setQueues((prev) => prev.filter((q) => q.id !== queue.id));
      if (editor?.queue?.id === queue.id) closeEditor();
      setNotice({ type: "success", text: `${queue.name} deleted.` });
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  /* ---------- loading ---------- */
  if (page.status === "loading") {
    return (
      <main className="dt" aria-busy="true">
        <div className="dt__container">
          <div className="dt-skeleton dt-skeleton--title" />
          <div className="dt-skeleton dt-skeleton--line" />
          <div className="dt-skeleton dt-skeleton--block" />
        </div>
      </main>
    );
  }

  /* ---------- messages ---------- */
  const messages = {
    signin: {
      title: "Sign in to manage queues",
      text: "Only the business owner can create and edit queues.",
    },
    forbidden: {
      title: "This isn't your branch",
      text: "You can only manage queues for branches of your own business.",
    },
    notfound: {
      title: "This branch isn't available",
      text: "It may have been closed or removed.",
    },
    error: {
      title: "We couldn't load this branch",
      text: `${page.error}. Check your connection and try again.`,
    },
  };

  if (messages[page.status]) {
    const message = messages[page.status];
    return (
      <main className="dt">
        <div className="dt__container">
          <div className="dt__message" role={page.status === "error" ? "alert" : undefined}>
            <h1>{message.title}</h1>
            <p>{message.text}</p>
            {page.status === "error" ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Try again
              </button>
            ) : (
              <Link className="btn btn--primary" to={`/branches/${branchId}`}>
                Back to branch
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ---------- ready ---------- */
  const { branch, business, services } = page;
  const serviceName = (id) => services.find((s) => s.id === id)?.name;
  const openCount = queues.filter((q) => q.status === "open").length;

  return (
    <main className="dt qs">
      <div className="dt__container">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="dt__crumbs">
            <li>
              <Link to={`/businesses/${business.id}`}>{business.name}</Link>
            </li>
            <li>
              <Link to={`/branches/${branch.id}`}>{branch.name}</Link>
            </li>
            <li>
              <span aria-current="page">Queue settings</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="qs__header">
          <div>
            <p className="qs__eyebrow">{branch.name}</p>
            <h1 className="dt__title">Queue settings</h1>
            <p className="qs__summary">
              {queues.length} {queues.length === 1 ? "queue" : "queues"} · {openCount} open
            </p>
          </div>

          <button
            type="button"
            className="btn btn--primary qs__new"
            onClick={() => openEditor(null)}
            disabled={editor !== null && editor.queue === null}
          >
            <Plus size={18} weight="bold" />
            New queue
          </button>
        </header>

        {/* Success / error message */}
        <div className="qs__notice-slot" aria-live="polite">
          {notice && (
            <p className={`qs__notice qs__notice--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
              {notice.text}
            </p>
          )}
        </div>

        <div className={`qs__layout ${editor ? "has-editor" : ""}`}>
          {/* Queue list */}
          <section aria-label="Queues">
            {queues.length === 0 ? (
              <div className="qs__empty">
                <h2>No queues yet</h2>
                <p>Create your first queue so customers can join from their phone.</p>
                {!editor && (
                  <button type="button" className="btn btn--primary" onClick={() => openEditor(null)}>
                    <Plus size={18} weight="bold" />
                    Create a queue
                  </button>
                )}
              </div>
            ) : (
              <ul className="qs__list">
                {queues.map((queue) => {
                  const status = QUEUE_STATUS[queue.status] || QUEUE_STATUS.closed;
                  const actions = STATUS_ACTIONS[queue.status] || [];
                  const busy = busyId === queue.id;
                  const isEditing = editor?.queue?.id === queue.id;
                  const service = serviceName(queue.service_id);

                  return (
                    <li key={queue.id} className={`qs-card ${isEditing ? "is-editing" : ""}`}>
                      <div className="qs-card__top">
                        <div>
                          <span className={`dt__status ${status.className}`}>{status.label}</span>
                          <h2 className="qs-card__name">{queue.name}</h2>
                          <p className="qs-card__service">{service || "Any service"}</p>
                        </div>

                        <div className="qs-card__tools">
                          <button
                            type="button"
                            className="qs-icon-btn"
                            onClick={() => openEditor(queue)}
                            aria-label={`Edit ${queue.name}`}
                            disabled={busy}
                          >
                            <PencilSimple size={18} />
                          </button>
                          <button
                            type="button"
                            className="qs-icon-btn qs-icon-btn--danger"
                            onClick={() => setConfirmId(queue.id)}
                            aria-label={`Delete ${queue.name}`}
                            disabled={busy}
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>

                      <ul className="qs-card__facts">
                        <li>
                          <UsersThree size={16} />
                          <b>{queue.waiting_count}</b> waiting
                        </li>
                        <li>
                          <Clock size={16} />
                          <b>{queue.average_service_minutes}</b> min per person
                        </li>
                        <li>
                          <HourglassMedium size={16} />
                          <b>{queue.no_show_grace_minutes}</b> min grace
                        </li>
                        <li>
                          <UsersThree size={16} />
                          {queue.max_capacity ? (
                            <>
                              Max <b>{queue.max_capacity}</b>
                            </>
                          ) : (
                            "No limit"
                          )}
                        </li>
                      </ul>

                      {confirmId === queue.id ? (
                        <div className="qs-card__confirm" role="group" aria-label="Confirm delete">
                          <p>Delete {queue.name}? This can't be undone.</p>
                          <div className="qs-card__actions">
                            <button
                              type="button"
                              className="btn qs-btn--danger"
                              onClick={() => handleDelete(queue)}
                              disabled={busy}
                            >
                              {busy ? "Deleting…" : "Delete"}
                            </button>
                            <button
                              type="button"
                              className="btn btn--outline"
                              onClick={() => setConfirmId(null)}
                              disabled={busy}
                            >
                              Keep it
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="qs-card__actions">
                          {actions.map(({ to, label, Icon }) => (
                            <button
                              key={to}
                              type="button"
                              className={`btn ${to === "open" ? "btn--primary" : "btn--outline"} qs-btn`}
                              onClick={() => handleStatus(queue, to)}
                              disabled={busy}
                            >
                              <Icon size={16} weight="fill" />
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Create / edit form */}
          {editor && (
            <aside className="qs__panel">
              <QueueForm
                key={editor.queue?.id ?? "new"}
                queue={editor.queue}
                services={services}
                saving={saving}
                serverError={formError}
                onSubmit={handleSubmit}
                onCancel={closeEditor}
              />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}