import { Link, useLocation, useNavigate } from 'react-router';
import SignInForm from '../SignInForm/SignInForm';
import SignUpForm from '../SignUpForm/SignUpForm';
import logo from '../../assets/qless-logo.png';
import './Auth.css';

/* One page for both /sign-in and /sign-up.
   Both forms stay on the page; the dark panel slides over the one that is not in use. */
const AuthPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSignUp = pathname === '/sign-up';

  const goSignUp = () => navigate('/sign-up');
  const goSignIn = () => navigate('/sign-in');

  return (
    <div className="auth-page">
      <main className={isSignUp ? 'auth-card active' : 'auth-card'}>
        <div className="auth-box in" inert={isSignUp}>
          <SignInForm onSwitch={goSignUp} />
        </div>

        <div className="auth-box up" inert={!isSignUp}>
          <SignUpForm onSwitch={goSignIn} />
        </div>

        <div className="auth-toggle">
          <div className="auth-panel left" inert={isSignUp}>
            <Link to="/" className="auth-logo">
              <img src={logo} alt="QLess home" />
            </Link>
            <h2>New here? <span>Skip the line.</span></h2>
            <p>Join a queue from your phone, wait wherever you like, and come back right on time.</p>
            <button type="button" className="auth-ghost" onClick={goSignUp}>
              Create an account
            </button>
          </div>

          <div className="auth-panel right" inert={!isSignUp}>
            <Link to="/" className="auth-logo">
              <img src={logo} alt="QLess home" />
            </Link>
            <h2>Welcome back. <span>Your place is waiting.</span></h2>
            <p>Sign in to check your place in line or manage your branches.</p>
            <button type="button" className="auth-ghost" onClick={goSignIn}>
              Sign in
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;