import axios from "axios";

const api = axios.create({
  baseURL: "https://dev1-p3.palindo.id/api",
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");

      if (token) {
        localStorage.removeItem("token");

        if (window.location.pathname !== "/signin") {
          sessionStorage.setItem("forceLogout", "true");
          sessionStorage.setItem(
            "logoutReason",
            "Sesi Anda telah berakhir atau Anda telah login di perangkat lain."
          );

          window.location.href = "/signin";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
