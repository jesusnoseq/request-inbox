import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Inbox } from '../types/inbox';
import Container from '@mui/material/Container';
import { Typography, Divider, Alert, Grid, Switch, Box, SvgIcon, Fab } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import RequestList from '../components/RequestList';
import { getInbox, deleteInboxRequests } from '../services/inbox';
import InboxDetail from '../components/InboxDetail';
import UpdateIcon from '@mui/icons-material/Update';
import UpdateDisabledIcon from '@mui/icons-material/UpdateDisabled';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

const InboxDetailPage: React.FC = () => {
    const { inboxId } = useParams<'inboxId'>();
    const [inbox, setInbox] = useState<Inbox | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoUpdate, setAutoUpdate] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

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
                const data = await getInbox(inboxId);
                setInbox(data);
            }
        };
        const intervalId = autoUpdate ? setInterval(() => {
            fetchInboxRequests();
        }, 2000) : undefined;
        return () => clearInterval(intervalId);
    }, [inboxId, inbox, isLoading, error, autoUpdate])

    if (isLoading) {
        return (
            <Container>
                <Grid container spacing={0} justifyContent="center" alignItems="center" >
                    <CircularProgress />
                </Grid>
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

    const iconStyle = {
        borderRadius: '50%',
        backgroundColor: "#eee",
        color: "#ce93d8"
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight || document.body.scrollHeight,
            behavior: 'smooth',
        });
    };

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
        <Container>
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
                    <Box margin={1} padding={1} width="100%" display="flex" justifyContent="space-between">
                        <Switch
                            color="secondary"
                            checked={autoUpdate}
                            onChange={() => setAutoUpdate(!autoUpdate)}
                            icon={<SvgIcon style={iconStyle}><UpdateDisabledIcon /></SvgIcon>}
                            checkedIcon={<SvgIcon style={iconStyle}><UpdateIcon /></SvgIcon>}
                        />
                        <Tooltip title="Delete All Request">
                            <Fab size="small" color="secondary" aria-label="Delete requests" onClick={openDeleteRequestsDialog}
                                style={{ marginLeft: 'auto', marginRight: '20px' }}>
                                <DeleteSweepIcon />
                            </Fab>
                        </Tooltip>
                        <Tooltip title="Go Down">
                            <Fab size="small" color="secondary" aria-label="go down" onClick={scrollToBottom} >
                                <ArrowDownwardIcon />
                            </Fab>
                        </Tooltip>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    {inbox.Requests && inbox.Requests.length > 0 ? (
                        <RequestList requests={inbox.Requests} />
                    ) : (
                        <Typography>No requests found for this inbox.</Typography>
                    )}
                </>
            )
            }
        </Container >
    );
};

export default InboxDetailPage;