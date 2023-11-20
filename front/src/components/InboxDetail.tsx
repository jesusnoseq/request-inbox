import React from 'react';
import { Inbox } from '../types/inbox';
import { Typography, Paper, List, ListItem, Divider } from '@mui/material';
import moment from 'moment';
import CopyToClipboardButton from '../components/CopyToClipboardButton';
import { buildInboxURL } from '../services/inbox';

type InboxDetailProps = {
    inbox: Inbox;
};


const InboxDetail: React.FC<InboxDetailProps> = ({ inbox }) => {
    const inboxURL = buildInboxURL(inbox.ID);
    const headerEntries: [string, string][] = Object.entries(inbox.Response.Headers);
    return (
        <Paper sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Inbox  {inbox.ID}
            </Typography>
            <Typography color="textSecondary" variant="body1" gutterBottom>
                <a href={inboxURL} target='_blank' rel='noreferrer'>{inboxURL}</a>
                <CopyToClipboardButton textToCopy={inboxURL} tooltipTitle="Copy inbox URL" />
            </Typography>

            <Typography color="textSecondary">
                Created: {moment(inbox.Timestamp).format('LLL')}
            </Typography>
            <Typography color="textSecondary">
                {
                    headerEntries.map((k) => (
                        <li>
                            {k[0]}: {k[1]}
                        </li>
                    ))
                }
            </Typography>
            <Typography color="textSecondary">
                Response: {inbox.Response.Body}
            </Typography>
            <Typography color="textSecondary">
                Status code: {inbox.Response.Code}
            </Typography>
            <Typography color="textSecondary">
                Obfuscate headers: {inbox.ObfuscateHeaderFields}
            </Typography>

            {/* Additional details such as ObfuscateHeaderFields could be displayed here */}
            {/* <Typography variant="h6">Requests</Typography>
            {inbox.Requests && inbox.Requests.length > 0 ? (
                <List>
                    {inbox.Requests.map((request, index) =>
                        <ListItem key={request.ID} divider={index !== inbox.Requests.length - 1}>
                            {request.Path} ({moment(request.Timestamp).fromNow()})
                        </ListItem>
                    )}
                </List>
            ) : (
                <Typography>No requests found for this inbox.</Typography>
            )} */}

        </Paper>
    );
};

export default InboxDetail;