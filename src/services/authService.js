// src/services/authService.js

import { registerToken, saveUser } from '../lib/helpers/jwt-helpers';

// Use the `VITE_BACK_END_SERVER_URL` environment variable to set the base URL.
// Note the `/auth` path added to the server URL that forms the base URL for
// all the requests in this service.
const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/auth`;

const readError = (data) => {
  if (!data || !data.detail) return 'Something went wrong. Please try again.';
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg.replace('Value error, ', '')).join('. ');
  }
  return 'Something went wrong. Please try again.';
};

const handleAuth = async (url, body) => {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(readError(data));
  if (!data?.token || !data?.user) throw new Error('Invalid response from server');

  registerToken(data.token);
  saveUser(data.user);
  return data.user;
};

// { name, email, password, phone, role }
const signUp = (formData) => handleAuth(`${BASE_URL}/sign-up`, formData);

// { email, password }
const signIn = (formData) => handleAuth(`${BASE_URL}/sign-in`, formData);

export {
  signUp,
  signIn,
};
