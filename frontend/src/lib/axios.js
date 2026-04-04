import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true,
});

// Redirect to login on 401 — but NOT if we're already on a public page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicPage = ["/login", "/register"].includes(window.location.pathname);
    if (error.response?.status === 401 && !isPublicPage) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
