import axios from 'axios';

const api = axios.create({
  baseURL: 'http://dev2.palindo.id:4000/api', // Adjust this to your API base URL
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) and 403 (Forbidden) globally
    if (error.response?.status === 401 || error.response?.status === 403) {
      const token = localStorage.getItem('token');
      
      // Only handle logout if user was actually logged in (had a token)
      if (token) {
        // Clear token from localStorage
        localStorage.removeItem('token');
        
        // Only redirect if not already on signin page
        if (window.location.pathname !== '/signin') {
          // Add a flag to indicate forced logout
          sessionStorage.setItem('forceLogout', 'true');
          sessionStorage.setItem('logoutReason', 'Sesi Anda telah berakhir atau Anda telah login di perangkat lain.');
          
          // Redirect to signin
          window.location.href = '/signin';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;