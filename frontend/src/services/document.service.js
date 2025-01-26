import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8000/documents";

class DocumentService {
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

  async uploadDocument(documentData) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Received document data:", documentData);

    // Create FormData and append fields one by one
    const formData = new FormData();

    // Append file - this must be first
    if (documentData.file instanceof File) {
      formData.append("file", documentData.file);
      console.log("appended file to formData");
    } else {
      throw new Error("Invalid file object");
    }

    // Append other fields as part of the request body
    const requestBody = {
      clientId: documentData.clientId,
      title: documentData.title,
      //metadata: documentData.metadata || {},
    };

    // Append each field from requestBody to FormData
    Object.entries(requestBody).forEach(([key, value]) => {
      // Convert objects to JSON strings, keep strings as is
      const fieldValue = typeof value === "object" ? JSON.stringify(value) : value;
      formData.append(key, fieldValue);
      console.log(`appended ${key} to formData:`, fieldValue);
    });

    const config = {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      const response = await axios.post(
        `${API_URL}/upload/${documentData.clientId}`,
        formData,
        config
      );
      console.log("Upload successful:", response.data);
      return response;
    } catch (error) {
      console.error("Upload failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  async getDocuments() {
    return this.api.get("");
  }

  async getDocumentById(id) {
    return this.api.get(`/${id}`);
  }

  async deleteDocument(id) {
    try {
      const response = await this.api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete document error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateDocument(id, updateData) {
    try {
      const response = await this.api.patch(`/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update document error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new DocumentService();
