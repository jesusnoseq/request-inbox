import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid2, CircularProgress, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Inbox } from '../types/inbox';
import { getInboxList, deleteInbox } from '../services/inbox';
import InboxListItem from '../components/InboxListItem';
import SearchBar from '../components/SearchBar';
import CreateInboxButton from '../components/CreateNewInboxButton';

const InboxListPage: React.FC = () => {
    const [inboxes, setInboxes] = useState<Inbox[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("");
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

    const handleSearch = ((searchTerm: string) => {
        setFilter(searchTerm);
    });


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
                <Alert variant="outlined" severity="error">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container>

            <Typography variant="h2" fontSize={'2.5rem'} gutterBottom>
                Inbox List
            </Typography>

            <Box width="100%" display="flex" justifyContent="space-between">
                <CreateInboxButton variant="contained" color="primary" source="inbox-list-page" sx={{ marginBottom: 2 }}>
                    Create New Inbox
                </CreateInboxButton>
                <SearchBar onChange={handleSearch} />
            </Box>

            <Grid2 container spacing={2}>
                {inboxes.filter((inbox) => inbox.ID.includes(filter)).map((inbox) => (
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={inbox.ID}>
                        <InboxListItem inbox={inbox} onDelete={handleDeleteInbox} />
                    </Grid2>
                ))}
            </Grid2>
        </Container >
    );
};

export default InboxListPage;