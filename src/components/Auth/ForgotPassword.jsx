import { useState } from 'react';
import { Link } from 'react-router';
import { forgotPassword } from '../../services/authService';
import { MailIcon, AlertIcon } from './AuthIcons';
import ForgotArt, { BackArrow, Steps } from './ForgotArt';
import logo from '../../assets/qless-logo.png';
import './Auth.css';
import './Forgot.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [devLink, setDevLink] = useState('');
  const send = async () => {
    setLoading(true);
    setMessage('');
    try {
            const data = await forgotPassword(email);
      setDevLink(data?.reset_link ? new URL(data.reset_link).search : '');
      setSent(true);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (email.includes('@')) send();
  };

  return (
    <div className="auth-page">
      <main className="fp-card">
        <Link to="/" className="fp-logo"><img src={logo} alt="QLess home" /></Link>

        {!sent ? (
          <section className="fp-screen">
            <ForgotArt name="lock" />
            <h1>Forgot your <span>password?</span></h1>
            <p className="fp-sub">No worries. Enter the email you signed up with and we'll send you a link to reset it.</p>

            {message && <div className="auth-alert" role="alert"><AlertIcon /><span>{message}</span></div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="fp-email">Email</label>
                <div className="auth-inp">
                  <MailIcon className="lead-ic" />
                  <input id="fp-email" type="email" placeholder="you@example.com" autoComplete="email"
                    value={email} onChange={(e) => { setEmail(e.target.value); setMessage(''); }} required />
                </div>
              </div>
              <button type="submit" className="auth-btn" disabled={!email.includes('@') || loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <Link to="/sign-in" className="fp-back"><BackArrow />Back to sign in</Link>
            <Steps on={1} />
          </section>
        ) : (
          <section className="fp-screen">
            <ForgotArt name="mail" />
            <h1>Check your <span>email</span></h1>
            <p className="fp-sub">If an account uses <b>{email}</b>, we sent it a reset link. Open it to choose a new password.</p>

            {message && <div className="auth-alert" role="alert"><AlertIcon /><span>{message}</span></div>}

                        {devLink ? (
              <Link to={`/reset-password${devLink}`} className="auth-btn fp-btn-link">Open reset link</Link>
            ) : (
              <Link to="/sign-in" className="auth-btn fp-btn-link">Back to sign in</Link>
            )}
            <p className="fp-resend">
              Didn't get it?{' '}
              <button type="button" onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Resend email'}</button>
            </p>
            <button type="button" className="fp-back" onClick={() => { setSent(false); setMessage(''); }}>
              <BackArrow />Use a different email
            </button>
            <Steps on={2} />
          </section>
        )}
      </main>
    </div>
  );
};

export default ForgotPassword;