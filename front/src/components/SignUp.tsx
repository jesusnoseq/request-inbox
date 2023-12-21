import React, { useState } from 'react';
import { Button, TextField, Container, Typography, FormHelperText, FormControlLabel, Checkbox, FormControl } from '@mui/material';
import { doSignUp } from '../services/users';
import { useNavigate } from 'react-router-dom';

const SignUpForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [remember, setRemember] = useState(false);

    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('')

    const navigate = useNavigate();


    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(false);
        setHelperText('');

        try {
            const result = await doSignUp({ username, password, email, autoSignIn: false });
            console.log("result", result)
            if (result.success) {
                navigate(`/`);
                //navigate(`/sign-up-confirmation`);
            } else {
                setError(true);
                setHelperText("" + result.success);
            }
        } catch (error) {
            setError(true);
            setHelperText('An unexpected error occurred.');
        }
    };


    return (
        <Container component="main" maxWidth="xs">
            <Typography component="h1" variant="h5">
                Sign Up
            </Typography>
            <form onSubmit={handleSignUp}>
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
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        variant="filled"
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                        }
                        label="Remember Me"
                    />

                    <FormHelperText sx={{ fontSize: "1rem" }}>{helperText}</FormHelperText>
                    <Button
                        sx={{ mt: 1 }}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleSignUp}>
                        Sign Up
                    </Button>
                </FormControl>
            </form>
        </Container>
    );
};

export default SignUpForm;