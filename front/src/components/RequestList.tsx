import React from 'react';
import { InboxRequest } from '../types/inbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CopyToClipboardButton from './CopyToClipboardButton';

type Props = {
    requests: InboxRequest[];
};

const RequestList: React.FC<Props> = ({ requests }) => {
    return (
        <List>
            {requests.map((request, index) => (
                <React.Fragment key={request.ID}>
                    <ListItem alignItems="flex-start">
                        <ListItemText
                            primary={`Request ID: ${request.ID}`}
                            secondary={`Path: ${request.Path}`}
                        />
                        <CopyToClipboardButton textToCopy={request.Body} />
                    </ListItem>
                    {index < requests.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
            ))}
        </List>
    );
};

export default RequestList;