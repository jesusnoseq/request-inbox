import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Switch,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    IconButton,
    Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { InboxCallback } from '../../types/inbox';
import MethodChip from '../MethodChip';

interface CallbackListProps {
    callbacks: InboxCallback[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onUpdate: (index: number, callback: InboxCallback) => Promise<void>;
    onDeleteImmediately: (index: number) => Promise<void>;
    onToggleEnabled?: (index: number) => void;
    readonly?: boolean;
}

const CallbackList: React.FC<CallbackListProps> = ({
    callbacks,
    onEdit,
    onDelete,
    onUpdate,
    onDeleteImmediately,
    onToggleEnabled,
    readonly = false
}) => {
    if (!callbacks || callbacks.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="textSecondary">
                    No callbacks configured
                </Typography>
            </Box>
        );
    }

    const getMethodLabel = (method: string) => {
        if (method === '{{.Request.Method}}') {
            return 'Pass Forward';
        }
        if (method.length > 6) {
            return 'Custom';
        }
        return method;
    };

    const handleUpdate = (event: React.FormEvent<HTMLFormElement>, index: number) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const update = Promise.resolve().then(async () => {
            const parsedHeaders: unknown = JSON.parse(String(formData.get('headers') ?? '{}'));
            if (!parsedHeaders || Array.isArray(parsedHeaders) || typeof parsedHeaders !== 'object'
                || Object.values(parsedHeaders).some((value) => typeof value !== 'string')) {
                throw new Error('headers must be a JSON object with string values.');
            }

            const callback: InboxCallback = {
                IsEnabled: (form.elements.namedItem('isEnabled') as HTMLInputElement).checked,
                IsDynamic: (form.elements.namedItem('isDynamic') as HTMLInputElement).checked,
                ToURL: String(formData.get('toURL') ?? '').trim(),
                Method: String(formData.get('method') ?? '').trim(),
                Headers: parsedHeaders as Record<string, string>,
                Body: String(formData.get('body') ?? ''),
                IsForwardingHeaders: (form.elements.namedItem('isForwardingHeaders') as HTMLInputElement).checked,
            };
            if (!callback.ToURL || !/^https?:\/\/[^/\s]+/i.test(callback.ToURL)) {
                throw new Error('toURL must start with http:// or https:// followed by a domain.');
            }
            if (!callback.Method) {
                throw new Error('method is required.');
            }

            await onUpdate(index, callback);
            return { callbackIndex: index, callback };
        });
        const submitEvent = event.nativeEvent as SubmitEvent;

        if (submitEvent.agentInvoked && submitEvent.respondWith) {
            submitEvent.respondWith(update);
        } else {
            void update.catch(() => undefined);
        }
    };

    const handleDelete = (event: React.FormEvent<HTMLFormElement>, index: number) => {
        event.preventDefault();
        const deletedCallback = callbacks[index];
        const deletion = onDeleteImmediately(index).then(() => ({
            deletedCallbackIndex: index,
            deletedCallback,
        }));
        const submitEvent = event.nativeEvent as SubmitEvent;

        if (submitEvent.agentInvoked && submitEvent.respondWith) {
            submitEvent.respondWith(deletion);
        } else {
            void deletion.catch(() => undefined);
        }
    };

    return (
        <Box>
            {callbacks.map((callback, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                            {readonly ? (
                                <Chip
                                    label={callback.IsEnabled ? 'Enabled' : 'Disabled'}
                                    color={callback.IsEnabled ? 'info' : 'default'}
                                    size="small"
                                />
                            ) : (
                                <Tooltip title={callback.IsEnabled ? 'Disable callback' : 'Enable callback'}>
                                    <Switch
                                        checked={callback.IsEnabled}
                                        size="small"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onToggleEnabled?.(index);
                                        }}
                                        inputProps={{ 'aria-label': 'Toggle callback enabled' }}
                                    />
                                </Tooltip>
                            )}
                            <MethodChip method={callback.Method || 'GET'} label={getMethodLabel(callback.Method || 'GET')} />
                            <Typography sx={{ flexGrow: 1, fontSize: '0.9rem' }} noWrap>
                                {callback.ToURL || 'No URL set'}
                            </Typography>
                            {callback.IsDynamic && (
                                <Chip
                                    label="Dynamic"
                                    color="info"
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                            {!readonly && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Edit callback">
                                        <form
                                            aria-label={`Update callback ${index + 1}`}
                                            toolname={`update_request_inbox_callback_${index}`}
                                            tooltitle={`Update Request Inbox Callback ${index + 1}`}
                                            tooldescription={`Update callback ${index + 1}, currently targeting ${callback.ToURL}. This replaces its complete configuration.`}
                                            toolautosubmit=""
                                            onSubmit={(event) => handleUpdate(event, index)}
                                        >
                                            <input hidden name="toURL" value={callback.ToURL} readOnly required toolparamdescription="Destination URL, including http:// or https://. Go templates are allowed in its path." />
                                            <input hidden name="method" value={callback.Method} readOnly required toolparamdescription="HTTP method or Go template used for the forwarded request." />
                                            <textarea hidden name="headers" value={JSON.stringify(callback.Headers || {})} readOnly required toolparamdescription="Complete callback headers as a JSON object whose values are strings." />
                                            <textarea hidden name="body" value={callback.Body} readOnly toolparamdescription="Complete callback request body. It may contain Go templates when dynamic mode is enabled." />
                                            <input hidden name="isEnabled" type="checkbox" checked={callback.IsEnabled} readOnly toolparamdescription="Whether this callback runs for incoming requests." />
                                            <input hidden name="isDynamic" type="checkbox" checked={callback.IsDynamic} readOnly toolparamdescription="Whether URL, method, headers, and body are rendered as Go templates." />
                                            <input hidden name="isForwardingHeaders" type="checkbox" checked={callback.IsForwardingHeaders} readOnly toolparamdescription="Whether incoming request headers are forwarded before applying custom headers." />
                                            <IconButton
                                                type="button"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(index);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </form>
                                    </Tooltip>
                                    <Tooltip title="Delete callback">
                                        <form
                                            aria-label={`Delete callback ${index + 1}`}
                                            toolname={`delete_request_inbox_callback_${index}`}
                                            tooltitle={`Delete Request Inbox Callback ${index + 1}`}
                                            tooldescription={`Permanently delete callback ${index + 1}, currently targeting ${callback.ToURL}, from the open request inbox.`}
                                            toolautosubmit=""
                                            onSubmit={(event) => handleDelete(event, index)}
                                        >
                                            <IconButton
                                                type="button"
                                                size="small"
                                                color="default"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(index);
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </form>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    URL
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1 }}>
                                    {callback.ToURL || 'Not set'}
                                </Typography>
                            </Box>

                            {callback.Headers && Object.keys(callback.Headers).length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Headers
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableBody>
                                                {Object.entries(callback.Headers).map(([key, value]) => (
                                                    <TableRow key={key}>
                                                        <TableCell sx={{ fontFamily: 'monospace', width: '30%' }}>
                                                            {key}
                                                        </TableCell>
                                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                                            {value}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {callback.Body && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Body
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        component="pre"
                                        sx={{ 
                                            fontFamily: 'monospace', 
                                            backgroundColor: 'rgba(0,0,0,0.1)', 
                                            p: 1, 
                                            borderRadius: 1,
                                            whiteSpace: 'pre-wrap',
                                            maxHeight: '200px',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {callback.Body}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default CallbackList;
