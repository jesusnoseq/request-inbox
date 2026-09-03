import React, { useState } from 'react';
import type {} from '@mcp-b/react-webmcp';
import { CallbackResponse, InboxRequest } from '../types/inbox';
import {
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Box,
    Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import BodyView from './BodyView';
import CallbackResponseView, { CallbackRetry } from './callback/CallbackResponseView';
import MethodChip from './MethodChip';
import StatusChip from './StatusChip';
import CopyToClipboardButton from './CopyToClipboardButton';
import { buildCurlCommand } from '../utils/curl';
import { retryCallback } from '../services/inbox';

dayjs.extend(localizedFormat);

type RequestDetailProps = {
    request: InboxRequest;
    inboxId: string;
};

const callbackOutcome = (cr: CallbackResponse) => cr.Error ? 'Failed' : `${cr.Method || 'POST'} ${cr.Code}`;

const RequestDetail: React.FC<RequestDetailProps> = ({ request, inboxId }) => {
    const headerEntries: [string, string][] = Object.entries(request.Headers);
    const [headersOpen, setHeadersOpen] = useState<boolean>(false);
    const [callbacksOpen, setCallbacksOpen] = useState<boolean>(false);
    // A retry does not change what is stored, so its result only lives here, keyed by callback index.
    const [retries, setRetries] = useState<Record<number, CallbackRetry>>({});
    const [retryingIndex, setRetryingIndex] = useState<number | null>(null);
    // Keyed by callback index too, so a failed retry is reported inside the box of its own callback.
    const [retryErrors, setRetryErrors] = useState<Record<number, string>>({});
    const capturedResponses = request.CallbackResponses || [];
    const callbackResponses = capturedResponses.map((cr, index) => retries[index]?.response ?? cr);

    const dismissRetryError = (index: number) => {
        setRetryErrors(({ [index]: _dismissed, ...rest }) => rest);
    };

    const handleRetryCallback = async (index: number) => {
        setRetryingIndex(index);
        dismissRetryError(index);
        setCallbacksOpen(true);
        try {
            const response = await retryCallback(inboxId, request.ID, index);
            setRetries((previous) => ({
                ...previous,
                [index]: {
                    response,
                    at: Date.now(),
                    attempts: (previous[index]?.attempts ?? 0) + 1,
                },
            }));
            return response;
        } catch (err) {
            const reason = err instanceof Error ? err.message : 'Failed to retry callback';
            setRetryErrors((previous) => ({ ...previous, [index]: reason }));
            throw err;
        } finally {
            setRetryingIndex(null);
        }
    };

    const handleHeadersCollapse = () => {
        setHeadersOpen(!headersOpen);
    };

    const handleCallbacksCollapse = () => {
        setCallbacksOpen(!callbacksOpen);
    };

    function splitPath(url: string) {
        const regex = /(\/inboxes\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/in)(.*)/;
        const matches = url.match(regex);
        return matches && matches[2] ? [matches[1], matches[2]] : [url, ''];
    }

    const [URIDefaulPath, URICustomPath] = splitPath(request.URI)

    const curlCommand = buildCurlCommand(request);

    const handleCopyCurlToolSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const submitEvent = event.nativeEvent as SubmitEvent;
        const copy = navigator.clipboard.writeText(curlCommand).then(() => ({
            requestId: request.ID,
            curl: curlCommand,
        }));

        if (submitEvent.agentInvoked && submitEvent.respondWith) {
            submitEvent.respondWith(copy);
        } else {
            void copy.catch(() => undefined);
        }
    };

    return (
        <Card variant="outlined" sx={{ marginBottom: 2 }}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    Nº {request.ID + 1}<br />
                    {dayjs(request.Timestamp).format('LLL')}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <MethodChip method={request.Method} />
                    <Typography variant="h6" component="span">
                        <Box component="code"
                            sx={{
                                opacity: '0.5',
                                fontSize: '1rem',
                                letterSpacing: '-0.5px',
                            }}>{URIDefaulPath}</Box>
                        <code>{URICustomPath}</code>
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                    <Button onClick={handleHeadersCollapse}>
                        <Typography>Show headers</Typography>
                        {headersOpen ? <ExpandLess /> : <ExpandMore />}
                    </Button>
                    <form
                        aria-label={`Copy request ${request.ID + 1} as cURL`}
                        toolname={`copy_request_as_curl_${request.ID}`}
                        tooltitle={`Copy Request ${request.ID + 1} as cURL`}
                        tooldescription={`Copy captured request ${request.ID + 1} to the clipboard as a cURL command and return the command.`}
                        toolautosubmit=""
                        onSubmit={handleCopyCurlToolSubmit}
                        style={{ display: 'contents' }}
                    >
                        <CopyToClipboardButton
                            textToCopy={curlCommand}
                            label="Copy cURL"
                            tooltipTitle="Copy this request as a cURL command"
                            copyEventMessage="cURL command copied to clipboard"
                        />
                    </form>
                </Box>

                <Collapse in={headersOpen} timeout="auto" unmountOnExit>
                    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        {
                            headerEntries.map((k, index) => (
                                <ListItem key={index} alignItems="flex-start" sx={{ paddingBottom: 0, paddingTop: 0 }}>
                                    <ListItemText primary={k[0]} secondary={k[1]} />
                                </ListItem>
                            ))
                        }
                    </List>
                </Collapse>

                {/* Callback Results Section */}
                {callbackResponses.length > 0 && (
                    <>
                        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} sx={{ marginTop: 2 }}>
                            <Button onClick={handleCallbacksCollapse}>
                                <Typography>Show callback results ({callbackResponses.length})</Typography>
                                {callbacksOpen ? <ExpandLess /> : <ExpandMore />}
                            </Button>
                            <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
                                {callbackResponses.map((cr, index) => {
                                    const retry = retries[index];
                                    const isRetrying = retryingIndex === index;
                                    const tooltip = isRetrying
                                        ? `Retrying callback ${index + 1}…`
                                        : retry
                                            ? `Callback ${index + 1} retried at ${dayjs(retry.at).format('LTS')} · captured: ${callbackOutcome(capturedResponses[index])}`
                                            : `Callback ${index + 1}`;
                                    return (
                                        <Tooltip key={index} title={tooltip}>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                {isRetrying && <CircularProgress size={12} />}
                                                <StatusChip
                                                    code={cr.Code}
                                                    forceError={!!cr.Error}
                                                    label={`${retry ? '↻ ' : ''}${callbackOutcome(cr)}`}
                                                />
                                            </Box>
                                        </Tooltip>
                                    );
                                })}
                            </Box>
                        </Box>

                        <Collapse in={callbacksOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ marginTop: 1 }}>
                                {callbackResponses.map((callbackResponse, index) => (
                                    <CallbackResponseView
                                        key={index}
                                        callbackResponse={callbackResponse}
                                        index={index}
                                        requestId={request.ID}
                                        onRetry={() => handleRetryCallback(index)}
                                        isRetrying={retryingIndex === index}
                                        retry={retries[index]}
                                        retryError={retryErrors[index]}
                                        onDismissRetryError={() => dismissRetryError(index)}
                                    />
                                ))}
                            </Box>
                        </Collapse>
                    </>
                )}

                <BodyView data={request.Body} />
            </CardContent>
        </Card >
    );
};

export default RequestDetail;
