import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

const APIDocPage: React.FC = () => {
    return (
        <Container>
            <Header />
            <Box my={4}>
                <SwaggerUI url="openapi.yaml" />
            </Box>
            <Footer />
        </Container>
    );
};

export default APIDocPage;