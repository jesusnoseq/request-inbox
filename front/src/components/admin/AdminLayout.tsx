import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, Divider } from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, Inbox as InboxIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        // { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
        // { text: 'Inboxes', icon: <InboxIcon />, path: '/admin/inboxes' },
        // { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' }
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                variant="permanent"
                sx={{
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        top: '64px', // Account for header height
                        height: 'calc(100vh - 64px)',
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        Admin Panel
                    </Typography>
                </Box>
                <Divider />
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => navigate(item.path)}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box
                component="main"
            >
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;
