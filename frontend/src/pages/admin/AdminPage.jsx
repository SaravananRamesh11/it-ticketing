import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeRegistrationForm from './addusers'; 
import SupportMemberPieChart from './pie';
import  RemoveUserForm  from './remove';
import Detail from "./details"
import ClosedTickets from "./ClosedTickets" // Import the new component for closed tickets management
import useAuth from '../../hooks/login_context_hook';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  ListItemButton,
  Container,
  Paper,
  Grid,
  Button,
  Avatar
} from '@mui/material';

import {
  Menu as MenuIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  PieChart as PieChartIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Details as BadgeIcon,
  Visibility as VisibilityIcon,
  InsertDriveFile as FileIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: 0,
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AdminPage = () => {
  const [open, setOpen] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('createUser');
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const menuItems = [
    { id: 'createUser', text: 'Create User', icon: <PersonAddIcon /> },
    { id: 'deleteEmployee', text: 'Delete Employee', icon: <PersonRemoveIcon /> },
    { id: 'pieChart', text: 'IT Support Statistics', icon: <PieChartIcon /> },
    { id: 'closedTickets', text: 'Closed Tickets', icon: <FileIcon /> },
    // { id: 'AdminDetails', text: 'User Details', icon: <PersonIcon /> }
    { id: 'UserDetails', text: 'User Details', icon: <BadgeIcon /> }
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'createUser':
        return <EmployeeRegistrationForm />;
      case 'deleteEmployee':
        return <RemoveUserForm/>;
      case 'pieChart':
        return <SupportMemberPieChart />;
      case 'UserDetails':
        return <Detail/>;
      case 'closedTickets':
        return <ClosedTickets />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold',  }}>
            Admin Dashboard
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              '&:hover': {
                backgroundColor: '#e83b3bff',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#f7f9fc',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            zIndex: 0
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar />
        {/* Branded header inside drawer */}
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 36, height: 36, fontWeight: 700 }}>V</Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>VISTA</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Admin</Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={selectedMenu === item.id}
                  onClick={() => setSelectedMenu(item.id)}
                  sx={{
                    py: 1.25,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(37,117,252,0.08)'
                    },
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.03)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: selectedMenu === item.id ? 'primary.main' : 'transparent',
                      color: selectedMenu === item.id ? '#fff' : 'inherit'
                    }}>
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        <Divider />
        {/* <Box sx={{ px: 2, py: 2, mt: 'auto' }}>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            fullWidth
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box> */}
      </Drawer>
      <Main open={open}>
        <Toolbar />
        {renderContent()}
      </Main>
    </Box>
  );
};

export default AdminPage;