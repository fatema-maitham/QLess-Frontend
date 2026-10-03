import { useState } from 'react';
import { updateService } from '../../services/ownerApi';
import OwnerEditDialog from './OwnerEditDialog';

export default function OwnerServiceEdit({
  service,
  branch,
  onClose,
  reload,
  toast,
}) {
  const [name, setName] = useState(service.name || '');
  const [minutes, setMinutes] = useState(service.duration_minutes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      await updateService(service.id, {
        name: name.trim(),
        duration_minutes: Number(minutes),
      });

      await reload();
      toast('Service changes saved');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <OwnerEditDialog
      title="Edit service"
      description={`Update this service at ${branch.name}.`}
      onClose={onClose}
      onSubmit={save}
      saving={saving}
      error={error}
    >
      <div className="f">
        <label htmlFor="service-edit-name">Service name</label>
        <input
          id="service-edit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="f">
        <label htmlFor="service-edit-minutes">
          Minutes per visitor
        </label>
        <input
          id="service-edit-minutes"
          type="number"
          min="1"
          max="240"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
          required
        />
      </div>
    </OwnerEditDialog>
  );
}