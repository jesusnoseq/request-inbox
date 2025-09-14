import React, { useState } from 'react';
import { Inbox, InboxResponse, InboxCallback } from '../types/inbox';
import { Typography, Paper, Box, Alert, Snackbar } from '@mui/material';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import HighlightURL from '../components/HighlightURL';
import { buildInboxURL, updateInbox } from '../services/inbox';
import ResponseInlineEditor from '../components/ResponseInlineEditor';
import TextInlineEditor from '../components/TextInlineEditor';
import InboxVisibilityToggle from '../components/InboxVisibilityToggle';
import CallbackManager from '../components/CallbackManager';
import { useUser } from '../context/UserContext';

dayjs.extend(localizedFormat);

type InboxDetailProps = {
    inbox: Inbox;
};


const InboxDetail: React.FC<InboxDetailProps> = (props) => {
    const { isLoggedIn, user } = useUser();
    const [inbox, setInbox] = useState<Inbox>(props.inbox);
    const [error, setError] = useState<string | null>(null);
    const inboxURL = buildInboxURL(props.inbox.ID);

    const handleSaveInboxName = async (name: string) => {
        try {
            setError(null);
            const updatedInbox = {
                ...inbox,
                Name: name
            };
            const resp = await updateInbox(updatedInbox);
            setInbox(resp);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update inbox name');
        }
    }

    const handleSaveResponse = async (ir: InboxResponse) => {
        try {
            setError(null);
            const updatedInbox = {
                ...inbox,
                Response: ir
            };
            const resp = await updateInbox(updatedInbox);
            setInbox(resp);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update response');
        }
    };

    const handleSaveIsPublic = async (isPublic: boolean) => {
        try {
            setError(null);
            const updatedInbox = {
                ...inbox,
                IsPrivate: !isPublic
            };
            const resp = await updateInbox(updatedInbox);
            setInbox(resp);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update visibility');
        }
    }

    const handleSaveCallbacks = async (callbacks: InboxCallback[]) => {
        try {
            setError(null);
            const updatedInbox = {
                ...inbox,
                Callbacks: callbacks
            };
            const resp = await updateInbox(updatedInbox);
            setInbox(resp);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update callbacks');
            throw err; // Re-throw the error so the callback form can handle it
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    const canEdit = inbox.OwnerID === '00000000-0000-0000-0000-000000000000' || (isLoggedIn() && inbox.OwnerID === user.ID)
    const canChangeVisibility = isLoggedIn() && inbox.OwnerID === user.ID

    return (
        <>
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

                <CallbackManager 
                    callbacks={inbox.Callbacks || []} 
                    onCallbacksChange={handleSaveCallbacks} 
                    readonly={!canEdit} 
                />
            </Paper>

            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseError} 
                    severity="error" 
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};

export default InboxDetail;