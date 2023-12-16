import React, { useState } from 'react';
import { InboxRequest } from '../types/inbox';
import { Typography, Card, CardContent, Button, List, ListItem, ListItemText, Collapse, Box } from '@mui/material';
import moment from 'moment';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import BodyView from './BodyView';

type RequestDetailProps = {
    request: InboxRequest;
};

const RequestDetail: React.FC<RequestDetailProps> = ({ request }) => {
    const headerEntries: [string, string][] = Object.entries(request.Headers);
    const [open, setOpen] = useState<boolean>(false);

    const handleCollapse = () => {
        setOpen(!open);
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
                    {moment(request.Timestamp).format('LLL')}
                </Typography>
                <Typography variant="h6">
                    <code>{request.Protocol} {request.Method} </code>
                    <Box component="code"
                        sx={{
                            opacity: '0.5',
                            fontSize: '1rem',
                            letterSpacing: '-0.5px',
                        }}>{URIDefaulPath}</Box>
                    <code>{URICustomPath}</code>
                </Typography>


                <Typography>
                    <Button onClick={handleCollapse}>
                        <Typography>Show headers</Typography>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </Button>
                </Typography>

                <Collapse in={open} timeout="auto" unmountOnExit>
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
                <BodyView data={request.Body} />
            </CardContent>
        </Card >
    );
};

export default RequestDetail;
