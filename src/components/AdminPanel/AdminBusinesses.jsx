import { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import {
  approveBusiness, getAdminBusinesses, rejectBusiness, setBusinessActive,
} from '../../services/adminManageService';
import { initial } from '../Owner/ownerSetup';
import { SearchBox, Tabs } from './AdminParts';
import { ago, matches, shortDate } from './adminUtils';

const STATUS = {
  pending: { text: 'Pending', cls: 'warn' },
  approved: { text: 'Approved', cls: 'open' },
  rejected: { text: 'Rejected', cls: 'bad' },
  draft: { text: 'Draft', cls: 'off' },
};

export default function AdminBusinesses() {
  const { toast, refreshPending } = useOutletContext();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const dialog = useRef(null);

    const load = useCallback(() => {
    return getAdminBusinesses()
      .then((data) => {
        setList(data);
        setError('');
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  // run an action, then reload the list and the sidebar number
  async function run(id, action, message) {
    setBusyId(id);
    try {
      await action();
      await load();
      refreshPending();
      toast(message);
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function openReject(business) {
    setRejecting(business);
    setReason('');
    dialog.current?.showModal();
  }

  function closeReject() {
    dialog.current?.close();
    setRejecting(null);
  }

  async function confirmReject(evt) {
    evt.preventDefault();
    const b = rejecting;
    closeReject();
    await run(b.id, () => rejectBusiness(b.id, reason.trim()), `${b.name} was rejected`);
  }

  if (error) return <div className="empty"><b>Couldn't load businesses</b><p>{error}</p></div>;
  if (!list) return null;

  const count = (s) => list.filter((b) => b.approval_status === s).length;
  const tabs = [
    { key: 'pending', label: 'Pending', count: count('pending') },
    { key: 'approved', label: 'Approved', count: count('approved') },
    { key: 'rejected', label: 'Rejected', count: count('rejected') },
    { key: 'all', label: 'All', count: list.length },
  ];

  const shown = list
    .filter((b) => tab === 'all' || b.approval_status === tab)
    .filter((b) => matches(`${b.name} ${b.owner?.name} ${b.owner?.email} ${b.category?.name}`, q));

  function details(b) {
    const parts = [b.category?.name, b.owner && `owner ${b.owner.name}`, b.owner?.email];
    if (b.approval_status === 'pending') parts.push(`sent ${ago(b.updated_at || b.created_at)}`);
    if (b.approval_status === 'approved' && !b.is_active) parts.push('deactivated');
    else if (b.approval_status === 'approved') parts.push(`since ${shortDate(b.created_at)}`);
    if (b.approval_status === 'rejected' && b.rejection_reason) parts.push(`reason: “${b.rejection_reason}”`);
    return parts.filter(Boolean).join(' · ');
  }

  return (
    <section className="am-page">
      <div className="page-h">
        <h1>Businesses</h1>
        <span className="sp" />
        <SearchBox value={q} onChange={setQ} placeholder="Search businesses" />
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {shown.length ? (
        <div className="list">
          {shown.map((b) => {
            const st = !b.is_active && b.approval_status === 'approved'
              ? { text: 'Inactive', cls: 'off' }
              : STATUS[b.approval_status] || STATUS.draft;
            const busy = busyId === b.id;
            return (
              <div className={`li am-li${b.is_active ? '' : ' off'}`} key={b.id}>
                <span className="ic">{initial(b.name)}</span>
                <div><b>{b.name}</b><small>{details(b)}</small></div>
                <span className={`st ${st.cls}`}>{st.text}</span>
                <span className="am-acts">
                  {b.approval_status === 'pending' && (
                    <>
                      <button className="ok" type="button" disabled={busy}
                        onClick={() => run(b.id, () => approveBusiness(b.id), `${b.name} is approved`)}>Approve</button>
                      <button className="no" type="button" disabled={busy} onClick={() => openReject(b)}>Reject</button>
                    </>
                  )}
                  {b.approval_status === 'approved' && (b.is_active ? (
                    <button className="mute" type="button" disabled={busy}
                      onClick={() => run(b.id, () => setBusinessActive(b.id, false), `${b.name} was deactivated`)}>Deactivate</button>
                  ) : (
                    <button className="ok" type="button" disabled={busy}
                      onClick={() => run(b.id, () => setBusinessActive(b.id, true), `${b.name} is active again`)}>Activate</button>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <b>{q ? 'Nothing matches your search' : tab === 'pending' ? 'No businesses are waiting' : 'No businesses here yet'}</b>
          <p>{q ? 'Try another name or email.' : 'New applications will show up here.'}</p>
        </div>
      )}

      <dialog className="am-dlg" ref={dialog} onClose={() => setRejecting(null)}>
        <form onSubmit={confirmReject}>
          <h2>Reject {rejecting?.name}?</h2>
          <p>The owner will see this reason and can fix their details and send again.</p>
          <div className="f">
            <label htmlFor="am-reason">Reason</label>
            <textarea id="am-reason" value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. The CR number is missing" required />
          </div>
          <div className="fa">
            <button className="btn btn-ghost" type="button" onClick={closeReject}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={!reason.trim()}>Reject business</button>
          </div>
        </form>
      </dialog>
    </section>
  );
}