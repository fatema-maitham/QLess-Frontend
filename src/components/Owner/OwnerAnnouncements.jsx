import { useState } from 'react';
import { useOutletContext } from 'react-router';

import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from '../../services/ownerApi';

import { Empty } from './OwnerParts';
import OwnerEditDialog from './OwnerEditDialog';

const EMPTY_FORM = {
  title: '',
  message: '',
  branch: 'all',
};

export default function OwnerAnnouncements() {
  const {
    business,
    branches,
    announcements,
    reload,
    toast,
  } = useOutletContext();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function change(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function branchName(id) {
    if (!id) return 'All branches';

    return (
      branches.find((branch) => branch.id === id)?.name ||
      'Removed branch'
    );
  }

  function posted(date) {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }

  async function save(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      await createAnnouncement(business.id, {
        title: form.title.trim(),
        message: form.message.trim(),
        branch_id:
          form.branch === 'all'
            ? null
            : Number(form.branch),
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
    try {
      await deleteAnnouncement(id);
      await reload();
      toast('Announcement removed');
    } catch (err) {
      toast(err.message);
    }
  }

  async function saveEdit(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      await updateAnnouncement(editing.id, {
        title: editing.title.trim(),
        message: editing.message.trim(),
        branch_id: editing.branch_id
          ? Number(editing.branch_id)
          : null,
      });

      await reload();
      setEditing(null);
      toast('Announcement updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="page-h">
        <h1>Announcements</h1>

        <span className="sp" />

        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setOpen(true)}
        >
          + New announcement
        </button>
      </div>

      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f">
            <label htmlFor="announcement-title">
              Title
            </label>

            <input
              id="announcement-title"
              name="title"
              value={form.title}
              onChange={change}
              required
              maxLength={80}
              autoFocus
            />
          </div>

          <div className="f wide">
            <label htmlFor="announcement-message">
              Message
            </label>

            <input
              id="announcement-message"
              name="message"
              value={form.message}
              onChange={change}
              required
              maxLength={300}
            />
          </div>

          <div className="f">
            <label htmlFor="announcement-branch">
              Show at
            </label>

            <select
              id="announcement-branch"
              name="branch"
              value={form.branch}
              onChange={change}
            >
              <option value="all">All branches</option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="fa">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Posting…' : 'Post'}
            </button>

            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setOpen(false);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}
        </form>
      )}

      <div className="list">
        {announcements.length ? (
          announcements.map((announcement) => (
            <div className="li" key={announcement.id}>
              <span className="ic">!</span>

              <div>
                <b>{announcement.title}</b>

                <small>
                  {announcement.message} ·{' '}
                  {branchName(announcement.branch_id)} ·{' '}
                  {posted(announcement.created_at)}
                </small>
              </div>

              <span className="owner-row-actions">
                <button
                  className="owner-edit"
                  type="button"
                  onClick={() =>
                    setEditing(announcement)
                  }
                >
                  Edit
                </button>

                <button
                  className="del"
                  type="button"
                  onClick={() =>
                    remove(announcement.id)
                  }
                >
                  Remove
                </button>
              </span>
            </div>
          ))
        ) : (
          <Empty
            title="No announcements"
            text="Tell visitors about closures, new services or busy days."
          />
        )}
      </div>

      {editing && (
        <OwnerEditDialog
          title="Edit announcement"
          onClose={() => {
            setEditing(null);
            setError('');
          }}
          onSubmit={saveEdit}
          saving={saving}
          error={error}
        >
          <div className="f">
            <label htmlFor="edit-announcement-title">
              Title
            </label>

            <input
              id="edit-announcement-title"
              value={editing.title}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  title: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="f">
            <label htmlFor="edit-announcement-message">
              Message
            </label>

            <input
              id="edit-announcement-message"
              value={editing.message}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  message: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="f">
            <label htmlFor="edit-announcement-branch">
              Show at
            </label>

            <select
              id="edit-announcement-branch"
              value={
                editing.branch_id
                  ? String(editing.branch_id)
                  : 'all'
              }
              onChange={(event) =>
                setEditing({
                  ...editing,
                  branch_id:
                    event.target.value === 'all'
                      ? null
                      : Number(event.target.value),
                })
              }
            >
              <option value="all">All branches</option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </OwnerEditDialog>
      )}
    </section>
  );
}