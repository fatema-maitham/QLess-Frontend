import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import CheckoutForm from "./CheckoutForm";
import {
  getPayments,
  getSubscription,
  money,
  shortDate,
} from "../../services/paymentService";
import "./Payment.css";

const PLAN_NAMES = { monthly: "Monthly", yearly: "Yearly" };

const cardText = (payment) =>
  payment.card_last4
    ? `${(payment.card_brand || "card").replace(/^./, (c) => c.toUpperCase())} •••• ${payment.card_last4}`
    : "—";

/* Owner dashboard → Billing: plan status, renew, and receipts */
export default function OwnerBilling() {
  const { business, reload, toast } = useOutletContext();

  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  // Fetch the plan and the receipts together
  const fetchBilling = useCallback(
    () => Promise.all([getSubscription(business.id), getPayments(business.id)]),
    [business]
  );

  const show = ([sub, list]) => {
    setSubscription(sub);
    setPayments(list);
    setError("");
  };

  useEffect(() => {
    let cancelled = false;

    fetchBilling()
      .then((result) => {
        if (!cancelled) show(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchBilling]);

  const handlePaid = async (payment) => {
    setShowCheckout(false);
    toast?.(`Payment received · ${payment.reference}`);
    try {
      show(await fetchBilling());
    } catch (err) {
      setError(err.message);
    }
    reload?.();
  };

  if (loading) return null;

  if (error) {
    return (
      <div className="empty">
        <b>Couldn't load billing</b>
        <p>{error}</p>
      </div>
    );
  }

  const active = subscription?.is_paid;
  const endingSoon = active && subscription.days_left <= 7;

  return (
    <section className="pay-billing" data-view="billing">
      <div className="page-h">
        <h1>Billing</h1>
        <span className="sp" />
      </div>

      <div className={`pay-status ${active ? (endingSoon ? "soon" : "ok") : "off"}`}>
        <div>
          <span className="pay-status-tag">
            {active ? (endingSoon ? "Ending soon" : "Active") : "No active plan"}
          </span>
          <h2>
            {active
              ? `${PLAN_NAMES[subscription.plan] || "Your"} plan`
              : subscription?.paid_until
                ? "Your plan has ended"
                : "You haven't picked a plan yet"}
          </h2>
          <p>
            {active
              ? `Paid until ${shortDate(subscription.paid_until)} · ${subscription.days_left} ${subscription.days_left === 1 ? "day" : "days"} left`
              : subscription?.paid_until
                ? `It ended on ${shortDate(subscription.paid_until)}. Renew to keep your business running on QLess.`
                : "Pick a plan to keep your business running on QLess."}
          </p>
        </div>

        {!showCheckout && (
          <button type="button" className="pay-btn" onClick={() => setShowCheckout(true)}>
            {active ? "Extend plan" : "Pay now"}
          </button>
        )}
      </div>

      {showCheckout && (
        <div className="pay-card">
          <div className="pay-card-h">
            <h3>{active ? "Extend your plan" : "Choose a plan"}</h3>
            <button type="button" className="pay-link" onClick={() => setShowCheckout(false)}>
              Cancel
            </button>
          </div>
          {active && (
            <p className="pay-muted">
              The new time is added after {shortDate(subscription.paid_until)}, so you don't lose any days.
            </p>
          )}
          <CheckoutForm
            businessId={business.id}
            buttonText={active ? "Extend" : "Pay now"}
            onPaid={handlePaid}
          />
        </div>
      )}

      <div className="pay-card">
        <div className="pay-card-h">
          <h3>Payment history</h3>
          <span className="pay-muted">{payments.length} {payments.length === 1 ? "payment" : "payments"}</span>
        </div>

        {payments.length ? (
          <div className="pay-table-wrap">
            <table className="pay-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Receipt</th>
                  <th>Plan</th>
                  <th>Card</th>
                  <th>Covers</th>
                  <th className="num">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Date">{shortDate(p.created_at)}</td>
                    <td data-label="Receipt"><code>{p.reference}</code></td>
                    <td data-label="Plan">{PLAN_NAMES[p.plan] || p.plan}</td>
                    <td data-label="Card">{cardText(p)}</td>
                    <td data-label="Covers">
                      {p.status === "paid" ? `${shortDate(p.period_start)} – ${shortDate(p.period_end)}` : "—"}
                    </td>
                    <td data-label="Amount" className="num">{money(p.amount, p.currency)}</td>
                    <td data-label="Status">
                      <span className={`pay-pill ${p.status}`} title={p.failure_reason || ""}>
                        {p.status === "paid" ? "Paid" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pay-muted">No payments yet.</p>
        )}
      </div>
    </section>
  );
}