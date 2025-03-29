import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Snackbar,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import Navbar from './Navbar';

const Settings = () => {
  const [settings, setSettings] = useState({
    id: { birthDate: true, firstName: true, id: true, issueDate: true, lastName: true, validUntil: true },
    passport: { passportNumber: true, issueDate: true, validUntil: true },
    driverLicense: { licenseNumber: true, issueDate: true, validUntil: true },
  });
  const [expanded, setExpanded] = useState('id');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (column, field) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [column]: {
        ...prevSettings[column],
        [field]: !prevSettings[column][field],
      },
    }));
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSave = () => {
    // Here you would typically make an API call to save the settings
    console.log('Settings saved:', settings);
    setSnackbar({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success',
    });
  };

  const formatFieldName = (field) => {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const renderSettingsSection = (title, column) => (
    <Accordion
      expanded={expanded === column}
      onChange={handleAccordionChange(column)}
      sx={{ mb: 2 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {Object.entries(settings[column]).map(([field, value]) => (
            <Box key={field} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={value}
                    onChange={() => handleChange(column, field)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{formatFieldName(field)}</Typography>
                    <Tooltip title="This field will be displayed in the client details">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            System Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Configure which fields are displayed in the client details view
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {renderSettingsSection('ID Settings', 'id')}
          {renderSettingsSection('Passport Settings', 'passport')}
          {renderSettingsSection('Driver License Settings', 'driverLicense')}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              size="large"
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
