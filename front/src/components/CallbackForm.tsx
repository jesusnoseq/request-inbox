import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    TextareaAutosize,
    InputAdornment,
    Tooltip,
    IconButton,
    Autocomplete
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { InboxCallback } from '../types/inbox';
import HeadersEditor, { Header, convertRecordToHeaders, convertHeadersToRecord } from './HeadersEditor';

interface CallbackFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (callback: InboxCallback) => Promise<void>;
    initialCallback?: InboxCallback;
    title?: string;
}

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const defaultCallback: InboxCallback = {
    IsEnabled: true,
    IsDynamic: false,
    ToURL: '',
    Method: 'POST',
    Headers: {},
    Body: ''
};

const CallbackForm: React.FC<CallbackFormProps> = ({
    open,
    onClose,
    onSave,
    initialCallback,
    title = 'Add Callback'
}) => {
    const [callback, setCallback] = useState<InboxCallback>(initialCallback || defaultCallback);
    const [headers, setHeaders] = useState<Header[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (initialCallback) {
            setCallback(initialCallback);
            setHeaders(convertRecordToHeaders(initialCallback.Headers || {}));
        } else {
            setCallback(defaultCallback);
            setHeaders([]);
        }
        setErrors({});
        setIsSubmitting(false);
    }, [initialCallback, open]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!callback.ToURL.trim()) {
            newErrors.ToURL = 'URL is required';
        } else {
            try {
                new URL(callback.ToURL);
            } catch {
                newErrors.ToURL = 'Please enter a valid URL';
            }
        }

        if (!callback.Method) {
            newErrors.Method = 'HTTP method is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const updatedCallback: InboxCallback = {
                    ...callback,
                    Headers: convertHeadersToRecord(headers)
                };
                await onSave(updatedCallback);
                onClose();
            } catch (error) {
                // Don't close the popup on error - let the user see the error and try again
                console.error('Failed to save callback:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleCancel = () => {
        setCallback(initialCallback || defaultCallback);
        setHeaders(convertRecordToHeaders((initialCallback?.Headers) || {}));
        setErrors({});
        setIsSubmitting(false);
        onClose();
    };

    const formatAsJson = () => {
        try {
            const formattedJson = JSON.stringify(JSON.parse(callback.Body), null, 2);
            setCallback({ ...callback, Body: formattedJson });
        } catch (error) {
            console.error('Invalid JSON input:', error);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleCancel} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { minHeight: '60vh' }
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    {/* Enable/Disable Toggle */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={callback.IsEnabled}
                                onChange={(e) => setCallback({ ...callback, IsEnabled: e.target.checked })}
                            />
                        }
                        label="Enable callback"
                    />

                    {/* URL Field */}
                    <TextField
                        label="Callback URL"
                        value={callback.ToURL}
                        onChange={(e) => setCallback({ ...callback, ToURL: e.target.value })}
                        error={!!errors.ToURL}
                        helperText={errors.ToURL}
                        fullWidth
                        required
                        placeholder="https://example.com/webhook"
                    />

                    {/* HTTP Method */}
                    <Autocomplete
                        freeSolo
                        options={httpMethods}
                        value={callback.Method}
                        onChange={(event, newValue) => {
                            setCallback({ ...callback, Method: (newValue || '').toUpperCase() });
                        }}
                        onInputChange={(event, newInputValue) => {
                            setCallback({ ...callback, Method: newInputValue.toUpperCase() });
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="HTTP Method"
                                error={!!errors.Method}
                                helperText={errors.Method || "Select from list or enter a custom HTTP method/template"}
                                fullWidth
                                required
                                placeholder="POST, GET, PUT, DELETE, etc."
                            />
                        )}
                    />

                    {/* Headers Section */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Headers
                        </Typography>
                        <HeadersEditor 
                            initialHeaders={headers} 
                            onHeadersChange={setHeaders} 
                        />
                    </Box>

                    {/* Body Field */}
                    <TextField
                        label="Request Body"
                        multiline
                        fullWidth
                        variant="outlined"
                        rows={4}
                        value={callback.Body}
                        onChange={(e) => setCallback({ ...callback, Body: e.target.value })}
                        placeholder="Request body content (optional)"
                        slotProps={{
                            input: {
                                inputComponent: TextareaAutosize,
                                inputProps: {
                                    minRows: 4,
                                    style: { resize: 'vertical' },
                                },
                                endAdornment: callback.Body && (
                                    <InputAdornment position="end">
                                        <Button 
                                            onClick={formatAsJson} 
                                            variant="outlined" 
                                            size="small" 
                                            color="secondary"
                                        >
                                            Format as JSON
                                        </Button>
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />

                    {/* Dynamic Response Toggle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={callback.IsDynamic}
                                    onChange={(e) => setCallback({ ...callback, IsDynamic: e.target.checked })}
                                />
                            }
                            label="Dynamic callback"
                        />
                        <Tooltip
                            title="Dynamic callbacks allow you to use variables from the incoming request in the callback URL, headers, and body"
                            arrow
                            enterDelay={200}
                            leaveDelay={300}
                        >
                            <IconButton size="small">
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Callback'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CallbackForm;