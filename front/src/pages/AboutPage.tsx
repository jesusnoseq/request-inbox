import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid2,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
} from '@mui/lab';
import { Code as CodeIcon, Cloud as CloudIcon, Speed as SpeedIcon } from '@mui/icons-material';
import LoginDialog from '../components/LoginDialog';
import SignUpButton from '../components/SignUpButton';

export default function AboutPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);

    // const handleClick = async () => {
    //     if (isLoggedIn()) {
    //         navigate('/');
    //     } else {
    //         setOpen(true);
    //     }
    // };


    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Container maxWidth="lg">
            <Box my={8}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    About Request Inbox
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom align="center" color="textSecondary">
                    Your Reliable Companion in Webhook Testing
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="body1" >
                    It's a tool for testing and debugging webhooks, built to make a developer's life easier. If you're tired of hunting for reliable webhook endpoints, Request Inbox has your back. It's simple, dependable, and takes the hassle out of your workflow so you can focus on what you do best.
                </Typography>
            </Paper>

            <Grid2 container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
                <Grid2 size={4}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CodeIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h6" component="h3" gutterBottom align="center">
                            Cutting-Edge Technology
                        </Typography>
                        <Typography align="center">
                            Built with the latest web technologies, ensuring speed, reliability, and a seamless user experience.
                        </Typography>
                    </Paper>
                </Grid2>
                <Grid2 size={4}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CloudIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h6" component="h3" gutterBottom align="center">
                            Always Available
                        </Typography>
                        <Typography align="center">
                            Your dedicated URL is always ready, providing a reliable endpoint for all your webhook testing needs.
                        </Typography>
                    </Paper>
                </Grid2>
                <Grid2 size={4}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SpeedIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h6" component="h3" gutterBottom align="center">
                            Streamlined Workflow
                        </Typography>
                        <Typography align="center">
                            Designed to make your life easier, saving you time and reducing frustration in your development process.
                        </Typography>
                    </Paper>
                </Grid2>
            </Grid2>

            <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
                <Typography variant="h4" component="h2" gutterBottom align="center">
                    Our Journey
                </Typography>
                <Timeline position={isMobile ? "right" : "alternate"}>
                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="h6" component="h1">
                                The Problem
                            </Typography>
                            <Typography>Developers struggled with unreliable webhook <br />testing solutions.</Typography>
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="h6" component="h1">
                                The Idea
                            </Typography>
                            <Typography>We envisioned a tool that would always be there
                                <br />when you need it.</Typography>
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color="primary" />
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="h6" component="h1">
                                The Solution
                            </Typography>
                            <Typography>Request Inbox was born, offering reliable URLs <br />for webhook testing.</Typography>
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot color="primary" />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="h6" component="h1">
                                The Future
                            </Typography>
                            <Typography>Continuously evolving to meet the needs <br />of developers worldwide.</Typography>
                        </TimelineContent>
                    </TimelineItem>
                </Timeline>
            </Paper>

            <Box textAlign="center" mb={8}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Ready to Simplify Your Webhook Testing?
                </Typography>

                {/* <Button variant="contained" color="primary" size="large" onClick={handleClick}>
                    Get Started Now
                </Button> */}
                <Box sx={{ maxWidth: 300, margin: 'auto' }}>
                    <SignUpButton text='Get Started Now' />
                </Box>

                <LoginDialog open={open} onClose={handleClose} />
            </Box>
        </Container>
    );
}