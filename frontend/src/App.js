import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Home from './pages/Home';
import CreateClient from './components/CreateClient';
import CreateEmployee from './components/CreateEmployee';
import PhotoUpload from './pages/PhotoUpload';
import ClientPage from './pages/ClientPage';
import PrivateRoute from './components/PrivateRoute';
import Settings from './components/Settings';
import Profile from './pages/Profile';
import DownloadComponent from './components/DownloadComponent';
import SignUp from './components/SignUp';
import SignUpCompany from './components/SignUpCompany';
import GlobalNotification from './components/GlobalNotification';
import ApiSpec from './pages/ApiSpec';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalNotification />
        <Router>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signup-company" element={<SignUpCompany />} />
            <Route path="/download-component" element={<DownloadComponent />} />
            <Route path="/" element={<Login />} />
            
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/create-client"
              element={
                <PrivateRoute>
                  <CreateClient />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/create-employee"
              element={
                <PrivateRoute>
                  <CreateEmployee />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/upload-photos"
              element={
                <PrivateRoute>
                  <PhotoUpload />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/client/:clientId"
              element={
                <PrivateRoute>
                  <ClientPage />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="/api-spec"
              element={
                <PrivateRoute>
                  <ApiSpec />
                </PrivateRoute>
              }
            />

            {/* Catch all route - redirect to home if authenticated, login if not */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
