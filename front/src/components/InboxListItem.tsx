import React from 'react';
import { Inbox } from '../types/inbox';
import { Card, CardContent, Typography, CardActions, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

type InboxListItemProps = {
    inbox: Inbox;
    onDelete: (id: string) => void;
};

const InboxListItem: React.FC<InboxListItemProps> = ({ inbox, onDelete }) => {
    const navigate = useNavigate();
    // const requestsCount = Array.isArray(inbox.Requests) ? inbox.Requests.length : 0;

    const handleClick = () => {
        navigate(`/inbox/${inbox.ID}`);
    };

    return (
        <Card variant="outlined" sx={{ marginBottom: 2 }}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {inbox.ID}
                </Typography>
                {inbox.Name !== inbox.ID &&
                    <Typography variant="h3" fontSize={'2rem'} sx={{
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word'
                    }}>
                        {inbox.Name}
                    </Typography>
                }

                {/* <Typography color="">
                    Requests: {requestsCount}
                </Typography> */}
                <Typography color="textSecondary">
                    Last Updated: {moment(inbox.Timestamp).fromNow()}
                </Typography>
                <Typography component="p">
                    Response Code: {inbox.Response.Code}
                </Typography>
            </CardContent>
            <CardActions>
                <Box width="100%" display="flex" justifyContent="space-between">
                    <Button size="small" onClick={handleClick} >Open</Button>
                    <IconButton size="small" onClick={() => onDelete(inbox.ID)} aria-label="delete">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </CardActions>
        </Card >
    );
};

export default InboxListItem;