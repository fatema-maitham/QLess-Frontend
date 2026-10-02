import { Link, useLocation, useNavigate } from 'react-router';
import { BenchArt, PhoneArt } from './AuthArt';
import { CheckIcon } from './AuthIcons';
import './Auth.css';

const CONTENT = {
  customer: {
    title: <>Skip the line. <span>Keep your time.</span></>,
    lead: 'Join a queue from your phone, wait wherever you like, and come back right on time.',
    perks: [
      'No app to install, works in any browser',
      'See your place in line and wait time live',
      'Get a message right before your turn',
    ],
  },
  owner: {
    title: <>Skip the line. <span>Keep your time.</span></>,
    lead: 'Register your business, add your branches and start serving visitors in minutes.',
    perks: [
      'Add branches, services and opening hours',
      'Invite staff and call visitors in one tap',
      'Reviewed and approved before going live',
    ],
  },
  signin: {
    title: <>Welcome back. <span>Your place is waiting.</span></>,
    lead: 'Sign in to check your place in line or manage your branches.',
    perks: [
      'Pick up right where you left off',
      'Check your active tickets',
      'Manage your branches and queues',
    ],
  },
};

const AuthLayout = ({ mode, role = 'customer', children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignIn = mode === 'signin';
  const content = CONTENT[isSignIn ? 'signin' : role];
  const slid = location.state?.slide;
  const sideAnim = slid ? (isSignIn ? 'slide-from-left' : 'slide-from-right') : '';

  return (
    <div className={`auth ${isSignIn ? 'flip' : ''}`}>
      <div className="auth-switch-top" role="tablist" aria-label="Sign up or sign in">
        <button
          type="button"
          role="tab"
          aria-selected={!isSignIn}
          className={!isSignIn ? 'on' : ''}
          onClick={() => isSignIn && navigate('/sign-up', { state: { slide: true } })}
        >
          Sign up
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isSignIn}
          className={isSignIn ? 'on' : ''}
          onClick={() => !isSignIn && navigate('/sign-in', { state: { slide: true } })}
        >
          Sign in
        </button>
      </div>

      <aside className={`auth-side ${sideAnim}`}>
        <div className="auth-glow" aria-hidden="true"></div>

        <Link to="/" className="auth-logo">
          <i>Q</i>QLess
        </Link>

        <div>
          <h2>{content.title}</h2>
          <p className="auth-lead">{content.lead}</p>
        </div>

        <div className="auth-art">
          {isSignIn ? <PhoneArt /> : <BenchArt />}
        </div>

        <ul className="auth-perks">
          {content.perks.map((perk) => (
            <li key={perk}>
              <span><CheckIcon /></span>
              {perk}
            </li>
          ))}
        </ul>

        <footer>© QLess · Your place. Your time.</footer>
      </aside>

      <main className={`auth-main ${slid ? 'fade' : ''}`}>
        <div className="auth-top">
          <span>{isSignIn ? 'New to QLess?' : 'Already have an account?'}</span>
          <Link
            className="btn btn-ghost"
            to={isSignIn ? '/sign-up' : '/sign-in'}
            state={{ slide: true }}
          >
            {isSignIn ? 'Sign up' : 'Sign in'}
          </Link>
        </div>

        <div className="auth-form-wrap">{children}</div>
      </main>
    </div>
  );
};

export default AuthLayout;