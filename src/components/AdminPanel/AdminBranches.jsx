import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { getAdminBranches, setBranchActive } from '../../services/adminManageService';
import { initial } from '../Owner/ownerSetup';
import { SearchBox, Tabs } from './AdminParts';
import { matches } from './adminUtils';

export default function AdminBranches() {
  const { toast } = useOutletContext();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('active');
  const [business, setBusiness] = useState('');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    return getAdminBranches()
      .then((data) => {
        setList(data);
        setError('');
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(b) {
    setBusyId(b.id);
    try {
      await setBranchActive(b.id, !b.is_active);
      await load();
      toast(b.is_active ? `${b.name} was deactivated` : `${b.name} is active again`);
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <div className="empty"><b>Couldn't load branches</b><p>{error}</p></div>;
  if (!list) return null;

  // the businesses for the filter, A to Z, no repeats
  const businesses = [...new Map(list.map((b) => [b.business.id, b.business])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));

  const byBusiness = list.filter((b) => !business || String(b.business.id) === business);
  const groups = {
    active: byBusiness.filter((b) => b.is_active),
    inactive: byBusiness.filter((b) => !b.is_active),
  };
  const tabs = [
    { key: 'active', label: 'Active', count: groups.active.length },
    { key: 'inactive', label: 'Inactive', count: groups.inactive.length },
  ];
  const shown = groups[tab].filter((b) => matches(`${b.name} ${b.address} ${b.business.name}`, q));

  return (
    <section className="am-page">
      <div className="page-h">
        <h1>Branches</h1>
        <span className="sp" />
        <SearchBox value={q} onChange={setQ} placeholder="Search branches" />
        {businesses.length > 1 && (
          <select className="sel" aria-label="Filter by business" value={business} onChange={(e) => setBusiness(e.target.value)}>
            <option value="">All businesses</option>
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {shown.length ? (
        <div className="list">
          {shown.map((b) => (
            <div className={`li am-li${b.is_active ? '' : ' off'}`} key={b.id}>
              <span className="ic am-image-icon">
                {b.business?.image ? (
                  <img
                    src={b.business.image}
                    alt={`${b.business.name} logo`}
                    className="am-list-image"
                  />
                ) : (
                  initial(b.business?.name || b.name)
                )}
              </span>
              <div>
                <b>{b.name}</b>
                <small>{[b.business.name, b.address, b.phone].filter(Boolean).join(' · ')}</small>
              </div>
              <span className={b.is_active ? 'st open' : 'st off'}>{b.is_active ? 'Active' : 'Inactive'}</span>
              <span className="am-acts">
                <button className={b.is_active ? 'mute' : 'ok'} type="button" disabled={busyId === b.id} onClick={() => toggle(b)}>
                  {b.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <b>{q ? 'Nothing matches your search' : 'No branches here'}</b>
          <p>{q ? 'Try another name or area.' : 'Branches show up when owners add them.'}</p>
        </div>
      )}
    </section>
  );
}