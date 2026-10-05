import { useCallback, useContext, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { getAdminUsers, liftRestriction, setUserActive } from '../../services/adminManageService';
import { initial } from '../Owner/ownerSetup';
import { SearchBox, Tabs, isRestricted, matches, shortDate } from './AdminParts';

const ROLE_NAMES = { customer: 'Visitor', owner: 'Owner', staff: 'Staff', admin: 'Admin' };

export default function AdminUsers() {
  const { toast } = useOutletContext();
  const { user: me } = useContext(UserContext);
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('active');
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setList(await getAdminUsers());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function run(id, action, message) {
    setBusyId(id);
    try {
      await action();
      await load();
      toast(message);
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <div className="empty"><b>Couldn't load users</b><p>{error}</p></div>;
  if (!list) return null;

  const byRole = list.filter((u) => !role || u.role === role);
  const groups = {
    active: byRole.filter((u) => u.is_active && !isRestricted(u)),
    restricted: byRole.filter((u) => u.is_active && isRestricted(u)),
    inactive: byRole.filter((u) => !u.is_active),
  };
  const tabs = [
    { key: 'active', label: 'Active', count: groups.active.length },
    { key: 'restricted', label: 'Restricted', count: groups.restricted.length },
    { key: 'inactive', label: 'Inactive', count: groups.inactive.length },
  ];
  const shown = groups[tab].filter((u) => matches(`${u.name} ${u.email}`, q));

  function details(u) {
    const parts = [u.email, ROLE_NAMES[u.role] || u.role];
    if (u.no_show_count) parts.push(`${u.no_show_count} no-shows`);
    else parts.push(`joined ${shortDate(u.created_at)}`);
    return parts.join(' · ');
  }

  return (
    <section className="am-page">
      <div className="page-h">
        <h1>Users</h1>
        <span className="sp" />
        <SearchBox value={q} onChange={setQ} placeholder="Search name or email" />
        <select className="sel" aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="customer">Visitors</option>
          <option value="owner">Owners</option>
          <option value="staff">Staff</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {shown.length ? (
        <div className="list">
          {shown.map((u) => {
            const busy = busyId === u.id;
            const isMe = u.id === me?.id;
            return (
              <div className={`li am-li${u.is_active ? '' : ' off'}`} key={u.id}>
                <span className="ic">{initial(u.name)}</span>
                <div><b>{u.name}{isMe && ' (you)'}</b><small>{details(u)}</small></div>
                {!u.is_active ? <span className="st off">Inactive</span>
                  : isRestricted(u) ? <span className="st warn">Restricted until {shortDate(u.restricted_until)}</span>
                    : <span className="st open">Active</span>}
                <span className="am-acts">
                  {u.is_active && isRestricted(u) && (
                    <button className="ok" type="button" disabled={busy}
                      onClick={() => run(u.id, () => liftRestriction(u.id), `Restriction lifted for ${u.name}`)}>Lift restriction</button>
                  )}
                  {u.is_active ? (
                    !isMe && (
                      <button className="mute" type="button" disabled={busy}
                        onClick={() => run(u.id, () => setUserActive(u.id, false), `${u.name} was deactivated`)}>Deactivate</button>
                    )
                  ) : (
                    <button className="ok" type="button" disabled={busy}
                      onClick={() => run(u.id, () => setUserActive(u.id, true), `${u.name} is active again`)}>Activate</button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <b>{q ? 'Nothing matches your search' : 'No users here'}</b>
          <p>{q ? 'Try another name or email.' : 'Users will show up here.'}</p>
        </div>
      )}
    </section>
  );
}