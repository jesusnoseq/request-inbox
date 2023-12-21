import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ForgotPassword from '../components/ForgotPassword';

const ForgotPasswordPage: React.FC = () => {
    return (
        <Container>
            <Header />
            <Box>
                <ForgotPassword />
            </Box>
            <Footer />
        </Container>
    );
};

export default ForgotPasswordPage;