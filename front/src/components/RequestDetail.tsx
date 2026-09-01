import React, { useState } from 'react';
import { InboxRequest } from '../types/inbox';
import { Typography, Card, CardContent, Button, Chip, List, ListItem, ListItemText, Collapse, Box } from '@mui/material';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import BodyView from './BodyView';
import CallbackResponseView from './callback/CallbackResponseView';
import MethodChip from './MethodChip';
import { monoFontFamily } from '../theme';

dayjs.extend(localizedFormat);

type RequestDetailProps = {
    request: InboxRequest;
};

const callbackChipColor = (error: string, code: number): 'success' | 'warning' | 'error' | 'default' => {
    if (error) return 'error';
    if (code >= 500) return 'error';
    if (code >= 400) return 'warning';
    if (code >= 200 && code < 400) return 'success';
    return 'default';
};

const RequestDetail: React.FC<RequestDetailProps> = ({ request }) => {
    const headerEntries: [string, string][] = Object.entries(request.Headers);
    const [headersOpen, setHeadersOpen] = useState<boolean>(false);
    const [callbacksOpen, setCallbacksOpen] = useState<boolean>(false);
    const callbackResponses = request.CallbackResponses || [];

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

    return (
        <Card variant="outlined" sx={{ marginBottom: 2 }}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    Nº {request.ID + 1}<br />
                    {dayjs(request.Timestamp).format('LLL')}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={callbackResponses.length > 0 ? 1 : 0}>
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

                {/* At-a-glance callback outcomes, visible without expanding */}
                {callbackResponses.length > 0 && (
                    <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap" mb={1}>
                        {callbackResponses.map((cr, index) => (
                            <Chip
                                key={index}
                                size="small"
                                color={callbackChipColor(cr.Error, cr.Code)}
                                label={cr.Error ? 'Failed' : `${cr.Method || 'POST'} ${cr.Code}`}
                                sx={{ fontFamily: monoFontFamily, fontSize: '0.7rem' }}
                            />
                        ))}
                    </Box>
                )}

                <Typography>
                    <Button onClick={handleHeadersCollapse}>
                        <Typography>Show headers</Typography>
                        {headersOpen ? <ExpandLess /> : <ExpandMore />}
                    </Button>
                </Typography>

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
                        <Typography sx={{ marginTop: 2 }}>
                            <Button onClick={handleCallbacksCollapse}>
                                <Typography>Show callback results ({callbackResponses.length})</Typography>
                                {callbacksOpen ? <ExpandLess /> : <ExpandMore />}
                            </Button>
                        </Typography>

                        <Collapse in={callbacksOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ marginTop: 1 }}>
                                {callbackResponses.map((callbackResponse, index) => (
                                    <CallbackResponseView
                                        key={index}
                                        callbackResponse={callbackResponse}
                                        index={index}
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
