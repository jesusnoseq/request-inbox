import React from "react";
import Button from "@mui/material/Button";
import { buildLoginURL } from '../services/inbox';

interface LoginViewProps {
    provider: string;
}

const LoginWithButton: React.FC<LoginViewProps> = ({ provider }) => {
    const handleLogin = () => {
        window.location.href = buildLoginURL(provider);
    };

    return (
        <Button variant="contained" color="primary" onClick={handleLogin}>
            Login with {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </Button>
    );
}

export default LoginWithButton;