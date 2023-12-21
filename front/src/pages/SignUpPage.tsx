import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SignUp from '../components/SignUp';


const SignUpPage: React.FC = () => {
    return (
        <Container>
            <Header />
            <Box>
                <SignUp />
                {/* <Authenticator /> */}
            </Box>
            <Footer />
        </Container>
    );
};

export default SignUpPage;