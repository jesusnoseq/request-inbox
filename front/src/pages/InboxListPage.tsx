import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Inbox } from '../types/inbox';
import { getInboxList, newInbox, deleteInbox } from '../services/inbox';
import InboxListItem from '../components/InboxListItem';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';

const InboxListPage: React.FC = () => {
    const [inboxes, setInboxes] = useState<Inbox[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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
                navigate(`inbox/${inbox.ID}`);
            } catch (err) {
                setError('Failed to load inboxes');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    };

    const handleDeleteInbox = async (inboxID: string) => {
        const deleteData = async () => {
            try {
                setLoading(true);
                await deleteInbox(inboxID);
                const updatedInboxes = inboxes.filter((inbox) => {
                    return inbox.ID !== inboxID;
                });
                setInboxes(updatedInboxes);
                setError(null);
            } catch (err) {
                setError('Failed to delete inbox');
            } finally {
                setLoading(false);
            }
        };

        deleteData();
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
                <Header />
                <Alert variant="outlined" severity="error">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container>
            <Header />
            <Typography variant="h4" gutterBottom>
                Inbox List
            </Typography>

            <Box width="100%" display="flex" justifyContent="space-between">
                <Button variant="contained" color="primary" onClick={handleCreateInbox} sx={{ marginBottom: 2 }}>
                    Create New Inbox
                </Button>

                <SearchBar />
            </Box>

            <Grid container spacing={2}>
                {inboxes.map((inbox) => (
                    <Grid item xs={12} sm={6} md={4} lg={4} key={inbox.ID}>
                        <InboxListItem inbox={inbox} onDelete={handleDeleteInbox} />
                    </Grid>

                ))}
            </Grid>
            <Footer />
        </Container >
    );
};

export default InboxListPage;