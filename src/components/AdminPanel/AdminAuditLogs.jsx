import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../services/adminManageService';
import { SearchBox, matches } from './AdminParts';

// dot colour from the action name, e.g. "approve_business"
function tone(action = '') {
  if (/^(approve|activate|lift)/.test(action)) return 'ok';
  if (/^(reject|delete)/.test(action)) return 'bad';
  if (/^(deactivate)/.test(action)) return '';
  return 'info';
}

// "approve_business" -> "Approve business"
const words = (text = '') => {
  const t = text.replace(/_/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// "Today", "Yesterday" or "3 Oct"
function dayLabel(value) {
  const d = new Date(value);
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const timeOf = (value) =>
  new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export default function AdminAuditLogs() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getAuditLogs({ entity_type: type, signal: controller.signal })
      .then((data) => { setList(data); setError(''); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [type]);

  const shown = (list || []).filter((log) =>
    matches(`${log.description} ${log.action} ${log.admin?.name}`, q));

  // group the logs under their day, newest first (the backend already sorts them)
  const days = [];
  shown.forEach((log) => {
    const label = log.created_at ? dayLabel(log.created_at) : 'Earlier';
    const last = days[days.length - 1];
    if (last && last.label === label) last.logs.push(log);
    else days.push({ label, logs: [log] });
  });

  return (
    <section className="am-page">
      <div className="page-h">
        <h1>Audit logs</h1>
        <span className="sp" />
        <SearchBox value={q} onChange={setQ} placeholder="Search actions" />
        <select className="sel" aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All actions</option>
          <option value="business">Businesses</option>
          <option value="user">Users</option>
          <option value="branch">Branches</option>
        </select>
      </div>

      {error ? (
        <div className="empty"><b>Couldn't load the audit logs</b><p>{error}</p></div>
      ) : !list ? null : days.length ? (
        days.map((day) => (
          <div key={day.label}>
            <p className="am-day">{day.label}</p>
            <div className="am-tl">
              {day.logs.map((log) => (
                <div className="am-tl-i" key={log.id}>
                  <span className={`am-dot ${tone(log.action)}`} />
                  <div className="am-tl-c">
                    <div>
                      <b>{log.description || words(log.action)}</b>
                      <small>by {log.admin?.name || 'a deleted admin'}</small>
                    </div>
                    {log.created_at && <span className="am-time">{timeOf(log.created_at)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="empty">
          <b>{q ? 'Nothing matches your search' : 'No actions yet'}</b>
          <p>{q ? 'Try another word.' : 'Every approve, reject, activate and deactivate will be listed here.'}</p>
        </div>
      )}
    </section>
  );
}