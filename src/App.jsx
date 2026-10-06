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
import Footer from "./components/Footer/Footer";
import ScrollToHash from "./components/ScrollToHash/ScrollToHash";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import NoAccess from "./components/NoAccess/NoAccess";
import AuthPage from "./components/Auth/AuthPage";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";

// Customer pages
import JoinQueuePage from "./components/Ticket/JoinQueuePage";
import TicketPage from "./components/Ticket/TicketPage";
import MyTicketsPage from "./components/Ticket/MyTicketsPage";
import FavoritesPage from "./components/Favorites/FavoritesPage";
import MyBookingsPage from "./components/Bookings/MyBookingsPage";
import CustomerDashboard from "./components/Dashboard/CustomerDashboard";
import CustomerProfile from "./components/CustomerProfile/CustomerProfile";

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
import QueueSettingsPage from "./components/QueueSettings/QueueSettingsPage";

// Staff
import StaffQueues from "./components/Control/StaffQueues";
import StaffLayout from "./components/Staff/StaffLayout";
import StaffOverview from "./components/Staff/StaffOverview";
import StaffBranch from "./components/Staff/StaffBranch";
import StaffProfile from "./components/Staff/StaffProfile";
import StaffHistory from "./components/Staff/StaffHistory";
import StaffBookings from "./components/Staff/StaffBookings";

// Bookings
import BranchBookingsPage from "./components/Bookings/BranchBookingsPage";

// Notifications
import NotificationsPage from "./components/Notifications/NotificationsPage";

// Admin pages
import AdminSuspiciousPage from "./components/Admin/AdminSuspiciousPage";
import AdminQueuesPage from "./components/Admin/AdminQueuesPage";
import AdminReviewsPage from "./components/Admin/AdminReviewsPage";
import AdminCategoriesPage from "./components/Admin/AdminCategoriesPage";
import AdminLayout from "./components/AdminPanel/AdminLayout";
import AdminOverview from "./components/AdminPanel/AdminOverview";
import AdminBusinesses from "./components/AdminPanel/AdminBusinesses";
import AdminUsers from "./components/AdminPanel/AdminUsers";
import AdminBranches from "./components/AdminPanel/AdminBranches";
import AdminAuditLogs from "./components/AdminPanel/AdminAuditLogs";

// Context + helpers
import { UserContext } from "./contexts/UserContext";
import { ROLES, getRole, homeFor } from "./lib/helpers/roles";

import "./App.css";

const NO_NAV = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

export default function App() {
  const { user } = useContext(UserContext);
  const location = useLocation();

  const requestedPage = location.state?.from;

  const canReturnToPage = (path, user) => {
    if (!path || !user) return false;

    const role = getRole(user);

    if (path.startsWith("/owner")) {
      return role === ROLES.OWNER;
    }

    if (path.startsWith("/staff")) {
      return role === ROLES.STAFF;
    }

    if (path.startsWith("/admin")) {
      return role === ROLES.ADMIN;
    }

    if (
      path.startsWith("/dashboard") ||
      path.startsWith("/my-tickets") ||
      path.startsWith("/tickets/") ||
      path.startsWith("/favorites") ||
      path.startsWith("/my-bookings") ||
      path === "/notifications"
    ) {
      return role === ROLES.CUSTOMER;
    }

    return true;
  };

  const afterSignIn = canReturnToPage(requestedPage, user)
    ? requestedPage
    : homeFor(user);

  const showNav =
    !NO_NAV.includes(location.pathname) &&
    !location.pathname.startsWith("/owner") &&
    !location.pathname.startsWith("/staff") &&
    !location.pathname.startsWith("/admin");

  const showFooter = showNav;

  return (
    <div className="app">
      {showNav && <NavBar />}

      <ScrollToHash />

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

        <Route
          path="/business/register"
          element={<Navigate to="/sign-up?type=owner" replace />}
        />

        {/* ================= AUTH ================= */}

        <Route
          path="/sign-up"
          element={
            user ? (
              <Navigate to={afterSignIn} replace />
            ) : (
              <AuthPage />
            )
          }
        />

        <Route
          path="/sign-in"
          element={
            user ? (
              <Navigate to={afterSignIn} replace />
            ) : (
              <AuthPage />
            )
          }
        />

        <Route
          path="/forgot-password"
          element={
            user ? (
              <Navigate to={homeFor(user)} replace />
            ) : (
              <ForgotPassword />
            )
          }
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* ================= CUSTOMER DASHBOARD ================= */}

        <Route
          path="/dashboard"
          element={
            !user ? (
              <Navigate to="/sign-in" replace />
            ) : getRole(user) === ROLES.CUSTOMER ? (
              <CustomerDashboard />
            ) : (
              <Navigate to={homeFor(user)} replace />
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
          path="/profile"
          element={
            <ProtectedRoute roles={[ROLES.CUSTOMER]}>
              <CustomerProfile key="customer-profile" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute roles={[ROLES.CUSTOMER]}>
              <CustomerProfile
                key="customer-settings"
                settings
              />
            </ProtectedRoute>
          }
        />

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

        {/* Customer notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute roles={[ROLES.CUSTOMER]}>
              <NotificationsPage />
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

          <Route
            path="/owner/branches/:branchId/queues"
            element={<QueueSettingsPage />}
          />

          <Route
            path="/owner/queues/:queueId/analytics"
            element={<QueueAnalyticsPage />}
          />

          <Route
            path="/owner/profile"
            element={<OwnerProfile />}
          />

          {/* OWNER NOTIFICATIONS - keeps Owner sidebar */}
          <Route
            path="/owner/notifications"
            element={<NotificationsPage />}
          />
        </Route>

            {/* ================= STAFF ================= */}

        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={[ROLES.STAFF]}>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<StaffOverview />}
          />

          <Route
            path="queues"
            element={<StaffQueues />}
          />

          <Route
            path="history"
            element={<StaffHistory />}
          />

          <Route
            path="bookings"
            element={<StaffBookings />}
          />

          <Route
            path="branch"
            element={<StaffBranch />}
          />

          <Route
            path="profile"
            element={<StaffProfile key="profile" />}
          />

          <Route
            path="settings"
            element={<StaffProfile key="settings" />}
          />

          <Route
            path="notifications"
            element={<NotificationsPage />}
          />
        </Route>

        {/* ================= BRANCH BOOKINGS ================= */}

        <Route
          path="/branches/:branchId/bookings"
          element={
            <ProtectedRoute roles={[ROLES.OWNER, ROLES.STAFF]}>
              <BranchBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<AdminOverview />}
          />

          <Route
            path="businesses"
            element={<AdminBusinesses />}
          />

          <Route
            path="users"
            element={<AdminUsers />}
          />

          <Route
            path="branches"
            element={<AdminBranches />}
          />

          <Route
            path="audit-logs"
            element={<AdminAuditLogs />}
          />

          <Route
            path="categories"
            element={<AdminCategoriesPage />}
          />

          <Route
            path="queues"
            element={<AdminQueuesPage />}
          />

          <Route
            path="reviews"
            element={<AdminReviewsPage />}
          />

          <Route
            path="suspicious-activity"
            element={<AdminSuspiciousPage />}
          />

          {/* ADMIN NOTIFICATIONS - keeps Admin sidebar */}
          <Route
            path="notifications"
            element={<NotificationsPage />}
          />
        </Route>

        {/* ================= NO ACCESS ================= */}

        <Route
          path="/no-access"
          element={<NoAccess />}
        />

        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>

      {showFooter && <Footer />}
    </div>
  );
}