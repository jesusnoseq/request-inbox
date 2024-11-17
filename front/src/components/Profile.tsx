import React, { useState } from 'react'
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material'
import { Person, Email, DeleteForever } from '@mui/icons-material'
import { User } from '../types/inbox';
import APIKeyManager from './APIKeyManager';

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
        } catch (error) {
            console.error('Error deleting account:', error);
        } finally {
            setIsDeleting(false);
            handleCloseDialog();
        }
    };

    return (
        <Box sx={{ margin: 'auto', padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>
            {/* <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar
                    src={user.AvatarURL}
                    alt={user.Name}
                    sx={{ width: 100, height: 100, mb: 2 }}
                />
            </Box> */}

            <List>
                <ListItem>
                    <ListItemIcon>
                        <Person />
                    </ListItemIcon>
                    <ListItemText primary="Name" secondary={user.Name} />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <Email />
                    </ListItemIcon>
                    <ListItemText primary="Email" secondary={user.Email} />
                </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            {/*<APIKeyManager />*/}

            <Divider sx={{ my: 3 }} />
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="error">
                    Danger Zone
                </Typography>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleOpenDialog}
                    startIcon={<DeleteForever />}
                >
                    Delete Account
                </Button>
            </Box>

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
        </Box >
    );
}