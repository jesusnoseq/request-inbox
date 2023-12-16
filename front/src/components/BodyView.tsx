import React from 'react';
import { Typography, Paper, Grid } from '@mui/material'
import CopyToClipboardButton from './CopyToClipboardButton';
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { darkTheme } from '@uiw/react-json-view/dark';
import { ThemeContext } from '../theme';
import { useContext } from 'react';

interface BodyViewProps {
    title?: string;
    data: any;
}

const BodyView: React.FC<BodyViewProps> = ({ data, title }) => {
    const theme = useContext(ThemeContext);
    let body;

    try {
        body = <JsonView style={theme.isDarkMode ? darkTheme : lightTheme} value={JSON.parse(data)}
            enableClipboard={true}
            displayDataTypes={false}
            displayObjectSize={false} />
        title = title || "JSON body";
    } catch {
        title = title || "Text body";
        body = (<pre>{data}</pre>)
    }
    return (data &&
        <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={11}>
                        <Typography variant="h6">{title}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <CopyToClipboardButton textToCopy={data} />
                    </Grid>
                </Grid>
                {body}
            </Paper >
        </Grid>
    );
};

export default BodyView;