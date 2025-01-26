import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import Navbar from "./Navbar";
import ClientService from "../services/client.service";

const CreateClient = () => {
  const [formData, setFormData] = useState({
    email: "",
    clientReferenceId: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  // Check authentication
  if (!localStorage.getItem("access_token")) {
    navigate("/");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { email, clientReferenceId, name } = formData;
    if (!email || !clientReferenceId || !name) {
      setNotification({
        open: true,
        message: "All fields are required",
        severity: "error",
      });
      return false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setNotification({
        open: true,
        message: "Please enter a valid email address",
        severity: "error",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await ClientService.createClient(formData);
      console.log("Client created successfully:", response);

      setNotification({
        open: true,
        message: "Client created successfully!",
        severity: "success",
      });

      // Reset form
      setFormData({
        email: "",
        clientReferenceId: "",
        name: "",
      });

      // Navigate to clients list after short delay
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (error) {
      console.error("Error creating client:", error);
      setNotification({
        open: true,
        message: error.response?.data?.message || "Error creating client",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Create New Client
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Client Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
            />

            <TextField
              fullWidth
              label="Client Reference ID"
              name="clientReferenceId"
              value={formData.clientReferenceId}
              onChange={handleChange}
              margin="normal"
              required
              helperText="A unique identifier for this client"
            />

            <TextField
              fullWidth
              type="email"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Client's email address"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Client"
              )}
            </Button>
          </Box>
        </Paper>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default CreateClient;
