import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';

const Dashboard = () => {
  const { user } = useContext(UserContext);

  return (
    <main style={{ padding: '40px' }}>
      <h1>Welcome, {user?.name}</h1>
      <p>You are signed in as {user?.role?.name || user?.role}.</p>
    </main>
  );
};

export default Dashboard;