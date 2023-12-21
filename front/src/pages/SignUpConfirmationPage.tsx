import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SignUpConfirmation from '../components/SignUpConfirmation';


const SignUpPage: React.FC = () => {
    return (
        <Container>
            <Header />
            <Box>
                <SignUpConfirmation />
            </Box>
            <Footer />
        </Container>
    );
};

export default SignUpPage;