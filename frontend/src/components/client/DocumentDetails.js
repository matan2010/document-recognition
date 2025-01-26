import React, { useState } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  CloudDownload as CloudDownloadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const DocumentDetails = ({
  document,
  onViewDocument,
  onDownloadDocument,
  onUpdateDocument,
  onDeleteDocument,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  const [editFieldDialogOpen, setEditFieldDialogOpen] = useState(false);
  const [editFieldValue, setEditFieldValue] = useState("");
  const [newKeyValue, setNewKeyValue] = useState({ key: "", value: "" });

  // Parse metadata more safely
  const metadata = (() => {
    try {
      return typeof document.metadata === 'string'
        ? JSON.parse(document.metadata)
        : document.metadata || {};
    } catch (error) {
      console.error('Error parsing metadata:', error);
      return {};
    }
  })();

  const confidence = metadata.confidence || 0;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get structured data from metadata
  const extractStructuredData = () => {
    try {
      console.log("Extracting structured data from metadata:", metadata);

      // First try to get the pre-extracted structured data
      if (metadata.structuredData && Object.keys(metadata.structuredData).length > 0) {
        console.log("Using pre-extracted structured data:", metadata.structuredData);
        return metadata.structuredData;
      }

      console.log("Falling back to raw response parsing");
      // Fallback to raw response if structured data is not available
      const rawResponse = metadata.rawResponse;
      console.log("Raw response:", rawResponse);

      if (!rawResponse) {
        console.log("No raw response available");
        return {};
      }

      // Extract entities from raw response
      const structuredData = {};
      if (Array.isArray(rawResponse.entities)) {
        console.log("Found entities:", rawResponse.entities);
        rawResponse.entities.forEach((entity) => {
          if (entity.type && entity.mentionText) {
            // Use normalized value if available, otherwise use mention text
            const value = entity.normalizedValue?.text || entity.mentionText;
            structuredData[entity.type.toLowerCase()] = value;
            // console.log('Extracted entity:', { type: entity.type, value });
          }
        });
      }

      console.log("Final structured data:", structuredData);
      return structuredData;
    } catch (error) {
      console.error("Error extracting structured data:", error);
      return {};
    }
  };

  const structuredData = extractStructuredData();
  console.log("Final structured data for rendering:", structuredData);

  const handleEditField = (field) => {
    setSelectedField(field);
    setEditFieldValue(structuredData[field.key] || "");
    setEditFieldDialogOpen(true);
  };

  const handleDeleteField = async (field) => {
    if (window.confirm(`Are you sure you want to delete the field "${field.label}"?`)) {
      const updatedData = { ...structuredData };
      delete updatedData[field.key];

      try {
        await onUpdateDocument(document.id, {
          metadata: {
            ...metadata,
            structuredData: updatedData,
          },
        });
      } catch (error) {
        console.error("Error deleting field:", error);
        alert("Failed to delete field. Please try again.");
      }
    }
  };

  const handleSaveField = async () => {
    try {
      const updatedData = {
        ...structuredData,
        [selectedField.key]: editFieldValue,
      };

      await onUpdateDocument(document.id, {
        metadata: {
          ...metadata,
          structuredData: updatedData,
        },
      });

      setEditFieldDialogOpen(false);
      setSelectedField(null);
      setEditFieldValue("");
    } catch (error) {
      console.error("Error updating field:", error);
      alert("Failed to update field. Please try again.");
    }
  };

  const handleDeleteDocument = async () => {
    if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      try {
        await onDeleteDocument(document.id);
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document. Please try again.");
      }
    }
  };

  const renderIdCardData = () => {
    console.log("Rendering ID card data. Document type:", metadata.documentType);
    console.log("Current structured data:", structuredData);

    const fields = [
      { label: "Last Name", key: "last_name" },
      { label: "First Name", key: "first_name" },
      { label: "ID Number", key: "id" },
      { label: "Birth Date", key: "birth_date" },
      { label: "Issue Date", key: "issue_date" },
      { label: "Valid Until", key: "valid_until" },
    ];

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          ID Card Details
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.key}>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ width: "30%", backgroundColor: "#f5f5f5" }}
                  >
                    {field.label}
                  </TableCell>
                  <TableCell sx={{ width: "50%" }}>
                    {structuredData[field.key] ? (
                      <Typography>{structuredData[field.key]}</Typography>
                    ) : (
                      <Typography color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ width: "20%" }}>
                    <Tooltip title="Edit Field">
                      <IconButton size="small" onClick={() => handleEditField(field)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Field">
                      <IconButton size="small" onClick={() => handleDeleteField(field)} sx={{ ml: 1 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const handleEditDialogOpen = () => {
    setEditedData(structuredData);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setNewKeyValue({ key: "", value: "" });
  };

  const handleSaveChanges = () => {
    // Here you would typically call an API to update the document
    if (onUpdateDocument) {
      onUpdateDocument(document.id, {
        metadata: JSON.stringify({
          ...metadata,
          structuredData: editedData,
        }),
      });
    }
    handleEditDialogClose();
  };

  const handleAddKeyValue = () => {
    if (newKeyValue.key && newKeyValue.value) {
      setEditedData({
        ...editedData,
        [newKeyValue.key]: newKeyValue.value,
      });
      setNewKeyValue({ key: "", value: "" });
    }
  };

  return (
    <div>
      <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Document Information
          </Typography>
          <Box>
            <Tooltip title="View Document">
              <IconButton onClick={onViewDocument} size="large">
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton onClick={onDownloadDocument} size="large">
                <CloudDownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Document">
              <IconButton onClick={handleDeleteDocument} size="large" color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Document Type
            </Typography>
            <Typography variant="body1">
              {metadata.documentType === 'ID_CARD' ? 'Israeli ID Card' : 'Unknown'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Confidence Score
            </Typography>
            <Typography variant="body1">{(confidence * 100).toFixed(2)}%</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Processed At
            </Typography>
            <Typography variant="body1">{formatDate(metadata.processedAt || document.createdAt)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Provider
            </Typography>
            <Typography variant="body1">{metadata.provider || "Mock OCR"}</Typography>
          </Grid>
        </Grid>

        {renderIdCardData()}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Extracted Data</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Add New Field
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Field Name"
                  value={newKeyValue.key}
                  onChange={(e) => setNewKeyValue({ ...newKeyValue, key: e.target.value })}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Value"
                  value={newKeyValue.value}
                  onChange={(e) => setNewKeyValue({ ...newKeyValue, value: e.target.value })}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddKeyValue}
                  disabled={!newKeyValue.key || !newKeyValue.value}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell width={100}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(editedData).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={key}
                        onChange={(e) => {
                          const newData = { ...editedData };
                          delete newData[key];
                          newData[e.target.value] = value;
                          setEditedData(newData);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={value}
                        onChange={(e) => {
                          setEditedData({
                            ...editedData,
                            [key]: e.target.value,
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newData = { ...editedData };
                          delete newData[key];
                          setEditedData(newData);
                        }}
                        color="error"
                      >
                        ×
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleSaveChanges} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Field Dialog */}
      <Dialog open={editFieldDialogOpen} onClose={() => setEditFieldDialogOpen(false)}>
        <DialogTitle>
          Edit {selectedField?.label}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Value"
            fullWidth
            value={editFieldValue}
            onChange={(e) => setEditFieldValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFieldDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveField} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentDetails;
