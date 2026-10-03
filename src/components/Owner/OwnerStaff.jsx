import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { createStaff, deleteStaff } from '../../services/ownerApi';
import { initial } from './ownerSetup';
import { Empty } from './OwnerParts';

export default function OwnerStaff() {
  const { branches, reload, toast } = useOutletContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: '', position: '', branch: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const people = branches
    .flatMap((b) => b.staff.map((s) => ({ ...s, branch: b })))
    .filter((s) => filter === 'all' || String(s.branch.id) === filter);

  function openForm() {
    if (!branches.length) { toast('Add a branch first'); navigate('/owner/branches?add=1'); return; }
    setForm({ email: '', position: '', branch: filter !== 'all' ? filter : String(branches[0].id) });
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createStaff(Number(form.branch), { user_email: form.email.trim(), position: form.position.trim() || null });
      await reload();
      setOpen(false);
      const b = branches.find((x) => String(x.id) === form.branch);
      toast(`Staff member added to ${b?.name}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try { await deleteStaff(id); await reload(); toast('Staff member removed'); } catch (err) { toast(err.message); }
  }

  return (
    <section>
      <div className="page-h">
        <h1>Staff</h1>
        <span className="sp" />
        {branches.length > 1 && (
          <select className="sel" aria-label="Filter by branch" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All branches</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <button className="btn btn-primary" type="button" onClick={openForm}>+ Add staff</button>
      </div>

      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f wide"><label htmlFor="se">Their QLess email</label><input id="se" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={120} autoFocus /></div>
          <div className="f"><label htmlFor="sp">Position</label><input id="sp" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} maxLength={60} /></div>
          <div className="f"><label htmlFor="sb">Branch</label>
            <select id="sb" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="fa">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add staff'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => { setOpen(false); setError(''); }}>Cancel</button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>
      )}

      <div className="list">
        {people.length ? people.map((s) => (
          <div className="li" key={s.id}>
            <span className="ic">{initial(s.user?.name)}</span>
            <div><b>{s.user?.name}</b><small>{s.user?.email} · {s.branch.name}{s.position ? ` · ${s.position}` : ''}</small></div>
            <span className={s.is_active ? 'st open' : 'st off'}>{s.is_active ? 'Active' : 'Inactive'}</span>
            <button className="del" type="button" onClick={() => remove(s.id)}>Remove</button>
          </div>
        )) : (
          <Empty
            title="No staff yet"
            text={branches.length ? 'Add the people who call visitors at your branches. They need a QLess account first.' : 'Add a branch first, then add staff to it.'}
          />
        )}
      </div>
    </section>
  );
}