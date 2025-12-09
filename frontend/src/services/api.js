// frontend/src/services/api.js
import axios from 'axios';

// =============================
// INSTANCIA AXIOS SIN /api
// =============================
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000', // 🔥 Quitado /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================
// INTERCEPTOR — AGREGAR JWT
// =============================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =============================
// AUTENTICACIÓN
// =============================
export const registerUser = (userData) => {
  // POST /register
  return apiClient.post('/register', userData);
};

export const loginUser = async (credentials) => {
  // POST /login
  const response = await apiClient.post('/login', credentials);

  if (response.data.access_token) {
    localStorage.setItem('accessToken', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// =============================
// TAREAS (TASKS)
// =============================
export const getTasks = () => {
  // GET /tasks
  return apiClient.get('/tasks');
};

export const createTask = (taskData) => {
  // POST /tasks
  return apiClient.post('/tasks', taskData);
};

export const updateTask = (taskId, taskData) => {
  // PUT /tasks/:id
  return apiClient.put(`/tasks/${taskId}`, taskData);
};

export const deleteTask = (taskId) => {
  // DELETE /tasks/:id
  return apiClient.delete(`/tasks/${taskId}`);
};

// =============================
// ETIQUETAS (TAGS)
// =============================
export const getTags = () => {
  // GET /tags
  return apiClient.get('/tags');
};

export const createTag = (tagName) => {
  // POST /tags
  return apiClient.post('/tags', { name: tagName });
};

export const deleteTag = (tagId) => {
  // DELETE /tags/:id
  return apiClient.delete(`/tags/${tagId}`);
};

export default apiClient;
