import { useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router';
import { createBranch } from '../../services/ownerApi';
import { isReady, plural, stepsDone } from './ownerSetup';
import { BizLogo, Empty } from './OwnerParts';

const EMPTY_FORM = { name: '', address: '', phone: '' };

export default function OwnerBranches() {
  const [query, setQuery] = useState('');
  const { business, branches, reload, toast } = useOutletContext();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(params.get('add') === '1');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function close() {
    setOpen(false);
    setForm(EMPTY_FORM);
    setError('');
    if (params.get('add')) setParams({});
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const branch = await createBranch(business.id, {
        name: form.name.trim(),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
      });
      await reload();
      toast('Branch added · next: set opening hours');
      navigate(`/owner/branches/${branch.id}?tab=hours`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="page-h">
        <h1>Branches</h1>
        <span className="sp" />
      <OwnerPageSearch
        value={query}
        onChange={setQuery}
        placeholder="Search branches"
      />
        <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>+ Add branch</button>
      </div>

      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f"><label htmlFor="bn">Branch name</label><input id="bn" name="name" value={form.name} onChange={change} required maxLength={60} autoFocus /></div>
          <div className="f"><label htmlFor="ba">Area or address</label><input id="ba" name="address" value={form.address} onChange={change} maxLength={120} /></div>
          <div className="f"><label htmlFor="bp">Phone</label><input id="bp" name="phone" type="tel" value={form.phone} onChange={change} maxLength={20} /></div>
          <div className="fa">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save branch'}</button>
            <button className="btn btn-ghost" type="button" onClick={close}>Cancel</button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>
      )}

      {branches.length ? (
        <div className="bgrid">
          {branches.map((b) => {
            const ready = isReady(b);
            const done = stepsDone(b) - 1;
            return (
              <button type="button" className="bcard" key={b.id} onClick={() => navigate(`/owner/branches/${b.id}`)}>
                <div className="bc-top">
                  <BizLogo business={business} />
                  <div><b>{b.name}</b><small>{b.address || 'No address yet'}</small></div>
                  {!b.is_active
                    ? <span className="st off">Inactive</span>
                    : ready ? <span className="st open">Ready</span> : <span className="st warn">Needs setup</span>}
                </div>
                <div className="bprog">
                  <div className="track"><i style={{ width: `${(done / 3) * 100}%` }} /></div>
                  <b>{done}/3</b>
                </div>
                <div className="bc-foot">
                  <span className="cnt">
                    {b.hours.length ? 'Hours set' : 'No hours yet'} · {plural(b.services.length, 'service', 'services')} · {b.staff.length} staff
                  </span>
                  <span className="go">{ready ? 'Manage' : 'Continue setup'} ›</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        !open && (
          <div className="list">
            <Empty title="No branches yet" text="A branch is a place visitors come to, like your Seef or Riffa location. Each branch has its own hours, services and staff." />
          </div>
        )
      )}
    </section>
  );
}