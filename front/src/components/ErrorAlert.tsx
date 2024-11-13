import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface ErrorSnackbarProps {
    error: string | null;
    onClose: () => void;
}

const ErrorAlert: React.FC<ErrorSnackbarProps> = ({ error, onClose }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleClose = () => {
        setOpen(false);
        onClose();
    };

    useEffect(() => {
        if (error) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [error]);

    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                {error}
            </Alert>
        </Snackbar>
    );
};

export default ErrorAlert;
