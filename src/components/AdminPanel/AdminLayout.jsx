import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { removeToken } from '../../lib/helpers/jwt-helpers';
import { getAdminBusinesses } from '../../services/adminManageService';
import NotificationBell from '../Notifications/NotificationBell';
import { initial } from '../Owner/ownerSetup';
import logo from '../../assets/qless-logo.png';
import '../Owner/Owner.css';
import './AdminPanel.css';
import './AdminResponsive.css';

export const ICONS = {
  overview: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  businesses: <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 6" /></>,
  branches: <><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  categories: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  queues: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M7 10h4M7 14h7" /></>,
  reviews: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  suspicious: <path d="M5 21V4M5 4h12l-2 4 2 4H5" />,
  audit: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
};

export function Icon({ name, size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

function Item({ to, icon, children, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'nav on' : 'nav')}>
      <Icon name={icon} />
      {children}
    </NavLink>
  );
}

const today = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [pending, setPending] = useState(0);
  const [toastMsg, setToastMsg] = useState('');
  const timer = useRef(null);

  // How many businesses are waiting for approval (the orange number in the sidebar)
  const refreshPending = useCallback(async () => {
    try {
      const list = await getAdminBusinesses({ approval_status: 'pending' });
      setPending(list.length);
    } catch {
      setPending(0);
    }
  }, []);

  useEffect(() => { refreshPending(); }, [refreshPending]);

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

  const name = user?.name || '';

  return (
        <div className="owner app owner-admin">
      <div className="logo">
        <img src={logo} alt="QLess" />

        <button
          type="button"
          className="admin-menu-toggle"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="admin-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuOpen ? (
              <path d="m6 6 12 12M6 18 18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <header className="top">
        <span className="am-date">{today()}</span>
        <NotificationBell />
        <div className="who">
          <span>Admin{name && ' · '}<b>{name}</b></span>
          <div className="av">{initial(name)}</div>
        </div>
      </header>

      <nav className="side" aria-label="Admin menu">
        <Item to="/admin" icon="overview" end>Overview</Item>
        <p className="grp">Approvals</p>
        <Item to="/admin/businesses" icon="businesses">
          Businesses{pending > 0 && <span className="am-cnt">{pending}</span>}
        </Item>
        <p className="grp">Manage</p>
        <Item to="/admin/users" icon="users">Users</Item>
        <Item to="/admin/branches" icon="branches">Branches</Item>
        <Item to="/admin/categories" icon="categories">Categories</Item>
        <p className="grp">Monitor</p>
        <Item to="/admin/queues" icon="queues">Live queues</Item>
        <Item to="/admin/reviews" icon="reviews">Reviews</Item>
        <Item to="/admin/suspicious-activity" icon="suspicious">Suspicious activity</Item>
        <p className="grp">Records</p>
        <Item to="/admin/audit-logs" icon="audit">Audit logs</Item>

        <div className="meter">
          <button className="signout" type="button" onClick={signOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 16l-4-4 4-4M6 12h10" /></svg>
            Sign out
          </button>
        </div>
      </nav>

      <div className="main">
        <main className="content">
          <Outlet context={{ toast, pending, refreshPending }} />
        </main>
      </div>

      <div className={toastMsg ? 'toast show' : 'toast'} role="status">{toastMsg}</div>
    </div>
  );
}