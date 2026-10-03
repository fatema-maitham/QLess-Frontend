import { useState } from 'react';
import { updateBusiness, updateBranch } from '../../services/ownerApi';
import OwnerEditDialog from './OwnerEditDialog';

export default function OwnerAvailability({
  entity,
  kind,
  reload,
  toast,
}) {
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activating = !entity.is_active;
  const label = `${activating ? 'Activate' : 'Deactivate'} ${kind}`;

  async function save(event) {
    event.preventDefault();

    setSaving(true);
    setError('');

    try {
      const update =
        kind === 'business' ? updateBusiness : updateBranch;

      await update(entity.id, {
        is_active: activating,
      });

      await reload();
      setConfirm(false);

      toast(
        `${kind === 'business' ? 'Business' : 'Branch'} ${
          activating ? 'activated' : 'deactivated'
        }`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`owner-availability ${activating ? 'is-inactive' : ''}`}>
        <div>
          <h3>
            {kind === 'business' ? 'Business' : 'Branch'} availability{' '}
            <span className={`st ${entity.is_active ? 'open' : 'off'}`}>
              {entity.is_active ? 'Active' : 'Inactive'}
            </span>
          </h3>

          <p>
            {activating
              ? `This ${kind} is hidden from visitors.`
              : `Hide this ${kind} from visitors while keeping its details.`}
          </p>
        </div>

        <button
          className={`btn ${
            activating ? 'btn-primary' : 'btn-danger'
          }`}
          type="button"
          onClick={() => setConfirm(true)}
        >
          {label}
        </button>
      </div>

      {confirm && (
        <OwnerEditDialog
          title={`${label}?`}
          description={entity.name}
          onClose={() => setConfirm(false)}
          onSubmit={save}
          saving={saving}
          error={error}
          submitLabel={label}
          danger={!activating}
        >
          <p>
            {activating
              ? 'Visitors will be able to see this again.'
              : 'Visitors will no longer see this.'}
          </p>
        </OwnerEditDialog>
      )}
    </>
  );
}