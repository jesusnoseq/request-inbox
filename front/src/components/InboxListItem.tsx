import React from 'react';
import { Inbox } from '../types/inbox';
import { Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

type InboxListItemProps = {
    inbox: Inbox;
};

const InboxListItem: React.FC<InboxListItemProps> = ({ inbox }) => {
    const navigate = useNavigate();
    const requestsCount = Array.isArray(inbox.Requests) ? inbox.Requests.length : 0;

    const handleClick = () => {
        navigate(`/inbox/${inbox.ID}`);
    };

    return (
        <Card variant="outlined" onClick={handleClick} sx={{ marginBottom: 2 }}>
            <CardActionArea>
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                        ID: {inbox.ID}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        Requests: {requestsCount}
                    </Typography>
                    <Typography color="textSecondary">
                        Last Updated: {moment(inbox.Timestamp).fromNow()}
                    </Typography>
                    <Typography component="p">
                        Response Code: {inbox.Response.Code}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default InboxListItem;