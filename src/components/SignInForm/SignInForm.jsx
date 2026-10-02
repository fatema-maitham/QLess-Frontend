import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';
import { signIn } from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import AuthLayout from '../Auth/AuthLayout';
import { MailIcon, LockIcon, EyeIcon, AlertIcon } from '../Auth/AuthIcons';

const SignInForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext);
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    try {
      const user = await signIn(formData);
      setUser(user);
      navigate('/');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="signin">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to check your queue or manage your branches.</p>

        {message && (
          <div className="auth-alert" role="alert"><AlertIcon /><span>{message}</span></div>
        )}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <div className="auth-inp">
            <MailIcon className="lead-ic" />
            <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email"
              value={formData.email} onChange={handleChange} required />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <div className="auth-inp">
            <LockIcon className="lead-ic" />
            <input id="password" name="password" type={showPw ? 'text' : 'password'}
              placeholder="Your password" autoComplete="current-password"
              value={formData.password} onChange={handleChange} required />
            <button type="button" className="auth-eye" onClick={()=> setShowPw(!showPw)}
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              <EyeIcon open={showPw} />
            </button>
          </div>
        </div>

        <div className="auth-row">
          <label className="auth-check"><input type="checkbox" defaultChecked />Keep me signed in</label>
          <a className="auth-link" href="#">Forgot password?</a>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 14 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="auth-or">or</div>
        <p className="auth-switch">
          New to QLess? <Link className="auth-link" to="/sign-up" state={{ slide: true }}>Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignInForm;
