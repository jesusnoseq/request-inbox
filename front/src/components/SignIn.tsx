import React, { useState } from 'react';
import { Button, TextField, Container, Typography, FormHelperText, FormControl } from '@mui/material';
import { doSignIn } from '../services/users';
import { Link as LinkDOM } from "react-router-dom";
import { useNavigate } from 'react-router-dom';


const SignInForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('')
    const navigate = useNavigate();

    const handleSignIn = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(false);
        setHelperText('');

        try {
            const result = await doSignIn({ username, password });
            if (result.success) {
                navigate(`/`);
            } else {
                setError(true);
                //setHelperText("" + result.error);
            }
        } catch (error) {
            setError(true);
            setHelperText('An unexpected error occurred.');
        }
    };



    return (
        <Container component="main" maxWidth="xs">
            <Typography component="h1" variant="h5">
                Sign In
            </Typography>
            <form onSubmit={handleSignIn}>
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
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <FormHelperText sx={{ fontSize: "1rem" }}>{helperText}</FormHelperText>

                    <Button
                        sx={{ mt: 1 }}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleSignIn}>
                        Sign In
                    </Button>
                </FormControl>
            </form>

            <p>
                Don't have an account? <Button component={LinkDOM} to="/sign-up">Sign Up</Button>
                <br />
                Forgot your password? <Button color="inherit" component={LinkDOM} to="/forgot-password">Reset Password</Button>
                <br />
                {/* I have received a confirmation code <Button color="inherit" component={LinkDOM} to="/sign-up-confirmation">Validate</Button> */}
            </p>
        </Container>
    );
};

export default SignInForm;