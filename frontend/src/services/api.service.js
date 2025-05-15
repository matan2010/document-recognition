import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8000/api";

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add interceptor to handle token refresh
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Get all clients with their documents
  async getClientsWithDocuments() {
    try {
      const response = await this.api.get("/clients", {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching clients with documents:", error);
      throw error;
    }
  }

  // Get a specific client with their documents
  async getClientWithDocuments(clientId) {
    try {
      const response = await this.api.get(`/clients/${clientId}`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching client ${clientId} with documents:`, error);
      throw error;
    }
  }

  // Get client dashboard data
  async getClientDashboard(clientId) {
    try {
      const response = await this.api.get(`/dashboard/client/${clientId}`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching client dashboard for ${clientId}:`, error);
      throw error;
    }
  }

  // Get company dashboard data
  async getCompanyDashboard() {
    try {
      const response = await this.api.get("/dashboard/company", {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching company dashboard:", error);
      throw error;
    }
  }
}

export default new ApiService(); 