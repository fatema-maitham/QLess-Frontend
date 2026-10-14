import { useEffect, useState } from "react";
import { getPlans, money, payForPlan } from "../../services/paymentService";
import "./Payment.css";

const EMPTY_CARD = { card_holder: "", card_number: "", expiry: "", cvc: "" };

// "4242424242424242" → "4242 4242 4242 4242"
const formatNumber = (value) =>
  value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

// "1228" → "12/28"
const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const brandOf = (number) => {
  const n = number.replace(/\D/g, "");
  if (n.startsWith("4")) return "Visa";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^5[1-5]/.test(n) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(n)) return "Mastercard";
  return "";
};

const CardIcon = () => (
  <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A827B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19M6.5 15h4" />
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

/**
 * Plan picker + card form. Used on the setup page and on the Billing page.
 * onPaid(payment) runs after a successful payment.
 */
export default function CheckoutForm({ businessId, onPaid, buttonText = "Pay now" }) {
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState("monthly");
  const [card, setCard] = useState(EMPTY_CARD);
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch((err) => setMessage(err.message));
  }, []);

  const chosen = plans.find((p) => p.id === plan);
  const brand = brandOf(card.card_number);

  const handleChange = (evt) => {
    setMessage("");
    const { name, value } = evt.target;

    let clean = value;
    if (name === "card_number") clean = formatNumber(value);
    if (name === "expiry") clean = formatExpiry(value);
    if (name === "cvc") clean = value.replace(/\D/g, "").slice(0, 4);

    setCard({ ...card, [name]: clean });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    const [month, year] = card.expiry.split("/");

    if (card.card_holder.trim().length < 2) {
      setMessage("Enter the name on the card.");
      return;
    }
    if (card.card_number.replace(/\D/g, "").length !== 16) {
      setMessage("Card number should be 16 digits.");
      return;
    }
    if (!month || !year || year.length !== 2) {
      setMessage("Enter the expiry date as MM/YY.");
      return;
    }
    if (card.cvc.length < 3) {
      setMessage("Enter the security code (CVC).");
      return;
    }

    setPaying(true);
    try {
      const payment = await payForPlan(businessId, plan, {
        card_holder: card.card_holder.trim(),
        card_number: card.card_number.replace(/\D/g, ""),
        exp_month: Number(month),
        exp_year: 2000 + Number(year),
        cvc: card.cvc,
      });
      setCard(EMPTY_CARD);
      onPaid?.(payment);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <form className="pay-form" onSubmit={handleSubmit} noValidate>
      {message && <div className="pay-alert" role="alert">{message}</div>}

      <fieldset className="pay-plans">
        <legend>Choose a plan</legend>

        {plans.map((p) => (
          <label key={p.id} className={`pay-plan ${plan === p.id ? "on" : ""}`}>
            <input
              type="radio"
              name="plan"
              value={p.id}
              checked={plan === p.id}
              onChange={() => setPlan(p.id)}
            />
            <span className="pay-plan-top">
              <b>{p.name}</b>
              {p.id === "yearly" && <span className="pay-save">Best value</span>}
            </span>
            <span className="pay-price">
              {Number(p.price).toFixed(3)} <small>{p.currency} / {p.id === "yearly" ? "year" : "month"}</small>
            </span>
            <span className="pay-plan-text">{p.description}</span>
          </label>
        ))}
      </fieldset>

      <div className="pay-field">
        <label htmlFor="card_holder">Name on card</label>
        <div className="pay-inp">
          <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A827B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          <input id="card_holder" name="card_holder" type="text" autoComplete="cc-name" value={card.card_holder} onChange={handleChange} />
        </div>
      </div>

      <div className="pay-field">
        <label htmlFor="card_number">Card number</label>
        <div className="pay-inp">
          <CardIcon />
          <input
            id="card_number"
            name="card_number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={card.card_number}
            onChange={handleChange}
          />
          {brand && <span className="pay-brand">{brand}</span>}
        </div>
      </div>

      <div className="pay-two">
        <div className="pay-field">
          <label htmlFor="expiry">Expiry</label>
          <div className="pay-inp">
            <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A827B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
            <input id="expiry" name="expiry" type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={handleChange} />
          </div>
        </div>
        <div className="pay-field">
          <label htmlFor="cvc">CVC</label>
          <div className="pay-inp">
            <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A827B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <input id="cvc" name="cvc" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="pay-submit">
        <button className="pay-btn" type="submit" disabled={paying || !chosen}>
          <LockIcon />
          {paying ? "Paying…" : chosen ? `${buttonText} · ${money(chosen.price, chosen.currency)}` : buttonText}
        </button>
        <span>We only keep the last 4 digits of your card.</span>
      </div>
    </form>
  );
}