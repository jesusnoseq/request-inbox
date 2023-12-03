import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Inbox } from '../types/inbox';
import Container from '@mui/material/Container';
import { Typography, Divider, Alert, Grid, Switch, Box, SvgIcon, Fab } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import RequestList from '../components/RequestList';
import { getInbox } from '../services/inbox';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InboxDetail from '../components/InboxDetail';
import UpdateIcon from '@mui/icons-material/Update';
import UpdateDisabledIcon from '@mui/icons-material/UpdateDisabled';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';


const InboxDetailPage: React.FC = () => {
    const { inboxId } = useParams<'inboxId'>();
    const [inbox, setInbox] = useState<Inbox | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoUpdate, setAutoUpdate] = useState(false);

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
                <Header />
                <Grid container spacing={0} justifyContent="center" alignItems="center" >
                    <CircularProgress />
                </Grid>
                <Footer />
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
                <Footer />
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


    return (
        <Container>
            <Header />
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
                        <Fab size="small" color="secondary" aria-label="go down" onClick={scrollToBottom}>
                            <ArrowDownwardIcon />
                        </Fab>
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
            <Footer />
        </Container >
    );
};

export default InboxDetailPage;