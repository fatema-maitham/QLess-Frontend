import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { resetPassword } from '../../services/authService';
import { LockIcon, EyeIcon, AlertIcon } from './AuthIcons';
import ForgotArt, { BackArrow } from './ForgotArt';
import logo from '../../assets/qless-logo.png';
import './Auth.css';
import './Forgot.css';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const longEnough = password.length >= 6;
  const matches = password.length > 0 && password === confirm;

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!longEnough || !matches) return;
    setLoading(true);
    setMessage('');
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="fp-card">
        <Link to="/" className="fp-logo"><img src={logo} alt="QLess home" /></Link>

        {!token ? (
          <section className="fp-screen">
            <ForgotArt name="lock" />
            <h1>This link isn't <span>complete</span></h1>
            <p className="fp-sub">Open the link from your email again, or ask for a new one.</p>
            <Link to="/forgot-password" className="auth-btn fp-btn-link">Get a new link</Link>
            <Link to="/sign-in" className="fp-back"><BackArrow />Back to sign in</Link>
          </section>
        ) : done ? (
          <section className="fp-screen">
            <ForgotArt name="done" />
            <h1>Password <span>changed!</span></h1>
            <p className="fp-sub">Your password was reset. You can sign in with your new password now.</p>
            <Link to="/sign-in" className="auth-btn fp-btn-link">Back to sign in</Link>
            <Steps on={3} />          </section>
        ) : (
          <section className="fp-screen">
            <ForgotArt name="key" />
            <h1>Set a new <span>password</span></h1>
            <p className="fp-sub">Make it something you'll remember. You'll use it to sign in.</p>

            {message && (
              <div className="auth-alert" role="alert">
                <AlertIcon />
                <span>{message} <Link to="/forgot-password">Get a new link</Link></span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="rp-new">New password</label>
                <div className="auth-inp">
                  <LockIcon className="lead-ic" />
                  <input id="rp-new" type={showPw ? 'text' : 'password'} placeholder="6+ characters" autoComplete="new-password"
                    value={password} onChange={(e) => { setPassword(e.target.value); setMessage(''); }} required />
                  <button type="button" className="auth-eye" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw(!showPw)}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="rp-confirm">Confirm new password</label>
                <div className="auth-inp">
                  <LockIcon className="lead-ic" />
                  <input id="rp-confirm" type={showPw ? 'text' : 'password'} placeholder="Type it again" autoComplete="new-password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>
              </div>
              <div className="fp-rules">
                <span className={longEnough ? 'ok' : ''}>6+ characters</span>
                <span className={matches ? 'ok' : ''}>Passwords match</span>
              </div>
              <button type="submit" className="auth-btn" disabled={!longEnough || !matches || loading}>
                {loading ? 'Saving...' : 'Reset password'}
              </button>
            </form>
            <Steps on={3} />
          </section>
        )}
      </main>
    </div>
  );
};

export default ResetPassword;