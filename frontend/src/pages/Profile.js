import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import Navbar from '../components/Navbar';
import authService from '../services/auth.service';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

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

  if (!user) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4 }}>
          <Typography>User profile not found.</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </Avatar>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                Profile Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="textSecondary">
                  Role
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {user.role}
                </Typography>
              </Box>

              {user.companyId && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    Company ID
                  </Typography>
                  <Typography variant="body1">{user.companyId}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default Profile;
