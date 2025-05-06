import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';


import RequestQualityIcon from '@mui/icons-material/RequestQuote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const fullDrawerWidth = 180;
const collapsedDrawerWidth = 72;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const toggleCollapse = () => setCollapsed(!collapsed);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Users', icon: <PersonIcon />, path: '/users' },
    { text: 'Deposits', icon: <AccountBalanceWalletIcon />, path: '/deposits/pending' },
    { text: 'Withdrawals', icon: <PaymentsIcon />, path: '/withdrawals/pending' },
    { text: 'KYC', icon: <RequestQualityIcon />, path: '/Kyc' },
    { text: 'Admin Wallet', icon: <AccountBalanceWalletIcon />, path: '/admin/wallet' },
    { text: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/admin' }
  ];

  // Sort by descending path length for specificity
  const currentMenuItem = [...menuItems]
    .sort((a, b) => b.path.length - a.path.length)
    .find(item =>
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/')
    );

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'space-between', px: 1 }}>
        {collapsed ? (
          <Tooltip title="Expand">
            <IconButton onClick={toggleCollapse}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Typography variant="h6" noWrap>
              Options
            </Typography>
            <Tooltip title="Collapse">
              <IconButton onClick={toggleCollapse}>
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 2,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: {
            sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : fullDrawerWidth}px)`,
          },
          ml: { sm: `${collapsed ? collapsedDrawerWidth : fullDrawerWidth}px` },
          transition: 'width 0.3s ease',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {currentMenuItem?.text || 'Admin Panel'}
          </Typography>

          

          

          
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: collapsed ? collapsedDrawerWidth : fullDrawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: fullDrawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? collapsedDrawerWidth : fullDrawerWidth,
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : fullDrawerWidth}px)` },
          transition: 'width 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
