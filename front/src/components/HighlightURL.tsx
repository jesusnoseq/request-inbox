import React from 'react';
import { Link, Typography, IconButton, Box } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CopyToClipboardButton from '../components/CopyToClipboardButton';

interface HighlightURLProps {
    url: string;
    displayText?: string;
}

const HighlightURL: React.FC<HighlightURLProps> = ({ url, displayText }) => {
    return (
        <Box display="flex" flexWrap="wrap" alignItems="center" p={1} borderRadius={1} >
            <CopyToClipboardButton textToCopy={url} tooltipTitle="Copy inbox URL" />
            <Typography variant="body1" component="span" sx={{ flexGrow: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <Link href={url} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover">
                    <pre>{displayText || url}</pre>
                </Link>
            </Typography>
        </Box >
    );
};
export default HighlightURL