import React from 'react';
import { Link as LinkDOM } from "react-router-dom";
import { Link, Typography, Box, Button, Toolbar, AppBar } from '@mui/material';
import ThemeSwitch from '../components/ThemeSwitch';

export default function Header() {
    return (
        <AppBar position="static" sx={{ flexGrow: 1, marginBottom: 2 }}>
            <Toolbar>

                <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
                    <Link to="/" component={LinkDOM} color="inherit" underline="none">
                        Request inbox
                    </Link>
                </Typography>

                <Box>
                    <Button color="inherit" component={LinkDOM} to="/">Inbox</Button>
                    <Button color="inherit" component={LinkDOM} to="/about">About</Button>
                </Box>
                <ThemeSwitch />
            </Toolbar>
        </AppBar>
    );
}