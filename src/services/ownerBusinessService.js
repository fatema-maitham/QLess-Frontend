import { getToken } from '../lib/helpers/jwt-helpers';

const BASE_URL = import.meta.env.VITE_BACK_END_SERVER_URL;

// Turn the backend error into one readable message
const readError = (data) => {
  if (!data || !data.detail) return 'Something went wrong. Please try again.';
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg.replace('Value error, ', '')).join('. ');
  }
  return 'Something went wrong. Please try again.';
};

const request = async (path, options = {}) => {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(readError(data));
  return data;
};

// The owner's business (we use one business per owner)
const getMyBusiness = async () => {
  const list = await request('/users/me/businesses');
  return list && list.length ? list[0] : null;
};

// Create, then send to the admin right away
const createAndSubmit = async (formData) => {
  const business = await request('/businesses', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  return request(`/businesses/${business.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ approval_status: 'pending' }),
  });
};

// Edit; resend to the admin if it was a draft or rejected
const updateBusiness = (id, formData, resubmit) =>
  request(`/businesses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(resubmit ? { ...formData, approval_status: 'pending' } : formData),
  });

// Categories for the dropdown (empty list if they fail to load)
const getCategories = async () => {
  try {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

export { getMyBusiness, createAndSubmit, updateBusiness, getCategories };