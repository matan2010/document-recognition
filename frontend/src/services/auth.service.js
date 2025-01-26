import axios from "axios";
import { API_URL } from "../config";

class AuthService {
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bootstrap(registrationData) {
    try {
      console.log('Sending registration data:', registrationData);
      const response = await axios.post(`${API_URL}/auth/bootstrap`, registrationData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleError(error);
    }
  }

  async refreshToken() {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (!refresh_token) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token,
      });

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      this.logout(); // Clear tokens if refresh fails
      throw this.handleError(error);
    }
  }

  async verifyToken() {
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: this.authHeader(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, { headers: this.authHeader() });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearStorage();
    }
  }

  clearStorage() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  }

  authHeader() {
    const token = localStorage.getItem("access_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.message || "An error occurred");
    } else if (error.request) {
      // Request made but no response
      throw new Error("No response from server");
    } else {
      // Error setting up request
      throw new Error(error.message);
    }
  }
}

const authService = new AuthService();

// Add axios interceptors for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await authService.refreshToken();

        // Update the authorization header
        const token = localStorage.getItem("access_token");
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        authService.clearStorage();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default authService;
