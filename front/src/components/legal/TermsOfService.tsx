import React from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import ContactInformation from './ContactInformation';

const TermsOfService: React.FC = () => {
    return (
        <Container>
            <Typography variant="h2" gutterBottom>
                Terms of Service for Request Inbox
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Last updated: september 15, 2024
            </Typography>

            <Typography variant="h4" gutterBottom>
                Introduction
            </Typography>
            <Typography paragraph>
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Request Inbox website and service (the "Service") operated by jesusnoseq ("us", "we", or "our").
                Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
                By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
            </Typography>

            <Typography variant="h4" gutterBottom>
                1. Accounts
            </Typography>
            <Typography paragraph>
                When you create an account with us, you must be at least 13 years old. You must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </Typography>
            <Typography paragraph>
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
            </Typography>
            <Typography paragraph>
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </Typography>

            <Typography variant="h4" gutterBottom>
                2. Service Description
            </Typography>
            <Typography paragraph>
                Request Inbox is a service that allows users to register and save requests made to a randomly generated endpoint. The service can be used anonymously or as a logged-in user. Logged-in users have access to private inboxes.
            </Typography>

            <Typography variant="h4" gutterBottom>
                3. Use of Service
            </Typography>
            <Typography paragraph>
                You agree to use the Service only for lawful purposes and in accordance with these Terms of Service. Specifically, you agree not to use the Service:
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary="a) For scams or fraudulent activities" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="b) For tracking purposes without explicit consent" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="c) To impersonate or attempt to impersonate another website or service" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="d) As a proxy for Denial of Service (DoS) attacks" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="e) To host content that infringes on copyrights or other intellectual property rights" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="f) For any illegal activities" />
                </ListItem>
            </List>
            <Typography paragraph>
                Request Inbox is intended to be used for Quality Assurance (QA) purposes only.
            </Typography>

            <Typography variant="h4" gutterBottom>
                4. Intellectual Property and Data Ownership
            </Typography>
            <Typography paragraph>
                Request Inbox is not responsible for or the owner of user-generated content in the application. Users are the owners, authors, and responsible parties for their inboxes and all content generated in them by sending requests.
            </Typography>

            <Typography variant="h4" gutterBottom>
                5. Service Availability and Modifications
            </Typography>
            <Typography paragraph>
                This Service is currently in a Minimum Viable Product (MVP) stage and may be subject to changes in the future. We strive to maintain backward compatibility and keep the Service operational most of the time. However, we do not provide any specific uptime guarantees.
            </Typography>
            <Typography paragraph>
                We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service.
            </Typography>

            <Typography variant="h4" gutterBottom>
                6. Account Termination
            </Typography>
            <Typography paragraph>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </Typography>
            <Typography paragraph>
                If you wish to terminate your account, you may simply discontinue using the Service.
            </Typography>
            <Typography paragraph>
                Users who do not comply with these Terms of Service will have their account and associated inboxes eliminated, and their IP address may be banned from using the Service.
            </Typography>

            <Typography variant="h4" gutterBottom>
                7. Limitation of Liability
            </Typography>
            <Typography paragraph>
                In no event shall jesusnoseq, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
            </Typography>

            <Typography variant="h4" gutterBottom>
                8. Disclaimer
            </Typography>
            <Typography paragraph>
                Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </Typography>
            <Typography paragraph>
                Jesusnoseq, its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
            </Typography>

            <Typography variant="h4" gutterBottom>
                9. Governing Law
            </Typography>
            <Typography paragraph>
                These Terms shall be governed and construed in accordance with the laws of Spain, without regard to its conflict of law provisions.
            </Typography>
            <Typography paragraph>
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
            </Typography>

            <Typography variant="h4" gutterBottom>
                10. Changes to Terms of Service
            </Typography>
            <Typography paragraph>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes on the Terms of Service page of our website. What constitutes a material change will be determined at our sole discretion.
            </Typography>
            <Typography paragraph>
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </Typography>

            <Typography variant="h4" gutterBottom>
                11. Payment Terms
            </Typography>
            <Typography paragraph>
                Currently, Request Inbox does not offer any paid services. However, we reserve the right to introduce paid features or subscription plans in the future. If and when we do introduce paid services:
            </Typography>
            <List>
                <ListItem>
                    <ListItemText primary="a) We will clearly communicate the pricing, billing cycle, and features of any paid plans." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="b) You will have the opportunity to review and accept the terms of any paid services before being charged." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="c) We may use third-party payment processors to handle transactions. Your use of such services will be subject to their respective terms of service." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="d) You agree to provide accurate and complete billing information." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="e) Paid subscriptions may automatically renew unless cancelled before the renewal date." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="f) We reserve the right to change pricing at any time, with notice provided to affected users." />
                </ListItem>
                <ListItem>
                    <ListItemText primary="g) Refunds, if applicable, will be handled on a case-by-case basis at our discretion." />
                </ListItem>
            </List>
            <Typography paragraph>
                We will update these Terms of Service with more detailed payment terms if and when paid services are introduced.
            </Typography>

            <Typography variant="h4" gutterBottom>
                12. Contact Us
            </Typography>
            <Typography paragraph>
                If you have any questions about these Terms, please contact us:
            </Typography>
            <ContactInformation />
        </Container>
    );
};

export default TermsOfService;
