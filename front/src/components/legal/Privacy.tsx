import React from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import ContactInformation from './ContactInformation';


const PrivacyPolicy: React.FC = () => {
    return (
        <Container>
            <Typography variant="h2" gutterBottom>
                Privacy Policy for Request Inbox
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Last updated: september 15, 2024
            </Typography>

            <Typography variant="h4" gutterBottom>
                1. Introduction
            </Typography>
            <Typography paragraph>
                Welcome to Request Inbox. We are committed to protecting your personal information and your right to privacy.
                This Privacy Policy describes how we collect, use, and share information when you use our application.
            </Typography>

            <Typography variant="h4" gutterBottom>
                2. Information We Collect
            </Typography>
            <Typography variant="h5" gutterBottom>
                2.1 Personal Information
            </Typography>
            <Typography paragraph>
                When you register for Request Inbox, we collect:
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary="Email address" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Name" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Organization name" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Avatar URL" />
                </ListItem>
            </List>

            <Typography variant="h5" gutterBottom>
                2.2 Webhook and Callback Data
            </Typography>
            <Typography paragraph>
                The primary purpose of Request Inbox is to collect and store webhook and callback data that you receive through
                your created inboxes. This data may contain personal or sensitive information depending on the nature of the
                webhooks you're receiving.
            </Typography>

            <Typography variant="h5" gutterBottom>
                2.3 Usage Data
            </Typography>
            <Typography paragraph>
                We collect certain usage data through AWS CloudFront when you visit our application. This may include your IP
                address, browser type, and other standard web log information.
            </Typography>

            <Typography variant="h4" gutterBottom>
                3. How We Use Your Information
            </Typography>
            <Typography paragraph>
                We use the information we collect to:
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary="Provide and maintain our service" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Notify you about changes to our service" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Allow you to participate in interactive features of our service when you choose to do so" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Provide customer support" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Monitor the usage of our service" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Detect, prevent and address technical issues" />
                </ListItem>
            </List>

            <Typography variant="h4" gutterBottom>
                4. Data Storage and Security
            </Typography>
            <Typography paragraph>
                All data, including your personal information and received webhook data, is stored in AWS DynamoDB in the EU Central 1
                region (Frankfurt, Germany). We implement appropriate technical and organizational measures to protect your data against
                unauthorized access, alteration, disclosure, or destruction.
            </Typography>
            <Typography paragraph>
                Our security measures include:
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary="Use of HTTPS for all data transmissions" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Implementation of DNSSEC for domain name security" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Secure implementation of OAuth 2.0 flow for authentication" />
                </ListItem>
            </List>

            <Typography variant="h4" gutterBottom>
                5. Data Retention
            </Typography>
            <Typography paragraph>
                We have the following data retention policies:
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary="Personal Information: We retain your personal information associated with your account indefinitely, or until you request its deletion." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Inactive Users: User accounts that have been inactive for three years will be automatically deleted." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Anonymous Inboxes: Inactive anonymous inboxes will be automatically deleted after 3 months of inactivity. Anonymous inboxes are limited to storing a maximum of 300 requests. We do not guarantee the retention of requests beyond this limit." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Webhook Data: We retain received webhook/callback data associated with your account indefinitely, or until you request its deletion, subject to the limitations for anonymous inboxes." />
                </ListItem>
            </List>
            <Typography paragraph>
                You have the right to request deletion of all information related to your account at any time.
            </Typography>

            <Typography variant="h4" gutterBottom>
                6. Cookies
            </Typography>
            <Typography paragraph>
                We use cookies solely for login purposes. These cookies are essential for the functioning of our authentication system
                and do not track your activities outside of our application.
            </Typography>

            <Typography variant="h4" gutterBottom>
                7. Third-Party Services
            </Typography>
            <Typography paragraph>
                We use the following third-party services in our application:
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary="AWS CloudWatch" secondary={<a href="https://aws.amazon.com/compliance/data-privacy/cloudwatch/">AWS CloudWatch Privacy Notice</a>} />
                </ListItem>
                <ListItem>
                    <ListItemText primary="AWS CloudFront" secondary={<a href="https://aws.amazon.com/compliance/data-privacy/cloudfront/">AWS CloudFront Privacy Notice</a>} />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Cloudflare" secondary={<a href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</a>} />
                </ListItem>
            </List>
            <Typography paragraph>
                These services may collect and process certain data as described in their respective privacy policies.
            </Typography>

            <Typography variant="h4" gutterBottom>
                8. Your Data Protection Rights
            </Typography>
            <Typography paragraph>
                Under the General Data Protection Regulation (GDPR), you have the following rights:
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary="Right of access - You have the right to request copies of your personal information." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Right to rectification - You have the right to request that we correct any information you believe is inaccurate or complete any information you believe is incomplete." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Right to erasure - You have the right to request that we erase your personal data, under certain conditions." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Right to restrict processing - You have the right to request that we restrict the processing of your personal data, under certain conditions." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Right to object to processing - You have the right to object to our processing of your personal data, under certain conditions." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Right to data portability - You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions." />
                </ListItem>
            </List>
            <Typography paragraph>
                To exercise any of these rights, please contact us using the information provided in the "Contact Us" section.
            </Typography>

            <Typography variant="h4" gutterBottom>
                9. Children's Privacy
            </Typography>
            <Typography paragraph>
                Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information
                from anyone under the age of 13.
            </Typography>

            <Typography variant="h4" gutterBottom>
                10. Changes to This Privacy Policy
            </Typography>
            <Typography paragraph>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this
                page and updating the "Last updated" date at the top of this Privacy Policy.
            </Typography>

            <Typography variant="h4" gutterBottom>
                11. API Keys
            </Typography>
            <Typography paragraph>
                Our application allows users to create and manage API keys. These keys are used to authenticate requests to our service.
                We treat these keys as sensitive information and implement appropriate security measures to protect them. API keys are stored
                as part of the user information in our secure database.
            </Typography>

            <Typography variant="h4" gutterBottom>
                12. Compliance with Data Protection Regulations
            </Typography>
            <Typography paragraph>
                Request Inbox complies with the General Data Protection Regulation (GDPR). We are committed to ensuring that your privacy is
                protected and that we handle your personal data in compliance with GDPR requirements.
            </Typography>

            <Typography variant="h4" gutterBottom>
                13. Contact Us
            </Typography>
            <Typography paragraph>
                If you have any questions about this Privacy Policy, please contact us:
            </Typography>
            <ContactInformation />
        </Container>
    );
};

export default PrivacyPolicy;
