import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8084/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isAuthRequest = config.url?.startsWith('/auth/');
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload)
};

export const userApi = {
  getAll: () => api.get('/users'),
  create: (payload) => api.post('/users', payload),
  updateAccess: (id, payload) => api.put(`/users/${id}/access`, payload),
  updateStatus: (id, payload) => api.put(`/users/${id}/status`, payload),
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (payload) => api.put('/users/me/profile', payload)
};

export const taskApi = {
  getAll: () => api.get('/tasks'),
  create: (payload) => api.post('/tasks', payload),
  updateStatus: (id, payload) => api.put(`/tasks/${id}/status`, payload)
};

export const assetApi = {
  getAll: () => api.get('/assets'),
  create: (payload) => api.post('/assets', payload),
  updateStatus: (id, payload) => api.put(`/assets/${id}/status`, payload)
};

export const assetHistoryApi = {
  getAll: () => api.get('/asset-history'),
  getByAsset: (assetId) => api.get(`/asset-history/asset/${assetId}`),
  getByEmployee: (employeeId) => api.get(`/asset-history/employee/${employeeId}`)
};

export const trainingApi = {
  getAll: () => api.get('/training'),
  create: (payload) => api.post('/training', payload)
};

export const reportsApi = {
  generate: (payload) => api.post('/reports/generate', payload),
  download: (payload) =>
    api.post('/reports/download', payload, {
      responseType: 'blob'
    })
};

export default api;
