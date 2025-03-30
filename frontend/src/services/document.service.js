import axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/documents";

class DocumentService {
  static async uploadDocument(documentData) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("file", documentData.file);
    formData.append("clientId", documentData.clientId);
    formData.append("title", documentData.title);
    formData.append("documentType", documentData.documentType);
    formData.append("metadata", JSON.stringify(documentData.metadata));

    return axios.post(`${API_URL}/upload/${documentData.clientId}`, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
  }

  static async uploadDocumentInBackground(documentData, onSuccess, onError) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("file", documentData.file);
    formData.append("clientId", documentData.clientId);
    formData.append("title", documentData.title);
    formData.append("documentType", documentData.documentType);
    formData.append("metadata", JSON.stringify(documentData.metadata));

    try {
      const response = await axios.post(`${API_URL}/upload/${documentData.clientId}`, formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (onSuccess) {
        onSuccess(response);
      }
      return response;
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }

  static async getDocuments() {
    return axios.get(API_URL, { headers: authHeader() });
  }

  static async getDocumentById(id) {
    return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
  }

  static async deleteDocument(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Delete document error:', error.response?.data || error.message);
      throw error;
    }
  }

  static async updateDocument(id, updateData) {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, updateData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Update document error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default DocumentService;
