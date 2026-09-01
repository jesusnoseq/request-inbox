import React from 'react';
import { Box, useTheme } from '@mui/material';
import { monoFontFamily } from '../theme';

const STATUS_COLORS: Record<string, { light: [string, string, string]; dark: [string, string, string] }> = {
    INFO: { light: ['#e3f2fd', '#0d47a1', '#bbdefb'], dark: ['rgba(33,150,243,0.16)', '#90caf9', 'rgba(33,150,243,0.4)'] },
    SUCCESS: { light: ['#e8f5e9', '#1b5e20', '#c8e6c9'], dark: ['rgba(76,175,80,0.16)', '#a5d6a7', 'rgba(76,175,80,0.4)'] },
    WARNING: { light: ['#fff3e0', '#e65100', '#ffcc80'], dark: ['rgba(255,152,0,0.16)', '#ffcc80', 'rgba(255,152,0,0.4)'] },
    ERROR: { light: ['#ffebee', '#b71c1c', '#ffcdd2'], dark: ['rgba(244,67,54,0.16)', '#ef9a9a', 'rgba(244,67,54,0.4)'] },
    DEFAULT: { light: ['#eceff1', '#455a64', '#cfd8dc'], dark: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.2)'] },
};

const statusCategory = (code: number): keyof typeof STATUS_COLORS => {
    if (code >= 500) return 'ERROR';
    if (code >= 400) return 'WARNING';
    if (code >= 300) return 'INFO';
    if (code >= 200) return 'SUCCESS';
    return 'DEFAULT';
};

/** Resolves a chip's [background, text, border] for the given HTTP status code and theme mode. */
export const statusChipColors = (code: number, isDarkMode: boolean): [string, string, string] => {
    const entry = STATUS_COLORS[statusCategory(code)];
    return isDarkMode ? entry.dark : entry.light;
};

interface StatusChipProps {
    code: number;
    size?: 'small' | 'medium';
    /** Overrides the displayed text (defaults to the numeric code), e.g. a method + code summary. */
    label?: string;
    /** Forces the ERROR palette regardless of code, for outcomes with no real status (e.g. a callback that never got a response). */
    forceError?: boolean;
}

/** Color-coded HTTP status code badge, muted to match MethodChip in both themes. */
const StatusChip: React.FC<StatusChipProps> = ({ code, size = 'small', label, forceError }) => {
    const theme = useTheme();
    const [bg, text, border] = statusChipColors(forceError ? 500 : code, theme.palette.mode === 'dark');
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
            {label ?? code}
        </Box>
    );
};

export default StatusChip;
