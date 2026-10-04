import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import BusinessLayout from './BusinessLayout';
import { getMyBusiness } from '../../services/ownerBusinessService';

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const BizCard = ({ business, pill, pillClass }) => (
  <div className="ob-biz">
    <div className="lg">
      {business.image ? <img src={business.image} alt="" /> : business.name[0].toUpperCase()}
    </div>
    <div>
      <b>{business.name}</b>
      <span>{business.category?.name || 'No category yet'}</span>
    </div>
    <span className={`ob-pill ${pillClass}`}>{pill}</span>
  </div>
);

const OwnerHome = () => {
  const [business, setBusiness] = useState(undefined); // undefined = still loading
  const [message, setMessage] = useState('');

    useEffect(() => {
    getMyBusiness()
      .then((b) => {
        if (b?.approval_status === 'approved') {
          const key = `qless-approved-seen-${b.id}`;
          setFirstTime(!localStorage.getItem(key));
          localStorage.setItem(key, 'yes');
        }
        setBusiness(b);
      })
      .catch((err) => {
        setMessage(err.message);
        setBusiness(null);
      });
  }, []);

  if (business === undefined) {
    return <BusinessLayout step={1}><p className="ob-loading">Loading…</p></BusinessLayout>;
  }

  if (message) {
    return (
      <BusinessLayout step={1}>
        <div className="ob-alert" role="alert">{message}</div>
      </BusinessLayout>
    );
  }

  // No business yet, or still a draft → the form
  if (!business || business.approval_status === 'draft') {
    return <Navigate to="/owner/business" replace />;
  }

  // Waiting for the admin
  if (business.approval_status === 'pending') {
    return (
      <BusinessLayout step={2}>
        <span className="ob-tag wait"><i></i>Under review</span>
        <h1>Thanks, we got it.</h1>
        <p className="ob-sub">
          An admin is checking your business now. Once it's approved, visitors can find it and
          you can open your first queue.
        </p>
        <BizCard business={business} pill="Pending" pillClass="" />
        <dl className="ob-dl">
          <dt>Sent</dt><dd>{formatDate(business.updated_at || business.created_at)}</dd>
          {business.phone && (<><dt>Phone</dt><dd>{business.phone}</dd></>)}
          {business.email && (<><dt>Email</dt><dd>{business.email}</dd></>)}
        </dl>
        <div className="ob-actions">
          <Link className="ob-btn ob-btn-ghost big" to="/owner/business">Edit details</Link>
        </div>
      </BusinessLayout>
    );
  }

  // Rejected by the admin
  if (business.approval_status === 'rejected') {
    return (
      <BusinessLayout step={2}>
        <span className="ob-tag no">Needs changes</span>
        <h1>Almost there.</h1>
        <p className="ob-sub">
          Your business wasn't approved yet. Fix the point below and send it again.
        </p>
        <BizCard business={business} pill="Rejected" pillClass="no" />
        <div className="ob-reason">
          <small>Note from admin</small>
          {business.rejection_reason || 'No reason was given. Check your details and send again.'}
        </div>
        <div className="ob-actions">
          <Link className="ob-btn ob-btn-primary" to="/owner/business">Edit and resubmit</Link>
        </div>
      </BusinessLayout>
    );
  }

  // Approved → straight to the dashboard
    // Already saw the approved page before → go to the dashboard
  if (!firstTime) return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/owner/dashboard" replace />;
};

export default OwnerHome;