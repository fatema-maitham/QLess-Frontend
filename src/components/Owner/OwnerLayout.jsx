import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { removeToken } from '../../lib/helpers/jwt-helpers';
import { loadOwnerData } from '../../services/ownerApi';
import { firstUnready, initial } from './ownerSetup';
import NotificationBell from "../Notifications/NotificationBell";
import './Owner.css';
import logo from '../../assets/qless-logo.png';
import './OwnerAccount.css';
import './OwnerResponsive.css';

const ICONS = {
  overview: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  branches: <><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  staff: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 6" /></>,
  announcements: <><path d="M4 10v4a1 1 0 0 0 1 1h3l6 4V5L8 9H5a1 1 0 0 0-1 1z" /><path d="M18 9a4 4 0 0 1 0 6" /></>,
  queues: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M7 10h4M7 14h7" /></>,
  profile: <path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M9 20v-6h6v6" />,
  account: (
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </>
),
settings: (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3Z" />
  </>
),
};

function Item({ to, icon, children, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'nav on' : 'nav')}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[icon]}
      </svg>
      {children}
    </NavLink>
  );
}

// function Search({ branches }) {
//   const navigate = useNavigate();
//   const [q, setQ] = useState('');
//   const [active, setActive] = useState(-1);
//   const box = useRef(null);

//   useEffect(() => {
//     const close = (e) => { if (box.current && !box.current.contains(e.target)) setQ(''); };
//     document.addEventListener('mousedown', close);
//     return () => document.removeEventListener('mousedown', close);
//   }, []);

//   const v = q.trim().toLowerCase();
//   const results = [];
//   if (v) {
//     branches.forEach((b) => {
//       if (`${b.name} ${b.address || ''}`.toLowerCase().includes(v))
//         results.push({ kind: 'Branch', title: b.name, sub: b.address || 'Branch', to: `/owner/branches/${b.id}` });
//       b.services.forEach((s) => {
//         if (s.name.toLowerCase().includes(v))
//           results.push({ kind: 'Service', title: s.name, sub: b.name, to: `/owner/branches/${b.id}?tab=services` });
//       });
//       b.staff.forEach((s) => {
//         const name = s.user?.name || '';
//         if (`${name} ${s.user?.email || ''}`.toLowerCase().includes(v))
//           results.push({ kind: 'Staff', title: name, sub: b.name, to: `/owner/branches/${b.id}?tab=staff` });
//       });
//     });
//   }
//   const shown = results.slice(0, 8);

//   function pick(r) {
//     setQ('');
//     navigate(r.to);
//   }

//   function onKey(e) {
//     if (!shown.length) return;
//     if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % shown.length); }
//     if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + shown.length) % shown.length); }
//     if (e.key === 'Enter') { e.preventDefault(); pick(shown[active] || shown[0]); }
//     if (e.key === 'Escape') setQ('');
//   }

//   return (
//     <label className="search" ref={box}>
//       <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
//       <input
//         type="search"
//         aria-label="Search branches, services and staff"
//         autoComplete="off"
//         value={q}
//         onChange={(e) => { setQ(e.target.value); setActive(-1); }}
//         onKeyDown={onKey}
//       />
//       {v && (
//         <div className="sres">
//           {shown.length ? shown.map((r, i) => (
//             <button type="button" key={r.kind + r.to + r.title} className={i === active ? 'on' : ''} onClick={() => pick(r)}>
//               <span className="ic">{initial(r.title)}</span>
//               <span><b>{r.title}</b><small>{r.sub}</small></span>
//               <span className="k">{r.kind}</span>
//             </button>
//           )) : <div className="none">Nothing matches “{q.trim()}”</div>}
//         </div>
//       )}
//     </label>
//   );
// }

export default function OwnerLayout() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [data, setData] = useState({ business: null, branches: [], announcements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const timer = useRef(null);

  const reload = useCallback(async () => {
    try {
      const fresh = await loadOwnerData();
      setData(fresh);
      setError('');
      return fresh;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(''), 2600);
  }, []);

  function signOut() {
    removeToken();
    setUser(null);
    navigate('/');
  }

  /* only approved businesses can use the dashboard */
  if (!loading && !error && data.business?.approval_status !== 'approved') {
    return <Navigate to="/owner" replace />;
  }

  const name = user?.name || '';
  const needsSetup = !!firstUnready(data.branches);

  return (
    <div className="owner app owner-business">
            <div className="logo"><img src={logo} alt="QLess" /></div>

      <header className="top">
        <span className="owner-date">
  {new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })}
</span>
        <NotificationBell />

        <div className="who">
          <span>{data.business?.name}{data.business && ' · '}<b>{name}</b></span>
          <div className="av">{initial(name)}</div>
        </div>
      </header>

      <nav className="side" aria-label="Owner menu">
        <Item to="/owner/dashboard" icon="overview" end>Overview</Item>
        <p className="grp">Manage</p>
        <Item to="/owner/branches" icon="branches">Branches{needsSetup && <span className="soon">Setup</span>}</Item>
        <Item to="/owner/staff" icon="staff">Staff</Item>
        <Item to="/owner/announcements" icon="announcements">Announcements</Item>
        <Item to="/owner/queues" icon="queues">Live queues</Item>
        <p className="grp">Business</p>
        <Item to="/owner/profile" icon="profile">Business profile</Item>
        <Item to="/owner/my-profile" icon="account">My profile</Item>
        <Item to="/owner/settings" icon="settings">Settings</Item>

        <div className="meter">
          <button className="signout" type="button" onClick={signOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 16l-4-4 4-4M6 12h10" /></svg>
            Sign out
          </button>
        </div>
      </nav>

      <div className="main">
        <main className="content">
          {loading ? null : error ? (
            <div className="empty"><b>Couldn't load your dashboard</b><p>{error}</p></div>
          ) : (
            <Outlet context={{ ...data, setData, reload, toast }} />
          )}
        </main>
      </div>

      <div className={toastMsg ? 'toast show' : 'toast'} role="status">{toastMsg}</div>
    </div>
  );
}