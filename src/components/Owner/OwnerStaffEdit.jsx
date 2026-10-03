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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      await updateStaff(staff.id, {
        position: position.trim() || null,
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
      description="Update this staff member's position."
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
    </OwnerEditDialog>
  );
}