
import api from '../utils/api';

// Get all withdrawals
export const getAllWithdrawals = async () => {
    try {
        const resp = await api.get('/withdrawals');
        return resp.data;
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        throw error;
    }
};

// Get pending withdrawals
export const getPendingWithdrawals = async () => {
    try {
        const resp = await api.get('/withdrawals/pending');
        return resp.data;
    } catch (error) {
        console.error('Error fetching pending withdrawals:', error);
        throw error;
    }
};

// Get user withdrawals
export const getUserWithdrawals = async (userId) => {
    try {
        const resp = await api.get(`/users/${userId}/withdrawals`);
        return resp.data;
    } catch (error) {
        console.error(`Error fetching withdrawals for user ${userId}:`, error);
        throw error;
    }
};

// Get withdrawal by ID
export const getWithdrawalById = async (id) => {
    try {
        const resp = await api.get(`/withdrawals/${id}`);
        return resp.data;
    } catch (error) {
        console.error(`Error fetching withdrawal with ID ${id}:`, error);
        throw error;
    }
};

// Update withdrawal status
export const updateWithdrawalStatus = async (withdrawalId, isPending) => {
    try {
        const resp = await api.patch(`/withdrawals/${withdrawalId}/status`, { isPending });
        return resp.data;
    } catch (error) {
        console.error(`Error updating withdrawal status for ID ${withdrawalId}:`, error);
        throw error;
    }
};

// Add new withdrawal
export const addWithdrawal = async (withdrawalData) => {
    try {
        const resp = await api.post('/withdrawals', withdrawalData);
        return resp.data;
    } catch (error) {
        console.error('Error adding new withdrawal:', error);
        throw error;
    }
};

// Delete withdrawal
export const deleteWithdrawal = async (withdrawalId) => {
    try {
        const resp = await api.delete(`/withdrawals/${withdrawalId}`);
        return resp.data;
    } catch (error) {
        console.error(`Error deleting withdrawal with ID ${withdrawalId}:`, error);
        throw error;
    }
};

const withdrawalService = {
    getAllWithdrawals,
    getPendingWithdrawals,
    getUserWithdrawals,
    getWithdrawalById,
    updateWithdrawalStatus,
    addWithdrawal,
    deleteWithdrawal
};

export default withdrawalService;
