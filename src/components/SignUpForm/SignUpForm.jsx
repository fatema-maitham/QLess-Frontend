import { useContext, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { signUp } from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import {
  UserIcon, MailIcon, PhoneIcon, LockIcon, EyeIcon, BuildingIcon, AlertIcon,
} from '../Auth/AuthIcons';
import { homeFor } from '../../lib/helpers/roles';

const STRENGTH_COLORS = ['#E2572A', '#F26B3A', '#F7C98B', '#1E1A18'];

const getStrength = (p) => {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || /[A-Z]/.test(p)) s++;
  return s;
};

const SignUpForm = ({ onSwitch }) => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const location = useLocation();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('type') === 'owner' ? 'owner' : 'customer');
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', passwordConf: '',
  });

  const { name, email, phone, password, passwordConf } = formData;
  const strength = getStrength(password);
  const tooShort = password.length > 0 && password.length < 6;
  const mismatch = passwordConf.length > 0 && password !== passwordConf;
  const isValid = name && email.includes('@') && password.length >= 6 && password === passwordConf;

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      const user = await signUp({ name, email, password, role, phone: phone || null });
      setUser(user);
      navigate(location.state?.from || homeFor(user), { replace: true });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Create your account</h1>
      <p className="auth-sub">It only takes a minute.</p>

      {message && (
        <div className="auth-alert" role="alert">
          <AlertIcon />
          <span>{message}</span>
        </div>
      )}

      <div className="auth-roles" role="radiogroup" aria-label="Account type">
        <button
          type="button"
          className="auth-role"
          role="radio"
          aria-checked={role === 'customer'}
          onClick={() => setRole('customer')}
        >
          <span className="ic"><UserIcon color="#1E1A18" size={20} /></span>
          <span><b>Visitor</b></span>
        </button>
        <button
          type="button"
          className="auth-role"
          role="radio"
          aria-checked={role === 'owner'}
          onClick={() => setRole('owner')}
        >
          <span className="ic"><BuildingIcon size={20} /></span>
          <span><b>Business owner</b></span>
        </button>
      </div>

      <p className="auth-hint">
        Staff? Sign up as a visitor and ask your owner to add you.
      </p>

      <div className="auth-two">
        <div className="auth-field">
          <label htmlFor="up-name">Full name</label>
          <div className="auth-inp">
            <UserIcon className="lead-ic" />
            <input
              id="up-name"
              name="name"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              value={name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="up-phone">Phone <em>(optional)</em></label>
          <div className="auth-inp">
            <PhoneIcon className="lead-ic" />
            <input
              id="up-phone"
              name="phone"
              type="tel"
              placeholder="3300 0000"
              autoComplete="tel"
              value={phone}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="up-email">Email</label>
        <div className="auth-inp">
          <MailIcon className="lead-ic" />
          <input
            id="up-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="auth-two auth-password-row">
        <div className="auth-field">
          <label htmlFor="up-password">Password</label>
          <div className={`auth-inp ${tooShort ? 'err' : ''}`}>
            <LockIcon className="lead-ic" />
            <input
              id="up-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder="6+ characters"
              autoComplete="new-password"
              value={password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="auth-eye"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw(!showPw)}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
          <div className="auth-strength" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i
                key={i}
                style={{ background: i < strength ? STRENGTH_COLORS[strength - 1] : undefined }}
              />
            ))}
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="up-passwordConf">Confirm password</label>
          <div className={`auth-inp ${mismatch ? 'err' : ''}`}>
            <LockIcon className="lead-ic" />
            <input
              id="up-passwordConf"
              name="passwordConf"
              type={showPw ? 'text' : 'password'}
              placeholder="Type it again"
              autoComplete="new-password"
              value={passwordConf}
              onChange={handleChange}
              required
            />
          </div>
          {mismatch && <span className="auth-hint bad">Passwords don't match</span>}
          {tooShort && !mismatch && <span className="auth-hint bad">Use at least 6 characters</span>}
        </div>
      </div>

      <button type="submit" className="auth-btn" disabled={!isValid || loading}>
        {loading
          ? 'Creating account...'
          : role === 'owner' ? 'Create business account' : 'Create account'}
      </button>

      <p className="auth-mobile-switch">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch}>Sign in</button>
      </p>
    </form>
  );
};

export default SignUpForm;