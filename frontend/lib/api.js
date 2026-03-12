import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-base-management-2.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Students
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getDepartments: () => api.get('/students/departments/list'),
};

// Malpractice
export const malpracticeAPI = {
  getAll: (params) => api.get('/malpractice', { params }),
  getByStudent: (studentId) => api.get(`/malpractice/student/${studentId}`),
  create: (data) => api.post('/malpractice', data),
  update: (id, data) => api.put(`/malpractice/${id}`, data),
  delete: (id) => api.delete(`/malpractice/${id}`),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

// Stats
export const statsAPI = {
  dashboard: () => api.get('/stats/dashboard'),
};

export default api;
