import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, setToken, getRefreshToken, logout } from './auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401 handling with refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        processQueue(new Error('No refresh token'), null);
        logout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${BACKEND_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;
        setToken(token);
        processQueue(null, token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(new Error('Refresh failed'), null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const jobsAPI = {
  getAll: (params?: { page?: number; size?: number; search?: string }) =>
    api.get('/jobs', { params }),
  getById: (id: string) => api.get(`/jobs/${id}`),
  create: (data: {
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    salary?: string;
    type: string;
  }) => api.post('/jobs', data),
  update: (id: string, data: Partial<JobData>) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  apply: (
    id: string,
    data: { resumeUrl: string; coverLetter?: string }
  ) => api.post(`/jobs/${id}/apply`, data),
  getApplicants: (id: string) => api.get(`/jobs/${id}/applicants`),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { emailSubscription?: boolean; name?: string }) =>
    api.patch('/users/me', data),
};

export const storageAPI = {
  getPresignedUrl: (filename: string) =>
    api.post('/storage/presign', null, { params: { filename } }),
  uploadToPresignedUrl: (url: string, file: File) =>
    axios.put(url, file, {
      headers: { 'Content-Type': file.type },
    }),
};

interface JobData {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: string;
}
