import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage: React.FC = () => {
    return (
        <Container>
            <Header />
            <Box my={4}>
                <Typography variant="h4" component="h2" gutterBottom>
                    About
                </Typography>
                <Typography variant="body1">
                    RequestInbox is a platform designed to streamline the way you manage your inbound requests.
                    Whether it's customer inquiries, internal requests, or personal reminders,
                    RequestInbox makes it easy to keep track of everything in one centralized location.
                </Typography>
                <Typography variant="body1" mt={2}>
                    Our mission is to help individuals and teams stay organized, work more efficiently,
                    and save time by automating the request management process. With RequestInbox,
                    you can ensure that every request is accounted for and handled.
                </Typography>
                <Typography variant="body1" mt={2}>
                    Built with the latest web technologies and a focus on user experience,
                    RequestInbox is here to improve the way you work.
                </Typography>
            </Box>
            <Footer />
        </Container>
    );
};

export default AboutPage;