import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import EditClientForm from './EditClientForm';

const ClientsTable = ({
  clients,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleEditClick = (event, client) => {
    event.stopPropagation();
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleEditSave = async (updatedData) => {
    await onEdit(selectedClient.id, updatedData);
    setEditDialogOpen(false);
    setSelectedClient(null);
  };

  const sortedClients = [...clients].sort((a, b) => {
    const aValue = a[orderBy] || '';
    const bValue = b[orderBy] || '';
    
    if (order === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  const headCells = [
    { id: 'clientReferenceId', label: 'Reference ID' },
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'createdAt', label: 'Created At' },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.id === 'actions' ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? sortedClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : sortedClients
            ).map((client) => (
              <TableRow
                key={client.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onView(client.id)}
              >
                <TableCell>{client.clientReferenceId}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  {new Date(client.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(client.id);
                    }}
                    color="primary"
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={(e) => handleEditClick(e, client)}
                    color="primary"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(client.id);
                    }}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={clients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      <EditClientForm
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSave={handleEditSave}
        loading={false}
      />
    </>
  );
};

export default ClientsTable;
