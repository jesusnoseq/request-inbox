'use client'

import React from 'react';
import {
    Box,
    Button,
    Container,
    Grid2,
    Paper,
    Typography,
} from '@mui/material';
import {
    Code as CodeIcon,
    // Inbox as InboxIcon,
    Lock as LockIcon,
    DynamicFeed as DynamicFeedIcon,
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import SignUpButton from '../components/SignUpButton';
import CreateInboxButton from '../components/CreateNewInboxButton'

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 2 }}>
                <Typography
                    component="h1"
                    variant="h3"
                    align="center"
                    color="textPrimary"
                    gutterBottom
                >
                    Test Callbacks and Webhooks <br />with Ease
                </Typography>
                <Typography variant="h5" align="center" color="textSecondary" paragraph>
                    Request Inbox simplifies the process of testing and debugging callbacks and webhooks. Capture, inspect, and manage incoming HTTP requests effortlessly.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <SignUpButton />
                    <Button variant="outlined" color="primary" sx={{ mx: 1 }} onClick={() => navigate('/users-manual')}>
                        Learn More
                    </Button>
                </Box>
                <Typography variant="h5" align="center" color="textSecondary" paragraph sx={{ mt: 5 }}>
                    Or jump straight into action and create a new Request Inbox anonymously.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <CreateInboxButton />
                </Box>
            </Container>

            <Container component="section" maxWidth="lg" sx={{ mt: 8, mb: 2 }} id="features">
                <Typography
                    component="h2"
                    variant="h3"
                    align="center"
                    color="textPrimary"
                    gutterBottom
                >
                    Key Features
                </Typography>
                <Grid2 container spacing={4} sx={{ mt: 4 }}>
                    <Grid2 size={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <DynamicFeedIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h5" component="h3" gutterBottom>
                                Request Capture
                            </Typography>
                            <Typography align="center">
                                Capture and display incoming HTTP requests for immediate analysis.
                            </Typography>
                        </Paper>
                    </Grid2>
                    <Grid2 size={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <CodeIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h5" component="h3" gutterBottom>
                                Custom Responses
                            </Typography>
                            <Typography align="center">
                                Configure and send tailored responses to incoming requests, enabling flexible testing scenarios.
                            </Typography>
                        </Paper>
                    </Grid2>
                    <Grid2 size={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <LockIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h5" component="h3" gutterBottom>
                                Secure Endpoints
                            </Typography>
                            <Typography align="center">
                                Generate unique, secure URLs for each testing session to protect your data.
                            </Typography>
                        </Paper>
                    </Grid2>
                </Grid2>
            </Container>

            <Container component="section" maxWidth="sm" sx={{ mt: 8, mb: 2 }}>
                <Typography
                    component="h2"
                    variant="h3"
                    align="center"
                    color="textPrimary"
                    gutterBottom
                >
                    Ready to Simplify<br /> Your Webhook Testing?
                </Typography>
                {/* <Typography variant="h5" align="center" color="textSecondary" paragraph>
                    Join thousands of developers who trust Request Inbox for their callback and webhook testing needs.
                </Typography> */}
                <Box component="form" sx={{ mt: 4 }}>
                    <Grid2 container spacing={2} alignItems="center">
                        {/* <Grid2 size={12} >
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Enter your email"
                                type="email"
                            />
                        </Grid2> */}
                        <Grid2 size={12}>
                            <SignUpButton fill />
                        </Grid2>
                    </Grid2>
                    {/* <Typography variant="caption" align="center" sx={{ mt: 2, display: 'block' }}>
                        Free plan available. No credit card required.
                    </Typography> */}
                </Box>
            </Container>
        </Box>
    );
}