import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import { getRole } from '../../lib/helpers/roles';

const ProtectedRoute = ({ roles, children }) => {
  const { user } = useContext(UserContext);
  const location = useLocation();

  // Not signed in → go to sign in, then come back here after
  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  // Signed in but wrong role → no access page
  if (roles && !roles.includes(getRole(user))) {
    return <Navigate to="/no-access" replace />;
  }

  return children;
};

export default ProtectedRoute;