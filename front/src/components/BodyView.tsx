import React, { useState } from 'react';
import { 
    Typography, 
    Paper, 
    Grid, 
    Box, 
    Chip, 
    Collapse, 
    IconButton, 
    Tooltip,
    useTheme 
} from '@mui/material';
import { 
    ExpandMore, 
    ExpandLess, 
    Code, 
    TextFields,
    DataObject 
} from '@mui/icons-material';
import CopyToClipboardButton from './CopyToClipboardButton';
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { darkTheme } from '@uiw/react-json-view/dark';
import { ThemeContext } from '../theme';
import { useContext } from 'react';

interface BodyViewProps {
    title?: string;
    data: any;
    defaultExpanded?: boolean;
}

const BodyView: React.FC<BodyViewProps> = ({ title, data, defaultExpanded = true }) => {
    const theme = useContext(ThemeContext);
    const muiTheme = useTheme();
    const [expanded, setExpanded] = useState(defaultExpanded);
    
    if (!data) return null;

    let body;
    let isJson = false;
    let dataType = 'text';
    let parsedData = null;

    // Try to parse as JSON
    try {
        parsedData = JSON.parse(data);
        isJson = true;
        dataType = 'json';
        body = (
            <JsonView 
                style={theme.isDarkMode ? darkTheme : lightTheme} 
                value={parsedData}
                enableClipboard={false}
                displayDataTypes={false}
                displayObjectSize={false}
                collapsed={false}
            />
        );
    } catch {
        // Check if it looks like XML
        if (typeof data === 'string' && data.trim().startsWith('<') && data.trim().endsWith('>')) {
            dataType = 'xml';
        }
        
        body = (
            <Box
                component="pre"
                sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    margin: 0,
                    padding: 0,
                    backgroundColor: 'transparent',
                    color: muiTheme.palette.text.primary,
                    maxHeight: expanded ? 'none' : '200px',
                    overflow: expanded ? 'visible' : 'auto',
                }}
            >
                {data}
            </Box>
        );
    }

    const getIcon = () => {
        switch (dataType) {
            case 'json':
                return <DataObject fontSize="small" />;
            case 'xml':
                return <Code fontSize="small" />;
            default:
                return <TextFields fontSize="small" />;
        }
    };

    const getDefaultTitle = () => {
        if (title) return title;
        return "";
        // switch (dataType) {
        //     case 'json':
        //         return 'JSON Response';
        //     case 'xml':
        //         return 'XML Response';
        //     default:
        //         return 'Response Body';
        // }
    };

    const dataSize = new Blob([data]).size;
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Paper 
            variant="outlined" 
            sx={{ 
                overflow: 'hidden',
                backgroundColor: theme.isDarkMode 
                    ? muiTheme.palette.grey[900] 
                    : muiTheme.palette.grey[50],
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 0,
                    paddingX: 1.5,
                    borderBottom: `1px solid ${muiTheme.palette.divider}`,
                    backgroundColor: theme.isDarkMode 
                        ? muiTheme.palette.grey[800] 
                        : muiTheme.palette.grey[100],
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getIcon()}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {getDefaultTitle()}
                    </Typography>
                    <Chip
                        label={dataType.toUpperCase()}
                        size="small"
                        variant="outlined"
                        sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            fontWeight: 500,
                        }}
                    />
                    <Typography variant="caption" color="textSecondary">
                        {formatSize(dataSize)}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CopyToClipboardButton 
                        textToCopy={data} 
                        tooltipTitle={`Copy ${dataType.toUpperCase()}`}
                    />
                    <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
                        <IconButton 
                            size="small" 
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Collapse in={expanded} timeout="auto">
                <Box sx={{ p: 2 }}>
                    {body}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default BodyView;