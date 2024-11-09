// ErrorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import ErrorAlert from '../components/ErrorAlert';

interface ErrorContextType {
    error: string | null;
    setError: (message: string) => void;
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
    const [error, setError] = useState<string | null>(null);

    const handleSetError = (message: string) => {
        setError(message);
    }

    const handleClearError = () => setError(null);

    return (
        <ErrorContext.Provider value={{ error, setError: handleSetError, clearError: handleClearError }}>
            <ErrorAlert error={error} onClose={handleClearError} />
            {children}
        </ErrorContext.Provider>
    );
};
