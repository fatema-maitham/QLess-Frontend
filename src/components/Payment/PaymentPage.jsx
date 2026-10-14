import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import BusinessLayout from "../Business/BusinessLayout";
import CheckoutForm from "./CheckoutForm";
import { getMyBusiness } from "../../services/ownerBusinessService";

/* Step 2 of the owner setup: pay for a plan, then the business goes to the admin. */
export default function PaymentPage() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(undefined); // undefined = still loading
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMyBusiness()
      .then(setBusiness)
      .catch((err) => {
        setMessage(err.message);
        setBusiness(null);
      });
  }, []);

  if (business === undefined) {
    return <BusinessLayout step={2}><p className="ob-loading">Loading…</p></BusinessLayout>;
  }

  if (message) {
    return (
      <BusinessLayout step={2}>
        <div className="ob-alert" role="alert">{message}</div>
      </BusinessLayout>
    );
  }

  // No business yet → fill in the details first
  if (!business) return <Navigate to="/owner/business" replace />;

  // Already paid and sent → nothing to pay here (renewals live on the Billing page)
  if (business.is_paid && ["pending", "approved"].includes(business.approval_status)) {
    return <Navigate to="/owner" replace />;
  }

  return (
    <BusinessLayout step={2}>
      <h1>Choose your plan</h1>
      <p className="ob-sub">
        Pay for <b>{business.name}</b> and we'll send it straight to an admin for approval.
      </p>

      <CheckoutForm
        businessId={business.id}
        buttonText="Pay and send for approval"
        onPaid={() => navigate("/owner")}
      />

      <div className="ob-actions">
        <Link className="ob-btn ob-btn-ghost" to="/owner/business">Back to business details</Link>
      </div>
    </BusinessLayout>
  );
}