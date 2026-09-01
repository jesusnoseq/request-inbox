import React from 'react';
import { Box, useTheme } from '@mui/material';
import { monoFontFamily } from '../theme';

const METHOD_COLORS: Record<string, { light: [string, string, string]; dark: [string, string, string] }> = {
    GET: { light: ['#e3f2fd', '#0d47a1', '#bbdefb'], dark: ['rgba(33,150,243,0.16)', '#90caf9', 'rgba(33,150,243,0.4)'] },
    POST: { light: ['#e8f5e9', '#1b5e20', '#c8e6c9'], dark: ['rgba(76,175,80,0.16)', '#a5d6a7', 'rgba(76,175,80,0.4)'] },
    PUT: { light: ['#fff3e0', '#e65100', '#ffcc80'], dark: ['rgba(255,152,0,0.16)', '#ffcc80', 'rgba(255,152,0,0.4)'] },
    PATCH: { light: ['#f3e5f5', '#6a1b9a', '#e1bee7'], dark: ['rgba(156,39,176,0.16)', '#ce93d8', 'rgba(156,39,176,0.4)'] },
    DELETE: { light: ['#ffebee', '#b71c1c', '#ffcdd2'], dark: ['rgba(244,67,54,0.16)', '#ef9a9a', 'rgba(244,67,54,0.4)'] },
    DEFAULT: { light: ['#eceff1', '#455a64', '#cfd8dc'], dark: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.2)'] },
};

/** Resolves a chip's [background, text, border] for the given HTTP method and theme mode. */
export const methodChipColors = (method: string, isDarkMode: boolean): [string, string, string] => {
    const entry = METHOD_COLORS[(method || '').toUpperCase()] || METHOD_COLORS.DEFAULT;
    return isDarkMode ? entry.dark : entry.light;
};

interface MethodChipProps {
    method: string;
    label?: string;
    size?: 'small' | 'medium';
}

/** Color-coded HTTP method badge (GET/POST/PUT/PATCH/DELETE), consistent across requests and callbacks. */
const MethodChip: React.FC<MethodChipProps> = ({ method, label, size = 'medium' }) => {
    const theme = useTheme();
    const [bg, text, border] = methodChipColors(method, theme.palette.mode === 'dark');
    const isSmall = size === 'small';

    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                height: isSmall ? 20 : 22,
                px: isSmall ? 0.875 : 1.125,
                borderRadius: 1,
                bgcolor: bg,
                color: text,
                border: 1,
                borderColor: border,
                fontFamily: monoFontFamily,
                fontSize: isSmall ? 11 : 12,
                fontWeight: 500,
                flexShrink: 0,
                whiteSpace: 'nowrap',
            }}
        >
            {label || (method || '').toUpperCase()}
        </Box>
    );
};

export default MethodChip;
