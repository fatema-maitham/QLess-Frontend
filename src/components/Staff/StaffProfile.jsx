import { useContext, useState } from 'react';
import { useOutletContext } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { saveUser } from '../../lib/helpers/jwt-helpers';
import { updateMe } from '../../services/profileService';
import { uploadImage } from '../../services/cloudinaryService';
import { initial } from './staffHelpers';

const Svg = ({ children, color = '#E2572A', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const UserIcon = () => <Svg><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></Svg>;
const MailIcon = () => <Svg><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 7l9 6 9-6" /></Svg>;
const PhoneIcon = () => <Svg><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></Svg>;
const LockIcon = () => <Svg><rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>;

function Field({ id, label, icon, ...input }) {
  return (
    <div className="pf-f">
      <label htmlFor={id}>{label}</label>
      <div className="pf-in">{icon}<input id={id} {...input} /></div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pf-f">
      <label htmlFor={id}>{label}</label>
      <div className="pf-in">
        <LockIcon />
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete="new-password" />
        <button type="button" className="pf-eye" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>
          <Svg color="#5A524C"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Svg>
        </button>
      </div>
    </div>
  );
}

export default function StaffProfile() {
  const { me, profile, setProfile } = useOutletContext();
  const { user, setUser } = useContext(UserContext);
  const [tab, setTab] = useState('details');
  const [details, setDetails] = useState({ name: profile.name, email: profile.email, phone: profile.phone || '' });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Save the new account everywhere: this page, the header and the signed-in user
  function applyUpdate(updated) {
    setProfile(updated);
    const merged = { ...user, ...updated };
    setUser(merged);
    saveUser(merged);
  }

  async function handlePhoto(evt) {
    const file = evt.target.files?.[0];
    evt.target.value = '';
    if (!file) return;
    setUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const url = await uploadImage(file);
      applyUpdate(await updateMe({ profile_image: url }));
      setMessage({ type: 'ok', text: 'Your photo was updated.' });
    } catch (err) {
      setMessage({ type: 'bad', text: err.message });
    } finally {
      setUploading(false);
    }
  }


  async function handleCover(evt) {
    const file = evt.target.files?.[0];
    evt.target.value = '';
    if (!file) return;
    setUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const url = await uploadImage(file);
      applyUpdate(await updateMe({ cover_image: url }));
      setMessage({ type: 'ok', text: 'Your cover was updated.' });
    } catch (err) {
      setMessage({ type: 'bad', text: err.message });
    } finally {
      setUploading(false);
    }
  }


    async function removeImage(field, text) {
    setUploading(true);
    setMessage({ type: '', text: '' });
    try {
      applyUpdate(await updateMe({ [field]: null }));
      setMessage({ type: 'ok', text });
    } catch (err) {
      setMessage({ type: 'bad', text: err.message });
    } finally {
      setUploading(false);
    }
  }
  

  async function saveDetails(evt) {
    evt.preventDefault();
    setBusy(true);
    setMessage({ type: '', text: '' });
    try {
      applyUpdate(await updateMe({ name: details.name, email: details.email, phone: details.phone || null }));
      setMessage({ type: 'ok', text: 'Your details were saved.' });
    } catch (err) {
      setMessage({ type: 'bad', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(evt) {
    evt.preventDefault();
    if (pw.next.length < 6) return setMessage({ type: 'bad', text: 'The new password needs at least 6 characters.' });
    if (pw.next !== pw.confirm) return setMessage({ type: 'bad', text: "The new passwords don't match." });
    setBusy(true);
    setMessage({ type: '', text: '' });
    try {
      await updateMe({ current_password: pw.current, new_password: pw.next });
      setPw({ current: '', next: '', confirm: '' });
      setMessage({ type: 'ok', text: 'Your password was changed.' });
    } catch (err) {
      setMessage({ type: 'bad', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  function openTab(name) {
    setTab(name);
    setMessage({ type: '', text: '' });
  }

  const photo = profile.profile_image;

  return (
    <>
      <div className="page-h"><h1>My profile</h1></div>

      <div className="pf2">
        <div className="pf-cover">
          {profile.cover_image && <img src={profile.cover_image} alt="" />}
          <svg className="pf-wave" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
            <rect width="1000" height="200" fill="#FCEBD3" />
            <path d="M0 140 C180 60 320 200 520 120 S860 40 1000 110 V200 H0Z" fill="#F9CA87" opacity=".45" />
            <path d="M0 170 C220 110 380 210 600 160 S880 120 1000 150 V200 H0Z" fill="#F8713A" opacity=".22" />
          </svg>
        </div>

        <div className="pf-top">
          <label className="pf-av" title="Change photo">
            {photo ? <img src={photo} alt="" /> : <span>{initial(profile.name)}</span>}
            <i><Svg color="#fff" size={17}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.5" /></Svg></i>
            <input type="file" accept="image/*" hidden onChange={handlePhoto} disabled={uploading} />
          </label>
          <div className="pf-who">
            <h2>{profile.name}</h2>
            <div className="pf-tags">
              <span><Svg size={16}><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Svg>{me.position || 'Staff'}</span>
              <span><Svg size={16}><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></Svg>{me.branch.name} · {me.business.name}</span>
            </div>
          </div>
          <div className="pf-upw">
                        <label className="st-btn ghost pf-up">
              <Svg color="#1B191A" size={17}><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></Svg>
              {uploading ? 'Uploading…' : 'Change cover'}
              <input type="file" accept="image/*" hidden onChange={handleCover} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="pf-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'details'} className={tab === 'details' ? 'on' : ''} onClick={() => openTab('details')}>My details</button>
          <button type="button" role="tab" aria-selected={tab === 'password'} className={tab === 'password' ? 'on' : ''} onClick={() => openTab('password')}>Password</button>
        </div>

        {message.text && <p className={`pf-msg ${message.type}`} role="status">{message.text}</p>}

        {tab === 'details' ? (
          <form className="pf-panel" onSubmit={saveDetails}>
            <div className="pf-grid">
              <Field id="pf-name" label="Full name" icon={<UserIcon />} value={details.name} autoComplete="name"
                onChange={(e) => setDetails({ ...details, name: e.target.value })} required />
              <Field id="pf-phone" label="Phone" icon={<PhoneIcon />} type="tel" value={details.phone} autoComplete="tel"
                onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
              <Field id="pf-email" label="Email" icon={<MailIcon />} type="email" value={details.email} autoComplete="email"
                onChange={(e) => setDetails({ ...details, email: e.target.value })} required />
            </div>
            <div className="pf-end"><button className="st-btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div>
          </form>
        ) : (
          <form className="pf-panel pw" onSubmit={savePassword}>
            <div className="pf-grid">
              <PasswordField id="pf-current" label="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              <PasswordField id="pf-new" label="New password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              <PasswordField id="pf-confirm" label="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </div>
            <div className="pf-end"><button className="st-btn" type="submit" disabled={busy || !pw.current || !pw.next}>{busy ? 'Saving…' : 'Update password'}</button></div>
          </form>
        )}
      </div>
    </>
  );
}