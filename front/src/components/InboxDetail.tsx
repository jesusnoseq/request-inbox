import React from 'react';
import { Inbox } from '../types/inbox';
import { Typography, Paper } from '@mui/material';
import moment from 'moment';
import HighlightURL from '../components/HighlightURL';
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
                Inbox  {inbox.Name}
            </Typography>
            <HighlightURL url={inboxURL} />

            <Typography color="textSecondary">
                Open since {moment(inbox.Timestamp).format('LLL')}
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
        </Paper>
    );
};

export default InboxDetail;