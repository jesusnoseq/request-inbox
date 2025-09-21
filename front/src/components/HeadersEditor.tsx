import React, { useState } from 'react';
import { TextField, Button, IconButton, List, ListItem, ListItemText, Stack, Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export interface Header {
    key: string;
    value: string;
}

export const convertRecordToHeaders = (record: Record<string, string>): Header[] => {
    return Object.entries(record).map(([key, value]) => ({
        key,
        value,
    }));
};

export const convertHeadersToRecord = (headers: Header[]): Record<string, string> => {
    return headers.reduce((acc, header) => {
        acc[header.key] = header.value;
        return acc;
    }, {} as Record<string, string>);
};

interface HeadersEditorProps {
    initialHeaders: Header[];
    onHeadersChange: (headers: Header[]) => void;
}

const standardResponseHeaders = [
    "Access-Control-Allow-Origin",
    "Access-Control-Expose-Headers",
    "Age",
    "Cache-Control",
    "Content-Disposition",
    "Content-Encoding",
    "Content-Language",
    "Content-Length",
    "Content-Type",
    "Date",
    "ETag",
    "Expires",
    "Last-Modified",
    "Location",
    "Pragma",
    "Retry-After",
    "Server",
    "Set-Cookie",
    "Transfer-Encoding",
    "Vary",
    "WWW-Authenticate",
    "X-Frame-Options"
]


const HeadersEditor: React.FC<HeadersEditorProps> = ({ initialHeaders, onHeadersChange }) => {
    const [headers, setHeaders] = useState<Header[]>(initialHeaders);
    const [newHeader, setNewHeader] = useState<Header>({ key: '', value: '' });

    const handleAddHeader = () => {
        if (newHeader.key && newHeader.value) {
            const updatedHeaders = [...headers, newHeader];
            setHeaders(updatedHeaders);
            onHeadersChange(updatedHeaders);
            setNewHeader({ key: '', value: '' });
        }
    };


    const handleRemoveHeader = (index: number) => {
        const updatedHeaders = headers.filter((_, i) => i !== index);
        setHeaders(updatedHeaders);
        onHeadersChange(updatedHeaders);
    };

    const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewHeader({ ...newHeader, key: event.target.value });
    };

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewHeader({ ...newHeader, value: event.target.value });
    };

    return (
        <div>
            <List>
                {headers.map((header, index) => (
                    <ListItem 
                        key={index} 
                        divider
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveHeader(index)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText primary={header.key} secondary={header.value} />
                    </ListItem>
                ))}
            </List>
            <Stack direction="row" spacing={2}>
                <Autocomplete
                    id="free-solo-demo"
                    freeSolo
                    options={standardResponseHeaders}
                    sx={{ flex: 0.5 }}
                    value={newHeader.key}
                    disableClearable
                    renderInput={(params) => <TextField
                        {...params}
                        label="Key"
                        onChange={handleKeyChange}
                        variant="outlined" />}
                />
                <TextField
                    label="Value"
                    value={newHeader.value}
                    onChange={handleValueChange}
                    margin="normal"
                    variant="outlined"
                    sx={{ flex: 1 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddHeader}
                    disabled={!newHeader.key || !newHeader.value}
                >
                    Add Header
                </Button>
            </Stack>
        </div >
    );
};

export default HeadersEditor;