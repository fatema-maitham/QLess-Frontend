// The 4 roles in QLess (same names as the backend)
export const ROLES = {
  CUSTOMER: 'customer',
  OWNER: 'owner',
  STAFF: 'staff',
  ADMIN: 'admin',
};

// Get the role name from the user object
export function getRole(user) {
  if (!user) return null;
  const role = user.role?.name || user.role;
  return typeof role === 'string' ? role.toLowerCase() : null;
}

// Each role's home page after sign in
export function homeFor(user) {
  switch (getRole(user)) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.OWNER:
      return '/owner';
    case ROLES.STAFF:
      return '/staff';
    default:
      return '/dashboard';
  }
}