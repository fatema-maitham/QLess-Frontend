import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import { getSuspiciousActivity, updateSuspiciousActivity } from "../../services/adminService";
import { initial } from "../Owner/ownerSetup";
import { SearchBox, Tabs } from '../AdminPanel/AdminParts';
import { ago, matches, shortDate } from '../AdminPanel/adminUtils';
import { label, plural } from "./adminHelpers";
import "./Admin.css";

const SEVERITY = {
  high: { text: "High", cls: "bad" },
  medium: { text: "Medium", cls: "warn" },
  low: { text: "Low", cls: "off" },
};

const DECISION = {
  reviewed: { title: "Mark as reviewed", button: "Mark reviewed", done: "marked as reviewed" },
  dismissed: { title: "Dismiss this flag", button: "Dismiss flag", done: "dismissed" },
};

const stillRestricted = (item) =>
  !!item.user_restricted_until && new Date(item.user_restricted_until) > new Date();

export default function AdminSuspiciousPage() {
  const { toast } = useOutletContext();
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("open");
  const [severity, setSeverity] = useState("");
  const [q, setQ] = useState("");
  const [deciding, setDeciding] = useState(null); // { item, status }
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    getSuspiciousActivity({ signal: controller.signal })
      .then((data) => { setList(data); setError(""); })
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, []);

  function openDecision(item, status) {
    setDeciding({ item, status });
    setNote("");
    dialog.current?.showModal();
  }

  function closeDialog() {
    dialog.current?.close();
    setDeciding(null);
  }

  async function confirmDecision(event) {
    event.preventDefault();
    const { item, status } = deciding;
    setBusy(true);
    try {
      const saved = await updateSuspiciousActivity(item.id, { status, note: note.trim() });
      setList((prev) => prev.map((row) => (row.id === saved.id ? { ...row, ...saved } : row)));
      toast(`Flag for ${item.user_name} was ${DECISION[status].done}`);
      closeDialog();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="empty"><b>Couldn't load flagged activity</b><p>{error}</p></div>;
  if (!list) return null;

  const bySeverity = list.filter((item) => !severity || item.severity === severity);
  const count = (status) => bySeverity.filter((item) => item.status === status).length;
  const tabs = [
    { key: "open", label: "Open", count: count("open") },
    { key: "reviewed", label: "Reviewed", count: count("reviewed") },
    { key: "dismissed", label: "Dismissed", count: count("dismissed") },
    { key: "all", label: "All", count: bySeverity.length },
  ];

  const shown = bySeverity
    .filter((item) => tab === "all" || item.status === tab)
    .filter((item) => matches(`${item.user_name} ${item.user_email} ${item.activity_type} ${item.queue_name}`, q));

  function details(item) {
    const parts = [item.user_email];
    if (item.queue_name) parts.push(item.queue_name);
    parts.push(plural(item.user_no_show_count ?? 0, "no-show"));
    parts.push(`flagged ${ago(item.created_at)}`);
    return parts.join(" · ");
  }

  return (
    <section className="am-page">
      <div className="page-h">
        <h1>Suspicious activity</h1>
        <span className="sp" />
        <SearchBox value={q} onChange={setQ} placeholder="Search name or email" />
        <select className="sel" aria-label="Filter by severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {shown.length ? (
        <div className="list">
          {shown.map((item) => {
            const sev = SEVERITY[item.severity] || SEVERITY.low;
            const isOpen = item.status === "open";
            return (
              <div className={`li am-li am-li--top${isOpen ? "" : " off"}`} key={item.id}>
                <span className="ic">{initial(item.user_name)}</span>
                <div>
                  <b>{item.user_name} <span className="am-reason">· {label(item.activity_type)}</span></b>
                  <small>{details(item)}</small>
                  {item.description && <p className="am-quote">{item.description}</p>}
                  {stillRestricted(item) && (
                    <p className="am-flag">Can't join queues until {shortDate(item.user_restricted_until)}</p>
                  )}
                  {!isOpen && (
                    <small className="am-handled">
                      {label(item.status)} by {item.reviewer_name || "an admin"} · {ago(item.reviewed_at)}
                    </small>
                  )}
                </div>
                <span className={`st ${sev.cls}`}>{sev.text}</span>
                <span className="am-acts">
                  {isOpen ? (
                    <>
                      <button className="ok" type="button" onClick={() => openDecision(item, "reviewed")}>Reviewed</button>
                      <button className="mute" type="button" onClick={() => openDecision(item, "dismissed")}>Dismiss</button>
                    </>
                  ) : (
                    <span className={`st ${item.status === "reviewed" ? "open" : "off"}`}>{label(item.status)}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <b>{q ? "Nothing matches your search" : tab === "open" ? "No open flags" : "Nothing here"}</b>
          <p>
            {q
              ? "Try another name or email."
              : "Accounts are flagged automatically for repeated no-shows or for leaving many queues quickly."}
          </p>
        </div>
      )}

      <dialog className="am-dlg" ref={dialog} onClose={() => setDeciding(null)}>
        <form onSubmit={confirmDecision}>
          <h2>{deciding && DECISION[deciding.status].title}</h2>
          <p>
            {deciding?.item.user_name} · {label(deciding?.item.activity_type)}. Your note is saved in the audit log.
          </p>
          <div className="f">
            <label htmlFor="am-note">Note (optional)</label>
            <textarea
              id="am-note"
              value={note}
              maxLength={300}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why you made this decision"
            />
          </div>
          <div className="fa">
            <button className="btn btn-ghost" type="button" onClick={closeDialog}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {deciding && DECISION[deciding.status].button}
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}