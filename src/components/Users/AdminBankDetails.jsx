import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiCreditCard, FiSave, FiAlertCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

// Styled components (matching the updated Admin component style)
const Section = styled(motion.div)`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  margin: 0;
  border: 1px solid #edf2f7;
  width: 100%;
`;

const Subtitle = styled.h3`
  color: #4a5568;
  margin: 0.5rem 0;
  padding: 0.5rem;
  font-weight: 500;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InputGroup = styled.div`
  position: relative;
  margin: 0.75rem 0;
  width: 100%;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2d3748 !important;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
    background-color: white;
    color: #1a202c !important;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2d3748 !important;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
    background-color: white;
    color: #1a202c !important;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const Button = styled(motion.button)`
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 0.75rem;
  margin-bottom: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #3182ce;
  }
  
  &:disabled {
    background-color: #cbd5e0;
    cursor: not-allowed;
  }
`;

const OutlineButton = styled(Button)`
  background-color: transparent;
  color: #4299e1;
  border: 2px solid #4299e1;
  
  &:hover {
    background-color: #ebf8ff;
  }
`;

const DangerButton = styled(Button)`
  background-color: #f56565;
  
  &:hover {
    background-color: #e53e3e;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
`;

const BankCard = styled(motion.div)`
  background: ${props => props.$active ? '#f8fafc' : '#f7fafc'};
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid ${props => props.$active ? '#e2e8f0' : '#edf2f7'};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  opacity: ${props => props.$active ? 1 : 0.7};
  position: relative;
  width: 100%;
  
  &:hover {
    border-color: ${props => props.$active ? '#cbd5e0' : '#e2e8f0'};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
`;

const CardTitle = styled.h4`
  font-weight: 600;
  font-size: 1.125rem;
  color: #2d3748;
  margin: 0.5rem 0;
  padding-right: 4rem; /* Space for the status badge */
`;

const CardDetail = styled.p`
  color: #4a5568;
  font-size: 0.9375rem;
  margin: 0.375rem 0;
  
  strong {
    color: #2d3748;
    font-weight: 500;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  margin-top: 1rem;
  
  ${Button}, ${OutlineButton}, ${DangerButton} {
    padding: 0.5rem;
    margin-right: 0.5rem;
    margin-bottom: 0;
    border-radius: 8px;
  }
`;

const ActionIcon = styled.div`
  cursor: pointer;
  color: #a0aec0;
  transition: all 0.2s ease;
  
  &:hover {
    color: #4a5568;
  }
`;

const FormContainer = styled(motion.div)`
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f8fafc;
  width: 100%;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: ${props => props.$active ? '#C6F6D5' : '#FED7D7'};
  color: ${props => props.$active ? '#22543D' : '#822727'};
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #718096;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px dashed #e2e8f0;
  width: 100%;
  margin: 1rem 0;
`;

const AdminBankDetails = () => {
  // States
  const [bankDetails, setBankDetails] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    branchName: '',
    swiftCode: '',
    description: ''
  });
  const [loading, setLoading] = useState({
    fetch: false,
    submit: false,
    toggle: {},
    delete: {}
  });

  // Backend base URL
  const BASE_URL = 'http://151.106.125.212:5021';
  // Hardcoded adminId (replace with auth context if available)
  const adminId = 1;

  // Fetch bank details on mount
  useEffect(() => {
    // Force adminId to always be 1
    fetchBankDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBankDetails = async () => {
    setLoading({ ...loading, fetch: true });
    try {
      // Include adminId as query parameter
      const res = await axios.get(`${BASE_URL}/api/admin/bank-details?adminId=${adminId}`);
      console.log('Fetched bank details response:', res.data);
      
      let bankDetailsData = [];
      
      // Handle different response formats
      if (Array.isArray(res.data)) {
        bankDetailsData = res.data;
      } else if (res.data.bankDetails && Array.isArray(res.data.bankDetails)) {
        bankDetailsData = res.data.bankDetails;
      } else {
        console.warn('Unexpected response format:', res.data);
      }
      
      // Transform data from snake_case to camelCase if needed
      const transformedData = bankDetailsData.map(item => ({
        id: item.id,
        bankName: item.bankName || item.bank_name,
        accountHolderName: item.accountHolderName || item.account_holder_name,
        accountNumber: item.accountNumber || item.account_number,
        branchName: item.branchName || item.branch_name,
        swiftCode: item.swiftCode || item.swift_code,
        description: item.description || item.description || "",
        isActive: item.isActive !== undefined ? item.isActive : (item.is_active !== undefined ? item.is_active : true)
      }));
      
      console.log('Transformed bank details:', transformedData);
      setBankDetails(transformedData);
    } catch (err) {
      console.error('Error fetching bank details:', err);
      toast.error(err.response?.data?.message || 'Error fetching bank details', {
        position: 'top-right',
        autoClose: 3000,
      });
      setBankDetails([]);
    } finally {
      setLoading({ ...loading, fetch: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.bankName || !formData.accountHolderName || !formData.accountNumber) {
      toast.error('Please fill in all required fields', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    
    setLoading({ ...loading, submit: true });
    
    try {
      if (editingId) {
        // Update existing bank details
        await axios.patch(`${BASE_URL}/api/admin/bank-details/${editingId}`, {
          ...formData,
          adminId
        });
        
        toast.success('Bank details updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        // Add new bank details
        await axios.post(`${BASE_URL}/api/admin/bank-details`, {
          ...formData,
          adminId
        });
        
        toast.success('Bank details added successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      
      // Reset form and fetch updated data
      resetForm();
      fetchBankDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving bank details', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading({ ...loading, submit: false });
    }
  };

  const handleEdit = (details) => {
    setFormData({
      bankName: details.bankName,
      accountHolderName: details.accountHolderName,
      accountNumber: details.accountNumber,
      branchName: details.branchName || '',
      swiftCode: details.swiftCode || '',
      description: details.description || ''
    });
    setEditingId(details.id);
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setLoading({ ...loading, toggle: { ...loading.toggle, [id]: true } });
    try {
      await axios.patch(`${BASE_URL}/api/admin/bank-details/${id}/status`, {
        isActive: !currentStatus,
        adminId
      });
      
      toast.success(`Bank details ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      
      fetchBankDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error toggling status', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading({ ...loading, toggle: { ...loading.toggle, [id]: false } });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete these bank details?')) {
      return;
    }
    
    setLoading({ ...loading, delete: { ...loading.delete, [id]: true } });
    try {
      await axios.delete(`${BASE_URL}/api/admin/bank-details/${id}`, {
        data: { adminId }
      });
      
      toast.success('Bank details deleted successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      
      fetchBankDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting bank details', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading({ ...loading, delete: { ...loading.delete, [id]: false } });
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      branchName: '',
      swiftCode: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <Section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="admin-content-container"
    >
      <Subtitle>
        <FiCreditCard />
        Admin Bank Details
      </Subtitle>
      
      {!showForm ? (
        <Button 
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus size={16} />
          Add New Bank Details
        </Button>
      ) : (
        <FormContainer
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Subtitle style={{ fontSize: '1.125rem' }}>
            {editingId ? 'Edit Bank Details' : 'Add New Bank Details'}
          </Subtitle>
          
          <form onSubmit={handleFormSubmit}>
            <FormRow>
              <InputGroup>
                <InputLabel>Bank Name *</InputLabel>
                <Input 
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
                  required
                />
              </InputGroup>
              
              <InputGroup>
                <InputLabel>Account Holder Name *</InputLabel>
                <Input 
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Enter account holder name"
                  required
                />
              </InputGroup>
            </FormRow>
            
            <FormRow>
              <InputGroup>
                <InputLabel>Account Number *</InputLabel>
                <Input 
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  required
                />
              </InputGroup>
              
              <InputGroup>
                <InputLabel>Branch Name</InputLabel>
                <Input 
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="Enter branch name"
                />
              </InputGroup>
            </FormRow>
            
            <FormRow>
              <InputGroup>
                <InputLabel>SWIFT Code</InputLabel>
                <Input 
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleInputChange}
                  placeholder="Enter SWIFT code"
                />
              </InputGroup>
            </FormRow>
            
            <InputGroup>
              <InputLabel>Description</InputLabel>
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter additional details or notes"
              />
            </InputGroup>
            
            <div>
              <Button 
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading.submit}
              >
                {loading.submit ? (
                  <><LoadingSpinner /> Saving...</>
                ) : (
                  <><FiSave size={16} /> {editingId ? 'Update' : 'Save'}</>
                )}
              </Button>
              
              <OutlineButton 
                type="button"
                onClick={resetForm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiX size={16} /> Cancel
              </OutlineButton>
            </div>
          </form>
        </FormContainer>
      )}
      
      {loading.fetch ? (
        <div style={{ textAlign: 'center', padding: '1rem', width: '100%' }}>
          <LoadingSpinner style={{ borderColor: '#cbd5e0', borderTopColor: '#4299e1', width: '1.5rem', height: '1.5rem' }} />
          <p style={{ marginTop: '0.5rem', color: '#718096' }}>Loading bank details...</p>
        </div>
      ) : bankDetails.length > 0 ? (
        <CardGrid>
          <AnimatePresence>
            {bankDetails.map(detail => (
              <BankCard 
                key={detail.id}
                $active={detail.isActive}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <StatusBadge $active={detail.isActive}>
                  {detail.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
                
                <CardTitle>{detail.bankName}</CardTitle>
                
                <CardDetail>
                  <strong>Account Holder:</strong> {detail.accountHolderName}
                </CardDetail>
                
                <CardDetail>
                  <strong>Account Number:</strong> {detail.accountNumber}
                </CardDetail>
                
                {detail.branchName && (
                  <CardDetail>
                    <strong>Branch:</strong> {detail.branchName}
                  </CardDetail>
                )}
                
                {detail.swiftCode && (
                  <CardDetail>
                    <strong>SWIFT Code:</strong> {detail.swiftCode}
                  </CardDetail>
                )}
                
                {detail.description && (
                  <CardDetail>
                    <strong>Description:</strong> {detail.description}
                  </CardDetail>
                )}
                
                <ButtonGroup>
                  <OutlineButton 
                    onClick={() => handleEdit(detail)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiEdit2 size={16} />
                  </OutlineButton>
                  
                  <OutlineButton 
                    onClick={() => handleToggleStatus(detail.id, detail.isActive)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading.toggle[detail.id]}
                  >
                    {loading.toggle[detail.id] ? (
                      <LoadingSpinner />
                    ) : detail.isActive ? (
                      <FiToggleRight size={16} />
                    ) : (
                      <FiToggleLeft size={16} />
                    )}
                  </OutlineButton>
                  
                  <DangerButton 
                    onClick={() => handleDelete(detail.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading.delete[detail.id]}
                  >
                    {loading.delete[detail.id] ? (
                      <LoadingSpinner />
                    ) : (
                      <FiTrash2 size={16} />
                    )}
                  </DangerButton>
                </ButtonGroup>
              </BankCard>
            ))}
          </AnimatePresence>
        </CardGrid>
      ) : (
        <EmptyState>
          <FiAlertCircle size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.6 }} />
          <p>No bank details found. Add your first bank account details using the button above.</p>
        </EmptyState>
      )}
    </Section>
  );
};

export default AdminBankDetails;