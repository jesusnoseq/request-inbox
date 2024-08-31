import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import { buildLoginURL } from '../services/inbox';

interface LoginDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function LoginDialog({ open, onClose }: LoginDialogProps) {

    const redirectToProvider = (provider: string) => {
        window.location.href = buildLoginURL(provider);
    }

    const handleGoogleLogin = () => {
        redirectToProvider('google');
    };

    const handleGitHubLogin = () => {
        redirectToProvider('github');
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="login-dialog-title">
            <DialogTitle id="login-dialog-title">
                Login
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please choose a method to log in:
                </DialogContentText>
                <Button
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    fullWidth
                    sx={{ mt: 2, mb: 1 }}
                >
                    Login with Google
                </Button>
                <Button
                    variant="contained"
                    startIcon={<GitHubIcon />}
                    onClick={handleGitHubLogin}
                    fullWidth
                    sx={{ mb: 1 }}
                >
                    Login with GitHub
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}