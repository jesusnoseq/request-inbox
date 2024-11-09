import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import LoginDialog from './LoginDialog';


interface SignUpButtonProps {
    text?: string;
    fill?: boolean;
}

const SignUpButton: React.FC<SignUpButtonProps> = ({ text = "Sign Up", fill = false }) => {
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
                size="large"
                fullWidth={fill}
                color="primary"
                variant="contained"
                onClick={handleOpen}
            >
                {text}
            </Button>
            <LoginDialog open={open} onClose={handleClose} />
        </>
    );
};

export default SignUpButton;
