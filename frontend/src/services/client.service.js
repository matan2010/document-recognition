import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8000/clients";

class ClientService {
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

  async getClients() {
    try {
      const response = await this.api.get("", {
        headers: authHeader(),
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  }

  async getClientById(id) {
    try {
      const response = await this.api.get(`/${id}`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  }

  async getClientDocuments(id) {
    try {
      const response = await this.api.get(`/${id}/documents`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching documents for client ${id}:`, error);
      throw error;
    }
  }

  async createClient(clientData) {
    try {
      const response = await this.api.post("", clientData, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  async updateClient(id, clientData) {
    try {
      const response = await this.api.patch(`/${id}`, clientData, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
  }

  async deleteClient(id) {
    try {
      const response = await this.api.delete(`/${id}`, {
        headers: authHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      throw error;
    }
  }
}

export default new ClientService();
