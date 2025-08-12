import React, { useState, useEffect } from 'react';
import {
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
    Alert,
    Box,
    Button,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import CopyToClipboardButton from './CopyToClipboardButton';
import { LoadingButton } from '@mui/lab';
import { useError } from '../context/ErrorContext';
import { getAPIKeyList, deleteAPIKey, createAPIKey } from '../services/inbox';
import { type APIKey } from "../types/inbox";
import dayjs from 'dayjs';


type ExpirationOption = '1 week' | '1 month' | '3 months' | '1 year' | 'No expiration';

export default function APIKeyManager() {
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [newKeyDescription, setNewKeyDescription] = useState('');
    const [newKeyExpiration, setNewKeyExpiration] = useState<ExpirationOption>('1 month');
    const [isNewKeyLoading, setNewKeyLoading] = useState<boolean>(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<APIKey | null>(null);
    const [unmaskedNewKey, setUnmaskedNewKey] = useState<boolean>(false);
    const { setError, clearError } = useError();

    useEffect(() => {
        const fetchData = async () => {
            try {
                //setLoading(true);
                const apiKeyListResponse = await getAPIKeyList();
                setApiKeys(apiKeyListResponse);
                clearError();
            } catch (err) {
                setError('Failed to load API keys');
                console.error('Error fetching API keys:', err);
            } finally {
                //setLoading(false);
            }
        };

        fetchData();
    }, [setError, clearError]);

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
            const newAPIKey = await createAPIKey(newKeyDescription, calculateExpirationDate(newKeyExpiration));
            
            setNewlyCreatedKey(newAPIKey);
            setUnmaskedNewKey(false);
            
            // setApiKeys([newAPIKey, ...apiKeys]);
            clearError();
        } catch (err) {
            setError('Failed to create a new API key');
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

    const toggleNewKeyVisibility = () => {
        setUnmaskedNewKey(!unmaskedNewKey);
    };

    const formatDate = (dateValue: any, fallback: string) => {
        console.log('formatDate called with:', dateValue, fallback);
        if (!dateValue) return fallback;
        const d = dayjs(dateValue);
        return d.isValid() ? d.format('LLL') : fallback;
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                API Key Management
            </Typography>

            {newlyCreatedKey && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="h6">New API Key Created!</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Your new API key has been created.
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={unmaskedNewKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            onClick={toggleNewKeyVisibility}
                        >
                            {unmaskedNewKey ? 'Hide' : 'Show'} API Key
                        </Button>
                        <CopyToClipboardButton textToCopy={newlyCreatedKey.APIKey} />
                    </Box>
                    {unmaskedNewKey && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    fontFamily: 'monospace', 
                                    backgroundColor: 'rgba(0,0,0,0.1)', 
                                    padding: '4px 8px', 
                                    borderRadius: 1,
                                    wordBreak: 'break-all'
                                }}
                            >
                                {newlyCreatedKey.APIKey}
                            </Typography>
                        </Box>
                    )}
                </Alert>
            )}

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
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {apiKey.APIKey}
                                    </Typography>
                                </TableCell>
                                <TableCell>{formatDate(apiKey.CreationDate, 'Unknown')}</TableCell>
                                <TableCell>{formatDate(apiKey.ExpiryDate, 'Never')}</TableCell>
                                <TableCell>{apiKey.Name}</TableCell>
                                <TableCell>
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