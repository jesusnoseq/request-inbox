import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export const ThemeContext = createContext({
    toggleTheme: () => { },
    isDarkMode: false,
});

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [isDarkMode, setDarkMode] = useState(prefersDarkMode);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: isDarkMode ? 'dark' : 'light',
                },
            }),
        [isDarkMode]
    );

    const toggleTheme = () => {
        setDarkMode(!isDarkMode);
    };

    return (
        <ThemeContext.Provider value={{ toggleTheme, isDarkMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useCustomTheme = () => useContext(ThemeContext);