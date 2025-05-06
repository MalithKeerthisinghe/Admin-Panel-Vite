import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircularProgress,
  Alert,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Paper,
  Grid
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { getPendingWithdrawals, updateWithdrawalStatus } from '../../services/withdrawalService';
import DataTable from '../common/DataTable';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PendingWithdrawals = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(null); // 'approve' | 'reject' | null
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPendingWithdrawals();

      let withdrawalsArray = [];

      if (Array.isArray(response)) {
        withdrawalsArray = response;
      } else if (response?.pendingWithdrawals && Array.isArray(response.pendingWithdrawals)) {
        withdrawalsArray = response.pendingWithdrawals;
      }

      console.log('Fetched withdrawals:', withdrawalsArray);
      setWithdrawals(Array.isArray(withdrawalsArray) ? withdrawalsArray : []);
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      setError('Failed to load withdrawals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedWithdrawal || !confirmOpen) return;

    const isPending = confirmOpen === 'reject';

    try {
      console.log(`${confirmOpen === 'approve' ? 'Approving' : 'Rejecting'} withdrawal ${selectedWithdrawal.id}`);

      await updateWithdrawalStatus(selectedWithdrawal.id, isPending);
      fetchWithdrawals();
      alert(`Withdrawal ${confirmOpen === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      console.error(`Failed to ${confirmOpen} withdrawal:`, err);

      if (err.response) {
        const errorMsg = err.response?.data?.error
          ? `${err.response.data.message}: ${err.response.data.error}`
          : err.response?.data?.message || 'Failed to update withdrawal status';

        alert(`Error: ${errorMsg}`);
      } else {
        alert('Network error. Please try again.');
      }
    } finally {
      setConfirmOpen(null);
      setSelectedWithdrawal(null);
    }
  };

  const handleDetailsClick = (row) => {
    setDetailsData(row);
    setDetailsOpen(true);
    
    // Reset animations if dialog is already open
    if (detailsOpen) {
      setDetailsOpen(false);
      setTimeout(() => {
        setDetailsData(row);
        setDetailsOpen(true);
      }, 100);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', minWidth: 60, maxWidth: 70 },
    { key: 'transaction_id', label: 'Transaction ID', minWidth: 120, maxWidth: 130 },
    { key: 'user_id', label: 'User ID', minWidth: 60, maxWidth: 70 },
    { key: 'username', label: 'Username', minWidth: 100, maxWidth: 110 },
    {
      key: 'payment_method',
      label: 'Payment Method',
      minWidth: 100,
      maxWidth: 110
    },
    {
      key: 'details',
      label: 'Details',
      minWidth: 70,
      maxWidth: 80,
      render: (_, row) => (
        <IconButton 
          size="small" 
          color="primary" 
          onClick={(e) => {
            e.stopPropagation();
            handleDetailsClick(row);
          }}
        >
          <InfoIcon />
        </IconButton>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      minWidth: 160,
      maxWidth: 170,
      render: (_, row) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ minWidth: '70px', padding: '4px 8px' }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWithdrawal(row);
              setConfirmOpen('approve');
            }}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            sx={{ minWidth: '70px', padding: '4px 8px' }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWithdrawal(row);
              setConfirmOpen('reject');
            }}
          >
            Reject
          </Button>
        </Box>
      )
    }
  ];

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchWithdrawals}>
            Retry
          </Button>
        }
        sx={{ margin: 2 }}
      >
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={withdrawals}
        searchEnabled
        searchPlaceholder="Search withdrawals..."
        sx={{
          height: 'calc(100vh - 64px)',
          width: '100%',
          '& .MuiTableContainer-root': {
            height: '100%',
            maxHeight: 'none !important',
            overflowX: 'auto',
          },
          '& table': {
            minWidth: 800, // Reduced since we removed several columns
          },
          '& .MuiTableCell-root': {
            padding: '6px',
            whiteSpace: 'nowrap',
            fontSize: '0.875rem',
          },
        }}
      />

      {/* Approval/Rejection Confirmation Dialog */}
      <Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)}>
        <DialogTitle>{`Confirm ${confirmOpen === 'approve' ? 'Approval' : 'Rejection'}`}</DialogTitle>
        <DialogContent>
          <Typography>
            {`Are you sure you want to ${confirmOpen} this withdrawal?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmOpen === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {confirmOpen === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionProps={{
          timeout: 500,
          style: { 
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' 
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            animation: detailsOpen ? 'dialogFadeIn 0.4s ease-out' : 'none',
            '@keyframes dialogFadeIn': {
              '0%': { opacity: 0, transform: 'scale(0.9)' },
              '100%': { opacity: 1, transform: 'scale(1)' }
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          py: 2,
          animation: detailsOpen ? 'slideDown 0.4s ease-out' : 'none',
          '@keyframes slideDown': {
            '0%': { transform: 'translateY(-20px)' },
            '100%': { transform: 'translateY(0)' }
          }
        }}>
          Withdrawal Details
          <IconButton
            aria-label="close"
            onClick={() => setDetailsOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': { 
                transform: 'rotate(90deg)',
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {detailsData && (
            <Box 
              sx={{ 
                p: 3,
                animation: detailsOpen ? 'fadeIn 0.6s ease-out' : 'none',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 }
                }
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={6} 
                  sx={{ 
                    animation: detailsOpen ? 'slideUp 0.4s ease-out' : 'none',
                    animationDelay: '0.1s',
                    animationFillMode: 'both',
                    '@keyframes slideUp': {
                      '0%': { opacity: 0, transform: 'translateY(20px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Amount</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {formatCurrency(detailsData.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}
                  sx={{ 
                    animation: detailsOpen ? 'slideUp 0.4s ease-out' : 'none',
                    animationDelay: '0.2s',
                    animationFillMode: 'both'
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Date</Typography>
                  <Typography variant="h6">{formatDate(detailsData.created_at)}</Typography>
                </Grid>
                <Grid item xs={6}
                  sx={{ 
                    animation: detailsOpen ? 'slideUp 0.4s ease-out' : 'none',
                    animationDelay: '0.3s',
                    animationFillMode: 'both'
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Account Number</Typography>
                  <Typography variant="body1" fontWeight="medium">{detailsData.account_number}</Typography>
                </Grid>
                <Grid item xs={6}
                  sx={{ 
                    animation: detailsOpen ? 'slideUp 0.4s ease-out' : 'none',
                    animationDelay: '0.4s',
                    animationFillMode: 'both'
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Branch Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{detailsData.branch_name}</Typography>
                </Grid>
                <Grid item xs={6}
                  sx={{ 
                    animation: detailsOpen ? 'slideUp 0.4s ease-out' : 'none',
                    animationDelay: '0.5s',
                    animationFillMode: 'both'
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Bank Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{detailsData.bank_name}</Typography>
                </Grid>
                <Grid item xs={6}
                  sx={{ 
                    animation: detailsOpen ? 'slideUp 0.4s ease-out' : 'none',
                    animationDelay: '0.6s',
                    animationFillMode: 'both'
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Account Holder</Typography>
                  <Typography variant="body1" fontWeight="medium">{detailsData.account_holder_name}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          justifyContent: 'center',
          animation: detailsOpen ? 'slideUp 0.4s ease-out' : 'none',
          animationDelay: '0.7s',
          animationFillMode: 'both'
        }}>
          <Button 
            onClick={() => setDetailsOpen(false)}
            variant="contained"
            sx={{
              borderRadius: 28,
              px: 4,
              py: 1,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PendingWithdrawals;