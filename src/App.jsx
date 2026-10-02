import { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router';

// Fatema's pages
import LandingPage from './components/Landing/LandingPage';
import BrowsePage from './components/Browse/BrowsePage';
import BusinessDetailsPage from './components/BusinessDetails/BusinessDetailsPage';
import BranchDetailsPage from './components/BranchDetails/BranchDetailsPage';
import NotFound from './components/NotFound/NotFound';

// Maram's pages
import NavBar from './components/NavBar/NavBar';
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Placeholder from './components/Placeholder/Placeholder';

// Context + helpers
import { UserContext } from './contexts/UserContext';
import { ROLES, homeFor } from './lib/helpers/roles';

import './App.css';

// Pages that have their own full-screen layout (no NavBar)
const NO_NAV = ['/', '/sign-in', '/sign-up'];

export default function App() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const showNav = user && !NO_NAV.includes(location.pathname);

  return (
    <div className="app">
      {showNav && <NavBar />}
      <Routes>
        {/* Home: signed in → dashboard, visitor → landing page */}
        <Route path="/" element={user ? <Dashboard /> : <LandingPage />} />

        {/* Auth (Maram) */}
        <Route path="/sign-up" element={<SignUpForm />} />
        <Route path="/sign-in" element={<SignInForm />} />

        {/* Browse (Fatema) */}
        <Route path="/businesses" element={<BrowsePage />} />
        <Route path="/businesses/:businessId" element={<BusinessDetailsPage />} />
        <Route path="/branches/:branchId" element={<BranchDetailsPage />} />

        {/* Next steps:
        <Route path="/queues/:queueId" element={<JoinQueuePage />} />
        <Route path="/business/register" element={<BusinessRegister />} />
        */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}