import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import DocumentService from "../services/document.service.js";
import ClientService from "../services/client.service.js";
import NotificationService from "../services/notification.service.js";
import "../styles/PhotoUpload.css";
import Navbar from '../components/Navbar';

const PhotoUpload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("id");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      let clients = await ClientService.getClients();
      clients ??= [];
      setClients(clients);
    } catch (error) {
      NotificationService.notify("Error loading clients: " + error.message, "error");
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

  const handleUpload = () => {
    if (!selectedClient) {
      NotificationService.notify("Please select a client", "error");
      return;
    }

    if (!title) {
      NotificationService.notify("Please enter a document title", "error");
      return;
    }

    // Start uploading each file in the background
    files.forEach((fileObj) => {
      const metadata = {
        documentType: fileObj.file.type.split("/")[1].toUpperCase(),
        originalName: fileObj.file.name,
        fileSize: fileObj.file.size,
        uploadedAt: new Date().toISOString(),
      };

      const documentData = {
        file: fileObj.file,
        clientId: selectedClient,
        title,
        documentType,
        metadata,
      };

      // Notify that upload has started
      NotificationService.notify(`Started uploading "${title}"`, "info");

      // Start background upload
      DocumentService.uploadDocumentInBackground(
        documentData,
        () => {
          NotificationService.notify(`Successfully uploaded "${title}"`, "success");
        },
        (error) => {
          NotificationService.notify(
            `Error uploading "${title}": ${error.response?.data?.message || error.message}`,
            "error"
          );
        }
      );
    });

    // Clear the form and navigate away
    setFiles([]);
    setTitle("");
    NotificationService.notify("Upload process started. You can continue using the site.", "info");
    navigate(`/client/${selectedClientId}`);
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

  const handleClientChange = (e) => {
    const client = clients.find(c => c.id === e.target.value);
    if (client) {
      setSelectedClient(client.clientReferenceId);
      setSelectedClientId(client.id);
    } else {
      setSelectedClient("");
      setSelectedClientId("");
    }
  };

  return (
    <>
      <Navbar />
      <Container className="upload-container">
        <Typography variant="h4" gutterBottom>
          Upload Documents
        </Typography>

        <Paper className="upload-paper">
          <FormControl fullWidth margin="normal">
            <InputLabel>Client</InputLabel>
            <Select
              value={selectedClientId}
              onChange={handleClientChange}
              label="Client"
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Document Type</InputLabel>
            <Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              label="Document Type"
            >
              <MenuItem value="id">ID</MenuItem>
              <MenuItem value="passport">Passport</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "active" : ""}`}
          >
            <input {...getInputProps()} />
            <CloudUpload />
            <Typography>
              {isDragActive
                ? "Drop the files here..."
                : "Drag 'n' drop files here, or click to select files"}
            </Typography>
          </div>

          {files.length > 0 && (
            <Grid container spacing={2} className="file-list">
              {files.map((fileObj) => (
                <Grid item xs={12} key={fileObj.file.name}>
                  <Paper className="file-item">
                    <img
                      src={fileObj.preview}
                      alt={fileObj.file.name}
                      className="file-preview"
                    />
                    <div className="file-info">
                      <Typography variant="body1">{fileObj.file.name}</Typography>
                    </div>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeFile(fileObj.file.name)}
                    >
                      Remove
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {files.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              className="upload-button"
              disabled={loading}
            >
              Upload Files
            </Button>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default PhotoUpload;
