import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { updateStaff } from '../../services/ownerApi';
import OwnerEditDialog from './OwnerEditDialog';
import StaffAssignmentFields from './StaffAssignmentFields';

export default function OwnerStaffEdit({
  staff,
  onClose,
  reload,
  toast,
}) {
  const { branches } = useOutletContext();

  const branch = branches.find(
    (item) =>
      item.id === staff.branch_id ||
      item.id === staff.branch?.id
  );

  const [position, setPosition] = useState(
    staff.position || ''
  );

  const [assignment, setAssignment] = useState({
    queue_id: String(staff.queue_id || ''),
    counter_number: String(
      staff.queue_id ? staff.counter_number || 1 : 1
    ),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await updateStaff(staff.id, {
        position: position.trim() || null,
        queue_id: assignment.queue_id
          ? Number(assignment.queue_id)
          : null,
        counter_number: Number(assignment.counter_number),
      });

      await reload();
      toast('Staff details saved');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <OwnerEditDialog
      title="Edit staff"
      description="Update this staff member’s position, assigned queue and counter."
      onClose={onClose}
      onSubmit={save}
      saving={saving}
      error={error}
    >
      <p className="owner-context-chip">
        {staff.user?.name} · {staff.user?.email}
      </p>

      <div className="f">
        <label htmlFor="staff-edit-position">
          Position
        </label>
        <input
          id="staff-edit-position"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
        />
      </div>

      <div className="f">
        <label htmlFor="staff-edit-branch">
          Branch
        </label>
        <input
          id="staff-edit-branch"
          value={branch?.name || ''}
          readOnly
        />
      </div>

      <StaffAssignmentFields
        prefix="staff-edit"
        queues={branch?.queues || []}
        queueId={assignment.queue_id}
        counterNumber={assignment.counter_number}
        disabled={saving}
        onChange={(changes) =>
          setAssignment((previous) => ({
            ...previous,
            ...changes,
          }))
        }
      />
    </OwnerEditDialog>
  );
}