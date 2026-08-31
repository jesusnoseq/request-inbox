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

/** Monospace stack for URLs, headers, status codes and request bodies. */
export const monoFontFamily = '"IBM Plex Mono", ui-monospace, Menlo, Consolas, "Courier New", monospace';

/**
 * Marketing sections alternate between the page ground (background.default)
 * and a raised band. In light mode the band is background.paper; in dark mode
 * paper is already used for cards, so the band sits between the two.
 */
export const bandBackground = (isDarkMode: boolean) => (isDarkMode ? '#181818' : '#ffffff');

/** Padded, bordered monospace block for code snippets and CLI examples. */
export const codeBlockSx = {
    my: 1,
    py: 1.25,
    px: 1.75,
    bgcolor: 'background.default',
    border: 1,
    borderColor: 'divider',
    borderRadius: 1.5,
    overflowX: 'auto' as const,
    '& code': {
        fontFamily: monoFontFamily,
        fontSize: 13,
        color: 'text.secondary',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
    },
};


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
                        ? {
                            background: {
                                // MUI's dark default makes paper identical to the page
                                // ground, which flattens every card. Lift paper instead.
                                default: "#121212",
                                paper: "#1e1e1e",
                            }
                        }
                        : {
                            background: {
                                default: "#f4f5f7",
                                paper: "#ffffff",
                            }
                        }),
                },
                typography: {
                    fontFamily: '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    h1: { fontWeight: 600, letterSpacing: '-0.025em' },
                    h2: { fontWeight: 600, letterSpacing: '-0.02em' },
                    h3: { fontWeight: 600, letterSpacing: '-0.02em' },
                    h4: { fontWeight: 600, letterSpacing: '-0.015em' },
                    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
                    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
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
