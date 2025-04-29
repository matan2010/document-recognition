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
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  CloudDownload as CloudDownloadIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  TableChart as TableChartIcon,
} from "@mui/icons-material";
import * as XLSX from 'xlsx';

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
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);

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

      // Check if this is a lease agreement with OpenRouter data
      if (metadata.provider?.includes('OpenRouter') && metadata.openRouterData?.data) {
        console.log("Using OpenRouter data for lease agreement:", metadata.openRouterData.data);
        return metadata.openRouterData.data;
      }

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
        // Check if we're dealing with a lease agreement (OpenRouter data)
        if (metadata.provider?.includes('OpenRouter') && metadata.openRouterData) {
          await onUpdateDocument(document.id, {
            metadata: {
              ...metadata,
              openRouterData: {
                ...metadata.openRouterData,
                data: updatedData
              },
              // Also update the combined structuredData
              structuredData: {
                ...metadata.structuredData,
                [field.key]: undefined
              }
            },
          });
        } else {
          // Regular document update
          await onUpdateDocument(document.id, {
            metadata: {
              ...metadata,
              structuredData: updatedData,
            },
          });
        }
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

      // Check if we're dealing with a lease agreement (OpenRouter data)
      if (metadata.provider?.includes('OpenRouter') && metadata.openRouterData) {
        await onUpdateDocument(document.id, {
          metadata: {
            ...metadata,
            openRouterData: {
              ...metadata.openRouterData,
              data: updatedData
            },
            // Also update the combined structuredData
            structuredData: {
              ...metadata.structuredData,
              [selectedField.key]: editFieldValue
            }
          },
        });
      } else {
        // Regular document update
        await onUpdateDocument(document.id, {
          metadata: {
            ...metadata,
            structuredData: updatedData,
          },
        });
      }

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

  const renderDriversLicenseData = () => {
    console.log("Rendering driver's license data. Document type:", metadata.documentType);
    console.log("Current structured data:", structuredData);

    const fields = [
      { label: "Last Name", key: "last_name" },
      { label: "First Name", key: "first_name" },
      { label: "ID Number", key: "id_number" },
      { label: "Date of Birth", key: "date_of_birth" },
      { label: "Home Address", key: "home_address" },
      { label: "Expiry", key: "expiry" },
    ];

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Driver's License Details
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

  const renderPassportData = () => {
    console.log("Rendering passport data. Document type:", metadata.documentType);
    console.log("Current structured data:", structuredData);

    const fields = [
      { label: "Last Name", key: "last_name" },
      { label: "First Name", key: "first_name" },
      { label: "ID Number", key: "id_number" },
      { label: "Passport Number", key: "passport_number" },
      { label: "Nationality", key: "nationality" },
      { label: "Place of Birth", key: "place_of_birth" },
      { label: "Expiration Date", key: "expiration_date" },
    ];

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Passport Details
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

  const renderLeaseAgreementData = () => {
    console.log("Rendering lease agreement data. Document type:", metadata.documentType);
    console.log("Current structured data:", structuredData);

    const fields = [
      { label: "Tenant Name", key: "tenantName" },
      { label: "Landlord Name", key: "landlordName" },
      { label: "Monthly Rent", key: "monthlyRent" }
    ];

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Lease Agreement Details
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

  const renderGenericTable = () => {
    if (metadata.rawResponse && metadata.rawResponse.documentLayout && 
        metadata.rawResponse.documentLayout.blocks && 
        metadata.rawResponse.documentLayout.blocks.length > 0) {
      
      // Extract table blocks from documentLayout
      const tableBlock = metadata.rawResponse.documentLayout.blocks.find(block => block.tableBlock);
      
      if (tableBlock && tableBlock.tableBlock && tableBlock.tableBlock.bodyRows) {
        const bodyRows = tableBlock.tableBlock.bodyRows;
        
        // First row is the header
        const headerRow = bodyRows[0];
        const headerCells = [];
        
        // Extract header cells text
        if (headerRow && headerRow.cells) {
          headerRow.cells.forEach(cell => {
            if (cell.blocks && cell.blocks.length > 0) {
              const textBlock = cell.blocks[0].textBlock;
              if (textBlock && textBlock.text) {
                headerCells.push({ text: textBlock.text });
              }
            }
          });
        }
        
        // Create table structure with header row
        const tableRows = [];
        
        // Process remaining rows (skip the header row)
        for (let i = 1; i < bodyRows.length; i++) {
          const row = bodyRows[i];
          const rowCells = [];
          
          if (row && row.cells) {
            row.cells.forEach(cell => {
              if (cell.blocks && cell.blocks.length > 0) {
                const textBlock = cell.blocks[0].textBlock;
                if (textBlock && textBlock.text) {
                  rowCells.push({ text: textBlock.text });
                } else {
                  rowCells.push({ text: '' });
                }
              } else {
                rowCells.push({ text: '' });
              }
            });
          }
          
          tableRows.push({ cells: rowCells });
        }
        
        // Store the table data for display
        const displayTableData = {
          headers: headerCells.map(cell => cell.text),
          rows: tableRows.map(row => row.cells.map(cell => cell.text))
        };
        
        // Handle edit button click
        const handleTableEditClick = () => {
          // Set the editedData state with our table data
          setEditedData({
            _tableData: displayTableData,
            _isTable: true
          });
          // Open the edit dialog
          setEditDialogOpen(true);
        };
        
        return (
          <Box mt={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Table Data
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<EditIcon />}
                onClick={handleTableEditClick}
                size="small"
              >
                Edit
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {headerCells.map((cell, index) => (
                      <TableCell key={index}>{cell.text}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.cells.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell.text}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      }
    }
    
    // Return empty if no table data found
    return null;
  };

  const extractTableData = () => {
    if (metadata.rawResponse && 
        metadata.rawResponse.documentLayout && 
        metadata.rawResponse.documentLayout.blocks) {
      
      // Find table block
      const tableBlock = metadata.rawResponse.documentLayout.blocks.find(block => block.tableBlock);
      
      if (tableBlock && tableBlock.tableBlock && tableBlock.tableBlock.bodyRows) {
        const bodyRows = tableBlock.tableBlock.bodyRows;
        
        // Extract headers
        const headerRow = bodyRows[0];
        const headers = [];
        
        if (headerRow && headerRow.cells) {
          headerRow.cells.forEach(cell => {
            if (cell.blocks && cell.blocks.length > 0) {
              const textBlock = cell.blocks[0].textBlock;
              if (textBlock && textBlock.text) {
                headers.push(textBlock.text);
              }
            }
          });
        }
        
        // Extract data rows
        const rows = [];
        for (let i = 1; i < bodyRows.length; i++) {
          const row = bodyRows[i];
          const rowData = [];
          
          if (row && row.cells) {
            row.cells.forEach(cell => {
              if (cell.blocks && cell.blocks.length > 0) {
                const textBlock = cell.blocks[0].textBlock;
                if (textBlock && textBlock.text) {
                  rowData.push(textBlock.text);
                } else {
                  rowData.push('');
                }
              } else {
                rowData.push('');
              }
            });
          }
          
          rows.push(rowData);
        }
        
        return { headers, rows };
      }
    }
    
    return null;
  };

  const extractDocumentData = () => {
    const docType = metadata.documentType?.toLowerCase() || '';
    
    // For table documents, use the existing table extraction
    if (docType.includes('table') || docType === 'table') {
      return extractTableData();
    }
    
    // For other document types, extract structured data
    const data = { headers: ['Field', 'Value'], rows: [] };
    
    // Use structured data if available
    if (metadata.structuredData && Object.keys(metadata.structuredData).length > 0) {
      Object.entries(metadata.structuredData).forEach(([key, value]) => {
        data.rows.push([key, value]);
      });
      return data;
    }
    
    // Fallback to raw entities if available
    if (metadata.rawResponse && Array.isArray(metadata.rawResponse.entities)) {
      metadata.rawResponse.entities.forEach((entity) => {
        if (entity.type && entity.mentionText) {
          const value = entity.normalizedValue?.text || entity.mentionText;
          data.rows.push([entity.type, value]);
        }
      });
      return data;
    }
    
    return null;
  };

  const exportToExcel = () => {
    const data = extractDocumentData();
    
    if (data) {
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet([
        data.headers,
        ...data.rows
      ]);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Document Data");
      
      // Generate Excel file
      const fileName = `${document.name || 'document-data'}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } else {
      alert("No data found to export to Excel");
    }
    
    // Close the menu
    setDownloadMenuAnchor(null);
  };

  const handleDownloadClick = (event) => {
    setDownloadMenuAnchor(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchor(null);
  };

  const renderDocumentData = () => {
    const docType = metadata.documentType?.toLowerCase() || '';
    if (docType.includes('leaseAgreement') || docType === 'leaseagreement') {
      return renderLeaseAgreementData();
    } else if (docType.includes('driversLicense') || docType === 'driverslicense') {
      return renderDriversLicenseData();
    } else if (docType.includes('passport')) {
      return renderPassportData();
    } else if (docType.includes('table') || docType === 'table') {
      // If the document type indicates it's a table, render it using the generic table function
      return renderGenericTable();
    } else {
      // Default to ID card for any other type or when type is not specified
      return renderIdCardData();
    }
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
      // Check if we're dealing with table data
      if (editedData._isTable && editedData._tableData) {
        const tableData = editedData._tableData;
        
        // Reconstruct the table block
        const headerCells = tableData.headers.map(header => ({
          blocks: [{
            textBlock: {
              text: header
            }
          }]
        }));
        
        // Create body rows from the edited data
        const bodyRows = [
          { cells: headerCells }, // Header row
          ...tableData.rows.map(row => ({
            cells: row.map(cellText => ({
              blocks: [{
                textBlock: {
                  text: cellText
                }
              }]
            }))
          }))
        ];
        
        // Create the updated table block
        const updatedTableBlock = {
          tableBlock: {
            bodyRows: bodyRows
          }
        };
        
        // Update the document layout with the new table
        const updatedDocumentLayout = {
          ...metadata.rawResponse.documentLayout,
          blocks: metadata.rawResponse.documentLayout.blocks.map(block => 
            block.tableBlock ? updatedTableBlock : block
          )
        };
        
        // Update the document with the new layout - as an object, not a string
        onUpdateDocument(document.id, {
          metadata: {
            ...metadata,
            rawResponse: {
              ...metadata.rawResponse,
              documentLayout: updatedDocumentLayout
            }
          }
        });
      } else {
        // Handle regular data updates - as an object, not a string
        onUpdateDocument(document.id, {
          metadata: {
            ...metadata,
            structuredData: editedData,
          }
        });
      }
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
              <IconButton onClick={handleDownloadClick} size="large">
                <CloudDownloadIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={downloadMenuAnchor}
              open={Boolean(downloadMenuAnchor)}
              onClose={handleDownloadMenuClose}
            >
              <MenuItem onClick={exportToExcel}>
                <ListItemIcon>
                  <TableChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Export as Excel" />
              </MenuItem>
            </Menu>
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
              {(() => {
                const docType = metadata.documentType?.toLowerCase() || '';
                if (docType === 'id_card') return 'Israeli ID Card';
                if (docType.includes('driverslicense') || docType === 'driverslicense') return 'Driver\'s License';
                if (docType.includes('passport')) return 'Passport';
                if (docType.includes('table') || docType === 'table') return 'Table Document';
                if (docType.includes('leaseAgreement') || docType === 'leaseagreement') return 'Lease Agreement';
                if (docType) return metadata.documentType; // Return original if not matching any known type
                return 'Unknown';
              })()}
            </Typography>
          </Grid>
          {!(metadata.documentType?.toLowerCase()?.includes('table') || metadata.documentType === 'table') && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Confidence Score
              </Typography>
              <Typography variant="body1">{(confidence * 100).toFixed(2)}%</Typography>
            </Grid>
          )}
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

        {renderDocumentData()}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Extracted Data</DialogTitle>
        <DialogContent>
          {editedData._isTable ? (
            <Box sx={{ mb: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Edit Table Data
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {editedData._tableData.headers.map((header, headerIndex) => (
                        <TableCell key={headerIndex}>
                          <Box display="flex" alignItems="center">
                            <TextField
                              fullWidth
                              size="small"
                              value={header}
                              onChange={(e) => {
                                const newHeaders = [...editedData._tableData.headers];
                                newHeaders[headerIndex] = e.target.value;
                                setEditedData({
                                  ...editedData,
                                  _tableData: {
                                    ...editedData._tableData,
                                    headers: newHeaders
                                  }
                                });
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                // Remove this column
                                const newHeaders = [...editedData._tableData.headers];
                                newHeaders.splice(headerIndex, 1);
                                
                                // Also remove this column from all rows
                                const newRows = editedData._tableData.rows.map(row => {
                                  const newRow = [...row];
                                  newRow.splice(headerIndex, 1);
                                  return newRow;
                                });
                                
                                setEditedData({
                                  ...editedData,
                                  _tableData: {
                                    headers: newHeaders,
                                    rows: newRows
                                  }
                                });
                              }}
                              color="error"
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      ))}
                      <TableCell width={100}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            // Add a new column
                            const newHeaders = [...editedData._tableData.headers, `Column ${editedData._tableData.headers.length + 1}`];
                            
                            // Add an empty cell to each row for this column
                            const newRows = editedData._tableData.rows.map(row => {
                              return [...row, ''];
                            });
                            
                            setEditedData({
                              ...editedData,
                              _tableData: {
                                headers: newHeaders,
                                rows: newRows
                              }
                            });
                          }}
                        >
                          Add Column
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editedData._tableData.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <TextField
                              fullWidth
                              size="small"
                              value={cell}
                              onChange={(e) => {
                                const newRows = [...editedData._tableData.rows];
                                newRows[rowIndex][cellIndex] = e.target.value;
                                setEditedData({
                                  ...editedData,
                                  _tableData: {
                                    ...editedData._tableData,
                                    rows: newRows
                                  }
                                });
                              }}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newRows = [...editedData._tableData.rows];
                              newRows.splice(rowIndex, 1);
                              setEditedData({
                                ...editedData,
                                _tableData: {
                                  ...editedData._tableData,
                                  rows: newRows
                                }
                              });
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box mt={2} display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const newRows = [...editedData._tableData.rows];
                    const emptyRow = Array(editedData._tableData.headers.length).fill('');
                    newRows.push(emptyRow);
                    setEditedData({
                      ...editedData,
                      _tableData: {
                        ...editedData._tableData,
                        rows: newRows
                      }
                    });
                  }}
                >
                  Add Row
                </Button>
              </Box>
            </Box>
          ) : (
            <>
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
            </>
          )}
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
