import axios from "axios";

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/auth`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              this.setTokens(response.access_token, response.refresh_token);
              originalRequest.headers["Authorization"] = `Bearer ${response.access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    this.api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }

  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete this.api.defaults.headers.common["Authorization"];
  }

  async bootstrap(data) {
    try {
      const response = await this.api.post("/bootstrap", data);
      this.setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error("Bootstrap failed:", error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post("/login", credentials);
      this.setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await this.api.post("/refresh", { refresh_token: refreshToken });
      return response.data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.api.post("/logout");
      this.clearTokens();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.get("/verify");
      return response.data;
    } catch (error) {
      console.error("Token verification failed:", error);
      throw error;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  }

  getAccessToken() {
    return localStorage.getItem("access_token");
  }

  getUser() {
    const token = this.getAccessToken();
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  }
}

// Create a singleton instance
const authService = new AuthService();
export default authService;
