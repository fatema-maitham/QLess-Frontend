import { useOutletContext } from 'react-router';
import { DAYS, dayLabel, hoursText, initial, todayName } from './staffHelpers';

const Icon = ({ children }) => (
  <span className="dic">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E2572A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  </span>
);

export default function StaffBranch() {
  const { me, branch, hours, services } = useOutletContext();
  const today = todayName();

  return (
    <>
      <div className="page-h"><h1>My branch</h1></div>

      <div className="branch-sheet">
        <div className="branch-heading">
          <div className="branch-logo">
            {branch.image ? <img src={branch.image} alt="" /> : initial(me.business.name)}
          </div>
          <div>
            <div className="branch-eyebrow">YOUR BRANCH</div>
            <h2>{branch.name}</h2>
            <p>{me.business.name}</p>
          </div>
          <span className={branch.is_open_now ? 'chip ok' : 'chip'}>
            {branch.is_open_now ? 'Open now' : 'Closed now'}
          </span>
        </div>

        <div className="branch-content">
          <div className="branch-details">
            <dl>
              <div className="dli">
                <Icon><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></Icon>
                <div><dt>Address</dt><dd>{branch.address || 'Not added yet'}</dd></div>
              </div>
              <div className="dli">
                <Icon><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></Icon>
                <div><dt>Phone</dt><dd>{branch.phone || 'Not added yet'}</dd></div>
              </div>
              <div className="dli">
                <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></Icon>
                <div><dt>Your position</dt><dd>{me.position || 'Staff'}</dd></div>
              </div>
            </dl>
          </div>

          <div className="branch-sections">
            <section>
              <h3>Services <span className="chip">{services.length} {services.length === 1 ? 'service' : 'services'}</span></h3>
              <p className="branch-caption">Available at this branch</p>
              <div className="branch-services">
                {services.length === 0 && <p className="branch-caption">No services added yet.</p>}
                {services.map((s) => (
                  <div className="svc" key={s.id}>
                    <i></i>{s.name}
                    {s.duration_minutes && <small>{s.duration_minutes} min</small>}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3>Opening hours</h3>
              <p className="branch-caption">Your branch's weekly schedule</p>
              <div>
                {DAYS.map((day) => (
                  <div key={day} className={day === today ? 'day on' : 'day'}>
                    <b>{dayLabel(day)}{day === today && <small className="today-label">Today</small>}</b>
                    <span>{hoursText(hours.find((h) => h.day_of_week === day))}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}