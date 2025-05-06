import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageIcon from '@mui/icons-material/Image';

const KycVerificationAdmin = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState({ open: false, url: '', title: '' });
  const [adminComment, setAdminComment] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // For demo purposes - replace with actual admin ID from auth context in production
  const adminId = 1;
  
  // API base URL - adjust as needed
  const API_BASE_URL = 'http://151.106.125.212:5021/api';

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Log the API call for debugging
      console.log(`Fetching from: ${API_BASE_URL}/admin/kyc-verifications/pending`);
      
      const response = await axios.get(`${API_BASE_URL}/admin/kyc-verifications/pending`);
      console.log('Pending verifications response:', response.data);
      
      setVerifications(response.data.verifications || []);
    } catch (error) {
      console.error('Error fetching KYC verifications:', error);
      const errorMsg = error.response 
        ? `Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`
        : 'Network error or server unreachable';
      setError(`Failed to load KYC verification requests. ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationDetails = async (id) => {
    try {
      console.log(`Fetching details for verification ID: ${id}`);
      const response = await axios.get(`${API_BASE_URL}/admin/kyc-verifications/${id}`);
      console.log('Verification details response:', response.data);
      return response.data.verification;
    } catch (error) {
      console.error('Error fetching verification details:', error);
      throw error;
    }
  };

  const handleApprove = async (verification) => {
    try {
      // Fetch complete details if needed
      setLoading(true);
      console.log('Approving verification:', verification);
      setSelectedVerification(verification); // Use the verification object directly
      setActionType('verified');
      setConfirmOpen(true);
    } catch (error) {
      setError('Failed to load verification details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (verification) => {
    try {
      // Fetch complete details if needed
      setLoading(true);
      console.log('Rejecting verification:', verification);
      setSelectedVerification(verification); // Use the verification object directly
      setActionType('rejected');
      setConfirmOpen(true);
    } catch (error) {
      setError('Failed to load verification details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedVerification) return;

    try {
      setLoading(true);
      
      // Use the correct ID from the verification object
      const verificationId = selectedVerification.id;
      const userId = selectedVerification.userId;
      
      console.log('Processing verification with:', {
        verificationId,
        userId,
        status: actionType
      });
      
      // Make sure we have a valid ID before proceeding
      if (!verificationId && !userId) {
        throw new Error('No valid identification found for this verification');
      }
      
      // Prepare request data
      const requestData = {
        status: actionType,
        adminComment: adminComment,
        adminId: adminId,
        userId: userId
      };
      
      let response;
      
      // First try with the verification ID endpoint
      if (verificationId) {
        try {
          console.log(`Attempting to update KYC verification with ID: ${verificationId}`);
          response = await axios.patch(
            `${API_BASE_URL}/admin/kyc-verifications/${verificationId}`, 
            requestData,
            { headers: { 'Content-Type': 'application/json' } }
          );
          console.log('KYC update response:', response.data);
        } catch (err) {
          console.warn(`Failed to update using verification ID: ${verificationId}`, err);
          // If this fails, we'll try the next approach
          throw err;
        }
      } else {
        // Force it to try the userId approach
        throw new Error('No verification ID available, trying userId approach');
      }
      
      // If we've reached here without an exception, we succeeded
      setSuccessMessage(`Successfully ${actionType === 'verified' ? 'approved' : 'rejected'} KYC verification`);
      setShowSuccess(true);
      
      // Refresh the list
      await fetchPendingVerifications();
      
      setAdminComment('');
      setConfirmOpen(false);
      
    } catch (error) {
      console.warn('First attempt failed, trying alternative endpoint with userId');
      
      // Try the alternative endpoint with userId
      try {
        const userId = selectedVerification.userId;
        
        if (!userId) {
          throw new Error('No user ID available for this verification');
        }
        
        const requestData = {
          status: actionType,
          adminComment: adminComment,
          adminId: adminId
        };
        
        console.log(`Attempting to update KYC verification for user: ${userId}`);
        
        const response = await axios.patch(
          `${API_BASE_URL}/admin/kyc-verifications/user/${userId}`, 
          requestData,
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        console.log('Alternative KYC update response:', response.data);
        
        // Show success message
        setSuccessMessage(`Successfully ${actionType === 'verified' ? 'approved' : 'rejected'} KYC verification`);
        setShowSuccess(true);
        
        // Refresh the list
        await fetchPendingVerifications();
        
        setAdminComment('');
        setConfirmOpen(false);
      } catch (secondError) {
        console.error('Both attempts failed:', secondError);
        
        // Try one more approach with a different endpoint structure
        try {
          const userId = selectedVerification.userId;
          
          if (!userId) {
            throw new Error('No user ID available for this verification');
          }
          
          const requestData = {
            status: actionType,
            adminComment: adminComment,
            adminId: adminId
          };
          
          console.log(`Final attempt: Trying direct user verification endpoint: ${userId}`);
          
          // This is a third possible endpoint format to try
          const response = await axios.patch(
            `${API_BASE_URL}/admin/user-verification/${userId}`, 
            requestData,
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          console.log('Final KYC update response:', response.data);
          
          // Show success message
          setSuccessMessage(`Successfully ${actionType === 'verified' ? 'approved' : 'rejected'} KYC verification`);
          setShowSuccess(true);
          
          // Refresh the list
          await fetchPendingVerifications();
          
          setAdminComment('');
          setConfirmOpen(false);
        } catch (thirdError) {
          console.error('All three attempts failed:', thirdError);
          const errorMsg = error.response 
            ? `Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`
            : 'Network error or server unreachable';
          setError(`Failed to ${actionType === 'verified' ? 'approve' : 'reject'} verification. ${errorMsg}`);
          setConfirmOpen(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenImage = (url, title) => {
    setImagePreview({
      open: true,
      url,
      title
    });
  };

  const handleCloseImage = () => {
    setImagePreview({
      open: false,
      url: '',
      title: ''
    });
  };

  const filteredVerifications = verifications.filter(verification => {
    return (
      verification.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.id?.toString().includes(searchTerm) ||
      verification.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (verification.email && verification.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <Box p={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} mt={1}>
        <Typography variant="h5" component="h1" sx={{ mr: 2 }}>
          KYC Verification Requests
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name, ID, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:focus-within': {
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
              }
            }
          }}
        />
      </Box>

      {error && (
        <Box p={2} mb={3}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchPendingVerifications}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress sx={{ 
            color: 'primary.main',
            animation: 'ripple 1.2s infinite ease-in-out',
            '@keyframes ripple': {
              '0%': {
                transform: 'scale(0.8)',
                opacity: 1
              },
              '50%': {
                transform: 'scale(1)',
                opacity: 0.5
              },
              '100%': {
                transform: 'scale(0.8)',
                opacity: 1
              }
            }
          }} />
        </Box>
      ) : filteredVerifications.length === 0 ? (
        <Alert severity="info">No KYC verification requests found.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredVerifications.map((verification) => (
            <Grid item xs={12} key={verification.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: 3, 
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="textSecondary">User Information</Typography>
                      <Typography variant="h6">{verification.userName || 'N/A'}</Typography>
                      <Typography variant="body2" color="textSecondary">User ID: {verification.userId}</Typography>
                      <Typography variant="body2">NIC: {verification.username || 'N/A'}</Typography>
                      {verification.email && (
                        <Typography variant="body2">Email: {verification.email}</Typography>
                      )}
                      <Typography variant="body2">
                        Submitted: {new Date(verification.createdAt).toLocaleString()}
                      </Typography>
                      <Chip 
                        label="Pending" 
                        color="warning" 
                        size="small" 
                        sx={{ mt: 1, borderRadius: 2 }} 
                      />
                      <Box mt={1}>
                        <Typography variant="body2" color="textSecondary">
                          Verification ID: {verification.id}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="textSecondary">Front Document</Typography>
                      <Box 
                        sx={{ 
                          height: 120, 
                          backgroundColor: 'rgba(0,0,0,0.04)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'pointer',
                          borderRadius: 3,
                          mt: 1,
                          transition: 'all 0.2s ease',
                          overflow: 'hidden',
                          border: '1px solid rgba(0,0,0,0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.06)',
                            transform: 'scale(1.02)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          },
                          '&:active': {
                            transform: 'scale(0.98)'
                          }
                        }}
                        onClick={() => handleOpenImage(
                          verification.frontImageUrl, 
                          'Front Document'
                        )}
                      >
                        {verification.frontImageUrl ? (
                          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                            <img 
                              src={verification.frontImageUrl} 
                              alt="Front Document" 
                              style={{ 
                                objectFit: 'cover', 
                                width: '100%',
                                height: '100%'
                              }}
                            />
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center' }}>
                            <ImageIcon fontSize="large" color="disabled" />
                            <Typography variant="caption" display="block">No document</Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="textSecondary">Back Document</Typography>
                      <Box 
                        sx={{ 
                          height: 120, 
                          backgroundColor: 'rgba(0,0,0,0.04)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: verification.backImageUrl ? 'pointer' : 'default',
                          borderRadius: 3,
                          mt: 1,
                          transition: 'all 0.2s ease',
                          overflow: 'hidden',
                          border: '1px solid rgba(0,0,0,0.08)',
                          '&:hover': {
                            backgroundColor: verification.backImageUrl ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.04)',
                            transform: verification.backImageUrl ? 'scale(1.02)' : 'none',
                            boxShadow: verification.backImageUrl ? '0 4px 8px rgba(0,0,0,0.1)' : 'none'
                          },
                          '&:active': {
                            transform: verification.backImageUrl ? 'scale(0.98)' : 'none'
                          }
                        }}
                        onClick={() => verification.backImageUrl && handleOpenImage(
                          verification.backImageUrl, 
                          'Back Document'
                        )}
                      >
                        {verification.backImageUrl ? (
                          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                            <img 
                              src={verification.backImageUrl} 
                              alt="Back Document" 
                              style={{ 
                                objectFit: 'cover', 
                                width: '100%',
                                height: '100%'
                              }}
                            />
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center' }}>
                            <ImageIcon fontSize="large" color="disabled" />
                            <Typography variant="caption" display="block">No document</Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleReject(verification)}
                    disabled={loading}
                    sx={{ 
                      ml: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(211, 47, 47, 0.2)'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      }
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleApprove(verification)}
                    disabled={loading}
                    sx={{ 
                      ml: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(46, 125, 50, 0.3)'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      }
                    }}
                  >
                    Approve
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmOpen} 
        onClose={() => !loading && setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle>
          {actionType === 'verified' ? 'Confirm Approval' : 'Confirm Rejection'}
        </DialogTitle>
        <DialogContent>
          {selectedVerification && (
            <>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to {actionType === 'verified' ? 'approve' : 'reject'} this KYC verification request?
              </Typography>
              <Box my={2} p={2} bgcolor="rgba(0,0,0,0.04)" borderRadius={2}>
                <Typography variant="body2" gutterBottom>
                  <strong>User:</strong> {selectedVerification.userName || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>User ID:</strong> {selectedVerification.userId || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Verification ID:</strong> {selectedVerification.id || 'N/A'}
                </Typography>
              </Box>
            </>
          )}
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={3}
            label="Admin Comment (Optional)"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            variant="outlined"
            disabled={loading}
            sx={{ mt: 2 }}
          />
          {loading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmOpen(false)} 
            sx={{ borderRadius: 2 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color={actionType === 'verified' ? 'success' : 'error'} 
            onClick={handleConfirmAction}
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: actionType === 'verified' 
                  ? '0 4px 8px rgba(46, 125, 50, 0.3)' 
                  : '0 4px 8px rgba(211, 47, 47, 0.2)'
              },
              '&:active': {
                transform: 'translateY(0)'
              }
            }}
          >
            {actionType === 'verified' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog 
        open={imagePreview.open} 
        onClose={handleCloseImage}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle>{imagePreview.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            {imagePreview.url && (
              <img 
                src={imagePreview.url} 
                alt={imagePreview.title} 
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImage} sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KycVerificationAdmin;