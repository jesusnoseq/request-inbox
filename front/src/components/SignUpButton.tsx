import React, { useState } from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import LoginDialog from './LoginDialog';


interface SignUpButtonProps extends ButtonProps {
    text?: string;
}

const SignUpButton: React.FC<SignUpButtonProps> = ({ text = "Sign Up", ...props }) => {
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
                onClick={handleOpen}
                {...props}
            >
                {text}
            </Button>
            <LoginDialog open={open} onClose={handleClose} />
        </>
    );
};

export default SignUpButton;
