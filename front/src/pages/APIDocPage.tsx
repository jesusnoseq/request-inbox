import React from 'react';
import { Container, Box } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

import { ThemeContext } from '../theme';
import { useContext } from 'react';


const APIDocPage: React.FC = () => {
    const theme = useContext(ThemeContext);

    if (theme.isDarkMode) {
        require('../SwaggerDark.css');
    }

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