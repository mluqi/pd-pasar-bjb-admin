import axios, { AxiosRequestConfig } from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api',
});

instance.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
