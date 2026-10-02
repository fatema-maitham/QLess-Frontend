import { useContext } from 'react';

import { UserContext } from '../../contexts/UserContext';

const Dashboard = () => {
  const { user } = useContext(UserContext);

  useEffect(()=> {
    async function getCurrentUser(){
      try {
        const signedInUser = await currentUser()
        console.log(signedInUser)
      } catch (error) {
        console.log(error)
      }
    }

    getCurrentUser()
  }, [user])

  return (
    <main>
      <h1>Welcome, {user.username}</h1>
      <p>
        This is the dashboard page where you can see a list of all the users.
      </p>
    </main>
  );
};

export default Dashboard;
