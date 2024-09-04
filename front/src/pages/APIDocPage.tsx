import React from 'react';
import { Container, Box } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"


const APIDocPage: React.FC = () => {
    return (
        <Container>
            <Box my={4}>
                <ErrorBoundary>
                    <SwaggerUI url="openapi.yaml" />
                </ErrorBoundary>
            </Box>
        </Container>
    );
};

export default APIDocPage;