import { getToken } from "../lib/helpers/jwt-helpers";

const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

const readError = (data) => {
  if (!data || !data.detail) {
    return "Something went wrong. Please try again.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((d) => d.msg.replace("Value error, ", ""))
      .join(". ");
  }

  return "Something went wrong. Please try again.";
};

const request = async (path, options = {}) => {
  let res;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(readError(data));
    error.status = res.status;
    throw error;
  }

  return data;
};

// Monthly and yearly plans with prices
const getPlans = () => request("/payments/plans");

// Is the plan active, and until when
const getSubscription = (businessId) =>
  request(`/businesses/${businessId}/subscription`);

// Receipts, newest first
const getPayments = (businessId) =>
  request(`/businesses/${businessId}/payments`);

// Pay for a plan. card = { card_holder, card_number, exp_month, exp_year, cvc }
const payForPlan = (businessId, plan, card) =>
  request(`/businesses/${businessId}/payments`, {
    method: "POST",
    body: JSON.stringify({ plan, ...card }),
  });

// "15.000 BHD"
const money = (amount, currency = "BHD") =>
  `${Number(amount || 0).toFixed(3)} ${currency}`;

// "12 Nov 2026"
const shortDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export {
  getPlans,
  getSubscription,
  getPayments,
  payForPlan,
  money,
  shortDate,
};