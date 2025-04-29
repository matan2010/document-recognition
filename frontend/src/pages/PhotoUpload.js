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
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    setFiles([]);
    setFileError("");
  }, [documentType]);

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

  const onDrop = (acceptedFiles, rejectedFiles) => {
    // Check if document type is table and validate file types
    if (documentType === "table") {
      const allowedExtensions = ['.pdf', '.html', '.docx', '.pptx', '.xlsx', '.xlsm'];
      const validFiles = acceptedFiles.filter(file => {
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        return allowedExtensions.includes(extension);
      });
      
      if (validFiles.length !== acceptedFiles.length) {
        setFileError("For table documents, only PDF, HTML, DOCX, PPTX, XLSX, and XLSM files are allowed.");
        // Only add valid files
        setFiles((prevFiles) => [
          ...prevFiles,
          ...validFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
          })),
        ]);
        return;
      }
    }
    
    // If not a table document or all files are valid
    setFileError("");
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
    accept: documentType === "table" 
      ? {
          "application/pdf": [".pdf"],
          "text/html": [".html"],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
          "application/vnd.ms-excel.sheet.macroEnabled.12": [".xlsm"]
        }
      : {
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
    
    if (files.length === 0) {
      NotificationService.notify("Please upload at least one file", "error");
      return;
    }
    
    if (fileError) {
      NotificationService.notify(fileError, "error");
      return;
    }

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

      NotificationService.notify(`Started uploading "${title}"`, "info");

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

    setFiles([]);
    setTitle("");
    NotificationService.notify("Upload process started. You can continue using the site.", "info");
    navigate(`/client/${selectedClientId}`);
  };

  const removeFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.file.name !== fileName));
    URL.revokeObjectURL(files.find((f) => f.file.name === fileName)?.preview);
  };

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
              <MenuItem value="driversLicense">Drivers License</MenuItem>
              <MenuItem value="table">Table</MenuItem>
              <MenuItem value="leaseAgreement">Lease Agreement</MenuItem>
            </Select>
          </FormControl>

          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "active" : ""}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <CloudUpload fontSize="large" />
                <p>Drag and drop files here, or click to select files</p>
                {documentType === "table" && (
                  <p className="file-type-info">
                    For table documents, only PDF, HTML, DOCX, PPTX, XLSX, and XLSM files are allowed.
                  </p>
                )}
              </div>
            )}
          </div>
          
          {fileError && (
            <div className="error-message">
              {fileError}
            </div>
          )}

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
