import { useContext } from 'react';
import { Route, Routes, useLocation } from 'react-router';

// Components
import NavBar from './components/NavBar/NavBar';
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import Dashboard from './components/Dashboard/Dashboard';
import Landing from './components/Landing/Landing';


// Context
import { UserContext } from './contexts/UserContext';

// Pages that have their own full-screen layout (no NavBar)
const NO_NAV = ['/sign-in', '/sign-up'];

const App = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const showNav = !NO_NAV.includes(location.pathname);

  return (
    <>
      {showNav && <NavBar />}
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Landing />} />
        <Route path="/sign-up" element={<SignUpForm />} />
        <Route path="/sign-in" element={<SignInForm />} />
      </Routes>
    </>
  );
};

export default App;