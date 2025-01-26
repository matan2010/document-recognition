import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import Navbar from '../components/Navbar';
import ClientsTable from '../components/client/ClientsTable';
import ClientService from '../services/client.service';

const Home = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/');
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
      console.error('Error fetching clients:', error);
      setNotification({
        open: true,
        message: 'Error loading clients: ' + error.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewClient = (clientId) => {
    navigate(`/client/${clientId}`);
  };

  const handleEditClient = async (clientId, updatedData) => {
    try {
      await ClientService.updateClient(clientId, updatedData);
      setNotification({
        open: true,
        message: 'Client updated successfully',
        severity: 'success',
      });
      fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Error updating client:', error);
      setNotification({
        open: true,
        message: 'Error updating client: ' + error.message,
        severity: 'error',
      });
      throw error; // Propagate error to form
    }
  };

  const handleDeleteClick = (clientId) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await ClientService.deleteClient(clientToDelete);
      setNotification({
        open: true,
        message: 'Client deleted successfully',
        severity: 'success',
      });
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      setNotification({
        open: true,
        message: 'Error deleting client: ' + error.message,
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
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
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Clients
            </Typography>
          </Box>

          <ClientsTable
            clients={clients}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            onView={handleViewClient}
            onEdit={handleEditClient}
            onDelete={handleDeleteClick}
          />
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Client</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Home;
