import React from 'react';
import {
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import { Visibility, Download } from '@mui/icons-material';

const DocumentItem = ({ document, onView, onDownload }) => {
  return (
    <ListItem
      key={document.id}
      secondaryAction={
        <Box>
          <IconButton
            edge="end"
            onClick={() => onView(document.id)}
            color="primary"
          >
            <Visibility />
          </IconButton>
          <IconButton
            edge="end"
            onClick={() => onDownload(document.id)}
            color="primary"
          >
            <Download />
          </IconButton>
        </Box>
      }
    >
      <ListItemText
        primary={document.title}
        secondary={
          <>
            <Typography component="span" variant="body2" color="textSecondary">
              Uploaded: {new Date(document.createdAt).toLocaleString()}
            </Typography>
            <br />
            {document.metadata && (
              <Box sx={{ mt: 1 }}>
                {Object.entries(document.metadata).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </>
        }
      />
    </ListItem>
  );
};

export default DocumentItem;
