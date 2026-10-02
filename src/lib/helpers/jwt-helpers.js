// Save the token after sign in / sign up
export function registerToken(token) {
  localStorage.setItem('token', token);
}

// Read the token (used for requests that need login)
export function getToken() {
  return localStorage.getItem('token');
}

// Save the user object the backend sends back
export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Get the signed-in user when the page loads
export function getUserFromToken() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (!token || !user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

// Sign out: remove both
export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}