import React, { ErrorInfo, ReactNode } from 'react';
import { Alert, Container } from '@mui/material';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container>
                    <Alert severity="error">
                        Something went wrong. Please try again later.
                    </Alert>
                    {this.state.error && <div>Error: {this.state.error.message}</div>}
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;