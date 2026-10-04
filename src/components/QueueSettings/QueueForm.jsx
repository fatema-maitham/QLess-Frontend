import { useState } from "react";

// Starting values for a new queue (same defaults as the backend)
const EMPTY = {
  name: "",
  service_id: "",
  average_service_minutes: "10",
  no_show_grace_minutes: "5",
  max_capacity: "",
  counter_count: "1",
};

// Queue from the API -> form values (inputs always hold strings)
function toFormValues(queue) {
  if (!queue) return EMPTY;
  return {
    name: queue.name,
    service_id: queue.service_id ? String(queue.service_id) : "",
    average_service_minutes: String(queue.average_service_minutes),
    no_show_grace_minutes: String(queue.no_show_grace_minutes),
    max_capacity: queue.max_capacity ? String(queue.max_capacity) : "",
    counter_count: String(queue.counter_count || 1),
  };
}

// Form values -> what the API expects
function toPayload(values) {
  return {
    name: values.name.trim(),
    service_id: values.service_id ? Number(values.service_id) : null,
    average_service_minutes: Number(values.average_service_minutes),
    no_show_grace_minutes: Number(values.no_show_grace_minutes),
    max_capacity: values.max_capacity ? Number(values.max_capacity) : null,
    counter_count: Number(values.counter_count),
  };
}

// Checks before sending, so the owner sees clear messages
function validate(values) {
  const errors = {};
  const avg = Number(values.average_service_minutes);
  const grace = Number(values.no_show_grace_minutes);
  const cap = Number(values.max_capacity);
  const counters = Number(values.counter_count);

  if (!values.name.trim()) errors.name = "Give the queue a name.";
  if (!Number.isInteger(avg) || avg < 1) errors.average_service_minutes = "Use a whole number of 1 or more.";
  if (!Number.isInteger(grace) || grace < 0) errors.no_show_grace_minutes = "Use a whole number of 0 or more.";
  if (values.max_capacity && (!Number.isInteger(cap) || cap < 1)) {
    errors.max_capacity = "Use a whole number of 1 or more, or leave it empty.";
  }
  if (!Number.isInteger(counters) || counters < 1 || counters > 20) {
    errors.counter_count = "Use a whole number from 1 to 20.";
  }

  return errors;
}

/**
 * Create or edit a queue.
 * - queue: the queue to edit, or null for a new one
 * - services: the branch's services, for the dropdown
 * - onSubmit(payload, { openNow }) must return a promise
 */
export default function QueueForm({ queue, services, saving, serverError, onSubmit, onCancel }) {
  const isEdit = Boolean(queue);
  const [values, setValues] = useState(() => toFormValues(queue));
  const [errors, setErrors] = useState({});
  const [openNow, setOpenNow] = useState(true);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(toPayload(values), { openNow: !isEdit && openNow });
  }

  // Helper so each field gets its error message and aria attributes
  const fieldProps = (name) => ({
    id: `queue-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `queue-${name}-error` : `queue-${name}-hint`,
  });

  const errorText = (name) =>
    errors[name] && (
      <p className="qs-field__error" id={`queue-${name}-error`}>
        {errors[name]}
      </p>
    );

  return (
    <form className="qs-form" onSubmit={handleSubmit} noValidate>
      <h2 className="qs-form__title">{isEdit ? `Edit ${queue.name}` : "New queue"}</h2>
      <p className="qs-form__intro">
        {isEdit
          ? "Changes show up for customers straight away."
          : "Set it up once. You can open, pause or close it any time."}
      </p>

      {serverError && (
        <p className="qs-form__alert" role="alert">
          {serverError}
        </p>
      )}

      <div className="qs-field">
        <label htmlFor="queue-name">Queue name</label>
        <input type="text" placeholder="e.g. Walk-in Queue" autoComplete="off" {...fieldProps("name")} />
        <p className="qs-field__hint" id="queue-name-hint">
          Customers see this name.
        </p>
        {errorText("name")}
      </div>

      <div className="qs-field">
        <label htmlFor="queue-service_id">Service</label>
        <select {...fieldProps("service_id")}>
          <option value="">Any service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
        <p className="qs-field__hint" id="queue-service_id-hint">
          Link the queue to one service, or leave it open to all.
        </p>
      </div>

      <div className="qs-form__pair">
        <div className="qs-field">
          <label htmlFor="queue-average_service_minutes">Minutes per person</label>
          <input type="number" min="1" step="1" inputMode="numeric" {...fieldProps("average_service_minutes")} />
          <p className="qs-field__hint" id="queue-average_service_minutes-hint">
            Used to estimate the wait.
          </p>
          {errorText("average_service_minutes")}
        </div>

        <div className="qs-field">
          <label htmlFor="queue-no_show_grace_minutes">No-show grace</label>
          <input type="number" min="0" step="1" inputMode="numeric" {...fieldProps("no_show_grace_minutes")} />
          <p className="qs-field__hint" id="queue-no_show_grace_minutes-hint">
            Minutes to arrive after being called.
          </p>
          {errorText("no_show_grace_minutes")}
        </div>
      </div>

      <div className="qs-field">
        <label htmlFor="queue-counter_count">Counters</label>
        <input type="number" min="1" max="20" step="1" inputMode="numeric" {...fieldProps("counter_count")} />
        <p className="qs-field__hint" id="queue-counter_count-hint">
          How many desks serve this queue at the same time. More counters means a shorter wait.
        </p>
        {errorText("counter_count")}
      </div>

      <div className="qs-field">
        <label htmlFor="queue-max_capacity">
          Maximum people <span className="qs-field__optional">optional</span>
        </label>
        <input type="number" min="1" step="1" inputMode="numeric" placeholder="No limit" {...fieldProps("max_capacity")} />
        <p className="qs-field__hint" id="queue-max_capacity-hint">
          New people can't join once this many are waiting.
        </p>
        {errorText("max_capacity")}
      </div>

      {!isEdit && (
        <label className="qs-check">
          <input type="checkbox" checked={openNow} onChange={(event) => setOpenNow(event.target.checked)} />
          <span>
            <strong>Open it right away</strong>
            Customers can join as soon as it's saved.
          </span>
        </label>
      )}

      <div className="qs-form__actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : openNow ? "Create and open" : "Create queue"}
        </button>
        <button type="button" className="btn btn--outline" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}