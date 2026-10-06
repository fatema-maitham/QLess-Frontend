import { Link, useOutletContext } from 'react-router';
import StaffArt from './StaffArt';
import { hoursText, todayName } from './staffHelpers';

const Icon = ({ children }) => (
  <span className="i">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E2572A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  </span>
);

export default function StaffOverview() {
  const { me, branch, hours, profile } = useOutletContext();
  const todayHours = hours.find((h) => h.day_of_week === todayName());
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="ov-full">
      <section className="ovh">
        <div className="txt">
          <div className="d">{date}</div>
          <h2>Good to see you,<br /><span>{profile.name}</span>.</h2>
          <p>Your visitors are on their way. Open live queues when you're ready to serve.</p>
          <div className="b">
            <Link className="st-btn" to="/staff/queues">Open live queues</Link>
            <Link className="st-btn ghost" to="/staff/branch">My branch</Link>
          </div>
        </div>
        <StaffArt />
      </section>

      <div className="st-tiles">
        <Link className="st-tile" to="/staff/branch">
          <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
          <span><small>Today</small><b>{hoursText(todayHours)}</b></span>
          <span className={branch.is_open_now ? 'chip ok' : 'chip'}>{branch.is_open_now ? 'Open now' : 'Closed now'}</span>
        </Link>
        <Link className="st-tile" to="/staff/branch">
          <Icon><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></Icon>
          <span><small>Your branch</small><b>{me.branch.name}</b></span>
        </Link>
        <Link className="st-tile" to="/staff/profile">
          <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></Icon>
          <span><small>Your role</small><b>{me.position || 'Staff'}</b></span>
        </Link>
        <Link className="st-tile" to="/staff/queues">
          <Icon><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 9h8M8 13h5" /></Icon>
          <span><small>Your counter</small><b>Counter {me.counter_number}</b></span>
        </Link>
      </div>
    </div>
  );
}