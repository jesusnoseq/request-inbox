import React, { useState } from 'react';
import { Link as LinkDOM, useNavigate } from "react-router-dom";
import { Link, Typography, Box, Button, Toolbar, AppBar } from '@mui/material';
import ThemeSwitch from '../components/ThemeSwitch';
import LoginDialog from '../components/LoginDialog';
import Login from '../components/Login';
import { useUser } from '../context/UserContext';

export default function Header() {
    const [open, setOpen] = useState(false);
    const { user, isLoggedIn, logout } = useUser();
    const navigate = useNavigate();


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLogout = async () => {
        const resp = logout();
        console.log("handleLogout resp", resp);
        navigate("/");
    };



    return (
        <AppBar position="static" elevation={0} sx={{ flexGrow: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>

                {/* Not an <h1>: each page owns its own top-level heading. */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: 20 }}>
                    <Link to="/" component={LinkDOM} color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/logo128.png" alt="Request Inbox logo" style={{ marginRight: '12px', height: '30px' }} />
                        Request Inbox
                    </Link>
                </Typography>

                <Box>
                    <Button color="inherit" component={LinkDOM} to="/">Inbox</Button>
                    <Button color="inherit" component={LinkDOM} to="/docs">Docs</Button>
                    <Button color="inherit" component={LinkDOM} to="/about">About</Button>
                </Box>
                <div>
                    {isLoggedIn() &&
                        <Login user={user} onLogout={handleLogout} />
                    }
                    {!isLoggedIn() &&
                        <>
                            <Button sx={{ marginX: 2 }} color="inherit" variant="outlined" onClick={handleClickOpen}>Login</Button>
                            <LoginDialog open={open} onClose={handleClose} />
                        </>
                    }
                </div>
                <ThemeSwitch />
            </Toolbar>
        </AppBar>
    );
}