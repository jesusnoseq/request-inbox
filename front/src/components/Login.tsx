import React from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { User } from '../types/inbox';
import Divider from '@mui/material/Divider';

interface LoginProps {
    user: User;
    onLogout: () => void;
}


const Login: React.FC<LoginProps> = ({ user, onLogout }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const navigate = useNavigate();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleGoToProfile = () => {
        navigate("/profile");
    };


    const handleLogout = () => {
        handleMenuClose();
        onLogout();
    };

    return (
        <>
            <IconButton onClick={handleMenuOpen} color="inherit">
                <Avatar
                    alt={user.Name}
                    src={user.AvatarURL}
                    sx={{
                        border: '2px solid #0005', // Replace with your desired color
                    }}
                />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{
                    paper: {
                        sx: {
                            width: 'auto',
                            maxWidth: '300px',
                        },
                    },
                }}
            >
                <Typography variant="body1" component="div" sx={{ padding: '8px 16px' }}>
                    Logged in as {user.Name}
                </Typography>
                <Divider />
                <MenuItem onClick={handleGoToProfile}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu >
        </>
    );
}

export default Login;