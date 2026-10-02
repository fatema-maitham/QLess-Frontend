import { useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";

// Public pages
import LandingPage from "./components/Landing/LandingPage";
import BrowsePage from "./components/Browse/BrowsePage";
import BusinessDetailsPage from "./components/BusinessDetails/BusinessDetailsPage";
import BranchDetailsPage from "./components/BranchDetails/BranchDetailsPage";
import NotFound from "./components/NotFound/NotFound";

// Auth + signed-in pages
import NavBar from "./components/NavBar/NavBar";
import SignUpForm from "./components/SignUpForm/SignUpForm";
import SignInForm from "./components/SignInForm/SignInForm";
import Dashboard from "./components/Dashboard/Dashboard";

// Owner pages
import QueueSettingsPage from "./components/QueueSettings/QueueSettingsPage";

// Context
import { UserContext } from "./contexts/UserContext";

import "./App.css";

// Pages that have their own full-screen layout (no NavBar)
const NO_NAV = ["/", "/sign-in", "/sign-up"];

export default function App() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const showNav = user && !NO_NAV.includes(location.pathname);

  return (
    <div className="app">
      {showNav && <NavBar />}
      <Routes>
        {/* Home: always the landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth: already signed in → go to dashboard */}
        <Route path="/sign-up" element={user ? <Navigate to="/dashboard" replace /> : <SignUpForm />} />
        <Route path="/sign-in" element={user ? <Navigate to="/dashboard" replace /> : <SignInForm />} />

        {/* Signed-in home: signed out → go to sign in */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/sign-in" replace />} />

        {/* Browse */}
        <Route path="/businesses" element={<BrowsePage />} />
        <Route path="/businesses/:businessId" element={<BusinessDetailsPage />} />
        <Route path="/branches/:branchId" element={<BranchDetailsPage />} />

        {/* Owner */}
        <Route path="/owner/branches/:branchId/queues" element={<QueueSettingsPage />} />

        {/* Next steps:
        <Route path="/queues/:queueId" element={<JoinQueuePage />} />
        <Route path="/business/register" element={<BusinessRegister />} />
        */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}