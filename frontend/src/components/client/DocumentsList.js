import React, { useState } from 'react';
import {
  Typography,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import DocumentDetails from './DocumentDetails';
import DocumentService from '../../services/document.service';

const DocumentsList = ({ documents, onViewDocument, onDownloadDocument, onDocumentsChange }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleUpdateDocument = async (documentId, updateData) => {
    try {
      await DocumentService.updateDocument(documentId, updateData);
      setSnackbar({
        open: true,
        message: 'Document updated successfully',
        severity: 'success'
      });
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error updating document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update document: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
      throw error;
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await DocumentService.deleteDocument(documentId);
      setSnackbar({
        open: true,
        message: 'Document deleted successfully',
        severity: 'success'
      });
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete document: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
      throw error;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!documents || documents.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">No documents found for this client.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Documents
      </Typography>
      {documents.map((document) => (
        <Box key={document.id} sx={{ mb: 2 }}>
          <DocumentDetails
            document={document}
            onViewDocument={() => onViewDocument(document)}
            onDownloadDocument={() => onDownloadDocument(document)}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        </Box>
      ))}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsList;
