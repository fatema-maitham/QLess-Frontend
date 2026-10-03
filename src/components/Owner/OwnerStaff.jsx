import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import {
  createStaff,
  deleteStaff,
} from '../../services/ownerApi';

import { initial } from './ownerSetup';
import { Empty } from './OwnerParts';
import OwnerStaffEdit from './OwnerStaffEdit';

export default function OwnerStaff() {
  const { branches, reload, toast } =
    useOutletContext();

  const navigate = useNavigate();

  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    email: '',
    position: '',
    branch: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const people = branches
    .flatMap((branch) =>
      branch.staff.map((staff) => ({
        ...staff,
        branch,
      }))
    )
    .filter(
      (staff) =>
        filter === 'all' ||
        String(staff.branch.id) === filter
    );

  function openForm() {
    if (!branches.length) {
      toast('Add a branch first');
      navigate('/owner/branches?add=1');
      return;
    }

    setForm({
      email: '',
      position: '',
      branch:
        filter !== 'all'
          ? filter
          : String(branches[0].id),
    });

    setError('');
    setOpen(true);
  }

  async function save(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      await createStaff(Number(form.branch), {
        user_email: form.email.trim(),
        position: form.position.trim() || null,
      });

      await reload();
      setOpen(false);

      const branch = branches.find(
        (item) => String(item.id) === form.branch
      );

      toast(`Staff member added to ${branch?.name}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      await deleteStaff(id);
      await reload();
      toast('Staff member removed');
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <section>
      <div className="page-h">
        <h1>Staff</h1>

        <span className="sp" />

        {branches.length > 1 && (
          <select
            className="sel"
            aria-label="Filter by branch"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >
            <option value="all">All branches</option>

            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        )}

        <button
          className="btn btn-primary"
          type="button"
          onClick={openForm}
        >
          + Add staff
        </button>
      </div>

      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f wide">
            <label htmlFor="staff-email">
              Their QLess email
            </label>

            <input
              id="staff-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="f">
            <label htmlFor="staff-position">
              Position
            </label>

            <input
              id="staff-position"
              value={form.position}
              onChange={(event) =>
                setForm({
                  ...form,
                  position: event.target.value,
                })
              }
            />
          </div>

          <div className="f">
            <label htmlFor="staff-branch">
              Branch
            </label>

            <select
              id="staff-branch"
              value={form.branch}
              onChange={(event) =>
                setForm({
                  ...form,
                  branch: event.target.value,
                })
              }
            >
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
              {saving ? 'Saving…' : 'Add staff'}
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
        {people.length ? (
          people.map((staff) => (
            <div className="li" key={staff.id}>
              <span className="ic">
                {initial(staff.user?.name)}
              </span>

              <div>
                <div className="owner-row-title">
                  <b>{staff.user?.name}</b>

                  <span
                    className={
                      staff.is_active
                        ? 'st open'
                        : 'st off'
                    }
                  >
                    {staff.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>

                <small>
                  {staff.user?.email} · {staff.branch.name}
                  {staff.position
                    ? ` · ${staff.position}`
                    : ''}
                </small>
              </div>

              <span className="owner-row-actions">
                <button
                  className="owner-edit"
                  type="button"
                  onClick={() => setEditing(staff)}
                >
                  Edit
                </button>

                <button
                  className="del"
                  type="button"
                  onClick={() => remove(staff.id)}
                >
                  Remove
                </button>
              </span>
            </div>
          ))
        ) : (
          <Empty
            title="No staff yet"
            text="Add the people who call visitors at your branches."
          />
        )}
      </div>

      {editing && (
        <OwnerStaffEdit
          staff={editing}
          reload={reload}
          toast={toast}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}