import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Inbox } from '../types/inbox';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import RequestList from '../components/RequestList';
import { getInbox } from '../services/inbox';

const InboxDetailPage: React.FC = () => {
    const { inboxId } = useParams<'inboxId'>();
    const [inbox, setInbox] = useState<Inbox | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInboxDetail = async () => {
            console.log(inboxId);
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
            {inbox && (
                <>
                    <Typography variant="h4" gutterBottom>
                        Inbox ID: {inbox.ID}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        {`Created at ${new Date(inbox.Timestamp).toLocaleString()}`}
                    </Typography>
                    {/* ...Additional inbox details */}
                    {inbox.Requests && inbox.Requests.length > 0 ? (
                        <RequestList requests={inbox.Requests} />
                    ) : (
                        <Typography>No requests found for this inbox.</Typography>
                    )}
                </>
            )}
        </Container>
    );
};

export default InboxDetailPage;