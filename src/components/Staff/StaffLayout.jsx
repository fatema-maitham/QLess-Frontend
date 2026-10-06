import { useCallback, useContext, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { removeToken } from '../../lib/helpers/jwt-helpers';
import { getStaffMe } from '../../services/controlService';
import { getBranch, getBranchHours, getBranchServices } from '../../services/branchService';
import { getMe } from '../../services/profileService';
import NotificationBell from '../Notifications/NotificationBell';
import { initial } from './staffHelpers';
import logo from '../../assets/qless-logo.png';
import '../Owner/Owner.css';
import './Staff.css';
import './StaffResponsive.css';

const ICONS = {
  settings: (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3Z" />
  </>
),
  overview: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  queues: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M7 10h4M7 14h7" /></>,
  history: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  bookings: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  branch: <><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
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

const today = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function StaffLayout() {
    const [menuOpen, setMenuOpen] = useState(false);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', error: '' });
  const [me, setMe] = useState(null);           // /staff/me: position, business, branch, queues
  const [branch, setBranch] = useState(null);   // full branch (has is_open_now)
  const [hours, setHours] = useState([]);
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState(null); // /users/me: name, email, phone, profile_image

    const load = useCallback(() => {
    return Promise.all([getStaffMe(), getMe()])
      .then(async ([staffMe, account]) => {
        const branchId = staffMe.branch.id;

        const [fullBranch, branchHours, branchServices] =
          await Promise.all([
            getBranch(branchId),
            getBranchHours(branchId),
            getBranchServices(branchId),
          ]);

        setMe(staffMe);
        setProfile(account);
        setBranch(fullBranch);
        setHours(branchHours);
        setServices(branchServices);
        setState({ status: 'ready', error: '' });
      })
      .catch((err) => {
        setState({
          status: err.status === 404 ? 'unassigned' : 'error',
          error: err.message,
        });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function retryLoad() {
    setState({ status: 'loading', error: '' });
    load();
  }

  function signOut() {
    removeToken();
    setUser(null);
    navigate('/');
  }

  const name = profile?.name || '';
  const position = me?.position || 'Staff';

  return (
        <div className="owner app owner-staff">
      <div className="logo">
        <img src={logo} alt="QLess" />

        <button
          type="button"
          className="staff-menu-toggle"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="staff-navigation"
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
        <span className="st-date">{today()}</span>
        <NotificationBell />
        <div className="who">
          <span>{position}{name && ' · '}<b>{name}</b></span>
          <div className="av">
            {profile?.profile_image ? <img src={profile.profile_image} alt="" /> : initial(name)}
          </div>
        </div>
      </header>

           <nav
        id="staff-navigation"
        className={`side${menuOpen ? ' staff-menu-open' : ''}`}
        aria-label="Staff menu"
        onClick={(event) => {
          if (event.target.closest('a, .signout')) {
            setMenuOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setMenuOpen(false);
          }
        }}
      >
        <Item to="/staff" icon="overview" end>Overview</Item>
        <p className="grp">Queues</p>
        <Item to="/staff/queues" icon="queues">Live queues</Item>
        <Item to="/staff/history" icon="history">Queue history</Item>
        <Item to="/staff/bookings" icon="bookings">Bookings</Item>
        <p className="grp">Account</p>
        <Item to="/staff/branch" icon="branch">My branch</Item>
        <Item to="/staff/profile" icon="profile">My profile</Item>
        <Item to="/staff/settings" icon="settings">Settings</Item>

        <div className="meter">
          <button className="signout" type="button" onClick={signOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 16l-4-4 4-4M6 12h10" /></svg>
            Sign out
          </button>
        </div>
      </nav>

      <div className="main">
        <main className="content sx">
          {state.status === 'unassigned' && (
            <div className="st-msg">
              <h2>You're not assigned to a branch yet</h2>
              <p>Ask the business owner to add you to a branch, then check again.</p>
              <button type="button" className="st-btn" onClick={retryLoad}>Check again</button>
            </div>
          )}

          {state.status === 'error' && (
            <div className="st-msg" role="alert">
              <h2>We couldn't load your branch</h2>
              <p>{state.error}</p>
              <button type="button" className="st-btn" onClick={retryLoad}>Try again</button>
            </div>
          )}

          {state.status === 'ready' && (
            <Outlet context={{ me, branch, hours, services, profile, setProfile }} />
          )}
        </main>
      </div>
    </div>
  );
}