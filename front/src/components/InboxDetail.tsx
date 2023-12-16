import React, { useState } from 'react';
import { Inbox, InboxResponse } from '../types/inbox';
import { Typography, Paper } from '@mui/material';
import moment from 'moment';
import HighlightURL from '../components/HighlightURL';
import { buildInboxURL, UpdateInbox } from '../services/inbox';
import ResponseInlineEditor from '../components/ResponseInlineEditor';
import TextInlineEditor from '../components/TextInlineEditor';


type InboxDetailProps = {
    inbox: Inbox;
};


const InboxDetail: React.FC<InboxDetailProps> = (props) => {
    const [inbox, setInbox] = useState<Inbox>(props.inbox);
    const inboxURL = buildInboxURL(props.inbox.ID);

    const handleSaveInboxName = async (name: string) => {
        const updatedInbox = {
            ...inbox,
            Name: name
        };
        const resp = await UpdateInbox(updatedInbox)
        setInbox(resp);
    }

    const handleSaveResponse = async (ir: InboxResponse) => {
        const updatedInbox = {
            ...inbox,
            Response: ir
        };
        const resp = await UpdateInbox(updatedInbox)
        setInbox(resp);
    };

    return (
        <Paper sx={{ padding: 2 }}>
            <TextInlineEditor initialValue={inbox.Name} label='Inbox' onSave={handleSaveInboxName} />

            <Typography color="textSecondary">
                Open since {moment(inbox.Timestamp).format('LLL')}
            </Typography>
            <HighlightURL url={inboxURL} />

            <ResponseInlineEditor response={inbox.Response} onSave={handleSaveResponse} />
        </Paper>
    );
};

export default InboxDetail;