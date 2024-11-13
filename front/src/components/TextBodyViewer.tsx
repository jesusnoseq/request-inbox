import React from 'react';
import { Typography, Paper, Grid2 } from '@mui/material';
import CopyToClipboardButton from './CopyToClipboardButton';

interface TextBodyViewerProps {
    title?: string;
    data: any;
}

const TextBodyViewer: React.FC<TextBodyViewerProps> = ({ data, title }) => {
    const body = JSON.stringify(data, null, 2);
    return (
        <Grid2 container spacing={2}>
            <Paper sx={{ p: 2 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={10}>
                        <Typography variant="h6">{title}</Typography>
                    </Grid2>
                    <Grid2 size={2}>
                        <CopyToClipboardButton textToCopy={body} />
                    </Grid2>
                </Grid2>
                <pre>{body}</pre>
            </Paper>
        </Grid2>
    );
};

export default TextBodyViewer;