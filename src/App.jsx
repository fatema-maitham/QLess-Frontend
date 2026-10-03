import { useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";

// Public pages
import LandingPage from "./components/Landing/LandingPage";
import BrowsePage from "./components/Browse/BrowsePage";
import BusinessDetailsPage from "./components/BusinessDetails/BusinessDetailsPage";
import BranchDetailsPage from "./components/BranchDetails/BranchDetailsPage";
import NotFound from "./components/NotFound/NotFound";

// Auth + shared
import NavBar from "./components/NavBar/NavBar";
import SignUpForm from "./components/SignUpForm/SignUpForm";
import SignInForm from "./components/SignInForm/SignInForm";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Placeholder from "./components/Placeholder/Placeholder";

// Customer pages
import JoinQueuePage from "./components/Ticket/JoinQueuePage";
import TicketPage from "./components/Ticket/TicketPage";
import MyTicketsPage from "./components/Ticket/MyTicketsPage";

// Owner pages
import OwnerHome from "./components/Business/OwnerHome";
import BusinessForm from "./components/Business/BusinessForm";

// Context + helpers
import { UserContext } from "./contexts/UserContext";
import { ROLES, homeFor } from "./lib/helpers/roles";

import "./App.css";

// Pages that have their own full-screen layout (no NavBar)
const NO_NAV = ["/sign-in", "/sign-up"];

export default function App() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const showNav = !NO_NAV.includes(location.pathname) && !location.pathname.startsWith("/owner");

  return (
    <div className="app">
      {showNav && <NavBar />}
      <Routes>
        {/* Home: visitor → landing page, signed in → their own home */}
        <Route path="/" element={user ? <Navigate to={homeFor(user)} replace /> : <LandingPage />} />

        {/* Auth: signed-in users don't need these pages */}
        <Route path="/sign-up" element={user ? <Navigate to={homeFor(user)} replace /> : <SignUpForm />} />
        <Route path="/sign-in" element={user ? <Navigate to={homeFor(user)} replace /> : <SignInForm />} />
        <Route
          path="/dashboard"
          element={user ? <Navigate to={homeFor(user)} replace /> : <Navigate to="/sign-in" replace />}
        />

        {/* Browse: open to everyone */}
        <Route path="/businesses" element={<BrowsePage />} />
        <Route path="/businesses/:businessId" element={<BusinessDetailsPage />} />
        <Route path="/branches/:branchId" element={<BranchDetailsPage />} />

        {/* Join queue: open to everyone, joining asks guests to sign in */}
        <Route path="/queues/:queueId" element={<JoinQueuePage />} />

        {/* Customer tickets */}
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute roles={[ROLES.CUSTOMER]}>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:entryId"
          element={
            <ProtectedRoute roles={[ROLES.CUSTOMER]}>
              <TicketPage />
            </ProtectedRoute>
          }
        />

        {/* Owner */}
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}