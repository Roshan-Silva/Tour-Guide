import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api`, withCredentials: true, timeout: 15000 });
let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  const isAuthRequest = request?.url?.startsWith('/auth/');
  if (error.response?.status === 401 && !request?._retried && !isAuthRequest && localStorage.getItem('user')) {
    request._retried = true;
    try {
      refreshPromise ||= axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true }).finally(() => { refreshPromise = null; });
      const response = await refreshPromise; const session = response.data.data || response.data; saveSession(session); request.headers.Authorization = `Bearer ${session.token}`; return api(request);
    } catch {
      localStorage.removeItem('token'); localStorage.removeItem('user'); window.dispatchEvent(new Event('auth-change'));
      if (window.location.pathname !== '/login') window.location.assign('/login?session=expired');
    }
  }
  if (!error.response) error.userMessage = 'The server could not be reached. Check your connection and try again.';
  return Promise.reject(error);
});

export const saveSession = ({ token, user }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
};

export const clearSession = () => {
  axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true }).catch(() => {});
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-change'));
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export const getImageUrl = (image) => {
  if (!image || /^https?:\/\//i.test(image)) return image;
  return `${API_URL}/uploads/${image}`;
};

export default api;
