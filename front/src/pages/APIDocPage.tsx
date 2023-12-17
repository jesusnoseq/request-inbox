import React from 'react';
import { Container, Box } from '@mui/material';
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