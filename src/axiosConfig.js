import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Xử lý intercept request
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios config adding token to request:', config.url);
    }
    return config;
  },
  error => Promise.reject(error)
);

// Xử lý intercept response
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Xử lý lỗi 401 - Unauthorized
      localStorage.removeItem('accessToken');
      console.log('Unauthorized request, removing token');
      // Có thể redirect đến trang đăng nhập nếu cần
    }
    return Promise.reject(error);
  }
);

export default instance; 