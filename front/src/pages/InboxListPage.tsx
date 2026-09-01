import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Box, Alert } from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import SearchOffIcon from '@mui/icons-material/SearchOff';
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
            <Container sx={{ mt: 2 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 2 }}>
                <Alert variant="outlined" severity="error">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 2 }}>

            <Typography variant="h2" component="h1" fontSize={'2.5rem'} gutterBottom>
                Inbox List
            </Typography>

            <Box width="100%" display="flex" justifyContent="space-between">
                <CreateInboxButton variant="contained" color="primary" source="inbox-list-page" sx={{ marginBottom: 2 }}>
                    Create New Inbox
                </CreateInboxButton>
                <SearchBar onChange={handleSearch} />
            </Box>

            {(() => {
                const filteredInboxes = inboxes.filter((inbox) =>
                    inbox.ID.toLowerCase().includes(filter.toLowerCase()) ||
                    inbox.Name.toLowerCase().includes(filter.toLowerCase())
                );
                if (filteredInboxes.length === 0) {
                    return inboxes.length === 0 ? (
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            textAlign="center"
                            gap={1}
                            sx={{ py: 8, bgcolor: 'background.paper', border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 2 }}
                        >
                            <InboxIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                            <Typography color="text.secondary">
                                No inboxes yet &mdash; create one to get a live endpoint.
                            </Typography>
                        </Box>
                    ) : (
                        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={1} sx={{ py: 6 }}>
                            <SearchOffIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
                            <Typography color="text.secondary">
                                No inboxes match &ldquo;{filter}&rdquo;.
                            </Typography>
                        </Box>
                    );
                }
                return (
                    <Grid container spacing={2} alignItems="stretch">
                        {filteredInboxes.map((inbox) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={inbox.ID} sx={{ display: 'flex' }}>
                                <InboxListItem inbox={inbox} onDelete={handleDeleteInbox} />
                            </Grid>
                        ))}
                    </Grid>
                );
            })()}
        </Container >
    );
};

export default InboxListPage;