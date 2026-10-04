import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import BusinessLayout from './BusinessLayout';
import {getMyBusiness, createAndSubmit, updateBusiness, getCategories,} from '../../services/ownerBusinessService';
import { uploadImage } from '../../services/cloudinaryService';

const EMPTY = { name: '', category_id: '', description: '', phone: '', email: '', image: '' };

const BusinessForm = () => {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(EMPTY);
  const [logoOk, setLogoOk] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load categories and (if any) the existing business
  useEffect(() => {
    const load = async () => {
      try {
        const [cats, mine] = await Promise.all([getCategories(), getMyBusiness()]);
        setCategories(cats);
        if (mine) {
          setBusiness(mine);
          setFormData({
            name: mine.name || '',
            category_id: mine.category_id ? String(mine.category_id) : '',
            description: mine.description || '',
            phone: mine.phone || '',
            email: mine.email || '',
            image: mine.image || '',
          });
        }
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

    const handleChange = (evt) => {
    setMessage('');
    const { name, value } = evt.target;
    if (name === 'image') setLogoOk(false);
    setFormData({ ...formData, [name]: value });
  };

  const handleLogoFile = async (evt) => {
    const file = evt.target.files[0];
    evt.target.value = '';
    if (!file) return;
    setMessage('');
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setLogoOk(false);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!formData.name.trim()) {
      setMessage('Please enter your business name.');
      return;
    }

    // Send empty optional fields as null
    const payload = {
      name: formData.name.trim(),
      category_id: formData.category_id ? Number(formData.category_id) : null,
      description: formData.description.trim() || null,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      image: formData.image.trim() || null,
    };

    setSaving(true);
    try {
      if (business) {
        const resubmit = ['draft', 'rejected'].includes(business.approval_status);
        await updateBusiness(business.id, payload, resubmit);
      } else {
        await createAndSubmit(payload);
      }
      navigate('/owner');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const letter = (formData.name.trim()[0] || 'Q').toUpperCase();
  const showLogo = formData.image.trim().startsWith('http');
  const isEdit = Boolean(business);
  const canResubmit = isEdit && ['draft', 'rejected'].includes(business.approval_status);

  if (loading) {
    return <BusinessLayout step={1}><p className="ob-loading">Loading…</p></BusinessLayout>;
  }

  return (
    <BusinessLayout step={1}>
      <h1>{isEdit ? 'Edit your business' : 'Set up your business'}</h1>
      <p className="ob-sub">
        This is what visitors see when they search for a place to queue. You can change it later.
      </p>

      <form className="ob-form" onSubmit={handleSubmit} noValidate>
        {message && <div className="ob-alert" role="alert">{message}</div>}

        <div className="ob-field">
          <label htmlFor="image">Business logo <em>(optional)</em></label>
          <div className="ob-logo-row">
            <div className={`ob-logo-box ${formData.name.trim() ? 'has' : ''}`}>
              {showLogo && (
                <img
                  src={formData.image}
                  alt=""
                  onLoad={() => setLogoOk(true)}
                  onError={() => setLogoOk(false)}
                  style={{ display: logoOk ? 'block' : 'none' }}
                />
              )}
              {!(showLogo && logoOk) && letter}
            </div>
                        <div className="ob-field">
              <div className="ob-upload">
                <label className="ob-btn ob-btn-ghost big" htmlFor="image">
                  {uploading ? 'Uploading…' : formData.image ? 'Change logo' : 'Upload logo'}
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFile}
                  disabled={uploading}
                  hidden
                />
                {formData.image && !uploading && (
                  <button
                    type="button"
                    className="ob-link"
                    onClick={() => setFormData({ ...formData, image: '' })}
                  >
                    Remove
                  </button>
                )}
              </div>
              <span className="ob-help">PNG or JPG, under 5 MB. A square image works best.</span>
            </div>
          </div>
        </div>

        <div className="ob-two">
          <div className="ob-field">
            <label htmlFor="name">Business name</label>
            <div className="ob-inp">
              <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A827B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M9 20v-6h6v6" /></svg>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="ob-field">
            <label htmlFor="category_id">Category</label>
            <div className="ob-inp">
              <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A827B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
              <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange}>
                <option value="">Choose a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A524C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </div>
          </div>
        </div>

        <div className="ob-field">
          <label htmlFor="description">What does your business do? <em>(optional)</em></label>
          <div className="ob-inp">
            <textarea id="description" name="description" maxLength={200} value={formData.description} onChange={handleChange} />
          </div>
          <span className="ob-count">{formData.description.length} / 200</span>
        </div>

        <div className="ob-two">
          <div className="ob-field">
            <label htmlFor="phone">Phone <em>(optional)</em></label>
            <div className="ob-inp">
              <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A827B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            </div>
          </div>
          <div className="ob-field">
            <label htmlFor="email">Email <em>(optional)</em></label>
            <div className="ob-inp">
              <svg className="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A827B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 7l9 6 9-6" /></svg>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="ob-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A5A14" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
          <span>An admin checks every business before visitors can find it.</span>
        </div>

        <div className="ob-submit">
          <button className="ob-btn ob-btn-primary" type="submit" disabled={saving}>
            {saving
              ? 'Sending…'
              : !isEdit ? 'Send for approval' : canResubmit ? 'Send again for approval' : 'Save changes'}
            {!saving && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            )}
          </button>
          <span>Only the name is required.</span>
        </div>
      </form>
    </BusinessLayout>
  );
};

export default BusinessForm;