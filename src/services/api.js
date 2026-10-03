// Backend address. Set VITE_API_URL in the frontend .env file.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Adds query params like { search: "bank" } to the URL, skipping empty ones
function buildUrl(path, params) {
  const url = new URL(API_URL + path);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  return url;
}

// Turns a failed response into an Error with a readable message and .status
async function toError(res) {
  let message = `Request failed (${res.status})`;

  try {
    const data = await res.json();
    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
      // FastAPI form errors come as a list
      message = data.detail[0].msg;
    }
  } catch {
    // response had no JSON body
  }

  const error = new Error(message);
  error.status = res.status;
  return error;
}

// One function that every request goes through
async function request(method, path, { params, body, signal } = {}) {
  const token = localStorage.getItem("token");

  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(buildUrl(path, params), {
    method,
    signal,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw await toError(res);
  if (res.status === 204) return null;
  return res.json();
}

export function apiGet(path, { params, signal } = {}) {
  return request("GET", path, { params, signal });
}

export function apiPost(path, body, { signal } = {}) {
  return request("POST", path, { body, signal });
}

export function apiPatch(path, body, { signal } = {}) {
  return request("PATCH", path, { body, signal });
}

export function apiDelete(path, { signal } = {}) {
  return request("DELETE", path, { signal });
}

// Backend may return a list, or { items: [...] }
export function toList(data) {
  if (Array.isArray(data)) return data;
  return data?.items || data?.results || [];
}