import React, { useState } from 'react';
import { TextField, Button, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Stack } from '@mui/material';
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
                    <ListItem key={index} divider>
                        <ListItemText primary={header.key} secondary={header.value} />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveHeader(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
            <Stack direction="row" spacing={2}>
                <TextField
                    label="Key"
                    value={newHeader.key}
                    onChange={handleKeyChange}
                    margin="normal"
                    variant="outlined"
                    sx={{ flex: 0.5 }}
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