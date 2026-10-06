import { useState } from 'react';
import { updateStaff } from '../../services/ownerApi';
import OwnerEditDialog from './OwnerEditDialog';

export default function OwnerStaffEdit({
  staff,
  onClose,
  reload,
  toast,
}) {
  const [position, setPosition] = useState(staff.position || '');
  const [counterNumber, setCounterNumber] = useState(String(staff.counter_number || 1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      await updateStaff(staff.id, {
        position: position.trim() || null,
        counter_number: Number(counterNumber),
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
      description="Update this staff member's role and assigned counter."
      onClose={onClose}
      onSubmit={save}
      saving={saving}
      error={error}
    >
      <p className="owner-context-chip">
        {staff.user?.name} · {staff.user?.email}
      </p>

      <div className="f">
        <label htmlFor="staff-edit-position">Position</label>
        <input
          id="staff-edit-position"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
        />
      </div>

      <div className="f">
        <label htmlFor="staff-edit-counter">Counter</label>
        <input
          id="staff-edit-counter"
          type="number"
          min="1"
          max="20"
          value={counterNumber}
          onChange={(event) => setCounterNumber(event.target.value)}
          required
        />
        <small>Counter is separate from the role. A Teller can work at Counter 1, 2, 3, etc.</small>
      </div>
    </OwnerEditDialog>
  );
}