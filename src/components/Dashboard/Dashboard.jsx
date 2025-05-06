import React, { useState, useEffect } from 'react';
import { depositService, withdrawalService, userService } from '../../services/api';
import walletService from '../../services/walletService';
import { Link } from 'react-router-dom';

import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalUsers: 0,
    adminWalletBalance: 0,
    totalCommission: 0,
    isLoading: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setError(null); // Reset error state
        // Fetch all data in parallel
        const [depositRes, withdrawalRes, userRes, walletRes, commissionRes] = await Promise.all([
          depositService.getPendingDeposits().catch(err => ({ error: err })),
          withdrawalService.getPendingWithdrawals().catch(err => ({ error: err })),
          // Check if getAllUsers exists, fallback to mock response if not
          typeof userService.getAllUsers === 'function'
            ? userService.getAllUsers().catch(err => ({ error: err }))
            : { error: new Error('userService.getAllUsers is not available') },
          walletService.getAdminWalletBalance().catch(err => ({ error: err })),
          walletService.getTecInvestment().catch(err => ({ error: err }))
        ]);

        let pendingDeposits = 0;
        if (depositRes.error) {
          console.error('Failed to fetch pending deposits:', depositRes.error);
        } else if (depositRes && depositRes.data) {
          if (Array.isArray(depositRes.data.pendingDeposits)) {
            pendingDeposits = depositRes.data.pendingDeposits.length;
          } else if (typeof depositRes.data.pendingDeposits === 'number') {
            pendingDeposits = depositRes.data.pendingDeposits;
          } else if (Array.isArray(depositRes.data)) {
            pendingDeposits = depositRes.data.filter(d => d.status === 'pending').length;
          } else if (depositRes.data.count !== undefined) {
            pendingDeposits = depositRes.data.count;
          }
        }

        let pendingWithdrawals = 0;
        if (withdrawalRes.error) {
          console.error('Failed to fetch pending withdrawals:', withdrawalRes.error);
        } else if (withdrawalRes && withdrawalRes.data) {
          if (Array.isArray(withdrawalRes.data.pendingWithdrawals)) {
            pendingWithdrawals = withdrawalRes.data.pendingWithdrawals.length;
          } else if (Array.isArray(withdrawalRes.data)) {
            pendingWithdrawals = withdrawalRes.data.filter(w => w.status === 'pending').length;
          } else if (withdrawalRes.data.count !== undefined) {
            pendingWithdrawals = withdrawalRes.data.count;
          }
        }

        let totalUsers = 0;
        if (userRes.error) {
          console.error('Failed to fetch users:', userRes.error);
        } else if (userRes && userRes.data) {
          if (Array.isArray(userRes.data)) {
            totalUsers = userRes.data.length;
          } else if (userRes.data.users && Array.isArray(userRes.data.users)) {
            totalUsers = userRes.data.users.length;
          }
        }

        let adminWalletBalance = 0;
        if (walletRes.error) {
          console.error('Failed to fetch admin wallet balance:', walletRes.error);
        } else if (walletRes && walletRes.data) {
          if (typeof walletRes.data.balance === 'number') {
            adminWalletBalance = walletRes.data.balance;
          } else if (typeof walletRes.data === 'number') {
            adminWalletBalance = walletRes.data;
          } else if (walletRes.data.adminWallet && typeof walletRes.data.adminWallet.balance === 'number') {
            adminWalletBalance = walletRes.data.adminWallet.balance;
          }
        }

        let totalCommission = 0;
        if (commissionRes.error) {
          console.error('Failed to fetch commission:', commissionRes.error);
        } else if (commissionRes && commissionRes.data) {
          totalCommission = parseFloat(commissionRes.data.total) || 0;
        }

        setStats({
          pendingDeposits,
          pendingWithdrawals,
          totalUsers,
          adminWalletBalance,
          totalCommission,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard data. Please check your network connection or server status.');
        setStats(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };

    fetchDashboardStats();
  }, []);

  // Helper function to format currency values
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'LKR 0.00';
    
    return `LKR ${parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Helper function to determine value length class
  const getValueLengthClass = (value) => {
    if (value === null || value === undefined) return '';
    
    const strValue = String(value);
    if (strValue.length > 12) return 'very-long-value';
    if (strValue.length > 8) return 'long-value';
    return '';
  };

  // Helper function to determine if a card needs to be expanded
  const needsExpansion = (value) => {
    if (value === null || value === undefined) return false;
    return String(value).length > 8;
  };

  return (
    <div className="dash-container">
      <style>
      {`
        /* Base container */
        .dash-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Cards grid layout */
        .dash-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          width: 100%;
        }

        /* Remove text decoration from links */
        .dash-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          width: 100%;
        }

        /* Card base styling */
        .dash-card {
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 25px;
          position: relative;
          height: 150px;
          transition: all 0.3s ease-in-out;
          overflow: hidden;
          width: 100%;
        }

        /* Expanded card styling */
        .dash-card.expanded {
          height: auto;
          min-height: 150px;
        }

        /* Card hover effect */
        .dash-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        /* Color variants for left borders */
        .dash-card.primary {
          border-left: 6px solid #1976d2;
        }

        .dash-card.warning {
          border-left: 6px solid #ff9800;
        }

        .dash-card.success {
          border-left: 6px solid #4caf50;
        }

        .dash-card.info {
          border-left: 6px solid #2196f3;
        }

        /* Card content container */
        .dash-card-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          width: 100%;
        }

        /* Card text container */
        .dash-card-text {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          width: 100%;
        }

        /* Card title styling */
        .dash-card-title {
          font-size: 18px;
          font-weight: 600;
          color: #6c757d;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }

        /* Card value styling with auto-resize */
        .dash-card-value {
          font-weight: 700;
          line-height: 1.2;
          overflow: visible;
          word-break: break-word;
          z-index: 5;
          font-size: 28px;
          transition: font-size 0.3s ease;
        }

        /* Responsive font sizing for longer numbers */
        .dash-card-value.long-value {
          font-size: 24px;
        }

        .dash-card-value.very-long-value {
          font-size: 20px;
        }

        /* Loading spinner */
        .value-progress {
          margin: 0 auto;
        }

        /* Text color classes */
        .primary-text {
          color: #1976d2;
        }

        .warning-text {
          color: #ff9800;
        }

        .success-text {
          color: #4caf50;
        }

        .info-text {
          color: #2196f3;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .dash-cards {
            grid-template-columns: 1fr;
          }
          
          .dash-card {
            width: 100%;
          }
        }
      `}
      </style>
      
      {error && (
        <Alert severity="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}
      
      <div className="dash-cards">
        <Link to="/deposits/pending" className="dash-card-link">
          <div className={`dash-card primary ${needsExpansion(stats.pendingDeposits) ? 'expanded' : ''}`}>
            <div className="dash-card-content">
              <div className="dash-card-text">
                <div className="dash-card-title">Pending Deposits</div>
                <div className={`dash-card-value primary-text ${getValueLengthClass(stats.pendingDeposits)}`}>
                  {stats.isLoading 
                    ? <CircularProgress size={24} className="value-progress" /> 
                    : `${stats.pendingDeposits}`
                  }
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/withdrawals/pending" className="dash-card-link">
          <div className={`dash-card warning ${needsExpansion(stats.pendingWithdrawals) ? 'expanded' : ''}`}>
            <div className="dash-card-content">
              <div className="dash-card-text">
                <div className="dash-card-title">Pending Withdrawals</div>
                <div className={`dash-card-value warning-text ${getValueLengthClass(stats.pendingWithdrawals)}`}>
                  {stats.isLoading 
                    ? <CircularProgress size={24} className="value-progress" /> 
                    : `${stats.pendingWithdrawals}`
                  }
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/users" className="dash-card-link">
          <div className={`dash-card success ${needsExpansion(stats.totalUsers) ? 'expanded' : ''}`}>
            <div className="dash-card-content">
              <div className="dash-card-text">
                <div className="dash-card-title">Total Users</div>
                <div className={`dash-card-value success-text ${getValueLengthClass(stats.totalUsers)}`}>
                  {stats.isLoading 
                    ? <CircularProgress size={24} className="value-progress" /> 
                    : `${stats.totalUsers}`
                  }
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/wallet" className="dash-card-link">
          <div className={`dash-card info ${needsExpansion(stats.adminWalletBalance + stats.totalCommission) ? 'expanded' : ''}`}>
            <div className="dash-card-content">
              <div className="dash-card-text">
                <div className="dash-card-title">Admin Wallet</div>
                <div className={`dash-card-value info-text ${getValueLengthClass(stats.adminWalletBalance + stats.totalCommission)}`}>
                  {stats.isLoading 
                    ? <CircularProgress size={24} className="value-progress" /> 
                    : formatCurrency(stats.adminWalletBalance + stats.totalCommission)
                  }
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;