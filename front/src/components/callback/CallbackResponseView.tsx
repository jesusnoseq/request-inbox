import React, { useState } from 'react';
import {
    Alert,
    AlertColor,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Collapse,
    CircularProgress,
    Tooltip
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ReplayIcon from '@mui/icons-material/Replay';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { CallbackResponse } from '../../types/inbox';
import BodyView from '../BodyView';

dayjs.extend(localizedFormat);

export type CallbackRetry = {
    /** Response of the last retry, shown in place of the captured one. */
    response: CallbackResponse;
    /** When that retry finished. */
    at: number;
    attempts: number;
};

/** How the last retry of this callback ended, as shown inside its own box. */
const retryOutcome = (retry: CallbackRetry): { severity: AlertColor, message: string } => {
    const when = dayjs(retry.at).format('LTS');
    const attempts = retry.attempts > 1 ? ` · ${retry.attempts} retries` : '';
    if (retry.response.Error) {
        return {
            severity: 'error',
            message: `Retried at ${when}${attempts} · no response: ${retry.response.Error}`,
        };
    }
    return {
        severity: retry.response.Code >= 400 ? 'warning' : 'success',
        message: `Retried at ${when}${attempts} · the destination answered ${retry.response.Code}`,
    };
};

type CallbackResponseViewProps = {
    callbackResponse: CallbackResponse;
    index: number;
    /** Sends the callback again. Omitted when the callback can not be retried. */
    onRetry?: () => void;
    isRetrying?: boolean;
    /** Set once this callback has been retried, so the shown response is not the captured one. */
    retry?: CallbackRetry;
    /** Why the last retry could not be sent at all, if that happened. */
    retryError?: string;
    onDismissRetryError?: () => void;
};

const CallbackResponseView: React.FC<CallbackResponseViewProps> = ({
    callbackResponse,
    index,
    onRetry,
    isRetrying = false,
    retry,
    retryError,
    onDismissRetryError
}) => {
    const [headersOpen, setHeadersOpen] = useState<boolean>(false);
    
    const handleHeadersToggle = () => {
        setHeadersOpen(!headersOpen);
    };

    const hasHeaders = callbackResponse.Headers && Object.keys(callbackResponse.Headers).length > 0;
    const outcome = retry && retryOutcome(retry);

    return (
        <Card
            variant="outlined"
            role="group"
            aria-label={`Callback ${index + 1}`}
            sx={{ marginBottom: 1, marginLeft: 2 }}
        >
            <CardContent sx={{ paddingBottom: '16px !important' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Callback {index + 1}
                    </Typography>
                    {onRetry && (
                        <Tooltip title="Send this callback again using the captured request">
                            <span>
                                <Button
                                    size="small"
                                    startIcon={isRetrying
                                        ? <CircularProgress size={14} color="inherit" />
                                        : <ReplayIcon fontSize="small" />}
                                    onClick={onRetry}
                                    disabled={isRetrying}
                                    sx={{ textTransform: 'none', flexShrink: 0 }}
                                >
                                    {isRetrying ? 'Retrying…' : 'Retry'}
                                </Button>
                            </span>
                        </Tooltip>
                    )}
                </Box>

                {isRetrying && (
                    <Alert
                        severity="info"
                        icon={<CircularProgress size={14} />}
                        sx={{ marginTop: 0.5, marginBottom: 1, paddingY: 0 }}
                    >
                        Sending the callback again…
                    </Alert>
                )}

                {retryError && (
                    <Alert
                        severity="error"
                        onClose={onDismissRetryError}
                        sx={{ marginTop: 0.5, marginBottom: 1, paddingY: 0 }}
                    >
                        Could not be retried: {retryError}
                    </Alert>
                )}

                {!isRetrying && outcome && (
                    <Alert severity={outcome.severity} sx={{ marginTop: 0.5, marginBottom: 1, paddingY: 0 }}>
                        {outcome.message}
                        <Typography variant="caption" component="div" color="textSecondary">
                            This is the response of the retry. The captured one is kept in the inbox.
                        </Typography>
                    </Alert>
                )}

                {callbackResponse.URL && (
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                        <strong>URL:</strong>{' '}
                        <Typography 
                            component="a" 
                            href={callbackResponse.URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ 
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            {callbackResponse.URL}
                        </Typography>
                    </Typography>
                )}
                
                {callbackResponse.Method && (
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                        <strong>Method:</strong> {callbackResponse.Method}
                    </Typography>
                )}
                
                {callbackResponse.Error && (
                    <Typography variant="body2" sx={{ 
                        marginBottom: 1, 
                        color: 'error.main',
                        padding: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'error.main'
                    }}>
                        <strong>Error:</strong> {callbackResponse.Error}
                    </Typography>
                )}
                
                {callbackResponse.Code !== 0 && (
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                        <strong>Status Code:</strong> {callbackResponse.Code}
                    </Typography>
                )}
                
                {hasHeaders && (
                    <>
                        <Typography sx={{ marginBottom: 1 }}>
                            <Button 
                                onClick={handleHeadersToggle}
                                size="small"
                                sx={{ textTransform: 'none', padding: '4px 8px', minWidth: 'auto' }}
                            >
                                <Typography variant="body2">
                                    Show headers ({Object.keys(callbackResponse.Headers).length})
                                </Typography>
                                {headersOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                            </Button>
                        </Typography>

                        <Collapse in={headersOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ marginBottom: 1 }}>
                                <List dense sx={{ paddingTop: 0, paddingBottom: 0 }}>
                                    {Object.entries(callbackResponse.Headers).map(([key, value], headerIndex) => (
                                        <ListItem key={headerIndex} sx={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 1 }}>
                                            <ListItemText 
                                                primary={key} 
                                                secondary={value}
                                                slotProps={{
                                                    primary: { 
                                                        variant: 'caption', 
                                                        fontWeight: 'bold',
                                                        sx: { fontSize: '0.75rem' }
                                                    },
                                                    secondary: { 
                                                        variant: 'caption',
                                                        sx: { fontSize: '0.75rem' }
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Collapse>
                    </>
                )}
                
                {callbackResponse.Body && (
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
                            Response Body:
                        </Typography>
                        <BodyView data={callbackResponse.Body} />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default CallbackResponseView;
