import React, { useState, useEffect } from 'react';
import { Link as LinkDOM, useNavigate } from "react-router-dom";
import { Link, Typography, Box, Button, Toolbar, AppBar } from '@mui/material';
import ThemeSwitch from '../components/ThemeSwitch';
import LoginDialog from '../components/LoginDialog';
import Login from '../components/Login';
import { getUser, logout } from '../services/inbox';
import { User } from '../types/inbox';

export default function Header() {
    const [open, setOpen] = useState(false);
    const [user, setUser] = React.useState<null | User>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await getUser();
                console.log("userResponse ", userResponse);
                setUser(userResponse);
            } catch (err) {
                console.log("Some error occur", err);
            }
        };

        fetchData();
    }, []);


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLogout = async () => {
        const resp = await logout();
        console.log("handleLogout resp", resp);
        setUser(null);
        navigate("/");
    };



    return (
        <AppBar position="static" sx={{ flexGrow: 1, marginBottom: 2 }}>
            <Toolbar>

                <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
                    <Link to="/" component={LinkDOM} color="inherit" underline="none">
                        Request Inbox
                    </Link>
                </Typography>

                <Box>
                    <Button color="inherit" component={LinkDOM} to="/">Inbox</Button>
                    <Button color="inherit" component={LinkDOM} to="/api-doc">API doc</Button>
                    <Button color="inherit" component={LinkDOM} to="/users-manual">Help</Button>
                    <Button color="inherit" component={LinkDOM} to="/about">About</Button>
                </Box>
                <div>
                    {user &&
                        <Login user={user} onLogout={handleLogout} />
                    }
                    {!user &&
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