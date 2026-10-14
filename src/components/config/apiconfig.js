import axios from 'axios';

export const baseURL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    
    if (!error.response) {
      console.error('Network error - please check your connection');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
