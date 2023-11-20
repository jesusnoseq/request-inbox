import React from 'react';
import { Link } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ThemeSwitch from '../components/ThemeSwitch';

export default function Header() {
    return (
        <AppBar position="static" sx={{ flexGrow: 1, marginBottom: 2 }}>
            <Toolbar>
                <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
                    RequestInbox
                </Typography>
                <Box>
                    <Button color="inherit" component={Link} to="/">Inbox</Button>
                    <Button color="inherit" component={Link} to="/about">About</Button>
                </Box>
                <ThemeSwitch />
            </Toolbar>
        </AppBar>
    );
}