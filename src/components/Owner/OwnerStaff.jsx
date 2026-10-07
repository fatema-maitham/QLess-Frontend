import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { createStaff, deleteStaff } from '../../services/ownerApi';
import { initial } from './ownerSetup';
import { Empty } from './OwnerParts';
import OwnerStaffEdit from './OwnerStaffEdit';
import OwnerPageSearch from './OwnerPageSearch';
import StaffAssignmentFields from '../Staff/StaffAssignmentFields';

export default function OwnerStaff() {
  const { branches, reload, toast } = useOutletContext();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    position: '',
    branch: '',
    queue_id: '',
    counter_number: '1',
  });

  const busy = saving || removingId !== null;

  const selectedBranch = branches.find(
    (branch) => String(branch.id) === form.branch
  );

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

  const visiblePeople = people.filter((staff) => {
    const queue = staff.branch.queues?.find(
      (item) => item.id === staff.queue_id
    );

    return [
      staff.user?.name,
      staff.user?.email,
      staff.position,
      staff.branch.name,
      queue?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  });

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
      queue_id: '',
      counter_number: '1',
    });

    setError('');
    setOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    if (busy) return;

    setSaving(true);
    setError('');

    try {
      await createStaff(Number(form.branch), {
        user_email: form.email.trim(),
        position: form.position.trim() || null,
        queue_id: form.queue_id
          ? Number(form.queue_id)
          : null,
        counter_number: Number(form.counter_number),
      });

      await reload();
      setOpen(false);
      toast(`Staff member added to ${selectedBranch?.name}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (busy) return;

    setRemovingId(id);

    try {
      await deleteStaff(id);
      await reload();
      toast('Staff member removed');
    } catch (err) {
      toast(err.message || 'Could not remove the staff member.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section>
      <div className="page-h">
        <h1>Staff</h1>
        <span className="sp" />

        <OwnerPageSearch
          value={query}
          onChange={setQuery}
          placeholder="Search staff"
        />

        {branches.length > 1 && (
          <select
            className="sel"
            aria-label="Filter by branch"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
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
          disabled={busy}
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
              disabled={busy}
              required
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
            />
          </div>

          <div className="f">
            <label htmlFor="staff-position">Position</label>
            <input
              id="staff-position"
              value={form.position}
              disabled={busy}
              onChange={(event) =>
                setForm({
                  ...form,
                  position: event.target.value,
                })
              }
            />
          </div>

          <div className="f">
            <label htmlFor="staff-branch">Branch</label>
            <select
              id="staff-branch"
              value={form.branch}
              disabled={busy}
              required
              onChange={(event) =>
                setForm({
                  ...form,
                  branch: event.target.value,
                  queue_id: '',
                  counter_number: '1',
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

          <StaffAssignmentFields
            prefix="staff"
            queues={selectedBranch?.queues || []}
            queueId={form.queue_id}
            counterNumber={form.counter_number}
            disabled={busy}
            onChange={(changes) =>
              setForm((previous) => ({
                ...previous,
                ...changes,
              }))
            }
          />

          <div className="fa">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={busy}
            >
              {saving ? 'Saving…' : 'Add staff'}
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

      {people.length ? (
        visiblePeople.length ? (
          <div className="list">
            {visiblePeople.map((staff) => {
              const queue = staff.branch.queues?.find(
                (item) => item.id === staff.queue_id
              );

              return (
                <div className="li" key={staff.id}>
                  <span className="owner-staff-avatar">                    {staff.user?.profile_image ? (
                    <img
                      src={staff.user.profile_image}
                      alt={`${staff.user?.name || 'Staff'} profile`}
                      className="owner-staff-avatar__image"
                    />
                  ) : (
                    initial(staff.user?.name)
                  )}
                  </span>

                  <div>
                    <div className="owner-row-title">
                      <b>{staff.user?.name}</b>
                    </div>

                    <small>
                      {staff.user?.email}
                      {' · '}
                      {staff.branch.name}
                      {staff.position
                        ? ` · ${staff.position}`
                        : ''}
                    </small>

                    <div className="owner-assignment-tags">
                      <span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="14"
                            rx="3"
                          />
                          <path d="M7 10h4M7 14h7" />
                        </svg>
                        {queue?.name || 'Not assigned'}
                      </span>

                      <span>
                        Counter {staff.counter_number || 1}
                      </span>
                    </div>
                  </div>

                  <span className="owner-row-actions">
                    <button
                      className="owner-edit"
                      type="button"
                      disabled={busy}
                      onClick={() => setEditing(staff)}
                    >
                      Edit
                    </button>

                    <button
                      className="del"
                      type="button"
                      disabled={busy}
                      aria-busy={removingId === staff.id}
                      onClick={() => remove(staff.id)}
                    >
                      {removingId === staff.id
                        ? 'Removing…'
                        : 'Remove'}
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty
            title="No matching staff"
            text="Try another name, email or queue."
          />
        )
      ) : (
        <Empty
          title="No staff yet"
          text="Add the people who call visitors at your branches."
        />
      )}

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