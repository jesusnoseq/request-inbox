import React, { useState } from 'react';
import { Inbox, InboxResponse } from '../types/inbox';
import { Typography, Paper, Box } from '@mui/material';
import moment from 'moment';
import HighlightURL from '../components/HighlightURL';
import { buildInboxURL, updateInbox } from '../services/inbox';
import ResponseInlineEditor from '../components/ResponseInlineEditor';
import TextInlineEditor from '../components/TextInlineEditor';
import InboxVisibilityToggle from '../components/InboxVisibilityToggle';
import { useUser } from '../context/UserContext';


type InboxDetailProps = {
    inbox: Inbox;
};


const InboxDetail: React.FC<InboxDetailProps> = (props) => {
    const { isLoggedIn } = useUser();
    const [inbox, setInbox] = useState<Inbox>(props.inbox);
    const inboxURL = buildInboxURL(props.inbox.ID);

    const handleSaveInboxName = async (name: string) => {
        const updatedInbox = {
            ...inbox,
            Name: name
        };
        const resp = await updateInbox(updatedInbox)
        setInbox(resp);
    }

    const handleSaveResponse = async (ir: InboxResponse) => {
        const updatedInbox = {
            ...inbox,
            Response: ir
        };
        const resp = await updateInbox(updatedInbox)
        setInbox(resp);
    };

    const handleSaveIsPublic = async (isPublic: boolean) => {
        const updatedInbox = {
            ...inbox,
            IsPrivate: !isPublic
        };
        const resp = await updateInbox(updatedInbox)
        setInbox(resp);
    }

    return (
        <Paper sx={{ padding: 2 }}>
            <TextInlineEditor initialValue={inbox.Name} label='Inbox' onSave={handleSaveInboxName} />
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mb={2}
            >
                <Typography color="textSecondary">
                    Open since {moment(inbox.Timestamp).format('LLL')}
                </Typography>
                {isLoggedIn() &&
                    <InboxVisibilityToggle defaultPublic={!inbox.IsPrivate} onChange={handleSaveIsPublic} />
                }
            </Box>
            <HighlightURL url={inboxURL} />

            <ResponseInlineEditor response={inbox.Response} onSave={handleSaveResponse} />
        </Paper>
    );
};

export default InboxDetail;