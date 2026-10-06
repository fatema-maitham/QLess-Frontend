import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { getMe, updateMe } from '../../services/profileService';
import { uploadImage } from '../../services/cloudinaryService';
import { apiDelete } from '../../services/api';
import { saveUser, removeToken } from '../../lib/helpers/jwt-helpers';
import { EyeIcon } from '../Auth/AuthIcons';
import './CustomerProfile.css';

const icons = {
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  edit: <path d="m15 5 4 4M4 20l4-1L20 7l-4-4L4 15Z" />,
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v12H4Z" />
      <circle cx="12" cy="14" r="3.5" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 15-5-5-8 8" />
    </>
  ),
  trash: (
    <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
  ),
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="3" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
};

function Icon({ name }) {
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
      {icons[name]}
    </svg>
  );
}

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [images, setImages] = useState({});
  const imageFiles = useRef({});
  const imageUrls = useRef([]);

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    getMe({ signal: controller.signal })
      .then(setProfile)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setLoadError(error.message);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      imageUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function clearImages() {
    imageUrls.current.forEach((url) => URL.revokeObjectURL(url));
    imageUrls.current = [];
    imageFiles.current = {};
  }

  function startEditing() {
    clearImages();

    setDetails({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
    });

    setImages({
      profile_image: profile.profile_image,
      cover_image: profile.cover_image,
    });

    setMessage('');
    setEditing(true);
  }

  function cancelEditing() {
    clearImages();
    setImages({});
    setEditing(false);
    setMessage('');
  }

  function chooseImage(event, key) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Please use an image under 5 MB.');
      return;
    }

    const url = URL.createObjectURL(file);

    imageUrls.current.push(url);
    imageFiles.current[key] = file;

    setImages((previous) => ({
      ...previous,
      [key]: url,
    }));

    setMessage('');
  }

  function removeImage(key) {
    delete imageFiles.current[key];

    setImages((previous) => ({
      ...previous,
      [key]: null,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!details.name.trim()) {
      setMessage('Enter your full name.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const savedImages = { ...images };

      for (const [key, file] of Object.entries(imageFiles.current)) {
        savedImages[key] = await uploadImage(file);
      }

      const updated = await updateMe({
        ...details,
        ...savedImages,
        name: details.name.trim(),
        email: details.email.trim(),
      });

      const updatedUser = { ...user, ...updated };

      setProfile(updated);
      saveUser(updatedUser);
      setUser(updatedUser);

      clearImages();
      setImages({});
      setEditing(false);
      setMessage('Your details have been updated.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    if (passwords.next !== passwords.confirm) {
      setMessage('Your new passwords do not match.');
      return;
    }

    if (passwords.next.length < 6) {
      setMessage('Use at least 6 characters.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      await updateMe({
        current_password: passwords.current,
        new_password: passwords.next,
      });

      setPasswords({ current: '', next: '', confirm: '' });
      setShowPasswords({ current: false, next: false, confirm: false });
      setMessage('Your password has been updated.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    setBusy(true);

    try {
      await apiDelete('/users/me');
      removeToken();
      setUser(null);
      navigate('/', { replace: true });
    } catch (error) {
      setDeleteOpen(false);
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function switchTab(nextSettings) {
    if (busy) return;

    cancelEditing();
    setSettings(nextSettings);
  }

  if (!profile) {
    return (
      <main className="page">
        <div className="page__container">
          <div className="page-empty">
            {loadError || 'Loading profile…'}
          </div>
        </div>
      </main>
    );
  }

  const shown = editing ? { ...profile, ...images } : profile;

  return (
    <main className="page cp-page">
      <div className="page__container">
        <header className="page-head">
          <div>
            <h1>My profile</h1>
            <p>Your personal information, all in one place.</p>
          </div>
        </header>

        {message && (
          <p className="cp-message" role="status">
            {message}
          </p>
        )}

        <div className="cp-tabs">
          <button
            type="button"
            className={!settings ? 'is-active' : ''}
            aria-pressed={!settings}
            disabled={busy}
            onClick={() => switchTab(false)}
          >
            My profile
          </button>

          <button
            type="button"
            className={settings ? 'is-active' : ''}
            aria-pressed={settings}
            disabled={busy}
            onClick={() => switchTab(true)}
          >
            Account settings
          </button>
        </div>

        {!settings ? (
          <div className="cp-profile cp-layout-cover">
            <section className="cp-identity-card">
              <div className="cp-cover">
                {shown.cover_image ? (
                  <img src={shown.cover_image} alt="" />
                ) : (
                  <svg
                    viewBox="0 0 1000 160"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <rect
                      width="1000"
                      height="160"
                      fill="#F9CA87"
                      opacity=".65"
                    />
                    <path
                      d="M0 115C220 35 360 200 570 110S860 55 1000 100V160H0Z"
                      fill="#F8713A"
                      opacity=".15"
                    />
                  </svg>
                )}

                {editing && (
                  <div className="cp-cover-tools">
                    {shown.cover_image && (
                      <button
                        type="button"
                        className="cp-image-tool cp-cover-trash"
                        title="Remove cover"
                        aria-label="Remove cover"
                        disabled={busy}
                        onClick={() => removeImage('cover_image')}
                      >
                        <Icon name="trash" />
                      </button>
                    )}

                    <label
                      className="cp-image-tool"
                      title="Change cover"
                      aria-label="Change cover"
                    >
                      <Icon name="image" />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={busy}
                        onChange={(event) =>
                          chooseImage(event, 'cover_image')
                        }
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="cp-identity-row">
                <div className="cp-avatar">
                  {shown.profile_image ? (
                    <img src={shown.profile_image} alt="" />
                  ) : (
                    <span>{profile.name.charAt(0).toUpperCase()}</span>
                  )}

                  {editing && (
                    <>
                      <label
                        className="cp-photo-upload"
                        title="Change profile photo"
                        aria-label="Change profile photo"
                      >
                        <Icon name="camera" />
                        <input
                          type="file"
                          accept="image/*"
                          disabled={busy}
                          onChange={(event) =>
                            chooseImage(event, 'profile_image')
                          }
                        />
                      </label>

                      {shown.profile_image && (
                        <button
                          type="button"
                          className="cp-photo-trash"
                          title="Remove profile photo"
                          aria-label="Remove profile photo"
                          disabled={busy}
                          onClick={() => removeImage('profile_image')}
                        >
                          <Icon name="trash" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="cp-identity">
                  <h2>{profile.name}</h2>
                  <span className="cp-role">
                    <Icon name="user" />
                    Visitor
                  </span>
                  <p>{profile.email}</p>
                </div>

                {!editing && (
                  <button
                    type="button"
                    className="btn btn--primary cp-button"
                    onClick={startEditing}
                  >
                    <Icon name="edit" />
                    Edit profile
                  </button>
                )}
              </div>
            </section>

            <section className="cp-details-card">
              <div className="cp-section-heading">
                <h2>
                  {editing ? 'Edit personal details' : 'Personal details'}
                </h2>
                <p>
                  {editing
                    ? 'Update your details below.'
                    : 'Your name and contact information.'}
                </p>
              </div>

              {editing ? (
                <form className="cp-edit-form" onSubmit={handleSave}>
                  <div className="cp-fields">
                    {[
                      ['name', 'Full name', 'text'],
                      ['email', 'Email address', 'email'],
                      ['phone', 'Phone (optional)', 'tel'],
                    ].map(([key, label, type]) => (
                      <label key={key} htmlFor={`cp-${key}`}>
                        {label}
                        <input
                          id={`cp-${key}`}
                          type={type}
                          value={details[key]}
                          disabled={busy}
                          required={key !== 'phone'}
                          autoComplete={key}
                          onChange={(event) =>
                            setDetails((previous) => ({
                              ...previous,
                              [key]: event.target.value,
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>

                  <div className="cp-actions">
                    <button
                      type="button"
                      className="btn btn--secondary"
                      disabled={busy}
                      onClick={cancelEditing}
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
                    <dt>Full name</dt>
                    <dd>{profile.name}</dd>
                  </div>
                  <div>
                    <dt>Email address</dt>
                    <dd>{profile.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{profile.phone || 'Not added yet'}</dd>
                  </div>
                </dl>
              )}
            </section>
          </div>
        ) : (
          <div className="cp-settings-content">
            <section className="cp-setting-card cp-security">
              <div className="cp-setting-title">
                <span className="cp-setting-icon">
                  <Icon name="lock" />
                </span>
                <h2>Change password</h2>
              </div>

              <p>
                Keep your account secure with a password only you know.
              </p>

              <form onSubmit={handlePasswordChange}>
                <div className="cp-fields password">
                  {[
                    ['current', 'Current password'],
                    ['next', 'New password'],
                    ['confirm', 'Confirm new password'],
                  ].map(([key, label]) => (
                    <label key={key} htmlFor={`cp-password-${key}`}>
                      {label}

                      <span className="cp-password-input">
                        <input
                          id={`cp-password-${key}`}
                          type={showPasswords[key] ? 'text' : 'password'}
                          value={passwords[key]}
                          disabled={busy}
                          required
                          minLength={key === 'current' ? undefined : 6}
                          autoComplete={
                            key === 'current'
                              ? 'current-password'
                              : 'new-password'
                          }
                          onChange={(event) =>
                            setPasswords((previous) => ({
                              ...previous,
                              [key]: event.target.value,
                            }))
                          }
                        />

                        <button
                          type="button"
                          className="cp-eye"
                          aria-label={
                            showPasswords[key]
                              ? `Hide ${label.toLowerCase()}`
                              : `Show ${label.toLowerCase()}`
                          }
                          onClick={() =>
                            setShowPasswords((previous) => ({
                              ...previous,
                              [key]: !previous[key],
                            }))
                          }
                        >
                          <EyeIcon open={showPasswords[key]} />
                        </button>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="cp-actions">
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={busy}
                  >
                    {busy ? 'Updating…' : 'Update password'}
                  </button>
                </div>
              </form>
            </section>

            <section className="cp-setting-card cp-danger">
              <div>
                <h2>Delete account</h2>
                <p>Permanently delete your QLess account.</p>
              </div>

              <button
                type="button"
                className="btn btn--secondary cp-delete"
                disabled={busy}
                onClick={() => setDeleteOpen(true)}
              >
                Delete my account
              </button>
            </section>
          </div>
        )}

        {deleteOpen && (
          <div className="cp-modal-backdrop">
            <section
              className="cp-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cp-delete-title"
              onKeyDown={(event) => {
                if (event.key === 'Escape' && !busy) {
                  setDeleteOpen(false);
                }
              }}
            >
              <h2 id="cp-delete-title">Delete your account?</h2>
              <p>This cannot be undone.</p>

              <div className="cp-actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={busy}
                  autoFocus
                  onClick={() => setDeleteOpen(false)}
                >
                  Keep my account
                </button>

                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={busy}
                  onClick={handleDeleteAccount}
                >
                  {busy ? 'Deleting…' : 'Delete account'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}