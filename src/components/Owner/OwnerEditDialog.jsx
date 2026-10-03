import { useEffect, useId, useRef } from 'react';

export default function OwnerEditDialog({
  title,
  description,
  children,
  onClose,
  onSubmit,
  saving,
  error,
  submitLabel = 'Save changes',
  danger = false,
}) {
  const dialog = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    element.showModal();

    return () => {
      if (element.open) element.close();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="owner-edit-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <form onSubmit={onSubmit}>
        <div className="owner-modal-head">
          <h2 id={titleId}>{title}</h2>

          <button
            type="button"
            className="owner-modal-close"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        {description && (
          <p className="owner-modal-description">{description}</p>
        )}

        <fieldset disabled={saving} className="owner-modal-fields">
          {children}
        </fieldset>

        {error && <p className="form-error">{error}</p>}

        <div className="owner-modal-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            disabled={saving}
          >
            {saving ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}