import { useContext, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { getQueueEntries, getQueues } from '../../services/ownerApi';
import { firstUnready, isReady, nextNeed, stepsDone } from './ownerSetup';
import { Arrow, ShopDrawing } from './OwnerParts';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* last 7 days, oldest first, today last */
function lastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

/* counts visitors who joined a queue on each of the last 7 days */
async function loadVisitors(branches) {
  const days = lastSevenDays();
  const counts = {};
  await Promise.all(branches.map(async (b) => {
    const queues = await getQueues(b.id).catch(() => []);
    const lists = await Promise.all(queues.map((q) => getQueueEntries(q.id).catch(() => [])));
    counts[b.id] = days.map((day) => {
      const end = new Date(day);
      end.setDate(end.getDate() + 1);
      return lists.flat().filter((e) => {
        const t = new Date(e.joined_at);
        return t >= day && t < end;
      }).length;
    });
  }));
  return { days, counts };
}

function greeting(name) {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return `${part}, ${name}`;
}

export default function OwnerOverview() {
  const { branches } = useOutletContext();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [chartBranch, setChartBranch] = useState('all');
  const [visitors, setVisitors] = useState(null);

  const branchIds = branches.map((b) => b.id).join(',');
  useEffect(() => {
    let alive = true;
    loadVisitors(branches).then((v) => { if (alive) setVisitors(v); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchIds]);

  const first = (user?.name || '').split(' ')[0];
  const focus = firstUnready(branches);

  /* welcome card text */
  let done, title, text, btn, go;
  if (!branches.length) {
    done = 0;
    title = greeting(first);
    text = 'Add your first branch so visitors can find you and join the queue.';
    btn = 'Add your first branch';
    go = () => navigate('/owner/branches?add=1');
  } else if (focus) {
    done = stepsDone(focus);
    const need = nextNeed(focus);
    const left = 4 - done;
    title = branches.length > 1 ? `Finish ${focus.name}` : greeting(first);
    text = left === 1
      ? `One more step and ${focus.name} is ready for visitors.`
      : `${left} more steps and ${focus.name} is ready for visitors.`;
    btn = `Next: ${need.label.toLowerCase()}`;
    go = () => navigate(`/owner/branches/${focus.id}?tab=${need.tab}&add=1`);
  } else {
    done = 4;
    title = `You're live, ${first}`;
    text = branches.length === 1
      ? 'Your branch is ready. Visitors can join the queue from their phone.'
      : `All ${branches.length} branches are ready. Visitors can join the queue from their phone.`;
    btn = 'Add another branch';
    go = () => navigate('/owner/branches?add=1');
  }

  /* chart numbers */
  const shownBranch = chartBranch === 'all' || branches.some((b) => String(b.id) === chartBranch) ? chartBranch : 'all';
  const values = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    if (!visitors) return 0;
    const ids = shownBranch === 'all' ? branches.map((b) => b.id) : [Number(shownBranch)];
    return ids.reduce((sum, id) => sum + (visitors.counts[id]?.[i] || 0), 0);
  });
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(...values, 1);
  const labels = visitors ? visitors.days.map((d, i) => (i === 6 ? 'Today' : DAY_SHORT[d.getDay()])) : DAY_SHORT;

  /* tiles */
  const readyCount = branches.filter(isReady).length;
  const serviceCount = branches.reduce((a, b) => a + b.services.length, 0);
  const staffCount = branches.reduce((a, b) => a + b.staff.length, 0);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <section className="overview" data-view="overview">      <div className="page-h">
        <h1>Overview</h1>
        <span className="sp" />
        <span className="date">{today}</span>
      </div>

      <div className={done === 4 ? 'welcome nor' : 'welcome'}>
        <div className="ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#EDE8E2" strokeWidth="12" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="#E2572A" strokeWidth="12" strokeLinecap="round" opacity={done ? 1 : 0}
              strokeDasharray={`${(314 * done) / 4} 314`} style={{ transition: 'stroke-dasharray .8s var(--ease)' }} />
          </svg>
          <div><b>{done}/4</b><span>steps done</span></div>
        </div>
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
          <button className="btn btn-primary" type="button" onClick={go}>{btn} <Arrow /></button>
        </div>
        <div className="drawing" aria-hidden="true"><ShopDrawing /></div>
      </div>

      <div className="row">
        <section className="chart" aria-label="Visitors this week">
          <div className="chart-top">
            <div>
              <p className="lbl">Visitors this week</p>
              <div className="total">{total}<span>people joined</span></div>
            </div>
            {branches.length > 1 && (
              <select className="sel" aria-label="Branch" value={shownBranch} onChange={(e) => setChartBranch(e.target.value)}>
                <option value="all">All branches</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
          </div>
          {total ? (
            <div className="bars">
              {values.map((v, i) => (
                <div className={i === 6 ? 'bar today' : 'bar'} key={i}>
                  <b>{v}</b>
                  <i style={{ height: `${Math.max(2, (v / max) * 86)}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-empty">
              <b>No visitors yet</b>
              <span>This fills in as soon as visitors join your queue.</span>
            </div>
          )}
          <div className="days">
            {labels.map((l, i) => <span key={i} className={i === 6 ? 't' : ''}>{l}</span>)}
          </div>
        </section>

        <section className="tiles" aria-label="Your business">
          <button className="tile" type="button" onClick={() => navigate('/owner/branches')}>
            <span className="ic"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#C9481F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg></span>
            <div><b>{branches.length}</b><span>{!branches.length ? 'Branches · add your first' : readyCount === branches.length ? 'Branches · all ready' : `Branches · ${branches.length - readyCount} need setup`}</span></div>
            <span className="arr">›</span>
          </button>
          <button className="tile" type="button" onClick={() => navigate('/owner/branches')}>
            <span className="ic"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#C9481F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 13h8M8 17h5" /></svg></span>
            <div><b>{serviceCount}</b><span>{serviceCount ? 'Services across branches' : 'Services · none yet'}</span></div>
            <span className="arr">›</span>
          </button>
          <button className="tile" type="button" onClick={() => navigate('/owner/staff')}>
            <span className="ic"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#C9481F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 6" /></svg></span>
            <div><b>{staffCount}</b><span>{staffCount ? 'Staff members' : 'Staff · add your team'}</span></div>
            <span className="arr">›</span>
          </button>
        </section>
      </div>
    </section>
  );
}