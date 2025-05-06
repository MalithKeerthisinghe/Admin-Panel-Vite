import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import walletService from '../../services/walletService';
import Layout from '../Layouts/Layout';
import './Wallet.css';

const Wallet = () => {
  const [stats, setStats] = useState({
    totalInvestment: 0,
    totalInvestment1: 0,
    totalCoin: 0,
    totalCommission: 0,
    totalWithdrawal: 0,
    pendingWithdrawalAmount: 0,
    serviceCharge: 0,
    userCount: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchWalletStats = async () => {
      try {
        // Fetch total investment
        const investmentSummaryRes = await walletService.getInvestmentSummary();
        let totalInvestment = 0;
        if (investmentSummaryRes && investmentSummaryRes.data && 
          investmentSummaryRes.data.investments && 
          investmentSummaryRes.data.investments.total) {
          totalInvestment = parseFloat(investmentSummaryRes.data.investments.total.amount) || 0;
        }

        // Fetch TEC investment
        const commissionRes = await walletService.getTecInvestment();
        let totalInvestment1 = 0;
        let totalCoin = 0;
        let totalCommission = 0;
        let withdrawal_total = 0;
        
        // Process the TEC investment data correctly
        if (commissionRes && commissionRes.data) {
          // Extract total commission
          totalCommission = parseFloat(commissionRes.data.total) || 0;
          withdrawal_total = parseFloat(commissionRes.data.withdrawal_total) || 0;
          
          // Extract investment amount
          const investmentEntry = commissionRes.data.byType.find(
            item => item.transaction_type === "investment"
          );
          if (investmentEntry) {
            totalInvestment1 = parseFloat(investmentEntry.total) || 0;
          }
          
          // Extract buy_coin amount
          const buyCoinEntry = commissionRes.data.byType.find(
            item => item.transaction_type === "buy_coin"
          );
          if (buyCoinEntry) {
            totalCoin = parseFloat(buyCoinEntry.total) || 0;
          }
        }

        // Fetch total withdrawal
        const withdrawalRes = await walletService.getTotalWithdrawal();
        let totalWithdrawal = 0;
        if (withdrawalRes && withdrawalRes.data) {
          if (typeof withdrawalRes.data.totalWithdrawal === 'number') {
            totalWithdrawal = withdrawalRes.data.totalWithdrawal;
          } else if (typeof withdrawalRes.data === 'number') {
            totalWithdrawal = withdrawalRes.data;
          }
        }

        // Fetch pending withdrawal amount
        const pendingWithdrawalRes = await walletService.getPendingWithdrawalAmount();
        let pendingWithdrawalAmount = 0;
        if (pendingWithdrawalRes && pendingWithdrawalRes.data) {
          const rawAmount = pendingWithdrawalRes.data.totalPendingAmount;
          // Handle both number and string responses
          pendingWithdrawalAmount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount);
          pendingWithdrawalAmount = isNaN(pendingWithdrawalAmount) ? 0 : pendingWithdrawalAmount;
        }

        // Fetch service charge from API
        const serviceChargeRes = await walletService.getServiceChargeTotal();
        let serviceCharge = 0;
        if (serviceChargeRes && serviceChargeRes.data) {
          if (typeof serviceChargeRes.data.serviceCharge === 'number') {
            serviceCharge = serviceChargeRes.data.serviceCharge;
          } else if (typeof serviceChargeRes.data === 'number') {
            serviceCharge = serviceChargeRes.data;
          }
        }

        // Fetch user count
        const userRes = await walletService.getUserCount();
        let userCount = 0;
        if (userRes && userRes.data) {
          if (typeof userRes.data.count === 'number') {
            userCount = userRes.data.count;
          } else if (typeof userRes.data === 'number') {
            userCount = userRes.data;
          }
        }
        
        // Update the stats state with all fetched data
        setStats({
          totalInvestment,
          totalInvestment1,
          totalCoin,
          totalCommission,
          totalWithdrawal,
          withdrawal_total,
          pendingWithdrawalAmount,
          serviceCharge,
          userCount,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching wallet stats:', error);
        setStats(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };

    fetchWalletStats();
  }, []);
  
  // Function to handle card expansion
  const handleCardExpansion = () => {
    // Get all card value elements
    const cardValues = document.querySelectorAll('.dash-card-value');
    
    // Check each card value
    cardValues.forEach(valueEl => {
      // Get the parent card
      const card = valueEl.closest('.dash-card');
      
      // Get the text content (will include the formatted currency)
      const text = valueEl.textContent || '';
      
      // If the text is longer than a threshold or contains very large numbers
      if (text.length > 20) {
        // Add expanded class to allow the card to grow
        card?.classList.add('expanded');
        
        // Allow the value to wrap to multiple lines if needed
        valueEl.style.whiteSpace = 'normal';
        
        // If it's extremely long, make sure it's marked for special styling
        if (text.length > 30) {
          valueEl.classList.add('very-long-value');
        }
      } else {
        // Remove expanded class if it's a shorter value
        card?.classList.remove('expanded');
        valueEl.style.whiteSpace = 'nowrap';
      }
    });
  };
  
  // Run card expansion when stats change
  useEffect(() => {
    // After stats load and component updates
    if (!stats.isLoading) {
      // Give the DOM time to update with new values
      setTimeout(handleCardExpansion, 100);
    }
  }, [stats]);
  
  // Handle window resize
  useEffect(() => {
    // Handle resize to adjust cards
    window.addEventListener('resize', handleCardExpansion);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleCardExpansion);
    };
  }, []);

  // Helper function to determine value length class
  const getValueLengthClass = (value) => {
    if (value === undefined || value === null) return '';
    
    // Convert to string and check if it includes decimal part
    const valueStr = value.toString();
    
    if (valueStr.length > 12) {
      return 'very-long-value';
    } else if (valueStr.length > 8) {
      return 'long-value';
    }
    
    return '';
  };

  // Helper function to format currency values
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'LKR 0.00';
    
    // Format with commas for thousands and fixed 2 decimal places
    return `LKR ${parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Create a card component to ensure consistent structure
  const StatCard = ({ title, value, colorClass, valueClass, link }) => (
    <Link to={link} className="dash-card-link">
      <div className={`dash-card ${colorClass}`}>
        <div className="dash-card-content">
          <div className="dash-text-container">
            <div className="dash-card-title">{title}</div>
            <div className={`dash-card-value ${valueClass} ${getValueLengthClass(value)}`}>
              {stats.isLoading ? '...' : value}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  // This is the content of the page that will be rendered inside the layout
  const walletContent = (
    <div className="dash-container">
      <div className="dash-cards wallet-cards">
        <StatCard 
          title="Investment Commision"
          value={formatCurrency(stats.totalInvestment1)}
          colorClass="primary"
          valueClass="primary-text"
          link="/admin/investment"
        />
        
        <StatCard 
          title="TEC Commision"
          value={formatCurrency(stats.totalCoin)}
          colorClass="success"
          valueClass="success-text"
          link="/admin/tec-investment"
        />
        
        <StatCard 
          title="Withdrawal Commission"
          value={formatCurrency(stats.withdrawal_total)}
          colorClass="info"
          valueClass="info-text"
          link="/admin/withdrawals"
        />
        
        <StatCard 
          title="Pending Withdrawal Amount"
          value={formatCurrency(stats.pendingWithdrawalAmount)}
          colorClass="warning"
          valueClass="warning-text"
          link="/admin/pending-withdrawals"
        />
        
        <StatCard 
          title="10% Total Service Charge"
          value={formatCurrency(stats.totalCommission)}
          colorClass="secondary"
          valueClass="secondary-text"
          link="/admin/service-charges"
        />
        
        <StatCard 
          title="User Count"
          value={stats.userCount.toLocaleString()}
          colorClass="tertiary"
          valueClass="tertiary-text"
          link="/admin/users"
        />
        <StatCard 
          title="Total Invested Amount"
          value={stats.userCount.toLocaleString()}
          colorClass="default"
          valueClass="default-text"
          link="/admin/users"
        />
        <StatCard 
          title="Total Coin Amount"
          value={stats.userCount.toLocaleString()}
          colorClass="light"
          valueClass="color-text1"
          link="/admin/users"
        />
        <StatCard 
          title="Total Amount"
          value={stats.userCount.toLocaleString()}
          colorClass="dark"
          valueClass="color-text2"
          link="/admin/users"
        />
      </div>
    </div>
  );
  
  // Wrap the content with the layout component that includes the drawer
  return <Layout>{walletContent}</Layout>;
};

export default Wallet;