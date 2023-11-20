import React from 'react';
import { Theme } from '@mui/material/styles';
import { Typography, Paper, Grid, Box } from '@mui/material'
import CopyToClipboardButton from './CopyToClipboardButton';

// const useStyles = makeStyles((theme: Theme) => ({
//     root: {
//         margin: theme.spacing(2),
//         padding: theme.spacing(2),
//     },
// }));

interface JSONViewerProps {
    title?: string;
    data: any;
}

const JSONViewer: React.FC<JSONViewerProps> = ({ data, title }) => {
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

export default JSONViewer;