import React from 'react';
import { Container, Box } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"


const APIDocPage: React.FC = () => {
    return (
        <Container>
            <Header />
            <Box my={4}>
                <ErrorBoundary>
                    <SwaggerUI url="openapi.yaml" />
                </ErrorBoundary>
            </Box>
            <Footer />
        </Container>
    );
};

export default APIDocPage;