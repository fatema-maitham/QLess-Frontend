import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { getAdminDashboard } from '../../services/adminManageService';
import { Icon } from './AdminLayout';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// shield with approve / reject marks
function ShieldArt() {
  return (
    <svg className="am-art" viewBox="0 0 220 150" fill="none" stroke="#1E1A18" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="150" cy="80" r="62" fill="#fff" stroke="none" opacity=".7" />
      <path d="M150 28l40 14v30c0 28-18 46-40 54-22-8-40-26-40-54V42z" fill="#fff" />
      <path d="M150 40l29 10v22c0 20-13 34-29 40-16-6-29-20-29-40V50z" fill="#F7C98B" />
      <path d="M136 76l10 10 20-22" stroke="#E2572A" strokeWidth="4" />
      <circle cx="62" cy="44" r="16" fill="#fff" /><path d="M55 44l5 5 9-10" stroke="#2F6B37" strokeWidth="2.6" />
      <circle cx="70" cy="110" r="12" fill="#fff" /><path d="M65 105l10 10M75 105l-10 10" stroke="#C9481F" strokeWidth="2.4" />
      <path d="M30 80h14M37 73v14" stroke="#E2572A" />
      <path d="M200 20l6-6M206 32h8" stroke="#E2572A" />
    </svg>
  );
}

// one row of the bars card
function Meter({ label, value, total, color }) {
  const w = total ? `${Math.max(1, Math.round((value / total) * 100))}%` : '0%';
  return (
    <div>
      {label}
      <i style={{ '--w': w, '--c': color }} />
      <em>{value}</em>
    </div>
  );
}

export default function AdminOverview() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getAdminDashboard({ signal: controller.signal })
      .then(setStats)
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, []);

  if (error) return <div className="empty"><b>Couldn't load the dashboard</b><p>{error}</p></div>;
  if (!stats) return null;

  const roles = stats.users_by_role || {};
  const biz = stats.businesses_by_status || {};
  const pending = biz.pending || 0;
  const first = (user?.name || 'Admin').split(' ')[0];

  return (
    <section className="am-page">
      <div className="am-hero">
        <div>
          <p className="am-eyebrow">ADMIN</p>
          <h2>{greeting()}, {first}</h2>
          {pending > 0 ? (
            <>
              <p className="am-line"><b>{pending} {pending === 1 ? 'business' : 'businesses'}</b> {pending === 1 ? 'needs' : 'need'} a decision today.</p>
              <button className="btn btn-primary" type="button" onClick={() => navigate('/admin/businesses')}>Review applications →</button>
            </>
          ) : (
            <p className="am-line">No businesses are waiting. You're all caught up.</p>
          )}
        </div>
        <ShieldArt />
      </div>

      <div className="am-kpis">
        <button className="am-kpi" type="button" onClick={() => navigate('/admin/users')}>
          <span className="ic"><Icon name="users" /></span>
          <b>{stats.users_total}</b><span>Users</span>
          <small>{stats.restricted_users} restricted</small>
        </button>
        <button className="am-kpi" type="button" onClick={() => navigate('/admin/businesses')}>
          <span className="ic"><Icon name="businesses" /></span>
          <b>{stats.businesses_total}</b><span>Businesses</span>
          <small>{pending} pending</small>
        </button>
        <button className="am-kpi" type="button" onClick={() => navigate('/admin/branches')}>
          <span className="ic"><Icon name="branches" /></span>
          <b>{stats.branches_total}</b><span>Branches</span>
          <small>{stats.active_branches} active</small>
        </button>
        <button className="am-kpi" type="button" onClick={() => navigate('/admin/queues')}>
          <span className="ic"><Icon name="queues" /></span>
          <b>{stats.open_queues}</b><span>Open queues</span>
          <small>{stats.people_waiting} people waiting</small>
        </button>
      </div>

      <div className="am-split">
        <div className="am-card">
          <h3>Users by role</h3>
          <div className="am-meter">
            <Meter label="Visitors" value={roles.customer || 0} total={stats.users_total} />
            <Meter label="Owners" value={roles.owner || 0} total={stats.users_total} />
            <Meter label="Staff" value={roles.staff || 0} total={stats.users_total} />
            <Meter label="Admins" value={roles.admin || 0} total={stats.users_total} />
          </div>
        </div>
        <div className="am-card">
          <h3>Businesses by status</h3>
          <div className="am-meter">
            <Meter label="Approved" value={biz.approved || 0} total={stats.businesses_total} color="#2F6B37" />
            <Meter label="Pending" value={pending} total={stats.businesses_total} color="#F7C98B" />
            <Meter label="Rejected" value={biz.rejected || 0} total={stats.businesses_total} />
            <Meter label="Draft" value={biz.draft || 0} total={stats.businesses_total} color="#BDB4AC" />
          </div>
        </div>
      </div>
    </section>
  );
}