export default function StaffAssignmentFields({
  queues = [],
  queueId,
  counterNumber,
  onChange,
  disabled = false,
  prefix = 'staff',
}) {
  const selectedQueue = queues.find(
    (queue) => String(queue.id) === String(queueId)
  );

  const counterCount = selectedQueue?.counter_count || 1;

  return (
    <>
      <div className="f">
        <label htmlFor={`${prefix}-queue`}>
          Assigned queue
        </label>

        <select
          id={`${prefix}-queue`}
          value={queueId}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              queue_id: event.target.value,
              counter_number: '1',
            })
          }
        >
          <option value="">Not assigned</option>

          {queues.map((queue) => (
            <option key={queue.id} value={queue.id}>
              {queue.name}
            </option>
          ))}
        </select>
      </div>

      <div className="f">
        <label htmlFor={`${prefix}-counter`}>
          Counter
        </label>

        <select
          id={`${prefix}-counter`}
          value={counterNumber}
          disabled={disabled}
          required
          onChange={(event) =>
            onChange({
              counter_number: event.target.value,
            })
          }
        >
          {Array.from(
            { length: counterCount },
            (_, index) => index + 1
          ).map((number) => (
            <option key={number} value={number}>
              Counter {number}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}