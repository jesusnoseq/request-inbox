import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Inbox } from '../types/inbox';
import Container from '@mui/material/Container';
import { Typography, Divider, Alert, Grid, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import RequestList from '../components/RequestList';
import { getInbox, deleteInboxRequests } from '../services/inbox';
import InboxDetail from '../components/InboxDetail';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import SignUpButton from '../components/SignUpButton';
import { useUser } from '../context/UserContext';

const InboxDetailPage: React.FC = () => {
    const { inboxId } = useParams<'inboxId'>();
    const [inbox, setInbox] = useState<Inbox | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoUpdateError, setAutoUpdateError] = useState<string | null>(null);
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const { isLoggedIn } = useUser();

    useEffect(() => {
        const fetchInboxDetail = async () => {
            if (inboxId) {
                try {
                    setLoading(true);
                    setError(null);
                    const data = await getInbox(inboxId);
                    setInbox(data);
                } catch (e) {
                    setError('Could not fetch inbox.');
                } finally {
                    setLoading(false);
                }
            } else {
                setError('Inbox ID is not specified.');
                setLoading(false);
            }
        };
        fetchInboxDetail();
    }, [inboxId]);


    useEffect(() => {
        const fetchInboxRequests = async () => {
            if (inboxId && !isLoading && !error) {
                try {
                    const data = await getInbox(inboxId);
                    setInbox(data);
                    setAutoUpdateError(null);
                } catch (e) {
                    console.error('Error fetching inbox updates:', e);
                    setAutoUpdateError('Auto-update failed. Updates have been paused.');
                    setAutoUpdate(false);
                }
            }
        };
        const intervalId = autoUpdate ? setInterval(() => {
            fetchInboxRequests();
        }, 2000) : undefined;
        return () => clearInterval(intervalId);
    }, [inboxId, isLoading, error, autoUpdate])

    if (isLoading) {
        return (
            <Container sx={{ mt: 2 }}>
                <Grid container spacing={0} justifyContent="center" alignItems="center" >
                    <CircularProgress />
                </Grid>
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

    const openDeleteRequestsDialog = () => {
        setConfirmDialogOpen(true);
    };

    const onDeleteRequestsConfirm = async () => {
        setConfirmDialogOpen(false);
        if (!inboxId) {
            return;
        }
        setLoading(true);
        const ok = await deleteInboxRequests(inboxId);
        if (ok) {
            const updatedInbox = {
                ...inbox,
                Requests: []
            };
            setInbox(updatedInbox as Inbox);
        } else {
            setError("Error deleting inbox requests");
        }
        setLoading(false);
    };

    const handleCloseDeleteRequestsDialog = () => {
        setConfirmDialogOpen(false);
    };

    return (
        <Container sx={{ mt: 2 }}>
            {!isLoggedIn() && (
                <Alert 
                    severity="info" 
                    sx={{ mb: 2, mt: 2 }}
                    action={
                        <SignUpButton variant="outlined" size="small" />
                    }
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        Create Your Free Account
                    </Typography>
                    <Typography variant="body2">
                        List all your inboxes · Generate API keys · Enjoy higher limits · Keep inboxes permanently
                    </Typography>
                </Alert>
            )}
            {autoUpdateError && (
                <Alert severity="warning" onClose={() => setAutoUpdateError(null)} sx={{ mb: 2 }}>
                    {autoUpdateError}
                </Alert>
            )}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCloseDeleteRequestsDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">
                    Delete Requests Confirmation
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete all requests?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteRequestsDialog}>Cancel</Button>
                    <Button onClick={onDeleteRequestsConfirm}>Delete</Button>
                </DialogActions>
            </Dialog>
            {inbox && (
                <><InboxDetail inbox={inbox} />
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ my: 1.5 }}>
                        <Box
                            onClick={() => setAutoUpdate(!autoUpdate)}
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: autoUpdate ? 'success.main' : 'action.disabled',
                                    '@keyframes livePulse': {
                                        '0%': { boxShadow: '0 0 0 0 rgba(46,125,50,0.45)' },
                                        '70%': { boxShadow: '0 0 0 6px rgba(46,125,50,0)' },
                                        '100%': { boxShadow: '0 0 0 0 rgba(46,125,50,0)' },
                                    },
                                    animation: autoUpdate ? 'livePulse 2s infinite' : 'none',
                                }}
                            />
                            <Typography variant="body2" sx={{ color: autoUpdate ? 'success.main' : 'text.secondary', fontWeight: 500 }}>
                                {autoUpdate ? 'Live — auto-refreshing' : 'Auto-refresh paused'}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<DeleteSweepIcon />}
                                onClick={openDeleteRequestsDialog}
                                sx={(theme) => theme.palette.mode === 'dark' ? {
                                    color: '#ef9a9a',
                                    borderColor: 'rgba(244,67,54,0.4)',
                                    '&:hover': {
                                        borderColor: 'rgba(244,67,54,0.6)',
                                        bgcolor: 'rgba(244,67,54,0.08)',
                                    },
                                } : {}}
                            >
                                Clear requests
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                href="#bottom-anchor"
                                startIcon={<ArrowDownwardIcon />}
                            >
                                Jump to latest
                            </Button>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <RequestList requests={inbox.Requests || []} />
                </>
            )
            }
        </Container >
    );
};

export default InboxDetailPage;