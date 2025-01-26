import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const BasicInformation = ({ client }) => {
  if (!client) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Name" secondary={client.name} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Email" secondary={client.email} />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Created At"
              secondary={new Date(client.createdAt).toLocaleString()}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default BasicInformation;
