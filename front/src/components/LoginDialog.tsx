import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    FormControlLabel,
    Checkbox,
    Link
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import { buildLoginURL } from '../services/inbox';

interface LoginDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function LoginDialog({ open, onClose }: LoginDialogProps) {
    const [checked, setChecked] = useState(false);


    const redirectToProvider = (provider: string) => {
        window.location.href = buildLoginURL(provider);
    }

    // const handleGoogleLogin = () => {
    //     redirectToProvider('google');
    // };

    const handleGitHubLogin = () => {
        redirectToProvider('github');
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
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
                {/* <Button
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    fullWidth
                    sx={{ mt: 2, mb: 1 }}
                    disabled={!checked}
                >
                    Login with Google
                </Button> */}
                <Button
                    variant="contained"
                    startIcon={<GitHubIcon />}
                    onClick={handleGitHubLogin}
                    fullWidth
                    sx={{ mb: 1 }}
                    disabled={!checked}
                >
                    Login with GitHub
                </Button>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={checked}
                            onChange={handleCheckboxChange}
                            color="primary"
                        />
                    }
                    label={
                        <span>
                            I accept the{' '}
                            <Link href="/terms" target="_blank" rel="noopener">Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="/privacy" target="_blank" rel="noopener">Privacy Policy</Link>
                        </span>}
                />

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}