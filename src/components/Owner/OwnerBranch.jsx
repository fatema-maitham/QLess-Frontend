import { useEffect, useState } from 'react';
import {
  Navigate,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router';

import {
  createHour,
  createService,
  createStaff,
  deleteService,
  deleteStaff,
  updateBranch,
  updateHour,
} from '../../services/ownerApi';

import {
  DAYS,
  DEFAULT_HOURS,
  NEEDS,
  hhmm,
  initial,
  isReady,
  nextNeed,
  stepsDone,
} from './ownerSetup';

import { BizLogo, Empty } from './OwnerParts';
import OwnerServiceEdit from './OwnerServiceEdit';
import OwnerStaffEdit from './OwnerStaffEdit';
import OwnerAvailability from './OwnerAvailability';
import OwnerPageSearch from './OwnerPageSearch';
import StaffAssignmentFields from '../Staff/StaffAssignmentFields';

function rowsFrom(hours) {
  return DAYS.map(({ n, name }) => {
    const saved = hours.find(
      (h) => String(h.day_of_week).toLowerCase() === n
    );

    if (saved) {
      return {
        n,
        name,
        id: saved.id,
        open: hhmm(saved.open_time) || '08:00',
        close: hhmm(saved.close_time) || '20:00',
        closed: saved.is_closed,
      };
    }

    const [open, close, closed] = DEFAULT_HOURS[name];

    return {
      n,
      name,
      id: null,
      open,
      close,
      closed,
    };
  });
}

function HoursTab({ branch, branches, onSaved }) {
  const [rows, setRows] = useState(() => rowsFrom(branch.hours));
  const [sameAs, setSameAs] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const others = branches.filter(
    (item) => item.id !== branch.id && item.hours.length
  );

  useEffect(() => {
    setRows(rowsFrom(branch.hours));
    setSameAs('');
  }, [branch.id, branch.hours]);

  function edit(index, patch) {
    setSameAs('');

    setRows((currentRows) =>
      currentRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row
      )
    );
  }

  function copyFrom(id) {
    setSameAs(id);

    if (!id) {
      setRows(rowsFrom(branch.hours));
      return;
    }

    const source = branches.find(
      (item) => String(item.id) === id
    );

    const sourceRows = rowsFrom(source.hours);

    setRows((currentRows) =>
      currentRows.map((row, index) => ({
        ...row,
        open: sourceRows[index].open,
        close: sourceRows[index].close,
        closed: sourceRows[index].closed,
      }))
    );
  }

  async function save() {
    setSaving(true);
    setError('');

    try {
      await Promise.all(
        rows.map((row) => {
          const body = {
            day_of_week: row.n,
            open_time: row.open,
            close_time: row.close,
            is_closed: row.closed,
          };

          return row.id
            ? updateHour(row.id, body)
            : createHour(branch.id, body);
        })
      );

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

            <select
              className="sel"
              id="sameAs"
              value={sameAs}
              onChange={(event) => copyFrom(event.target.value)}
            >
              <option value="">Own hours</option>

              {others.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </span>
        )}

        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save hours'}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="hours">
        {rows.map((row, index) => (
          <div className="day" key={row.n}>
            <b>{row.name}</b>

            <span className="time">
              {row.closed ? (
                <span className="t">Closed</span>
              ) : (
                <>
                  <input
                    type="time"
                    value={row.open}
                    aria-label={`${row.name} opens`}
                    onChange={(event) =>
                      edit(index, { open: event.target.value })
                    }
                  />

                  –

                  <input
                    type="time"
                    value={row.close}
                    aria-label={`${row.name} closes`}
                    onChange={(event) =>
                      edit(index, { close: event.target.value })
                    }
                  />
                </>
              )}
            </span>

            <button
              className={row.closed ? 'sw off' : 'sw'}
              type="button"
              aria-label={`${row.name} open`}
              aria-pressed={!row.closed}
              onClick={() => edit(index, { closed: !row.closed })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesTab({
  branch,
  startOpen,
  onSaved,
  toast,
  reload,
}) {
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(startOpen);
  const [form, setForm] = useState({
    name: '',
    minutes: '15',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      await createService(branch.id, {
        name: form.name.trim(),
        duration_minutes: Number(form.minutes),
      });

      setForm({
        name: '',
        minutes: '15',
      });

      setOpen(false);
      await onSaved('Service added');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      await deleteService(id);
      await reload();
      toast('Service removed');
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <div>
      <div className="toolbar">
        <p>What visitors queue for at this branch.</p>

        <span className="sp" />

        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => setOpen(true)}
        >
          + Add service
        </button>
      </div>

      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f wide">
            <label htmlFor="sn">Service name</label>

            <input
              id="sn"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="f">
            <label htmlFor="sm">Minutes per visitor</label>

            <input
              id="sm"
              type="number"
              min="1"
              max="240"
              value={form.minutes}
              onChange={(event) =>
                setForm({
                  ...form,
                  minutes: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="fa">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save service'}
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
        {branch.services.length ? (
          branch.services.map((service) => (
            <div className="li" key={service.id}>
              <span className="ic">{initial(service.name)}</span>

              <div>
                <div className="owner-row-title">
                  <b>{service.name}</b>

                  <span
                    className={
                      service.is_active ? 'st open' : 'st off'
                    }
                  >
                    {service.is_active
                      ? 'Taking visitors'
                      : 'Inactive'}
                  </span>
                </div>

                <small>
                  About {service.duration_minutes} min per visitor
                </small>
              </div>

              <span className="acts">
                <button
                  className="edit-action"
                  type="button"
                  onClick={() => setEditing(service)}
                >
                  Edit
                </button>

                <button
                  className="del"
                  type="button"
                  onClick={() => remove(service.id)}
                >
                  Remove
                </button>
              </span>
            </div>
          ))
        ) : (
          <Empty
            title="No services yet"
            text="Services are what visitors queue for."
          />
        )}
      </div>

      {editing && (
        <OwnerServiceEdit
          service={editing}
          branch={branch}
          reload={reload}
          toast={toast}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
function StaffTab({
  branch,
  startOpen,
  onSaved,
  toast,
  reload,
}) {
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(startOpen);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    position: '',
    queue_id: '',
    counter_number: '1',
  });

  const busy = saving || removingId !== null;

  async function save(event) {
    event.preventDefault();
    if (busy) return;

    setSaving(true);
    setError('');

    try {
      await createStaff(branch.id, {
        user_email: form.email.trim(),
        position: form.position.trim() || null,
        queue_id: form.queue_id
          ? Number(form.queue_id)
          : null,
        counter_number: Number(form.counter_number),
      });

      setForm({
        email: '',
        position: '',
        queue_id: '',
        counter_number: '1',
      });

      setOpen(false);
      await onSaved('Staff member added');
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
      toast(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <div className="toolbar">
        <p>Staff call the next visitor at this branch.</p>
        <span className="sp" />

        <button
          className="btn btn-primary btn-sm"
          type="button"
          disabled={busy}
          onClick={() => {
            setError('');
            setOpen(true);
          }}
        >
          + Add staff
        </button>
      </div>

      {open && (
        <form className="addform" onSubmit={save}>
          <div className="f wide">
            <label htmlFor="branch-staff-email">
              Their QLess email
            </label>
            <input
              id="branch-staff-email"
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
            <label htmlFor="branch-staff-position">
              Position
            </label>
            <input
              id="branch-staff-position"
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

          <StaffAssignmentFields
            prefix="branch-staff"
            queues={branch.queues || []}
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

      {branch.staff.length ? (
        <div className="list">
          {branch.staff.map((staff) => {
            const queue = branch.queues?.find(
              (item) => item.id === staff.queue_id
            );

            return (
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
                    {staff.user?.email}
                    {staff.position
                      ? ` · ${staff.position}`
                      : ''}
                  </small>

                  <div className="owner-assignment-tags">
                    <span>
                      {queue?.name || 'Not assigned'}
                    </span>
                    <span>
                      Counter {staff.counter_number || 1}
                    </span>
                  </div>
                </div>

                <span className="acts">
                  <button
                    className="edit-action"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setEditing({ ...staff, branch })
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="del"
                    type="button"
                    disabled={busy}
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
          title="No staff yet"
          text="Add the people who call visitors at this branch."
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
    </div>
  );
}

function DetailsTab({ branch, reload, toast }) {
  const [form, setForm] = useState({
    name: branch.name,
    address: branch.address || '',
    phone: branch.phone || '',
    email: branch.email || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function change(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function save(event) {
    event.preventDefault();

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

  return (
    <div className="owner-branch-details">
      <form onSubmit={save}>
        <div className="owner-detail-intro">
          <span>BRANCH INFORMATION</span>
          <h2>Branch details</h2>
          <p>Keep your branch details up to date.</p>
        </div>

        <div className="owner-detail-section">
          <div>
            <h3>Branch details</h3>
            <p>Shown to visitors when they choose a branch.</p>
          </div>

          <div className="owner-detail-fields">
            <div className="f">
              <label htmlFor="dn">Branch name</label>

              <input
                id="dn"
                name="name"
                value={form.name}
                onChange={change}
                required
              />
            </div>

            <div className="f">
              <label htmlFor="da">Address</label>

              <input
                id="da"
                name="address"
                value={form.address}
                onChange={change}
              />
            </div>
          </div>
        </div>

        <div className="owner-detail-section">
          <div>
            <h3>Contact</h3>
            <p>Direct contact details for this location.</p>
          </div>

          <div className="owner-detail-fields">
            <div className="f">
              <label htmlFor="dp">Phone number</label>

              <input
                id="dp"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={change}
              />
            </div>

            <div className="f">
              <label htmlFor="de">Email</label>

              <input
                id="de"
                name="email"
                type="email"
                value={form.email}
                onChange={change}
              />
            </div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="owner-detail-save">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <OwnerAvailability
        entity={branch}
        kind="branch"
        reload={reload}
        toast={toast}
      />
    </div>
  );
}

export default function OwnerBranch() {
  const { id } = useParams();
  const { business, branches, reload, toast } =
    useOutletContext();

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const branch = branches.find(
    (item) => String(item.id) === id
  );

  if (!branch) {
    return <Navigate to="/owner/branches" replace />;
  }

  const tab =
    params.get('tab') ||
    nextNeed(branch)?.tab ||
    'hours';

  const addOpen = params.get('add') === '1';

  function setTab(tabName, add = false) {
    setParams(
      add
        ? { tab: tabName, add: '1' }
        : { tab: tabName }
    );
  }

  const ready = isReady(branch);
  const done = stepsDone(branch);
  const need = nextNeed(branch);

  async function onSaved(message) {
    const before = stepsDone(branch);
    const fresh = await reload();

    const updatedBranch = fresh?.branches.find(
      (item) => item.id === branch.id
    );

    if (
      !updatedBranch ||
      stepsDone(updatedBranch) <= before
    ) {
      toast(message);
      return;
    }

    if (isReady(updatedBranch)) {
      toast(`${updatedBranch.name} is ready for visitors`);
      setTimeout(
        () => navigate('/owner/dashboard'),
        900
      );
      return;
    }

    const next = nextNeed(updatedBranch);

    toast(
      `${message} · next: ${next.label.toLowerCase()}`
    );

    setTimeout(
      () => setTab(next.tab, next.tab !== 'hours'),
      700
    );
  }

  const state = !branch.is_active
    ? ['st off', 'Inactive']
    : ready
      ? ['st open', 'Ready']
      : ['st warn', 'Needs setup'];

  return (
    <section>
      <button
        className="back"
        type="button"
        onClick={() => navigate('/owner/branches')}
      >
        ‹ All branches
      </button>

      {!ready && (
        <div className="stepbar">
          <span>
            Setting up <b>{branch.name}</b> · Step{' '}
            <b>{done + 1} of 4</b> · {need.label}
          </span>
        </div>
      )}

      <div className="page-h">
        <BizLogo business={business} />
        <h1>{branch.name}</h1>
        <span className={state[0]}>{state[1]}</span>
        <span className="sp" />

        {ready && branch.is_active && (
          <span className="meta">
            {branch.is_open_now ? 'Open now' : 'Closed now'}
          </span>
        )}
      </div>

      <div className="tabs" role="tablist">
        <button
          className={tab === 'hours' ? 'tab on' : 'tab'}
          type="button"
          onClick={() => setTab('hours')}
        >
          Opening hours
        </button>

        <button
          className={tab === 'services' ? 'tab on' : 'tab'}
          type="button"
          onClick={() => setTab('services')}
        >
          Services <span className="n">{branch.services.length}</span>
        </button>

        <button
          className={tab === 'staff' ? 'tab on' : 'tab'}
          type="button"
          onClick={() => setTab('staff')}
        >
          Staff <span className="n">{branch.staff.length}</span>
        </button>

        <button
          className={tab === 'details' ? 'tab on' : 'tab'}
          type="button"
          onClick={() => setTab('details')}
        >
          Details
        </button>
      </div>

      {tab === 'hours' && (
        <HoursTab
          branch={branch}
          branches={branches}
          onSaved={onSaved}
        />
      )}

      {tab === 'services' && (
        <ServicesTab
          branch={branch}
          startOpen={addOpen}
          onSaved={onSaved}
          toast={toast}
          reload={reload}
        />
      )}

      {tab === 'staff' && (
        <StaffTab
          branch={branch}
          branches={branches}
          startOpen={addOpen}
          onSaved={onSaved}
          toast={toast}
          reload={reload}
        />
      )}

      {tab === 'details' && (
        <DetailsTab
          branch={branch}
          reload={reload}
          toast={toast}
        />
      )}
    </section>
  );
}