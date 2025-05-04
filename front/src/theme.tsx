import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

const saveThemePreference = (themeName: string) => {
    localStorage.setItem('themePreference', themeName);
};


const loadThemePreference = () => {
    const theme = localStorage.getItem('themePreference');
    return theme
};

export const ThemeContext = createContext({
    toggleTheme: () => { },
    isDarkMode: false,
});



export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const savedTheme = loadThemePreference()
    const [isDarkMode, setDarkMode] = useState((savedTheme != null && savedTheme === 'dark') || (prefersDarkMode && savedTheme === null));

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: isDarkMode ? 'dark' : 'light',
                    ...(isDarkMode
                        ? {}
                        : {
                            background: {
                                default: "#e4e6ea",
                                paper: "#eeeeee",
                            }
                        }),
                },
            }),
        [isDarkMode]
    );

    const toggleTheme = () => {
        setDarkMode(!isDarkMode);
        saveThemePreference(!isDarkMode ? 'dark' : 'light');
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