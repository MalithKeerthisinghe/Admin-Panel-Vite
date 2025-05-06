// depositeService.js
import axios from 'axios';

// Create an API client with the correct base URL
const api = axios.create({
  baseURL: 'http://151.106.125.212:5021/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get all deposits
export const getAllDeposits = async () => {
  try {
    const resp = await api.get('/deposits');
    console.log('Deposits response:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('Error fetching deposits:', error);
    throw error;
  }
};

// Get pending deposits 
export const getPendingDeposits = async () => {
  console.log('Fetching pending deposits...');
  try {
    // Make sure to use the correct API path
    const resp = await api.get('/deposits/pending');
    console.log('Pending deposits response:', resp.data);
    return resp.data;
  } catch (error) {
    console.error('Error fetching pending deposits:', error);
    throw error;
  }
};

// Get deposit by ID
export const getDepositById = async (depositId) => {
  try {
    const resp = await api.get(`/deposits/${depositId}`);
    console.log(`Deposit ${depositId} response:`, resp.data);
    return resp.data;
  } catch (error) {
    console.error(`Error fetching deposit with ID ${depositId}:`, error);
    throw error;
  }
};

// Update deposit status - matches the pattern used in withdrawalService
export const updateDepositStatus = async (depositId, isPending) => {
  try {
    // Validate depositId
    if (!depositId) {
      throw new Error('Deposit ID is required');
    }
    
    console.log(`Updating deposit ${depositId} status to isPending=${isPending}`);
    
    const resp = await api.patch(`/deposits/${depositId}/status`, { isPending });
    return resp.data;
  } catch (error) {
    console.error(`Error updating deposit status for ID ${depositId}:`, error);
    throw error;
  }
};

// Add new deposit
export const addDeposit = async (depositData) => {
  try {
    const resp = await api.post('/deposits', depositData);
    return resp.data;
  } catch (error) {
    console.error('Error adding new deposit:', error);
    throw error;
  }
};

export default {
  getAllDeposits,
  getPendingDeposits,
  getDepositById,
  updateDepositStatus,
  addDeposit
};
