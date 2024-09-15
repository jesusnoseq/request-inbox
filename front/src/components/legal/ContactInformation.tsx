import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import ExternalLink from '../../components/ExternalLink';

const ContactInformation: React.FC = () => {
    return (<List>
        <ListItem>
            <ListItemText primary="By X (Formerly Twitter): " secondary={
                <ExternalLink href='https://x.com/Jesusnoseq'>@jesusnoseq</ExternalLink>
            } />
        </ListItem>
        <ListItem>
            <ListItemText primary="By Linkedin: " secondary={
                <ExternalLink href='https://www.linkedin.com/in/jesusnoseq/'>@jesusnoseq</ExternalLink>
            } />
        </ListItem>
    </List>
    );
}

export default ContactInformation;