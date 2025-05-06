// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://151.106.125.212:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Deposit Service
export const depositService = {
  getAllDeposits: async () => {
    return await api.get('/deposits');
  },
  
  getPendingDeposits: async () => {
    return await api.get('/deposits/pending');
  },
  
  getUserDeposits: async (userId) => {
    return await api.get(`/users/${userId}/deposits`);
  },
  
  updateDepositStatus: async (depositId, isPending) => {
    return await api.patch(`/deposits/${depositId}/status`, { isPending });
  },
  
  createDeposit: async (depositData, image) => {
    const formData = new FormData();
    formData.append('userId', depositData.userId);
    formData.append('amount', depositData.amount);
    if (image) {
      formData.append('image', image);
    }
    
    return await api.post('/deposits', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Withdrawal Service
export const withdrawalService = {
  getAllWithdrawals: async () => {
    return await api.get('/withdrawals');
  },
  
  getPendingWithdrawals: async () => {
    return await api.get('/withdrawals/pending');
  },
  
  getUserWithdrawals: async (userId) => {
    return await api.get(`/users/${userId}/withdrawals`);
  },
  
  updateWithdrawalStatus: async (withdrawalId, isPending) => {
    return await api.patch(`/withdrawals/${withdrawalId}/status`, { isPending });
  },
  
  createWithdrawal: async (withdrawalData) => {
    return await api.post('/withdrawals', withdrawalData);
  },
  
  deleteWithdrawal: async (withdrawalId) => {
    return await api.delete(`/withdrawals/${withdrawalId}`);
  }
};

// User Service
export const userService = {
  setUserPin: async (userId, pin) => {
    return await api.patch(`/users/${userId}/pin`, { pin });
  },
  
  updatePassword: async (userId, currentPassword, newPassword) => {
    return await api.patch(`/users/${userId}/password`, { currentPassword, newPassword });
  },
  
  resetPassword: async (userId, newPassword) => {
    return await api.patch(`/users/${userId}/reset-password`, { newPassword });
  },
  
  getUserTransactions: async (userId) => {
    return await api.get(`/users/${userId}/transactions`);
  },
  
  register: async (userData) => {
    return await api.post('/users/register', userData);
  }
};

export default {
  depositService,
  withdrawalService,
  userService
};
