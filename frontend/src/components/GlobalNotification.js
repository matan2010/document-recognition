import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import NotificationService from '../services/notification.service';

const GlobalNotification = () => {
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = NotificationService.subscribe(({ message, severity }) => {
      setNotification({ message, severity });
      setOpen(true);
    });

    return () => unsubscribe();
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  if (!notification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={notification.severity}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalNotification;
