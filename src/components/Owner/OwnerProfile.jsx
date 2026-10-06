import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import {
  getCategories,
  updateBusiness,
} from '../../services/ownerApi';
import { uploadImage } from '../../services/cloudinaryService';
import './OwnerAccount.css';

function Icon({ kind }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'edit' ? (
        <path d="m15 5 4 4M4 20l4-1L20 7l-4-4L4 15Z" />
      ) : kind === 'trash' ? (
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
      ) : kind === 'camera' ? (
        <>
          <path d="M4 8h3l2-3h6l2 3h3v12H4Z" />
          <circle cx="12" cy="14" r="3.5" />
        </>
      ) : kind === 'check' ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </>
      ) : (
        <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
      )}
    </svg>
  );
}

export default function OwnerProfile() {
  const { business, branches, reload, toast } = useOutletContext();

  const logoFile = useRef(null);
  const logoUrls = useRef([]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    return () => {
      logoUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function clearLogo() {
    logoUrls.current.forEach((url) => URL.revokeObjectURL(url));
    logoUrls.current = [];
    logoFile.current = null;
  }

  function edit() {
    clearLogo();

    setForm({
      name: business.name || '',
      category_id: String(business.category_id || ''),
      description: business.description || '',
      phone: business.phone || '',
      email: business.email || '',
      image: business.image || '',
    });

    setError('');
    setEditing(true);
  }

  function cancel() {
    clearLogo();
    setEditing(false);
    setForm({});
    setError('');
  }

  function change(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  function chooseLogo(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Choose an image under 5 MB.');
      return;
    }

    const url = URL.createObjectURL(file);

    logoUrls.current.push(url);
    logoFile.current = file;
    setForm((previous) => ({ ...previous, image: url }));
    setError('');
  }

  function removeLogo() {
    logoFile.current = null;
    setForm((previous) => ({ ...previous, image: '' }));
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const savedImage = logoFile.current
        ? await uploadImage(logoFile.current)
        : form.image;

      await updateBusiness(business.id, {
        ...form,
        name: form.name.trim(),
        category_id: Number(form.category_id),
        description: form.description.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        image: savedImage || null,
      });

      await reload();
      clearLogo();
      setEditing(false);
      toast('Business details saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const image = editing ? form.image : business.image;

  return (
    <div>
      <div className="owner-account">
        <div className="sp-container">
          <header className="page-head">
            <h1>Business profile</h1>
          </header>

          {error && (
            <p className="cp-message" role="alert">
              {error}
            </p>
          )}

          <div className="cp-profile bp-no-cover">
            <section className="cp-identity-card">
              <div className="cp-identity-row">
                <div className="cp-avatar">
                  {image ? (
                    <img src={image} alt="" />
                  ) : (
                    <span>{business.name.charAt(0)}</span>
                  )}

                  {editing && (
                    <>
                      <label
                        className="cp-photo-upload"
                        title="Change business logo"
                        aria-label="Change business logo"
                      >
                        <Icon kind="camera" />
                        <input
                          type="file"
                          accept="image/*"
                          disabled={busy}
                          onChange={chooseLogo}
                        />
                      </label>

                      {image && (
                        <button
                          type="button"
                          className="cp-photo-trash"
                          aria-label="Remove business logo"
                          disabled={busy}
                          onClick={removeLogo}
                        >
                          <Icon kind="trash" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="cp-identity">
                  <h2>{business.name}</h2>

                  <div className="pf-tags sp-tags">
                    <span>
                      <Icon kind="business" />
                      {business.category?.name || 'Business'}
                    </span>

                    <span>
                      <Icon kind="check" />
                      {business.is_active ? 'Approved · Active' : 'Inactive'}
                    </span>
                  </div>

                  {editing ? (
                    <label className="bp-about-editor">
                      About your business
                      <textarea
                        form="bp-edit"
                        name="description"
                        value={form.description}
                        onChange={change}
                        maxLength={200}
                        disabled={busy}
                      />
                    </label>
                  ) : (
                    <p className="bp-introduction">
                      {business.description ||
                        'Tell visitors what your business offers.'}
                    </p>
                  )}
                </div>

                {!editing && (
                  <button
                    type="button"
                    className="btn btn--primary cp-button"
                    onClick={edit}
                  >
                    <Icon kind="edit" />
                    Edit details
                  </button>
                )}
              </div>
            </section>

            <section className="cp-details-card">
              <div className="cp-section-heading">
                <h2>
                  {editing ? 'Edit business details' : 'Business details'}
                </h2>
                <p>Your business information and contact details.</p>
              </div>

              {editing ? (
                <form
                  id="bp-edit"
                  className="cp-edit-form"
                  onSubmit={save}
                >
                  <div className="cp-fields">
                    <label>
                      Business name
                      <input
                        name="name"
                        value={form.name}
                        onChange={change}
                        required
                        maxLength={80}
                        disabled={busy}
                      />
                    </label>

                    <label>
                      Category
                      <select
                        name="category_id"
                        value={form.category_id}
                        onChange={change}
                        required
                        disabled={busy}
                      >
                        <option value="" disabled>
                          Choose a category
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Phone
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={change}
                        maxLength={20}
                        disabled={busy}
                      />
                    </label>

                    <label>
                      Email
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={change}
                        maxLength={120}
                        disabled={busy}
                      />
                    </label>
                  </div>

                  <div className="cp-actions">
                    <button
                      type="button"
                      className="btn btn--secondary"
                      disabled={busy}
                      onClick={cancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn--primary"
                      disabled={busy}
                    >
                      {busy ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="cp-facts">
                  <div>
                    <dt>Phone</dt>
                    <dd>{business.phone || 'Not added yet'}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{business.email || 'Not added yet'}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{business.category?.name || 'Not added yet'}</dd>
                  </div>
                  <div>
                    <dt>Branches</dt>
                    <dd>
                      {branches.length}{' '}
                      {branches.length === 1 ? 'branch' : 'branches'}
                    </dd>
                  </div>
                </dl>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}