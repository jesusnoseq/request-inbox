import React from 'react';
import { Link, Box } from '@mui/material';
import { monoFontFamily } from '../theme';
import CopyToClipboardButton from '../components/CopyToClipboardButton';

interface HighlightURLProps {
    url: string;
    displayText?: string;
}

const HighlightURL: React.FC<HighlightURLProps> = ({ url, displayText }) => {
    return (
        <Box display="flex" alignItems="center" gap={1} p={1} borderRadius={1} minWidth={0}>
            <CopyToClipboardButton textToCopy={url} tooltipTitle="Copy inbox URL" />
            <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    fontFamily: monoFontFamily,
                    fontSize: '0.875rem',
                    wordBreak: 'break-all',
                }}
            >
                {displayText || url}
            </Link>
        </Box >
    );
};
export default HighlightURL