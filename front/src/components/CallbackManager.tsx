import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { InboxCallback } from '../types/inbox';
import CallbackList from './CallbackList';
import CallbackForm from './CallbackForm';

interface CallbackManagerProps {
    callbacks: InboxCallback[];
    onCallbacksChange: (callbacks: InboxCallback[]) => Promise<void>;
    readonly?: boolean;
}

const CallbackManager: React.FC<CallbackManagerProps> = ({
    callbacks,
    onCallbacksChange,
    readonly = false
}) => {
    const [editMode, setEditMode] = useState<boolean>(true);
    const [formOpen, setFormOpen] = useState<boolean>(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    const enableEditMode = () => {
        setEditMode(true);
    };

    const handleAddCallback = () => {
        setEditingIndex(null);
        setFormOpen(true);
    };

    const handleEditCallback = (index: number) => {
        setEditingIndex(index);
        setFormOpen(true);
    };

    const handleDeleteCallback = (index: number) => {
        setDeleteIndex(index);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteIndex !== null) {
            const newCallbacks = callbacks.filter((_, i) => i !== deleteIndex);
            await onCallbacksChange(newCallbacks);
        }
        setDeleteDialogOpen(false);
        setDeleteIndex(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setDeleteIndex(null);
    };

    const handleSaveCallback = async (callback: InboxCallback) => {
        if (editingIndex !== null) {
            // Editing existing callback
            const newCallbacks = [...callbacks];
            newCallbacks[editingIndex] = callback;
            await onCallbacksChange(newCallbacks);
        } else {
            // Adding new callback
            await onCallbacksChange([...callbacks, callback]);
        }
        setFormOpen(false);
        setEditingIndex(null);
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setEditingIndex(null);
    };

    return (
        <>
            {!editMode && (
                <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Typography variant="h6">
                            Callbacks ({callbacks.length})
                        </Typography>
                        {!readonly && (
                            <IconButton 
                                aria-label="edit callbacks" 
                                size="small" 
                                onClick={enableEditMode}
                            >
                                <ModeEditIcon fontSize="medium" />
                            </IconButton>
                        )}
                    </Box>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <CallbackList 
                            callbacks={callbacks} 
                            onEdit={() => {}} 
                            onDelete={() => {}}
                            readonly={true}
                        />
                    </Paper>
                </Box>
            )}

            {editMode && (
                <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6">
                            Manage Callbacks
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddCallback}
                            size="small"
                        >
                            Add Callback
                        </Button>
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <CallbackList
                            callbacks={callbacks}
                            onEdit={handleEditCallback}
                            onDelete={handleDeleteCallback}
                            readonly={false}
                        />
                    </Paper>
                </Box>
            )}

            {/* Callback Form Dialog */}
            <CallbackForm
                open={formOpen}
                onClose={handleFormClose}
                onSave={handleSaveCallback}
                initialCallback={editingIndex !== null ? callbacks[editingIndex] : undefined}
                title={editingIndex !== null ? 'Edit Callback' : 'Add Callback'}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
                <DialogTitle>Delete Callback</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this callback? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CallbackManager;