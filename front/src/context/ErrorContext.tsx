// ErrorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { usePostHog } from 'posthog-js/react';
import ErrorAlert from '../components/ErrorAlert';

interface ErrorContextType {
    error: Error | string | null;
    setError: (error: Error | string) => void;
    clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = (): ErrorContextType => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};

interface ErrorProviderProps {
    children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
    const [error, setError] = useState<Error | string | null>(null);
    const posthog = usePostHog();

    const handleSetError = (error: Error | string) => {
        setError(error);
        
        // Send exception to PostHog
        if (posthog) {
            if (error instanceof Error) {
                posthog.captureException(error);
            } else {
                posthog.captureException(new Error(error));
            }
        }
    }

    const handleClearError = () => setError(null);

    return (
        <ErrorContext.Provider value={{ error, setError: handleSetError, clearError: handleClearError }}>
            <ErrorAlert error={error} onClose={handleClearError} />
            {children}
        </ErrorContext.Provider>
    );
};
