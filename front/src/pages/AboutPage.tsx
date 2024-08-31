import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

const AboutPage: React.FC = () => {
    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2" gutterBottom>
                    About Request Inbox
                </Typography>
                <Typography variant="body1" mt={2}>
                    It is built with the latest web technologies and a focus on user experience. <br />
                    Request Inbox is here to make your life a little easier by always providing a reliable URL to check your webhooks.
                </Typography>
            </Box>
        </Container>
    );
};

export default AboutPage;