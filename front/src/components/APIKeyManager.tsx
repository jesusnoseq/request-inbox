import React, { useState, useEffect } from 'react';
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
import { LoadingButton } from '@mui/lab';
import { useError } from '../context/ErrorContext';
import { getAPIKeyList, deleteAPIKey, createAPIKey } from '../services/inbox';
import { type APIKey } from "../types/inbox";
import moment from 'moment';


type ExpirationOption = '1 week' | '1 month' | '3 months' | '1 year' | 'No expiration';

export default function APIKeyManager() {
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [newKeyDescription, setNewKeyDescription] = useState('');
    const [newKeyExpiration, setNewKeyExpiration] = useState<ExpirationOption>('1 month');
    const [visibleKeys, setVisibleKeys] = useState<{ [key: string]: boolean }>({});
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isNewKeyLoading, setNewKeyLoading] = useState<boolean>(false);
    const { setError, clearError } = useError();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const apiKeyListResponse = await getAPIKeyList();
                setApiKeys(apiKeyListResponse);
                clearError();
            } catch (err) {
                setError('Failed to load inboxes');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const requestNewKey = async () => {
        try {
            setNewKeyLoading(true);
            const apiKeyListResponse = await createAPIKey(newKeyDescription, calculateExpirationDate(newKeyExpiration));
            setApiKeys([apiKeyListResponse, ...apiKeys]);
            clearError();
        } catch (err) {
            setError('Failed to load inboxes');
        } finally {
            setNewKeyLoading(false);
        }
        setNewKeyDescription('');
        setNewKeyExpiration('1 month');
    };

    const deleteKey = async (keyToDelete: string) => {
        await deleteAPIKey(keyToDelete);
        setApiKeys(apiKeys.filter((key) => key.ID !== keyToDelete));
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
                    Request new API key
                </Typography>
                <Grid2 container spacing={2} alignItems="flex-end">
                    <Grid2 size={7}>
                        <TextField
                            fullWidth
                            size='small'
                            label="Description"
                            value={newKeyDescription}
                            onChange={(e) => setNewKeyDescription(e.target.value)}
                        />
                    </Grid2>
                    <Grid2 size={2}>
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
                    <Grid2 size={3}>
                        <LoadingButton
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={requestNewKey}
                            fullWidth
                            loading={isNewKeyLoading}
                        >
                            Create API Key
                        </LoadingButton>
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
                            <TableRow key={apiKey.ID}>
                                <TableCell>
                                    {visibleKeys[apiKey.ID] ? apiKey.APIKey : maskKey(apiKey.APIKey)}
                                    <IconButton onClick={() => toggleKeyVisibility(apiKey.ID)}>
                                        {visibleKeys[apiKey.ID] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </TableCell>
                                <TableCell>{moment(apiKey.CreationDate).format('LLL')}</TableCell>
                                <TableCell>{apiKey.ExpiryDate ? moment(apiKey.ExpiryDate).format('LLL') : 'Never'}</TableCell>
                                <TableCell>{apiKey.Name}</TableCell>
                                <TableCell>
                                    <CopyToClipboardButton textToCopy={apiKey.ID} />
                                    <IconButton onClick={() => deleteKey(apiKey.ID)}>
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