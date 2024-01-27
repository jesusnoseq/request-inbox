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
                    About Request Inbox
                </Typography>
                {/* <Typography variant="body1">
                    RequestInbox is a platform designed to improve the way you manage webhooks and test API clients.
                    It easy to keep track of everything in one centralized location.
                </Typography>
                <Typography variant="body1" mt={2}>
                    Our mission is to help individuals and teams stay organized, work more efficiently,
                    and save time by automating the request management process. With Request Inbox,
                    you can ensure that every request is handled and saved.
                </Typography> */}
                <Typography variant="body1" mt={2}>
                    It is built with the latest web technologies and a focus on user experience. <br />
                    Request Inbox is here to make your life a little easier by always providing a reliable URL to check your webhooks.
                </Typography>
            </Box>
            <Footer />
        </Container>
    );
};

export default AboutPage;