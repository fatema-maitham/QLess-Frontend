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
import OwnerHome from './components/Business/OwnerHome';
import BusinessForm from './components/Business/BusinessForm';

// Context + helpers
import { UserContext } from './contexts/UserContext';
import { ROLES, homeFor } from './lib/helpers/roles';

import './App.css';

// Pages that have their own full-screen layout (no NavBar)
const NO_NAV = ['/', '/sign-in', '/sign-up'];

export default function App() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const showNav =
    user && !NO_NAV.includes(location.pathname) && !location.pathname.startsWith('/owner');

  return (
    <div className="app">
      {showNav && <NavBar />}
      <Routes>
        {/* Home: visitor → landing page, signed in → their own home */}
        <Route
          path="/"
          element={user ? <Navigate to={homeFor(user)} replace /> : <LandingPage />}
        />

        {/* Auth (Maram): signed-in users don't need these pages */}
        <Route
          path="/sign-up"
          element={user ? <Navigate to={homeFor(user)} replace /> : <SignUpForm />}
        />
        <Route
          path="/sign-in"
          element={user ? <Navigate to={homeFor(user)} replace /> : <SignInForm />}
        />

        {/* Browse (Fatema): open to everyone */}
        <Route path="/businesses" element={<BrowsePage />} />
        <Route path="/businesses/:businessId" element={<BusinessDetailsPage />} />
        <Route path="/branches/:branchId" element={<BranchDetailsPage />} />

                {/* Owner (Maram) */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute roles={[ROLES.OWNER]}>
              <OwnerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/business"
          element={
            <ProtectedRoute roles={[ROLES.OWNER]}>
              <BusinessForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute roles={[ROLES.OWNER]}>
              <Placeholder title="Owner dashboard" text="Branches, queues and staff will be here." />
            </ProtectedRoute>
          }
        />

        {/* Wrong role */}
        <Route
          path="/no-access"
          element={<Placeholder title="No access" text="You don't have permission to open that page." />}
        />

        {/* Next steps:
        <Route path="/queues/:queueId" element={<JoinQueuePage />} />
        <Route path="/owner/business/new" element={<BusinessRegister />} />
        */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}