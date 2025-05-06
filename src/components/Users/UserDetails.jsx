
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Nav, Tab, ListGroup, Badge } from 'react-bootstrap';
import userService from '../../services/userService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ConfirmationModal from '../common/ConfirmationModal';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState({
    today: [],
    yesterday: [],
    older: []
  });
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeKey, setActiveKey] = useState('overview');
  const [showResetModal, setShowResetModal] = useState(false);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user data
        // In a real implementation, you would call the actual endpoints
        
        // This endpoint might be needed in your backend
        const userResponse = await userService.getUserById(id);
        setUser(userResponse.data.user);
        
        // Fetch user transactions
        const transactionsResponse = await userService.getUserTransactions(id);
        setTransactions(transactionsResponse.data.transactions);
        
        // For demo purposes, set some dummy data if needed
        if (!user) {
          setUser({
            id: parseInt(id),
            name: 'John Doe',
            email: 'john@example.com',
            username: 'johndoe',
            nic_number: '1234567890',
            address: '123 Main St',
            country: 'Country',
            created_at: '2023-01-01T00:00:00Z'
          });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [id]);
  
  const handleResetPassword = () => {
    setShowResetModal(true);
  };
  
  const confirmResetPassword = async () => {
    try {
      // Call the reset password API
      // In a real implementation, you would call the actual endpoint
      await userService.resetUserPassword(id, 'tempPassword123');
      
      setShowResetModal(false);
      // Show success message or update UI
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Details</h2>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{user.name}</h5>
            <Button
              variant="warning"
              size="sm"
              onClick={handleResetPassword}
            >
              Reset Password
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
            <Row>
              <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="overview">Overview</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="transactions">Transactions</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="deposits">Deposits</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="withdrawals">Withdrawals</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="overview">
                    <h4>User Information</h4>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>ID:</strong> {user.id}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Name:</strong> {user.name}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Email:</strong> {user.email}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Username:</strong> {user.username}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>NIC Number:</strong> {user.nic_number}
                      </ListGroup.Item>
                      {user.address && (
                        <ListGroup.Item>
                          <strong>Address:</strong> {user.address}
                        </ListGroup.Item>
                      )}
                      {user.country && (
                        <ListGroup.Item>
                          <strong>Country:</strong> {user.country}
                        </ListGroup.Item>
                      )}
                      <ListGroup.Item>
                        <strong>Registration Date:</strong> {formatDate(user.created_at)}
                      </ListGroup.Item>
                    </ListGroup>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="transactions">
                    <h4>Transaction History</h4>
                    
                    {/* Display transactions by day */}
                    {transactions.today && transactions.today.length > 0 && (
                      <div className="mb-4">
                        <h5>Today</h5>
                        <ListGroup>
                          {transactions.today.map(tx => (
                            <ListGroup.Item
                              key={tx.transaction_id}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <div>{tx.description}</div>
                                <small className="text-muted">{tx.time}</small>
                              </div>
                              <span className={`text-${tx.type === 'income' ? 'success' : 'danger'}`}>
                                {tx.display_amount}
                              </span>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                    
                    {transactions.yesterday && transactions.yesterday.length > 0 && (
                      <div className="mb-4">
                        <h5>Yesterday</h5>
                        <ListGroup>
                          {transactions.yesterday.map(tx => (
                            <ListGroup.Item
                              key={tx.transaction_id}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <div>{tx.description}</div>
                                <small className="text-muted">{tx.time}</small>
                              </div>
                              <span className={`text-${tx.type === 'income' ? 'success' : 'danger'}`}>
                                {tx.display_amount}
                              </span>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                    
                    {transactions.older && transactions.older.length > 0 && (
                      <div>
                        <h5>Older</h5>
                        <ListGroup>
                          {transactions.older.map(tx => (
                            <ListGroup.Item
                              key={tx.transaction_id}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <div>{tx.description}</div>
                                <small className="text-muted">{formatDate(tx.created_at)}</small>
                              </div>
                              <span className={`text-${tx.type === 'income' ? 'success' : 'danger'}`}>
                                {tx.display_amount}
                              </span>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                    
                    {(!transactions.today || transactions.today.length === 0) && 
                     (!transactions.yesterday || transactions.yesterday.length === 0) && 
                     (!transactions.older || transactions.older.length === 0) && (
                      <p className="text-center text-muted my-4">No transactions found</p>
                    )}
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="deposits">
                    <h4>Deposits</h4>
                    {/* This would be populated from API data */}
                    <p className="text-center text-muted my-4">No deposits found</p>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="withdrawals">
                    <h4>Withdrawals</h4>
                    {/* This would be populated from API data */}
                    <p className="text-center text-muted my-4">No withdrawals found</p>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Card.Body>
      </Card>
      
      {/* Reset Password Confirmation Modal */}
      <ConfirmationModal
        show={showResetModal}
        onHide={() => setShowResetModal(false)}
        onConfirm={confirmResetPassword}
        title="Reset User Password"
        message={`Are you sure you want to reset the password for ${user.name}? The user will need to create a new password on their next login.`}
        confirmText="Reset Password"
      />
    </div>
  );
};

export default UserDetails;