import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Button, Stack, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';

import DataTable from '../common/DataTable';
import * as depositService from '../../services/depositeService';

const PendingDeposites = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDeposits = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await depositService.getPendingDeposits();
      setDeposits(data);
    } catch (err) {
      console.error('Failed to fetch pending deposits:', err);
      setError('Failed to load pending deposits. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleRowClick = (deposit) => {
    navigate(`/deposits/${deposit.id}`);
  };

  const columns = [
    { key: 'id', label: 'ID', minWidth: 100 },
    { key: 'userName', label: 'User', minWidth: 150 },
    { 
      key: 'amount', 
      label: 'Amount', 
      minWidth: 120,
      render: (value, row) => `${value} ${row.currency}`
    },
    { 
      key: 'paymentMethod', 
      label: 'Payment Method', 
      minWidth: 150,
      render: (value) => value.charAt(0).toUpperCase() + value.slice(1)
    },
    { 
      key: 'status', 
      label: 'Status', 
      minWidth: 120,
      render: (value) => (
        <Chip 
          label={value} 
          color={
            value === 'pending' ? 'warning' : 
            value === 'completed' ? 'success' : 
            value === 'failed' ? 'error' : 
            'default'
          }
          size="small"
        />
      )
    },
    { 
      key: 'createdAt', 
      label: 'Date', 
      minWidth: 150,
      render: (value) => new Date(value).toLocaleString()
    },
    {
      key: 'actions',
      label: 'Actions',
      minWidth: 100,
      render: (_, row) => (
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/deposits/${row.id}`);
          }}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Pending Deposits
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={fetchDeposits}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <DataTable 
        columns={columns}
        data={deposits}
        isLoading={loading}
        onRowClick={handleRowClick}
        searchEnabled={true}
        searchPlaceholder="Search deposits..."
      />
    </Box>
  );
};

export default PendingDeposites;