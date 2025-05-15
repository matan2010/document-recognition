import React from 'react';
import { Container, Paper, Typography, Box, Divider, Tabs, Tab, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Navbar from '../components/Navbar';

const apiEndpoints = [
  {
    title: 'Login',
    method: 'POST',
    url: 'http://localhost:8000/auth/login',
    description: 'Authenticate a user and receive an access token and refresh token. Use this endpoint to log in.',
    exampleRequest: `curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"user@example.com\", \"password\": \"your_password\"}"`,
    exampleResponse: `{
  "access_token": "<JWT_ACCESS_TOKEN>",
  "refresh_token": "<JWT_REFRESH_TOKEN>",
  "user": {
    "id": "123",
    "email": "user@example.com",
    ...
  }
}`,
  },
  {
    title: 'Get All Clients with Documents',
    method: 'GET',
    url: 'http://localhost:8000/api/clients',
    description: 'Returns a list of all clients with their documents.',
    exampleRequest: `curl -X GET \
  http://localhost:8000/api/clients \
  -H "Authorization: Bearer <ACCESS_TOKEN>"`,
    exampleResponse: `[
  {
    "id": "123",
    "name": "John Doe",
    "documents": [ ... ]
  },
  ...
]`,
  },
  {
    title: 'Get Client by ID',
    method: 'GET',
    url: 'http://localhost:8000/clients/{id}',
    description: 'Returns a specific client by ID.',
    exampleRequest: `curl -X GET \
  http://localhost:8000/clients/123 \
  -H "Authorization: Bearer <ACCESS_TOKEN>"`,
    exampleResponse: `{
  "id": "123",
  "name": "John Doe",
  "documents": [ ... ]
}`,
  },
  {
    title: 'Create Client',
    method: 'POST',
    url: 'http://localhost:8000/clients',
    description: 'Creates a new client.',
    exampleRequest: `curl -X POST \
  http://localhost:8000/clients \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith", "email": "jane@example.com"}'`,
    exampleResponse: `{
  "id": "124",
  "name": "Jane Smith",
  ...
}`,
  },
  {
    title: 'Update Client',
    method: 'PATCH',
    url: 'http://localhost:8000/clients/{id}',
    description: 'Updates an existing client.',
    exampleRequest: `curl -X PATCH \
  http://localhost:8000/clients/123 \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated"}'`,
    exampleResponse: `{
  "id": "123",
  "name": "John Updated",
  ...
}`,
  },
  {
    title: 'Delete Client',
    method: 'DELETE',
    url: 'http://localhost:8000/clients/{id}',
    description: 'Deletes a client by ID.',
    exampleRequest: `curl -X DELETE \
  http://localhost:8000/clients/123 \
  -H "Authorization: Bearer <ACCESS_TOKEN>"`,
    exampleResponse: `{
  "message": "Client deleted successfully"
}`,
  },
  {
    title: 'Get Client Dashboard',
    method: 'GET',
    url: 'http://localhost:8000/api/dashboard/client/{clientId}',
    description: 'Returns dashboard data for a specific client.',
    exampleRequest: `curl -X GET \
  http://localhost:8000/api/dashboard/client/123 \
  -H "Authorization: Bearer <ACCESS_TOKEN>"`,
    exampleResponse: `{
  "clientId": "123",
  "dashboard": { ... }
}`,
  },
  {
    title: 'Get Company Dashboard',
    method: 'GET',
    url: 'http://localhost:8000/api/dashboard/company',
    description: 'Returns dashboard data for the company.',
    exampleRequest: `curl -X GET \
  http://localhost:8000/api/dashboard/company \
  -H "Authorization: Bearer <ACCESS_TOKEN>"`,
    exampleResponse: `{
  "dashboard": { ... }
}`,
  },
];

function ApiSpec() {
  const [tab, setTab] = React.useState(0);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMsg('Copied!');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            API Specification
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Below are the main API endpoints for this application. All endpoints require authentication via a Bearer token in the <code>Authorization</code> header.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
            {apiEndpoints.map((ep, i) => (
              <Tab key={ep.title} label={ep.title} />
            ))}
          </Tabs>
          {apiEndpoints.map((ep, i) => (
            <Box key={ep.title} sx={{ display: tab === i ? 'block' : 'none' }}>
              <Typography variant="h6" sx={{ mt: 2 }}>{ep.title}</Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                <b>{ep.method}</b> {ep.url}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{ep.description}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mr: 1 }}>Example Request:</Typography>
                <Tooltip title="Copy to clipboard">
                  <IconButton size="small" onClick={() => handleCopy(ep.exampleRequest)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Paper sx={{ background: '#222', color: '#fff', p: 2, fontFamily: 'monospace', mb: 2, overflowX: 'auto' }}>
                <pre style={{ margin: 0 }}>{ep.exampleRequest}</pre>
              </Paper>
              <Typography variant="subtitle2">Example Response:</Typography>
              <Paper sx={{ background: '#222', color: '#fff', p: 2, fontFamily: 'monospace', overflowX: 'auto' }}>
                <pre style={{ margin: 0 }}>{ep.exampleResponse}</pre>
              </Paper>
              <Divider sx={{ my: 3 }} />
            </Box>
          ))}
        </Paper>
        <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}

export default ApiSpec; 