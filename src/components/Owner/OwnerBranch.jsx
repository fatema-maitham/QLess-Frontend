import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router';
import {
  createHour, createService, createStaff, deleteBranch, deleteService, deleteStaff,
  updateBranch, updateHour,
} from '../../services/ownerApi';
import { DAYS, DEFAULT_HOURS, NEEDS, hhmm, initial, isReady, nextNeed, stepsDone } from './ownerSetup';
import { BizLogo, Empty } from './OwnerParts';

/* turns the branch's saved hours into one row per day */
function rowsFrom(hours) {
  return DAYS.map(({ n, name }) => {
    const saved = hours.find(
    (h) => String(h.day_of_week).toLowerCase() === n
    );    if (saved) return { n, name, id: saved.id, open: hhmm(saved.open_time) || '08:00', close: hhmm(saved.close_time) || '20:00', closed: saved.is_closed };
    const [open, close, closed] = DEFAULT_HOURS[name];
    return { n, name, id: null, open, close, closed };
  });
}

/* ---------------- Opening hours tab ---------------- */
function HoursTab({ branch, branches, onSaved }) {
  const [rows, setRows] = useState(() => rowsFrom(branch.hours));
  const [sameAs, setSameAs] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const others = branches.filter((b) => b.id !== branch.id && b.hours.length);

  useEffect(() => { setRows(rowsFrom(branch.hours)); setSameAs(''); }, [branch.id, branch.hours]);

  function edit(i, patch) {
    setSameAs('');
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function copyFrom(id) {
    setSameAs(id);
    if (!id) { setRows(rowsFrom(branch.hours)); return; }
    const src = rowsFrom(branches.find((b) => String(b.id) === id).hours);
    setRows(rows.map((r, i) => ({ ...r, open: src[i].open, close: src[i].close, closed: src[i].closed })));
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      await Promise.all(rows.map((r) => {
        const body = { day_of_week: r.n, open_time: r.open, close_time: r.close, is_closed: r.closed };
        return r.id ? updateHour(r.id, body) : createHour(branch.id, body);
      }));
      await onSaved('Opening hours saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="toolbar">
        <p>When visitors can join this branch's queue.</p>
        <span className="sp" />
        {others.length > 0 && (
          <span className="same">
            <label htmlFor="sameAs">Same as</label>
            <select className="sel" id="sameAs" value={sameAs} onChange={(e) => copyFrom(e.target.value)}>
              <option value="">Own hours</option>
              {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </span>
        )}
        <button className="btn btn-primary btn-sm" type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save hours'}</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="hours">
        {rows.map((r, i) => (
          <div className="day" key={r.n}>
            <b>{r.name}</b>
            <span className="time">
              {r.closed ? <span className="t">Closed</span> : (
                <>
                  <input type="time" value={r.open} aria-label={`${r.name} opens`} onChange={(e) => edit(i, { open: e.target.value })} />
                  –
                  <input type="time" value={r.close} aria-label={`${r.name} closes`} onChange={(e) => edit(i, { close: e.target.value })} />
                </>
              )}
            </span>
            <button className={r.closed ? 'sw off' : 'sw'} type="button" aria-label={`${r.name} open`} aria-pressed={!r.closed} onClick={() => edit(i, { closed: !r.closed })} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Services tab ---------------- */
function ServicesTab({ branch, startOpen, onSaved, toast, reload }) {
  const [open, setOpen] = useState(startOpen);
  const [form, setForm] = useState({ name: '', minutes: '15' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createService(branch.id, { name: form.name.trim(), duration_minutes: Number(form.minutes) });
      setForm({ name: '', minutes: '15' });
      setOpen(false);
      await onSaved('Service added');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try { await deleteService(id); await reload(); toast('Service removed'); } catch (err) { toast(err.message); }
  }

  return (
    <div>
      <div className="toolbar">
        <p>What visitors queue for at this branch.</p>
        <span className="sp" />
        <button className="btn btn-primary btn-sm" type="button" onClick={() => setOpen(true)}>+ Add service</button>
      </div>
      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f wide"><label htmlFor="sn">Service name</label><input id="sn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={60} autoFocus /></div>
          <div className="f"><label htmlFor="sm">Minutes per visitor</label><input id="sm" type="number" min="1" max="240" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} required /></div>
          <div className="fa">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save service'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => { setOpen(false); setError(''); }}>Cancel</button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>
      )}
      <div className="list">
        {branch.services.length ? branch.services.map((s) => (
          <div className="li" key={s.id}>
            <span className="ic">{initial(s.name)}</span>
            <div><b>{s.name}</b><small>About {s.duration_minutes} min per visitor</small></div>
            <span className={s.is_active ? 'st open' : 'st off'}>{s.is_active ? 'Taking visitors' : 'Paused'}</span>
            <button className="del" type="button" onClick={() => remove(s.id)}>Remove</button>
          </div>
        )) : <Empty title="No services yet" text={'Services are what visitors queue for, like "Check-up" or "Cleaning".'} />}
      </div>
    </div>
  );
}

/* ---------------- Staff tab ---------------- */
function StaffTab({ branch, startOpen, onSaved, toast, reload }) {
  const [open, setOpen] = useState(startOpen);
  const [form, setForm] = useState({ email: '', position: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createStaff(branch.id, { user_email: form.email.trim(), position: form.position.trim() || null });
      setForm({ email: '', position: '' });
      setOpen(false);
      await onSaved('Staff member added');
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
    <div>
      <div className="toolbar">
        <p>Staff call the next visitor at this branch. They need a QLess account first.</p>
        <span className="sp" />
        <button className="btn btn-primary btn-sm" type="button" onClick={() => setOpen(true)}>+ Add staff</button>
      </div>
      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f wide"><label htmlFor="te">Their QLess email</label><input id="te" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={120} autoFocus /></div>
          <div className="f"><label htmlFor="tp">Position</label><input id="tp" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} maxLength={60} /></div>
          <div className="fa">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add staff'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => { setOpen(false); setError(''); }}>Cancel</button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>
      )}
      <div className="list">
        {branch.staff.length ? branch.staff.map((s) => (
          <div className="li" key={s.id}>
            <span className="ic">{initial(s.user?.name)}</span>
            <div><b>{s.user?.name}</b><small>{s.user?.email}{s.position ? ` · ${s.position}` : ''}</small></div>
            <span className={s.is_active ? 'st open' : 'st off'}>{s.is_active ? 'Active' : 'Inactive'}</span>
            <button className="del" type="button" onClick={() => remove(s.id)}>Remove</button>
          </div>
        )) : <Empty title="No staff yet" text="Add the people who will call visitors at this branch." />}
      </div>
    </div>
  );
}

/* ---------------- Details tab ---------------- */
function DetailsTab({ branch, reload, toast }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: branch.name, address: branch.address || '', phone: branch.phone || '', email: branch.email || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [armed, setArmed] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateBranch(branch.id, {
        name: form.name.trim(),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      });
      await reload();
      toast('Branch details saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 3000);
      return;
    }
    try {
      await deleteBranch(branch.id);
      await reload();
      toast(`${branch.name} deleted`);
      navigate('/owner/branches');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="pcard" style={{ maxWidth: 760 }} onSubmit={save}>
      <div className="ff">
        <div className="f"><label htmlFor="dn">Branch name</label><input id="dn" name="name" value={form.name} onChange={change} required maxLength={60} /></div>
        <div className="f"><label htmlFor="dp">Phone</label><input id="dp" name="phone" type="tel" value={form.phone} onChange={change} maxLength={20} /></div>
        <div className="f"><label htmlFor="da">Area or address</label><input id="da" name="address" value={form.address} onChange={change} maxLength={120} /></div>
        <div className="f"><label htmlFor="de">Email</label><input id="de" name="email" type="email" value={form.email} onChange={change} maxLength={120} /></div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="toolbar" style={{ margin: '20px 0 0' }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        <span className="sp" />
        <button className="btn btn-danger" type="button" onClick={remove}>{armed ? 'Click again to delete' : 'Delete branch'}</button>
      </div>
    </form>
  );
}

/* ---------------- The branch page ---------------- */
export default function OwnerBranch() {
  const { id } = useParams();
  const { business, branches, reload, toast } = useOutletContext();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const branch = branches.find((b) => String(b.id) === id);

  if (!branch) return <Navigate to="/owner/branches" replace />;

  const tab = params.get('tab') || nextNeed(branch)?.tab || 'hours';
  const addOpen = params.get('add') === '1';
  const setTab = (t, add) => setParams(add ? { tab: t, add: '1' } : { tab: t });

  const ready = isReady(branch);
  const done = stepsDone(branch);
  const need = nextNeed(branch);

  /* after a setup step: go to the next missing step, or back to the overview when the branch is ready */
  async function onSaved(msg) {
    const before = stepsDone(branch);
    const fresh = await reload();
    const after = fresh?.branches.find((b) => b.id === branch.id);
    if (!after || stepsDone(after) <= before) { toast(msg); return; }
    if (isReady(after)) {
      toast(`${after.name} is ready for visitors`);
      setTimeout(() => navigate('/owner/dashboard'), 900);
      return;
    }
    const next = nextNeed(after);
    toast(`${msg} · next: ${next.label.toLowerCase()}`);
    setTimeout(() => setTab(next.tab, next.tab !== 'hours'), 700);
  }

  const state = !branch.is_active ? ['st off', 'Paused by admin'] : ready ? ['st open', 'Ready'] : ['st warn', 'Needs setup'];

  return (
    <section>
      <button className="back" type="button" onClick={() => navigate('/owner/branches')}>‹ All branches</button>

      {!ready && (
        <div className="stepbar">
          <span>Setting up <b>{branch.name}</b> · Step <b>{done + 1} of 4</b> · {need.label}</span>
          <span className="dots">
            <i className="d" />
            {NEEDS.map((n) => <i key={n.tab} className={n.done(branch) ? 'd' : n === need ? 'c' : ''} />)}
          </span>
        </div>
      )}

      <div className="page-h">
        <BizLogo business={business} />
        <h1>{branch.name}</h1>
        <span className={state[0]}>{state[1]}</span>
        <span className="sp" />
        {ready && branch.is_active && (
          <span className="meta">{branch.is_open_now ? 'Open now' : 'Closed now'}</span>
        )}
      </div>

      <div className="tabs" role="tablist">
        <button className={tab === 'hours' ? 'tab on' : 'tab'} type="button" role="tab" onClick={() => setTab('hours')}>
          Opening hours {!branch.hours.length && <span className="dot" />}
        </button>
        <button className={tab === 'services' ? 'tab on' : 'tab'} type="button" role="tab" onClick={() => setTab('services')}>
          Services <span className="n">{branch.services.length}</span>
        </button>
        <button className={tab === 'staff' ? 'tab on' : 'tab'} type="button" role="tab" onClick={() => setTab('staff')}>
          Staff <span className="n">{branch.staff.length}</span>
        </button>
        <button className={tab === 'details' ? 'tab on' : 'tab'} type="button" role="tab" onClick={() => setTab('details')}>
          Details
        </button>
      </div>

      {tab === 'hours' && <HoursTab branch={branch} branches={branches} onSaved={onSaved} />}
      {tab === 'services' && <ServicesTab key={`s${addOpen}`} branch={branch} startOpen={addOpen} onSaved={onSaved} toast={toast} reload={reload} />}
      {tab === 'staff' && <StaffTab key={`t${addOpen}`} branch={branch} startOpen={addOpen} onSaved={onSaved} toast={toast} reload={reload} />}
      {tab === 'details' && <DetailsTab key={branch.id} branch={branch} reload={reload} toast={toast} />}
    </section>
  );
}