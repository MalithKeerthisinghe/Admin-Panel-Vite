import API from '../utils/api';

const walletService = {
  // Get investment summary including active, completed, and total investments
  getInvestmentSummary: () => {
    return API.get('/admin/investments/summary').catch(error => {
      console.error('Investment summary endpoint failed:', error);
      // Return a default structure matching the exact API response structure
      return { 
        data: { 
          investments: {
            active: { count: 0, total: 0 },
            completed: { count: 0, total: 0 },
            total: { count: 0, amount: 0 }
          },
          profits: {
            generated: { total: 0, days: 0 },
            claimed: { total: 0, days: 0 },
            unclaimed: { total: 0, days: 0 }
          }
      }
      };
    });
  },
  
  // Get TEC specific investment amount
  getTecInvestment: () => {
    console.log('Starting TEC investment fetch');
    return API.get('/admin/commissions/summary')
      .then(response => {
        console.log('TEC investment fetch successful:', response);
        return response;
      })
      .catch(error => {
        console.error('TEC investment endpoint failed:', error.message, error.response?.statuserror);
        return { data: { totalCommission: 0 } };
      });
  },
  
  // Get total withdrawal amount processed
  getTotalWithdrawal: () => {
    return API.get('/withdrawals').catch(error => {
      console.error('Total withdrawal endpoint failed:', error);
      return { data: 0 };
    }).then(response => {
      // Handle the response from the existing endpoint that returns { withdrawals: [...] }
      if (response.data && response.data.withdrawals && Array.isArray(response.data.withdrawals)) {
        // Calculate the total from the withdrawals array
        const total = response.data.withdrawals.reduce((sum, withdrawal) => {
          return sum + (parseFloat(withdrawal.amount) || 0);
        }, 0);
        return { data: total };
      }
      return { data: 0 };
    });
  },
  
  // Get total amount in pending withdrawals
  getPendingWithdrawalAmount: () => {
    return API.get('/withdrawals/pending/total').catch(error => {
      console.error('Pending withdrawal endpoint failed:', error);
      return { data: { totalPendingAmount: 0 } };
    });
  },
  
  // Get admin wallet balance
  getAdminWalletBalance: () => {
    return API.get('/wallet/admin-balance').catch(error => {
      console.error('Admin balance endpoint failed:', error);
      return { data: 0 };
    });
  },
  
  // Get service charge total from the API endpoint
  getServiceChargeTotal: () => {
    return API.get('/wallet/service-charge-total').catch(error => {
      console.error('Service charge endpoint failed:', error);
      return { data: 0 };
    });
  },
  
  // Get user count specifically for wallet page
  getUserCount: () => {
    return API.get('/users').catch(error => {
      console.error('User count endpoint failed:', error);
      return { data: { users: [] } };
    }).then(response => {
      // Transform the response to match the expected format
      if (response.data && response.data.users) {
        return {
          data: {
            count: response.data.users.length
          }
        };
      }
      return { data: { count: 0 } };
    });

    
  }
  

  
};

export default walletService;