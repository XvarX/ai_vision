import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 添加日志输出环境变量
console.log('=== API 配置 ===');
console.log('NEXT_PUBLIC_API_URL 环境变量:', process.env.NEXT_PUBLIC_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('最终 baseURL:', `${API_BASE_URL}/api`);
console.log('================');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  // 日志: 记录每次请求的完整 URL
  console.log('API 请求:', config.method?.toUpperCase(), config.baseURL + (config.url || ''));

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
