import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  TablePagination,
  Box,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import Navbar from "./Navbar";
import ClientService from "../services/client.service";

const Home = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/");
      return;
    }
    fetchClients();
  }, [navigate]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await ClientService.getClients();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setNotification({
        open: true,
        message: "Error loading clients: " + error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewClient = (clientId) => {
    navigate(`/client/${clientId}`);
  };

  const handleEditClient = (clientId) => {
    navigate(`/edit-client/${clientId}`);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      await ClientService.deleteClient(clientId);
      setNotification({
        open: true,
        message: "Client deleted successfully",
        severity: "success",
      });
      fetchClients(); // Refresh the list
    } catch (error) {
      console.error("Error deleting client:", error);
      setNotification({
        open: true,
        message: "Error deleting client: " + error.message,
        severity: "error",
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" component="h1">
              Clients
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reference ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? clients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : clients
                ).map((client) => (
                  <TableRow
                    key={client.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleViewClient(client.id)}
                  >
                    <TableCell>{client.clientReferenceId}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      {new Date(client.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClient(client.id);
                        }}
                        color="primary"
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClient(client.id);
                        }}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id);
                        }}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={clients.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
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

export default Home;
