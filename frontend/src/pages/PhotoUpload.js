import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { CloudUpload, CheckCircle, Error } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import DocumentService from "../services/document.service.js";
import ClientService from "../services/client.service.js";
import "../styles/PhotoUpload.css";
import Navbar from '../components/Navbar';

const PhotoUpload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ success: [], error: [] });
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("id"); // Default document type
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      let clients = await ClientService.getClients();
      clients ??= [];
      console.log(clients);
      setClients(clients);
    } catch (error) {
      setNotification({
        open: true,
        message: "Error loading clients: " + error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        status: "pending",
      })),
    ]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10000000, // 10MB
  });

  const handleUpload = async () => {
    if (!selectedClient) {
      setNotification({
        open: true,
        message: "Please select a client",
        severity: "error",
      });
      return;
    }

    if (!title) {
      setNotification({
        open: true,
        message: "Please enter a document title",
        severity: "error",
      });
      return;
    }

    setUploading(true);
    const uploadPromises = files.map(async (fileObj) => {
      if (fileObj.status !== "pending") return;

      // Create metadata object following backend DTO structure
      const metadata = {
        documentType: fileObj.file.type.split("/")[1].toUpperCase(),
        originalName: fileObj.file.name,
        fileSize: fileObj.file.size,
        uploadedAt: new Date().toISOString(),
      };

      const documentData = {
        file: fileObj.file,
        clientId: selectedClient, // Use clientReferenceId for the backend
        title,
        documentType, // Add the selected document type
        metadata,
      };

      console.log("Preparing to upload document:", {
        ...documentData,
        file: {
          name: documentData.file.name,
          type: documentData.file.type,
          size: documentData.file.size,
        },
      });

      try {
        const response = await DocumentService.uploadDocument(documentData);
        console.log("Upload response:", response);

        setNotification({
          open: true,
          message: "File uploaded successfully",
          severity: "success",
        });
        
        // Navigate to client page after successful upload using the actual client ID
        navigate(`/client/${selectedClientId}`);
        
        return { id: fileObj.file.name, success: true, response: response.data };
      } catch (error) {
        console.error("Upload error:", error);

        setNotification({
          open: true,
          message: `Error uploading ${fileObj.file.name}: ${
            error.response?.data?.message || error.message
          }`,
          severity: "error",
        });
        return { id: fileObj.file.name, success: false, error: error.message };
      }
    });

    const results = await Promise.all(uploadPromises);

    setUploadStatus({
      success: results.filter((r) => r?.success).map((r) => r.id),
      error: results.filter((r) => r?.success === false).map((r) => r.id),
    });

    setUploading(false);
  };

  const getFileStatus = (fileName) => {
    if (uploadStatus.success.includes(fileName)) return "success";
    if (uploadStatus.error.includes(fileName)) return "error";
    return "pending";
  };

  const removeFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.file.name !== fileName));
    URL.revokeObjectURL(files.find((f) => f.file.name === fileName)?.preview);
  };

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleClientChange = (e) => {
    const client = clients.find(c => c.id === e.target.value);
    if (client) {
      setSelectedClient(client.clientReferenceId); // Store the reference ID for the backend
      setSelectedClientId(client.id); // Store the actual ID for navigation
    } else {
      setSelectedClient("");
      setSelectedClientId("");
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" className="photo-upload-container">
        <Paper elevation={3} className="upload-paper">
          <Typography variant="h4" gutterBottom>
            Upload Documents
          </Typography>

          <Grid container spacing={2} className="form-fields">
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Select Client</InputLabel>
                <Select
                  value={selectedClientId} // Use actual ID for the select value
                  onChange={handleClientChange}
                  label="Select Client"
                >
                  {loading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Loading clients...
                    </MenuItem>
                  ) : (
                    clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name} ({client.clientReferenceId})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  label="Document Type"
                >
                  <MenuItem value="id">ID Card</MenuItem>
                  <MenuItem value="passport">Passport</MenuItem>
                  <MenuItem value="driversLicense">Driver's License</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: "primary.main" }} />
            <Typography variant="h6">
              {isDragActive
                ? "Drop the files here..."
                : "Drag 'n' drop files here, or click to select"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Supported formats: JPEG, PNG, PDF (Max 10MB)
            </Typography>
          </div>

          {files.length > 0 && (
            <Grid container spacing={2} className="preview-grid">
              {files.map((fileObj) => (
                <Grid item xs={12} sm={6} md={4} key={fileObj.file.name}>
                  <Paper className="preview-item">
                    {fileObj.file.type.startsWith("image/") ? (
                      <img src={fileObj.preview} alt="preview" />
                    ) : (
                      <div className="pdf-preview">PDF</div>
                    )}
                    <div className="preview-info">
                      <Typography variant="body2" noWrap>
                        {fileObj.file.name}
                      </Typography>
                      <div className="preview-status">
                        {getFileStatus(fileObj.file.name) === "success" && (
                          <CheckCircle color="success" />
                        )}
                        {getFileStatus(fileObj.file.name) === "error" && <Error color="error" />}
                        <Button
                          size="small"
                          onClick={() => removeFile(fileObj.file.name)}
                          disabled={uploading}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          <div className="upload-actions">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!selectedClient || !title || files.length === 0 || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : null}
            >
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </Paper>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default PhotoUpload;
