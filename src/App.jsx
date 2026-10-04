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
import FavoritesPage from "./components/Favorites/FavoritesPage";
import MyBookingsPage from "./components/Bookings/MyBookingsPage";

// Owner pages
import OwnerHome from "./components/Business/OwnerHome";
import BusinessForm from "./components/Business/BusinessForm";
import OwnerLayout from "./components/Owner/OwnerLayout";
import OwnerOverview from "./components/Owner/OwnerOverview";
import OwnerBranches from "./components/Owner/OwnerBranches";
import OwnerBranch from "./components/Owner/OwnerBranch";
import OwnerStaff from "./components/Owner/OwnerStaff";
import OwnerAnnouncements from "./components/Owner/OwnerAnnouncements";
import OwnerProfile from "./components/Owner/OwnerProfile";
import OwnerQueues from "./components/Control/OwnerQueues";

// Queue analytics
import QueueAnalyticsPage from "./components/Analytics/QueueAnalyticsPage";

// Staff
import StaffQueues from "./components/Control/StaffQueues";

// Bookings
import BranchBookingsPage from "./components/Bookings/BranchBookingsPage";

// Notifications
import NotificationsPage from "./components/Notifications/NotificationsPage";

// Admin pages
import AdminSuspiciousPage from "./components/Admin/AdminSuspiciousPage";
import AdminQueuesPage from "./components/Admin/AdminQueuesPage";
import AdminReviewsPage from "./components/Admin/AdminReviewsPage";

// Context + helpers
import { UserContext } from "./contexts/UserContext";
import { ROLES, homeFor } from "./lib/helpers/roles";

import "./App.css";

// Pages that have their own full-screen layout (no NavBar)
const NO_NAV = ["/sign-in", "/sign-up"];

export default function App() {
  const { user } = useContext(UserContext);
  const location = useLocation();

  const showNav =
    !NO_NAV.includes(location.pathname) &&
    !location.pathname.startsWith("/owner");

  return (
    <div className="app">
      {showNav && <NavBar />}

      <Routes>
        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={
            user ? (
              <Navigate to={homeFor(user)} replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* ================= AUTH ================= */}

        <Route
          path="/sign-up"
          element={
            user ? (
              <Navigate to={homeFor(user)} replace />
            ) : (
              <SignUpForm />
            )
          }
        />

        <Route
          path="/sign-in"
          element={
            user ? (
              <Navigate to={homeFor(user)} replace />
            ) : (
              <SignInForm />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <Navigate to={homeFor(user)} replace />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />

        {/* ================= PUBLIC BROWSING ================= */}

        <Route
          path="/businesses"
          element={<BrowsePage />}
        />

        <Route
          path="/businesses/:businessId"
          element={<BusinessDetailsPage />}
        />

        <Route
          path="/branches/:branchId"
          element={<BranchDetailsPage />}
        />

        {/* ================= JOIN QUEUE ================= */}

        <Route
          path="/queues/:queueId"
          element={<JoinQueuePage />}
        />

        {/* ================= CUSTOMER ================= */}

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

        <Route
          path="/favorites"
          element={
            <ProtectedRoute roles={[ROLES.CUSTOMER]}>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute roles={[ROLES.CUSTOMER]}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* ================= OWNER ================= */}

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

        {/* Owner dashboard layout */}
        <Route
          element={
            <ProtectedRoute roles={[ROLES.OWNER]}>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/owner/dashboard"
            element={<OwnerOverview />}
          />

          <Route
            path="/owner/branches"
            element={<OwnerBranches />}
          />

          <Route
            path="/owner/branches/:id"
            element={<OwnerBranch />}
          />

          <Route
            path="/owner/staff"
            element={<OwnerStaff />}
          />

          <Route
            path="/owner/announcements"
            element={<OwnerAnnouncements />}
          />

          <Route
            path="/owner/queues"
            element={<OwnerQueues />}
          />

          {/* Queue analytics - owner only */}
          <Route
            path="/owner/queues/:queueId/analytics"
            element={<QueueAnalyticsPage />}
          />

          <Route
            path="/owner/profile"
            element={<OwnerProfile />}
          />
        </Route>

        {/* ================= STAFF ================= */}

        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={[ROLES.STAFF]}>
              <StaffQueues />
            </ProtectedRoute>
          }
        />

        {/* ================= BRANCH BOOKINGS ================= */}

        <Route
          path="/branches/:branchId/bookings"
          element={
            <ProtectedRoute roles={[ROLES.OWNER, ROLES.STAFF]}>
              <BranchBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* ================= NOTIFICATIONS ================= */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}

        {/* Temporary: send /admin here until the admin dashboard is built */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <Navigate to="/admin/suspicious-activity" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/suspicious-activity"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminSuspiciousPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/queues"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminQueuesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminReviewsPage />
            </ProtectedRoute>
          }
        />

        {/* ================= NO ACCESS ================= */}

        <Route
          path="/no-access"
          element={
            <Placeholder
              title="No access"
              text="You don't have permission to open that page."
            />
          }
        />

        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </div>
  );
}