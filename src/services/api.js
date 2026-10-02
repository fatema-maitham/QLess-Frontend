// Backend address. Set VITE_API_URL in the frontend .env file.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// GET request with optional query params, e.g. { search: "bank" }
export async function apiGet(path, { params, signal } = {}) {
  const url = new URL(API_URL + path);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") message = data.detail;
    } catch {
      // response had no JSON body
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

// Backend may return a list, or { items: [...] }
export function toList(data) {
  if (Array.isArray(data)) return data;
  return data?.items || data?.results || [];
}