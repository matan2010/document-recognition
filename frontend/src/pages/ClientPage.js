import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import BasicInformation from '../components/client/BasicInformation';
import DocumentsList from '../components/client/DocumentsList';
import EditClientForm from '../components/client/EditClientForm';
import ClientService from '../services/client.service';
import DocumentService from '../services/document.service';

const ClientPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/');
      return;
    }
    fetchClientData();
  }, [clientId, navigate]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientData, documentsData] = await Promise.all([
        ClientService.getClientById(clientId),
        ClientService.getClientDocuments(clientId),
      ]);
      
      setClient(clientData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching client data:', error);
      setNotification({
        open: true,
        message: 'Error loading client data: ' + error.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document) => {
    window.open(`/view-document/${document.id}`, '_blank');
  };

  const handleDownloadDocument = async (document) => {
    try {
      const response = await DocumentService.downloadDocument(document.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.fileName || `document-${document.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
      setNotification({
        open: true,
        message: 'Error downloading document: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleDocumentsChange = async () => {
    try {
      const documentsData = await ClientService.getClientDocuments(clientId);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error refreshing documents:', error);
      setNotification({
        open: true,
        message: 'Error refreshing documents: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleEditClient = async (updatedData) => {
    try {
      setSaving(true);
      await ClientService.updateClient(clientId, updatedData);
      setNotification({
        open: true,
        message: 'Client updated successfully',
        severity: 'success',
      });
      await fetchClientData();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating client:', error);
      setNotification({
        open: true,
        message: 'Error updating client: ' + error.message,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      await ClientService.deleteClient(clientId);
      setNotification({
        open: true,
        message: 'Client deleted successfully',
        severity: 'success',
      });
      navigate('/home');
    } catch (error) {
      console.error('Error deleting client:', error);
      setNotification({
        open: true,
        message: 'Error deleting client: ' + error.message,
        severity: 'error',
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (!client) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">Client not found</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            to="/home"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary">{client.name}</Typography>
        </Breadcrumbs>

        {/* Header Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1">
              {client.name}
            </Typography>
            <Box>
              <Button
                startIcon={<EditIcon />}
                onClick={() => setEditDialogOpen(true)}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                variant="outlined"
                color="error"
              >
                Delete
              </Button>
            </Box>
          </Box>
          <BasicInformation client={client} />
        </Paper>

        {/* Tabs Section */}
        <Paper elevation={0} sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<DescriptionIcon />}
              label="Documents"
              iconPosition="start"
            />
            <Tab
              icon={<HistoryIcon />}
              label="History"
              iconPosition="start"
            />
            <Tab
              icon={<SettingsIcon />}
              label="Settings"
              iconPosition="start"
            />
          </Tabs>
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <DocumentsList
                documents={documents}
                onViewDocument={handleViewDocument}
                onDownloadDocument={handleDownloadDocument}
                onDocumentsChange={handleDocumentsChange}
              />
            )}
            {activeTab === 1 && (
              <Typography variant="body1" color="text.secondary">
                History section coming soon...
              </Typography>
            )}
            {activeTab === 2 && (
              <Typography variant="body1" color="text.secondary">
                Settings section coming soon...
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Edit Dialog */}
        <EditClientForm
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleEditClient}
          client={client}
          saving={saving}
        />

        {/* Delete Dialog */}
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
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteClient} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default ClientPage;
