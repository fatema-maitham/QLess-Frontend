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
    setData,
    reload,
    toast,
  } = useOutletContext();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [changingId, setChangingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const busy = saving || changingId !== null;

  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const branchName = (id) =>
    id
      ? branches.find((branch) => branch.id === id)?.name ||
        'Removed branch'
      : 'All branches';

  const posted = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });

  async function save(event) {
    event.preventDefault();

    if (busy) return;

    setError('');

    const title = form.title.trim();
    const message = form.message.trim();

    if (!title || !message) {
      setError('Enter a title and message.');
      return;
    }

    setSaving(true);

    try {
      await createAnnouncement(business.id, {
        title,
        message,
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
      setError(
        err.message || 'Could not post the announcement.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(announcement) {
    if (busy) return;

    const nextActive = !announcement.is_active;

    setChangingId(announcement.id);
    setActionError('');

    try {
      const updated = await updateAnnouncement(
        announcement.id,
        { is_active: nextActive }
      );

      if (updated?.is_active !== nextActive) {
        throw new Error(
          'The server did not save the announcement status.'
        );
      }

      setData((current) => ({
        ...current,
        announcements: current.announcements.map((item) =>
          item.id === announcement.id
            ? { ...item, ...updated }
            : item
        ),
      }));

      toast(
        nextActive
          ? 'Announcement activated'
          : 'Announcement deactivated'
      );
    } catch (err) {
      setActionError(
        err.message ||
          'Could not change the announcement status.'
      );
    } finally {
      setChangingId(null);
    }
  }

  return (
    <section className="owner-announcements">
      <div className="page-h">
        <h1>Announcements</h1>
        <span className="sp" />

        <button
          className="btn btn-primary"
          type="button"
          disabled={busy}
          onClick={() => {
            setError('');
            setOpen(true);
          }}
        >
          + New announcement
        </button>
      </div>

      {actionError && (
        <p className="form-error" role="alert">
          {actionError}
        </p>
      )}

      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f">
            <label htmlFor="at">Title</label>
            <input
              id="at"
              name="title"
              value={form.title}
              onChange={change}
              required
              maxLength={80}
              autoFocus
            />
          </div>

          <div className="f wide">
            <label htmlFor="am">Message</label>
            <input
              id="am"
              name="message"
              value={form.message}
              onChange={change}
              required
              maxLength={300}
            />
          </div>

          <div className="f">
            <label htmlFor="ab">Show at</label>
            <select
              id="ab"
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
              disabled={busy}
            >
              {saving ? 'Posting…' : 'Post'}
            </button>

            <button
              className="btn btn-ghost"
              type="button"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}

      <div className="list">
        {announcements.length ? (
          announcements.map((announcement) => (
            <div className="li" key={announcement.id}>
              <span className="ic" aria-hidden="true">
                !
              </span>

              <div>
                <div className="owner-row-title">
                  <b>{announcement.title}</b>

                  <span
                    className={
                      announcement.is_active
                        ? 'st open'
                        : 'st off'
                    }
                  >
                    {announcement.is_active
                      ? 'Showing'
                      : 'Hidden'}
                  </span>
                </div>

                <small>
                  {announcement.message} ·{' '}
                  {branchName(announcement.branch_id)}
                  {announcement.created_at && (
                    <> · {posted(announcement.created_at)}</>
                  )}
                </small>
              </div>

              <div className="owner-row-actions">
                <button
                  className="owner-edit"
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing(announcement)}
                >
                  Edit
                </button>

                <button
                  className="del owner-announcement-toggle"
                  type="button"
                  disabled={busy}
                  aria-busy={
                    changingId === announcement.id
                  }
                  onClick={() =>
                    toggleAvailability(announcement)
                  }
                >
                  {changingId === announcement.id
                    ? 'Updating…'
                    : announcement.is_active
                      ? 'Deactivate'
                      : 'Activate'}
                </button>
              </div>
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
        <AnnouncementEdit
          announcement={editing}
          branches={branches}
          reload={reload}
          toast={toast}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function AnnouncementEdit({
  announcement,
  branches,
  reload,
  toast,
  onClose,
}) {
  const [form, setForm] = useState({
    title: announcement.title || '',
    message: announcement.message || '',
    branch:
      announcement.branch_id == null
        ? 'all'
        : String(announcement.branch_id),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  async function save(event) {
    event.preventDefault();

    if (saving) return;

    setError('');

    const title = form.title.trim();
    const message = form.message.trim();

    if (!title || !message) {
      setError('Enter a title and message.');
      return;
    }

    setSaving(true);

    try {
      await updateAnnouncement(announcement.id, {
        title,
        message,
        branch_id:
          form.branch === 'all'
            ? null
            : Number(form.branch),
      });

      await reload();
      toast('Announcement updated');
      onClose();
    } catch (err) {
      setError(
        err.message || 'Could not update the announcement.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OwnerEditDialog
      title="Edit announcement"
      onClose={onClose}
      onSubmit={save}
      saving={saving}
      error={error}
    >
      <div className="f">
        <label htmlFor="edit-announcement-title">
          Title
        </label>
        <input
          id="edit-announcement-title"
          name="title"
          value={form.title}
          onChange={change}
          required
          maxLength={80}
        />
      </div>

      <div className="f">
        <label htmlFor="edit-announcement-message">
          Message
        </label>
        <input
          id="edit-announcement-message"
          name="message"
          value={form.message}
          onChange={change}
          required
          maxLength={300}
        />
      </div>

      <div className="f">
        <label htmlFor="edit-announcement-branch">
          Show at
        </label>
        <select
          id="edit-announcement-branch"
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
    </OwnerEditDialog>
  );
}