const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = isForm ? {} : { 'Content-Type': 'application/json' };
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include', // sends/receives the httpOnly "token" cookie
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

function withQuery(path, params) {
  if (!params) return path;
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString();
  return qs ? `${path}?${qs}` : path;
}

export default {
  get: (path, params) => request(withQuery(path, params)),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  // For endpoints that accept a file (multipart/form-data) - pass a FormData instance
  postForm: (path, formData) => request(path, { method: 'POST', body: formData, isForm: true }),
};
