import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { signIn } from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import { MailIcon, LockIcon, EyeIcon, AlertIcon } from '../Auth/AuthIcons';
import { homeFor } from '../../lib/helpers/roles';

const SignInForm = ({ onSwitch }) => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const { email, password } = formData;
  const isValid = email.includes('@') && password.length > 0;

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      const user = await signIn({ email, password });
      setUser(user);
      navigate(homeFor(user));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Welcome back</h1>
      <p className="auth-sub">Sign in to your QLess account.</p>

      {message && (
        <div className="auth-alert" role="alert">
          <AlertIcon />
          <span>{message}</span>
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="in-email">Email</label>
        <div className="auth-inp">
          <MailIcon className="lead-ic" />
          <input
            id="in-email"
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

      <div className="auth-field">
        <label htmlFor="in-password">Password</label>
        <div className="auth-inp">
          <LockIcon className="lead-ic" />
          <input
            id="in-password"
            name="password"
            type={showPw ? 'text' : 'password'}
            placeholder="Your password"
            autoComplete="current-password"
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
      </div>

      <div className="auth-row">
        <label className="auth-check">
                    <input type="checkbox" defaultChecked /> Keep me signed in
        </label>
        <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
      </div>

      <button type="submit" className="auth-btn" disabled={!isValid || loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="auth-mobile-switch">
        New to QLess?{' '}
        <button type="button" onClick={onSwitch}>Create an account</button>
      </p>
    </form>
  );
};

export default SignInForm;