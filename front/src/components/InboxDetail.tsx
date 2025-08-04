import React, { useState } from 'react';
import { Inbox, InboxResponse } from '../types/inbox';
import { Typography, Paper, Box } from '@mui/material';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import HighlightURL from '../components/HighlightURL';
import { buildInboxURL, updateInbox } from '../services/inbox';
import ResponseInlineEditor from '../components/ResponseInlineEditor';
import TextInlineEditor from '../components/TextInlineEditor';
import InboxVisibilityToggle from '../components/InboxVisibilityToggle';
import { useUser } from '../context/UserContext';

dayjs.extend(localizedFormat);

type InboxDetailProps = {
    inbox: Inbox;
};


const InboxDetail: React.FC<InboxDetailProps> = (props) => {
    const { isLoggedIn, user } = useUser();
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

    const canEdit = inbox.OwnerID === '00000000-0000-0000-0000-000000000000' || (isLoggedIn() && user && inbox.OwnerID === user.ID)
    const canChangeVisibility = isLoggedIn() && user && inbox.OwnerID === user.ID

    return (
        <Paper sx={{ padding: 2 }}>
            <TextInlineEditor initialValue={inbox.Name} label='Inbox' onSave={handleSaveInboxName} readonly={!canEdit} />
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mb={2}
            >
                <Typography color="textSecondary">
                    Open since {dayjs(inbox.Timestamp).format('LLL')}
                </Typography>
                {canChangeVisibility &&
                    <InboxVisibilityToggle defaultPublic={!inbox.IsPrivate} onChange={handleSaveIsPublic} />
                }
            </Box>
            <HighlightURL url={inboxURL} />

            <ResponseInlineEditor response={inbox.Response} onSave={handleSaveResponse} readonly={!canEdit} />
        </Paper>
    );
};

export default InboxDetail;