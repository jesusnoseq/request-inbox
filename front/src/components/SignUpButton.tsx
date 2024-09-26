import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import LoginDialog from './LoginDialog';


interface SignUpButtonProps {
    text?: string;
}

const SignUpButton: React.FC<SignUpButtonProps> = ({ text = "Sign Up" }) => {
    const [open, setOpen] = useState(false);
    const { isLoggedIn } = useUser();
    const navigate = useNavigate();

    const handleOpen = async () => {
        if (isLoggedIn()) {
            navigate('/');
        } else {
            setOpen(true);
        }
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleOpen}
            >
                {text}
            </Button>
            <LoginDialog open={open} onClose={handleClose} />
        </>
    );
};

export default SignUpButton;
