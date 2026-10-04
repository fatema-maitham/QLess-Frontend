import { useEffect, useRef } from "react";
import { BellRinging, CheckCircle } from "@phosphor-icons/react";

/**
 * Full-screen "You're called!" pop-up.
 * - open: show or hide it
 * - onCheckIn: the check-in button
 * - onClose: "OK" button, Esc key or closing the pop-up
 */
export default function CalledAlert({ open, ticket, graceMinutes, busy, onCheckIn, onClose }) {
  const dialogRef = useRef(null);

  // <dialog> needs showModal()/close() to open and close it
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="tk-called" aria-labelledby="called-title" onClose={onClose}>
      <span className="tk-called__bell">
        <BellRinging size={40} weight="duotone" />
      </span>

      <p className="tk-called__place">{ticket.business_name}</p>
      <h2 id="called-title">You're called!</h2>
      <strong className="tk-called__number">{ticket.queue_number}</strong>
      {ticket.counter_number && <p className="tk-called__counter">Counter {ticket.counter_number}</p>}
      <p className="tk-called__text">
        Please go to {ticket.counter_number ? `counter ${ticket.counter_number}` : "the front desk"} now and
        check in within {graceMinutes} minutes.
      </p>

      <div className="tk-called__actions">
        <button type="button" className="btn tk-btn-danger tk-btn-wide" onClick={onCheckIn} disabled={busy}>
          <CheckCircle size={20} weight="bold" />
          {busy ? "Checking in…" : "I'm at the desk, check in"}
        </button>
        <button type="button" className="btn tk-called__ok tk-btn-wide" onClick={onClose}>
          OK, I'm going
        </button>
      </div>
    </dialog>
  );
}