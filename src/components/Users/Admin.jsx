import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { FiTrendingUp, FiActivity, FiClock, FiCreditCard, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AdminBankDetails from './AdminBankDetails';

// Add this to the very top of the file, above all other styled components
import { createGlobalStyle } from 'styled-components';
// Global style to ensure inputs show text properly without affecting sidebar
const GlobalStyle = createGlobalStyle`
  /* Only target specific components within our Admin component */
  .admin-dashboard-container input, 
  .admin-dashboard-container select, 
  .admin-dashboard-container textarea {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #2d3748;
    font-size: 1rem;
  }
  
  .admin-dashboard-container input[type="number"] {
    color: #2d3748;
  }
  
  /* Fix number input appearance in different browsers */
  .admin-dashboard-container input[type="number"]::-webkit-outer-spin-button,
  .admin-dashboard-container input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  .admin-dashboard-container input[type="number"] {
    -moz-appearance: textfield;
  }
`;

// Styled components
const FullPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
  margin: 0;
  padding: 0;
`;

// Modified Container to completely fill the available width
const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2d3748;
`;

const Section = styled(motion.div)`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  margin: 0;
  overflow: hidden;
  border: 1px solid #edf2f7;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Subtitle = styled.h3`
  color: #4a5568;
  margin-bottom: 1rem;
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
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2d3748;
  transition: all 0.2s ease;
  background-color: #f8fafc;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
    background-color: white;
    color: #1a202c;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 2.3rem;
  color: #a0aec0;
  transform: translateY(-50%);
  z-index: 1;
`;

const Button = styled(motion.button)`
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 1rem;
  margin-bottom: 1rem;
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

const SecondaryButton = styled(Button)`
  background-color: #e2e8f0;
  color: #4a5568;

  &:hover {
    background-color: #cbd5e0;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 1.5rem;
  width: 100%;
`;

const ListItem = styled(motion.li)`
  background: #f8fafc;
  padding: 1rem 1.5rem;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #4299e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const ListItemDate = styled.span`
  color: #718096;
  font-size: 0.8125rem;
`;

const ListItemValue = styled.span`
  font-weight: 600;
  color: #2d3748;
`;

const CurrentValueCard = styled.div`
  background: #f8fafc;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
`;

const CurrentValueText = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
  margin: 0.5rem 0;
  width: 100%;
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
    to {
      transform: rotate(360deg);
    }
  }
`;

// Modified TabContainer to better utilize width
const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: auto;
  background: #f0f4f8;
  border-radius: 6px 6px 0 0;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 4px;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.25rem;
  border: none;
  background: ${(props) => (props.$active ? 'white' : 'transparent')};
  color: ${(props) => (props.$active ? '#3182ce' : '#718096')};
  font-weight: ${(props) => (props.$active ? '600' : '500')};
  font-size: 0.95rem;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  border-radius: 6px 6px 0 0;
  margin-top: 4px;
  margin-left: 4px;

  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${(props) => (props.$active ? '#3182ce' : 'transparent')};
    transition: all 0.2s ease;
  }

  &:focus {
    outline: none;
  }
`;

const TabIcon = styled.span`
  margin-right: 0.5rem;
`;

const HistorySection = styled(motion.div)`
  margin-top: 2rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
  width: 100%;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: #718096;
`;

// Create a flex layout that fills the entire page width
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  flex: 1;
`;

// Button container for better responsiveness
const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

// Main content area that fills the available space
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

// === Component ===
// Main component that spans the full width of the page
const Admin = () => {
  const [activeTab, setActiveTab] = useState('coinValue');
  const [coinValueData, setCoinValueData] = useState({ value: '' });
  const [currentCoinValue, setCurrentCoinValue] = useState(null);
  const [coinHistory, setCoinHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState({
    currentValue: false,
    coinValue: false,
    coinHistory: false,
  });

  const BASE_URL = 'http://151.106.125.212:5021';
  const adminId = 2;

  useEffect(() => {
    fetchCurrentCoinValue();
  }, []);

  const fetchCurrentCoinValue = async () => {
    setLoading((prev) => ({ ...prev, currentValue: true }));
    try {
      const res = await axios.get(`${BASE_URL}/api/coin-values/current`);
      setCurrentCoinValue(res.data.coinValue);
      toast.info(`Current coin value: LKR ${parseFloat(res.data.coinValue.lkrValue).toFixed(2)}`);
    } catch (err) {
      setCurrentCoinValue(null);
      toast.error(err.response?.data?.message || 'Error fetching current coin value');
    } finally {
      setLoading((prev) => ({ ...prev, currentValue: false }));
    }
  };

  const handleSetCoinValue = async () => {
    const value = parseFloat(coinValueData.value);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid positive value');
      return;
    }

    setLoading((prev) => ({ ...prev, coinValue: true }));
    try {
      const response = await axios.post(`${BASE_URL}/api/coin-values`, {
        lkrValue: value,
        adminId,
      });
      toast.success(response.data.message || 'Coin value updated successfully!');
      setCoinValueData({ value: '' });
      fetchCurrentCoinValue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error setting coin value');
    } finally {
      setLoading((prev) => ({ ...prev, coinValue: false }));
    }
  };

  const handleViewHistory = async () => {
    if (coinHistory.length === 0 || !showHistory) {
      await fetchCoinHistory();
    }
    setShowHistory(!showHistory);
  };

  const fetchCoinHistory = async () => {
    setLoading((prev) => ({ ...prev, coinHistory: true }));
    try {
      const res = await axios.get(`${BASE_URL}/api/coin-values/history`);
      setCoinHistory(res.data.coinValues || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching coin history');
      setCoinHistory([]);
    } finally {
      setLoading((prev) => ({ ...prev, coinHistory: false }));
    }
  };

  return (
    <FullPageWrapper className="admin-dashboard-container">
      <GlobalStyle />
      <Container>
        <ContentWrapper>
          <ToastContainer position="top-right" autoClose={3000} limit={3} style={{width: '100%'}} />

          <TabContainer>
            <Tab $active={activeTab === 'coinValue'} onClick={() => setActiveTab('coinValue')}>
              <TabIcon><FiTrendingUp /></TabIcon>
              Coin Values
            </Tab>
            <Tab $active={activeTab === 'bankDetails'} onClick={() => setActiveTab('bankDetails')}>
              <TabIcon><FiCreditCard /></TabIcon>
              Bank Details
            </Tab>
          </TabContainer>

          <MainContent>
            <AnimatePresence mode="wait">
              {activeTab === 'coinValue' && (
                <Section
                  key="coinValue"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Subtitle><FiTrendingUp /> Coin Value Management</Subtitle>

                  <CurrentValueCard>
                    {loading.currentValue ? (
                      <CurrentValueText>Loading current value...</CurrentValueText>
                    ) : currentCoinValue ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <CurrentValueText>
                          Value: LKR {parseFloat(currentCoinValue.lkrValue).toFixed(2)}
                        </CurrentValueText>
                        <CurrentValueText>
                          Updated: {new Date(currentCoinValue.updatedAt).toLocaleString()}
                        </CurrentValueText>
                        <CurrentValueText>
                          By: {currentCoinValue.updatedByName}
                        </CurrentValueText>
                      </motion.div>
                    ) : (
                      <CurrentValueText>No value available</CurrentValueText>
                    )}
                  </CurrentValueCard>

                  <InputGroup>
                    <InputLabel>New Value (LKR)</InputLabel>
                    <InputIcon><FiTrendingUp /></InputIcon>
                    <Input
                      placeholder="Enter new value"
                      type="number"
                      step="0.01"
                      value={coinValueData.value}
                      onChange={(e) => setCoinValueData({ value: e.target.value })}
                    />
                  </InputGroup>

                  <ButtonContainer>
                    <Button
                      onClick={handleSetCoinValue}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!coinValueData.value || loading.coinValue}
                    >
                      {loading.coinValue ? <><LoadingSpinner /> Updating...</> : 'Set Coin Value'}
                    </Button>

                    <SecondaryButton
                      onClick={handleViewHistory}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading.coinHistory}
                    >
                      {loading.coinHistory ? (
                        <><LoadingSpinner /> Fetching...</>
                      ) : (
                        <>
                          {showHistory ? <FiChevronUp /> : <FiChevronDown />}
                          {showHistory ? 'Hide History' : 'View History'}
                        </>
                      )}
                    </SecondaryButton>
                  </ButtonContainer>

                  <AnimatePresence>
                    {showHistory && (
                      <HistorySection
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Subtitle><FiClock /> Value History</Subtitle>
                        {coinHistory.length > 0 ? (
                          <List>
                            <AnimatePresence>
                              {coinHistory.map((item, i) => (
                                <ListItem
                                  key={item.id || i}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1, duration: 0.3 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <ListItemDate>{new Date(item.updatedAt).toLocaleString()}</ListItemDate>
                                  <div>
                                    <ListItemValue>LKR {parseFloat(item.lkrValue).toFixed(2)}</ListItemValue>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: '0.5rem' }}>
                                      By: {item.updatedByName}
                                    </span>
                                  </div>
                                </ListItem>
                              ))}
                            </AnimatePresence>
                          </List>
                        ) : (
                          <EmptyState>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5 }}
                            >
                              No history records available
                            </motion.p>
                          </EmptyState>
                        )}
                      </HistorySection>
                    )}
                  </AnimatePresence>
                </Section>
              )}
              {activeTab === 'bankDetails' && (
                <motion.div
                  key="bankDetails"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <AdminBankDetails />
                </motion.div>
              )}
            </AnimatePresence>
          </MainContent>
        </ContentWrapper>
      </Container>
    </FullPageWrapper>
  );
};

export default Admin;