import axios from 'axios';

const BASE_URL = 'https://fakestoreapi.com';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Có thể thêm xử lý token ở đây
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý các lỗi response
    if (error.response) {
      // Server trả về lỗi
      console.error('Error response:', error.response.data);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('Error request:', error.request);
    } else {
      // Lỗi khi setting up request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;