import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true, // sends the JWT cookie automatically on every request
});

// Redirect to login on any 401 response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
