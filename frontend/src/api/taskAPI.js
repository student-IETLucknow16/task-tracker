import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.join(', ') ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const taskAPI = {
  // Get all tasks with optional filters
  getAll: (params = {}) => api.get('/tasks', { params }),

  // Get stats summary
  getStats: () => api.get('/tasks/stats'),

  // Get single task
  getById: (id) => api.get(`/tasks/${id}`),

  // Create task
  create: (data) => api.post('/tasks', data),

  // Update task fully
  update: (id, data) => api.put(`/tasks/${id}`, data),

  // Quick status update
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),

  // Delete one task
  delete: (id) => api.delete(`/tasks/${id}`),

  // Delete all completed tasks
  deleteCompleted: () => api.delete('/tasks?status=completed'),

  // Health check
  health: () => api.get('/health')
};

export default api;
