import { useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { removeToken } from '../../lib/helpers/jwt-helpers';
import BusinessArt from './BusinessArt';
import './Business.css';

const STEPS = [
  {
    title: 'Tell us about your business',
    text: 'A name and category are enough to start. A logo and contact details help visitors trust you.',
  },
  {
    title: 'We check it',
    text: 'An admin makes sure the business is real before visitors can find it and join its queues.',
  },
  {
    title: 'Add branches and open your queues',
    text: 'After approval, add branches, opening hours, services and staff from your dashboard.',
  },
];

const BusinessLayout = ({ step = 1, children }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignOut = () => {
    removeToken();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="ob">
      <header className="ob-top">
        <div className="ob-top-in">
          <Link className="ob-logo" to="/"><img src={logo} alt="QLess home" /></Link>
          <div className="ob-who">
            <span>Signed in as <b>{user?.name}</b></span>
            <button type="button" className="ob-btn ob-btn-ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="ob-page">
        <section className="ob-pane">{children}</section>

        <aside className="ob-aside" aria-label="What happens next">
          <div className="ob-pic">
            <div className="frame"><BusinessArt /></div>
          </div>
          {STEPS.map((s, i) => (
            <div key={s.title} className={`ob-info ${step === i + 1 ? 'on' : ''}`}>
              <span className="num">{i + 1}</span>
              <div>
                <b>{s.title}</b>
                <span>{s.text}</span>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default BusinessLayout;