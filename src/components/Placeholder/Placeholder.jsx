import { useContext } from 'react';
import { Link } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { getRole } from '../../lib/helpers/roles';

const Placeholder = ({ title, text }) => {
  const { user } = useContext(UserContext);

  return (
    <main style={{ padding: '48px 24px', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>{title}</h1>
      <p style={{ marginBottom: 16 }}>{text}</p>
      {user && (
        <p style={{ opacity: 0.7 }}>
          Signed in as {user.name} ({getRole(user)})
        </p>
      )}
      <p style={{ marginTop: 24 }}>
        <Link to="/">Back to home</Link>
      </p>
    </main>
  );
};

export default Placeholder;