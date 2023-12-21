import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn';


const SignInPage: React.FC = () => {
    return (
        <Container>
            <Header />
            <Box>
                <SignIn />
            </Box>
            <Footer />
        </Container>
    );
};

export default SignInPage;