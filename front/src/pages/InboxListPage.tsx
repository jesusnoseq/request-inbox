import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Button } from '@mui/material';

import { Inbox } from '../types/inbox';
import { getInboxList, newInbox } from '../services/inbox';
import InboxListItem from '../components/InboxListItem';

const InboxListPage: React.FC = () => {
    const [inboxes, setInboxes] = useState<Inbox[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const inboxListResponse = await getInboxList();
                setInboxes(inboxListResponse);
                setError(null);
            } catch (err) {
                setError('Failed to load inboxes');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateInbox = async () => {

        const fetchData = async () => {
            try {
                setLoading(true);
                const inbox = await newInbox();
                inboxes.push(inbox)
                setInboxes(inboxes);
                setError(null);
            } catch (err) {
                setError('Failed to load inboxes');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    };

    if (isLoading) {
        return (
            <Container>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Inbox List
            </Typography>
            <Button variant="contained" color="primary" onClick={handleCreateInbox} sx={{ marginBottom: 2 }}>
                Create New Inbox
            </Button>
            <Grid container spacing={2}>
                {inboxes.map((inbox) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={inbox.ID}>
                        <InboxListItem inbox={inbox} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default InboxListPage;