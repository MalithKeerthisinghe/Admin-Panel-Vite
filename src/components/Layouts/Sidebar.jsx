
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <div className="bg-light sidebar" style={{ minHeight: 'calc(100vh - 56px)', width: '100%' }}>
      <Nav className="flex-column pt-3">
        <Nav.Link as={Link} to="/dashboard" active={location.pathname === '/dashboard'}>
          Dashboard
        </Nav.Link>
        <Nav.Link as={Link} to="/deposits/pending" active={location.pathname.includes('/deposits')}>
          Pending Deposits
        </Nav.Link>
        <Nav.Link as={Link} to="/withdrawals/pending" active={location.pathname.includes('/withdrawals')}>
          Pending Withdrawals
        </Nav.Link>
        <Nav.Link as={Link} to="/users" active={location.pathname.includes('/users')}>
          User Management
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;