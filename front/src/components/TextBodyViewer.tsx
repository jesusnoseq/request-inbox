import React from 'react';
import { Typography, Paper, Grid } from '@mui/material'
import CopyToClipboardButton from './CopyToClipboardButton';


interface TextBodyViewerProps {
    title?: string;
    data: any;
}

const TextBodyViewer: React.FC<TextBodyViewerProps> = ({ data, title }) => {
    const body = JSON.stringify(data, null, 2)
    return (
        <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={11}>
                        <Typography variant="h6">{title}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <CopyToClipboardButton textToCopy={body} />
                    </Grid>
                </Grid>

                <pre>{body}</pre>
            </Paper >
        </Grid>
    );
};

export default TextBodyViewer;