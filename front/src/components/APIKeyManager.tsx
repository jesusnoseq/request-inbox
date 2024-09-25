import React, { useState } from 'react';
import {
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid2,
    Typography,
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, Delete as DeleteIcon } from '@mui/icons-material';
import CopyToClipboardButton from './CopyToClipboardButton';


interface APIKey {
    key: string;
    creationDate: Date;
    expirationDate: Date | null;
    description: string;
}

type ExpirationOption = '1 week' | '1 month' | '3 months' | '1 year' | 'No expiration';

export default function APIKeyManager() {
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [newKeyDescription, setNewKeyDescription] = useState('');
    const [newKeyExpiration, setNewKeyExpiration] = useState<ExpirationOption>('1 month');
    const [visibleKeys, setVisibleKeys] = useState<{ [key: string]: boolean }>({});

    const generateAPIKey = () => {
        // This is a simple example. In a real application, you'd generate this on the server.
        return 'ak_' + Math.random().toString(36).substr(2, 9);
    };

    const calculateExpirationDate = (option: ExpirationOption): Date | null => {
        const now = new Date();
        switch (option) {
            case '1 week':
                return new Date(now.setDate(now.getDate() + 7));
            case '1 month':
                return new Date(now.setMonth(now.getMonth() + 1));
            case '3 months':
                return new Date(now.setMonth(now.getMonth() + 3));
            case '1 year':
                return new Date(now.setFullYear(now.getFullYear() + 1));
            case 'No expiration':
                return null;
        }
    };

    const requestNewKey = () => {
        const newKey: APIKey = {
            key: generateAPIKey(),
            creationDate: new Date(),
            expirationDate: calculateExpirationDate(newKeyExpiration),
            description: newKeyDescription,
        };
        setApiKeys([...apiKeys, newKey]);
        setNewKeyDescription('');
        setNewKeyExpiration('1 month');
    };

    const deleteKey = (keyToDelete: string) => {
        setApiKeys(apiKeys.filter((key) => key.key !== keyToDelete));
    };

    const toggleKeyVisibility = (key: string) => {
        setVisibleKeys({ ...visibleKeys, [key]: !visibleKeys[key] });
    };


    const maskKey = (key: string) => {
        return key.slice(0, 3) + '*'.repeat(key.length - 6) + key.slice(-3);
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                API Key Management
            </Typography>

            <Paper style={{ padding: '20px', marginBottom: '20px' }}>
                <Typography variant="h6" gutterBottom>
                    Request New API Key
                </Typography>
                <Grid2 container spacing={2} alignItems="flex-end">
                    <Grid2>
                        <TextField
                            fullWidth
                            size='small'
                            label="Description"
                            value={newKeyDescription}
                            onChange={(e) => setNewKeyDescription(e.target.value)}
                        />
                    </Grid2>
                    <Grid2>
                        <FormControl fullWidth>
                            <InputLabel>Expiration</InputLabel>
                            <Select
                                size='small'
                                value={newKeyExpiration}
                                onChange={(e) => setNewKeyExpiration(e.target.value as ExpirationOption)}
                                label="Expiration"
                            >
                                <MenuItem value="1 week">1 week</MenuItem>
                                <MenuItem value="1 month">1 month</MenuItem>
                                <MenuItem value="3 months">3 months</MenuItem>
                                <MenuItem value="1 year">1 year</MenuItem>
                                <MenuItem value="No expiration">No expiration</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid2>
                    <Grid2>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={requestNewKey}
                            fullWidth
                        >
                            Create API Key
                        </Button>
                    </Grid2>
                </Grid2>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>API Key</TableCell>
                            <TableCell>Creation Date</TableCell>
                            <TableCell>Expiration Date</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {apiKeys.map((apiKey) => (
                            <TableRow key={apiKey.key}>
                                <TableCell>
                                    {visibleKeys[apiKey.key] ? apiKey.key : maskKey(apiKey.key)}
                                    <IconButton onClick={() => toggleKeyVisibility(apiKey.key)}>
                                        {visibleKeys[apiKey.key] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </TableCell>
                                <TableCell>{apiKey.creationDate.toLocaleDateString()}</TableCell>
                                <TableCell>{apiKey.expirationDate ? apiKey.expirationDate.toLocaleDateString() : 'Never'}</TableCell>
                                <TableCell>{apiKey.description}</TableCell>
                                <TableCell>
                                    <CopyToClipboardButton textToCopy={apiKey.key} />
                                    <IconButton onClick={() => deleteKey(apiKey.key)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}