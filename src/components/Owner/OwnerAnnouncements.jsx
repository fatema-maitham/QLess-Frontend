import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { createAnnouncement, deleteAnnouncement } from '../../services/ownerApi';
import { Empty } from './OwnerParts';

const EMPTY_FORM = { title: '', message: '', branch: 'all' };

export default function OwnerAnnouncements() {
  const { business, branches, announcements, reload, toast } = useOutletContext();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const branchName = (id) => (id ? branches.find((b) => b.id === id)?.name || 'Removed branch' : 'All branches');
  const posted = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createAnnouncement(business.id, {
        title: form.title.trim(),
        message: form.message.trim(),
        branch_id: form.branch === 'all' ? null : Number(form.branch),
      });
      await reload();
      setForm(EMPTY_FORM);
      setOpen(false);
      toast('Announcement posted');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try { await deleteAnnouncement(id); await reload(); toast('Announcement removed'); } catch (err) { toast(err.message); }
  }

  return (
    <section>
      <div className="page-h">
        <h1>Announcements</h1>
        <span className="sp" />
        <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>+ New announcement</button>
      </div>

      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f"><label htmlFor="at">Title</label><input id="at" name="title" value={form.title} onChange={change} required maxLength={80} autoFocus /></div>
          <div className="f wide"><label htmlFor="am">Message</label><input id="am" name="message" value={form.message} onChange={change} required maxLength={300} /></div>
          <div className="f"><label htmlFor="ab">Show at</label>
            <select id="ab" name="branch" value={form.branch} onChange={change}>
              <option value="all">All branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="fa">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Posting…' : 'Post'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => { setOpen(false); setError(''); }}>Cancel</button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>
      )}

      <div className="list">
        {announcements.length ? announcements.map((a) => (
          <div className="li" key={a.id}>
            <span className="ic">!</span>
            <div><b>{a.title}</b><small>{a.message} · {branchName(a.branch_id)} · {posted(a.created_at)}</small></div>
            <span className={a.is_active ? 'st open' : 'st off'}>{a.is_active ? 'Showing' : 'Hidden'}</span>
            <button className="del" type="button" onClick={() => remove(a.id)}>Remove</button>
          </div>
        )) : <Empty title="No announcements" text="Tell visitors about closures, new services or busy days." />}
      </div>
    </section>
  );
}