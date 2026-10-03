import { getToken } from '../lib/helpers/jwt-helpers';

const API = import.meta.env.VITE_BACK_END_SERVER_URL;

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = data?.detail;
    if (Array.isArray(detail)) throw new Error(detail.map((d) => d.msg).join(', '));
    throw new Error(detail || 'Something went wrong. Please try again.');
  }
  return data;
}

/* business */
export const getMyBusinesses = () => request('/users/me/businesses');
export const updateBusiness = (id, data) => request(`/businesses/${id}`, { method: 'PATCH', body: data });
export const getCategories = () => request('/categories');

/* branches */
export const getBranches = (businessId) => request(`/businesses/${businessId}/branches`);
export const createBranch = (businessId, data) => request(`/businesses/${businessId}/branches`, { method: 'POST', body: data });
export const updateBranch = (id, data) => request(`/branches/${id}`, { method: 'PATCH', body: data });
export const deleteBranch = (id) => request(`/branches/${id}`, { method: 'DELETE' });

/* opening hours */
export const getHours = (branchId) => request(`/branches/${branchId}/hours`);
export const createHour = (branchId, data) => request(`/branches/${branchId}/hours`, { method: 'POST', body: data });
export const updateHour = (id, data) => request(`/hours/${id}`, { method: 'PATCH', body: data });

/* services */
export const getServices = (branchId) => request(`/branches/${branchId}/services`);
export const createService = (branchId, data) => request(`/branches/${branchId}/services`, { method: 'POST', body: data });
export const deleteService = (id) => request(`/services/${id}`, { method: 'DELETE' });

/* staff */
export const getStaff = (branchId) => request(`/branches/${branchId}/staff`);
export const createStaff = (branchId, data) => request(`/branches/${branchId}/staff`, { method: 'POST', body: data });
export const deleteStaff = (id) => request(`/staff/${id}`, { method: 'DELETE' });

/* announcements */
export const getAnnouncements = (businessId) => request(`/businesses/${businessId}/announcements`);
export const createAnnouncement = (businessId, data) => request(`/businesses/${businessId}/announcements`, { method: 'POST', body: data });
export const deleteAnnouncement = (id) => request(`/announcements/${id}`, { method: 'DELETE' });

/* visitors (for the overview chart) */
export const getQueues = (branchId) => request(`/branches/${branchId}/queues`);
export const getQueueEntries = (queueId) => request(`/queues/${queueId}/entries`);

/* loads one branch with its hours, services and staff */
export async function loadBranch(branch) {
  const [hours, services, staff] = await Promise.all([
    getHours(branch.id).catch(() => []),
    getServices(branch.id).catch(() => []),
    getStaff(branch.id).catch(() => []),
  ]);
  return { ...branch, hours, services, staff };
}

/* loads everything the owner dashboard needs */
export async function loadOwnerData() {
  const list = await getMyBusinesses();
  const business = list?.[0] || null;
  if (!business) return { business: null, branches: [], announcements: [] };

  const [branches, announcements] = await Promise.all([
    getBranches(business.id).catch(() => []),
    getAnnouncements(business.id).catch(() => []),
  ]);
  const full = await Promise.all(branches.map(loadBranch));
  return { business, branches: full, announcements };
}