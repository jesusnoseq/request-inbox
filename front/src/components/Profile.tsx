import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
    Box,
} from '@mui/material';
import { User } from '../types/inbox';

interface ProfileProps {
    user: User;
    onDeleteAccount: () => Promise<void>;
}

export default function Profile({ user, onDeleteAccount }: ProfileProps) {
    const [openDialog, setOpenDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await onDeleteAccount();
            // Handle successful deletion (e.g., redirect to login page)
        } catch (error) {
            console.error('Error deleting account:', error);
            // Handle error (e.g., show error message to user)
        } finally {
            setIsDeleting(false);
            handleCloseDialog();
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>
            <Typography variant="body1" paragraph>
                Name: {user.Name}
            </Typography>
            <Typography variant="body1" paragraph>
                Email: {user.Email}
            </Typography>

            <Button
                variant="contained"
                color="error"
                onClick={handleOpenDialog}
                sx={{ mt: 2 }}
            >
                Delete Account
            </Button>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Are you sure you want to delete your account?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This action cannot be undone. All of your data will be permanently deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteAccount}
                        color="error"
                        disabled={isDeleting}
                        autoFocus
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}