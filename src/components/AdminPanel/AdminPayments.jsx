import { useEffect, useState } from 'react';
import { getAdminPayments } from '../../services/adminManageService';
import { money, shortDate } from '../../services/paymentService';
import { initial } from '../Owner/ownerSetup';
import { Icon } from './AdminLayout';
import { SearchBox, Tabs } from './AdminParts';
import { ago, matches } from './adminUtils';
import './AdminPayments.css';

const PLAN_NAMES = { monthly: 'Monthly', yearly: 'Yearly' };

const cardText = (p) =>
  p.card_last4
    ? `${(p.card_brand || 'card').replace(/^./, (c) => c.toUpperCase())} •••• ${p.card_last4}`
    : '';

/* Admin → Payments: every owner payment on the platform */
export default function AdminPayments() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  // fixed when the page opens, used for "last 30 days"
  const [openedAt] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();
    getAdminPayments({ signal: controller.signal })
      .then((data) => { setList(data); setError(''); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, []);

  if (error) return <div className="empty"><b>Couldn't load payments</b><p>{error}</p></div>;
  if (!list) return null;

  const paid = list.filter((p) => p.status === 'paid');
  const failed = list.filter((p) => p.status === 'failed');
  const revenue = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // revenue from payments made in the last 30 days
  const monthAgo = openedAt - 30 * 86400000;
  const lastMonth = paid
    .filter((p) => new Date(p.created_at).getTime() >= monthAgo)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const tabs = [
    { key: 'all', label: 'All', count: list.length },
    { key: 'paid', label: 'Paid', count: paid.length },
    { key: 'failed', label: 'Failed', count: failed.length },
  ];

  const shown = list
    .filter((p) => tab === 'all' || p.status === tab)
    .filter((p) => matches(`${p.business?.name} ${p.owner?.name} ${p.owner?.email} ${p.reference}`, q));

  function details(p) {
    const parts = [
      PLAN_NAMES[p.plan] || p.plan,
      p.owner && `owner ${p.owner.name}`,
      cardText(p),
      p.reference,
      ago(p.created_at),
    ];
    if (p.status === 'paid' && p.period_end) parts.push(`covers until ${shortDate(p.period_end)}`);
    if (p.status === 'failed' && p.failure_reason) parts.push(`“${p.failure_reason}”`);
    return parts.filter(Boolean).join(' · ');
  }

  return (
    <section className="am-page">
      <div className="page-h">
        <h1>Payments</h1>
        <span className="sp" />
        <SearchBox value={q} onChange={setQ} placeholder="Search business, owner or receipt" />
      </div>

      <div className="am-kpis am-pay-kpis">
        <div className="am-kpi">
          <span className="ic"><Icon name="payments" /></span>
          <b>{money(revenue)}</b><span>Total revenue</span>
          <small>from {paid.length} {paid.length === 1 ? 'payment' : 'payments'}</small>
        </div>
        <div className="am-kpi">
          <span className="ic"><Icon name="overview" /></span>
          <b>{money(lastMonth)}</b><span>Last 30 days</span>
          <small>new and renewed plans</small>
        </div>
        <div className="am-kpi">
          <span className="ic"><Icon name="suspicious" /></span>
          <b>{failed.length}</b><span>Failed payments</span>
          <small>{failed.length ? 'cards that were declined' : 'nothing to check'}</small>
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {shown.length ? (
        <div className="list">
          {shown.map((p) => (
            <div className={`li am-li${p.status === 'failed' ? ' off' : ''}`} key={p.id}>
              <span className="ic am-image-icon">
                {p.business?.image ? (
                  <img src={p.business.image} alt={`${p.business.name} logo`} className="am-list-image" />
                ) : (
                  initial(p.business?.name)
                )}
              </span>
              <div><b>{p.business?.name}</b><small>{details(p)}</small></div>
              <span className={`st ${p.status === 'paid' ? 'open' : 'bad'}`}>
                {p.status === 'paid' ? 'Paid' : 'Failed'}
              </span>
              <span className="am-pay-amt">{money(p.amount, p.currency)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <b>{q ? 'Nothing matches your search' : 'No payments here yet'}</b>
          <p>{q ? 'Try another business, owner or receipt number.' : 'Owner payments will show up here.'}</p>
        </div>
      )}
    </section>
  );
}