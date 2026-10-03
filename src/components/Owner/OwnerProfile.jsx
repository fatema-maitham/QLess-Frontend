import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { getCategories, updateBusiness } from '../../services/ownerApi';
import { BizLogo } from './OwnerParts';
import OwnerAvailability from './OwnerAvailability';

export default function OwnerProfile() {
  const { business, branches, reload, toast } = useOutletContext();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getCategories().then(setCategories).catch(() => setCategories([])); }, []);

  function startEdit() {
    setForm({
      name: business.name || '',
      category_id: business.category_id ? String(business.category_id) : '',
      description: business.description || '',
      phone: business.phone || '',
      email: business.email || '',
      image: business.image || '',
    });
    setError('');
    setEditing(true);
  }

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateBusiness(business.id, {
        name: form.name.trim(),
        category_id: form.category_id ? Number(form.category_id) : null,
        description: form.description.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        image: form.image.trim() || null,
      });
      await reload();
      setEditing(false);
      toast('Business details saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const since = new Date(business.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const show = (v, empty) => (v ? <b>{v}</b> : <b className="none">{empty}</b>);

  return (
    <section>
      <div className="page-h"><h1>Business profile</h1></div>

      <div className="hero">
        <BizLogo business={business} className="hero-lg" />
        <div className="hero-t">
          <div className="hero-chips">
            {business.category?.name && <span className="chip-c">{business.category.name}</span>}
            <span className={business.is_active ? 'chip-ok' : 'st off'}>
            {business.is_active ? 'Approved · Active' : 'Inactive'}
            </span>          </div>
          <b>{business.name}</b>
          <small>On QLess since {since}</small>
        </div>
        {!editing && <button className="btn hero-btn" type="button" onClick={startEdit}>Edit details</button>}
      </div>

      {!editing ? (
        <>
          <div className="pgrid">
            <div className="pinfo"><span className="pk">Phone</span>{show(business.phone, 'Not added')}</div>
            <div className="pinfo"><span className="pk">Email</span>{show(business.email, 'Not added')}</div>
            <button className="pinfo link" type="button" onClick={() => navigate('/owner/branches')}>
              <span className="pk">Branches</span>
              <b>{branches.length ? `${branches.length} ${branches.length === 1 ? 'branch' : 'branches'}` : 'None yet'}</b>
              <span className="arr">›</span>
            </button>
          </div>
          <div className="pdesc">
            <span className="pk">About</span>
            <p className={business.description ? '' : 'none'}>{business.description || 'No description yet. Tell visitors what you offer.'}</p>
          </div>
        </>
      ) : (
        <form className="pcard" onSubmit={save}>
          <div className="ff">
            <div className="f"><label htmlFor="pn">Business name</label><input id="pn" name="name" value={form.name} onChange={change} required maxLength={80} /></div>
            <div className="f"><label htmlFor="pc">Category</label>
              <select id="pc" name="category_id" value={form.category_id} onChange={change} required>
                {!form.category_id && <option value="" disabled>Choose a category</option>}
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="f full"><label htmlFor="pd">About your business</label><textarea id="pd" name="description" value={form.description} onChange={change} maxLength={200} /></div>
            <div className="f"><label htmlFor="pp">Phone</label><input id="pp" name="phone" type="tel" value={form.phone} onChange={change} maxLength={20} /></div>
            <div className="f"><label htmlFor="pe">Email</label><input id="pe" name="email" type="email" value={form.email} onChange={change} maxLength={120} /></div>
            <div className="f full"><label htmlFor="pi">Logo link</label><input id="pi" name="image" value={form.image} onChange={change} /></div>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="toolbar" style={{ margin: '22px 0 0' }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
      {!editing && (
        <OwnerAvailability
            entity={business}
            kind="business"
            reload={reload}
            toast={toast}
            />
            )}
        </section>
  );
}