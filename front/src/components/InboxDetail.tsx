import React from 'react';
import { Inbox } from '../types/inbox';
import { Typography, Paper, List, ListItem, Divider } from '@mui/material';
import moment from 'moment';

type InboxDetailProps = {
    inbox: Inbox;
};

const InboxDetail: React.FC<InboxDetailProps> = ({ inbox }) => {
    return (
        <Paper sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Inbox Details
            </Typography>
            <Typography variant="h6">ID: {inbox.ID}</Typography>
            <Typography color="textSecondary">
                Created: {moment(inbox.Timestamp).format('LLL')}
            </Typography>
            {/* Additional details such as ObfuscateHeaderFields could be displayed here */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Requests</Typography>
            <List>
                {inbox.Requests.map((request, index) =>
                    <ListItem key={request.ID} divider={index !== inbox.Requests.length - 1}>
                        {request.Path} ({moment(request.Timestamp).fromNow()})
                    </ListItem>
                )}
            </List>
        </Paper>
    );
};

export default InboxDetail;