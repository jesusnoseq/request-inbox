import React from 'react';
import { InboxRequest } from '../types/inbox';
import { Typography, Card, CardContent } from '@mui/material';
import moment from 'moment';

type RequestDetailProps = {
    request: InboxRequest;
};

const RequestDetail: React.FC<RequestDetailProps> = ({ request }) => {
    return (
        <Card variant="outlined" sx={{ marginBottom: 2 }}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    ID: {request.ID}
                </Typography>
                <Typography variant="h6">
                    Path: {request.Path}
                </Typography>
                <Typography color="textSecondary">
                    Timestamp: {moment(request.Timestamp).format('LLL')}
                </Typography>
                {/* Here you can list headers, Body, etc., perhaps with a toggle to show/hide details */}
            </CardContent>
        </Card>
    );
};

export default RequestDetail;