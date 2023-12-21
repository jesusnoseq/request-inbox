import React, { useState } from 'react';
import { Button, TextField, Container, Typography, FormControl } from '@mui/material';
import { doSignUpConfirmation } from '../services/users';
import { useNavigate } from 'react-router-dom';


const SignUpConfirmationForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const navigate = useNavigate();
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('')


    const handleSignUpConfirmation = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Sign up confirmation:', { username, confirmationCode });
        doSignUpConfirmation({ username, confirmationCode });
        navigate(`/sign-in`);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Typography component="h1" variant="h5">
                Sign Up confirmation
            </Typography>
            <form onSubmit={handleSignUpConfirmation}>
                <FormControl error={error} variant="standard" sx={{ display: "block", position: "relative" }}>
                    <TextField
                        variant="filled"
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        variant="filled"
                        margin="normal"
                        required
                        fullWidth
                        label="Confirmation code"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                    />
                    <Button
                        sx={{ mt: 1 }}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleSignUpConfirmation}>
                        Sign In
                    </Button>
                </FormControl>
            </form>
        </Container>
    );
};

export default SignUpConfirmationForm;