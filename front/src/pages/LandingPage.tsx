'use client'

import React from 'react';
import {
    Box,
    Button,
    Container,
    Grid,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import {
    Code as CodeIcon,
    // Inbox as InboxIcon,
    Lock as LockIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';

export default function LandingPage() {

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 2 }}>
                <Typography
                    component="h1"
                    variant="h2"
                    align="center"
                    color="textPrimary"
                    gutterBottom
                >
                    Test Callbacks and Webhooks with Ease
                </Typography>
                <Typography variant="h5" align="center" color="textSecondary" paragraph>
                    Request Inbox simplifies the process of testing and debugging callbacks and webhooks. Capture, inspect, and manage incoming HTTP requests effortlessly.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" color="primary" sx={{ mx: 1 }}>
                        Get Started
                    </Button>
                    <Button variant="outlined" color="primary" sx={{ mx: 1 }}>
                        Learn More
                    </Button>
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
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <CodeIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h5" component="h3" gutterBottom>
                                Real-time Request Capture
                            </Typography>
                            <Typography align="center">
                                Instantly capture and display incoming HTTP requests for immediate analysis.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <NotificationsIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h5" component="h3" gutterBottom>
                                Custom Notifications
                            </Typography>
                            <Typography align="center">
                                Set up alerts for specific request patterns or payload contents.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <LockIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h5" component="h3" gutterBottom>
                                Secure Endpoints
                            </Typography>
                            <Typography align="center">
                                Generate unique, secure URLs for each testing session to protect your data.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Container component="section" maxWidth="sm" sx={{ mt: 8, mb: 2 }}>
                <Typography
                    component="h2"
                    variant="h3"
                    align="center"
                    color="textPrimary"
                    gutterBottom
                >
                    Ready to Simplify Your Webhook Testing?
                </Typography>
                <Typography variant="h5" align="center" color="textSecondary" paragraph>
                    Join thousands of developers who trust Request Inbox for their callback and webhook testing needs.
                </Typography>
                <Box component="form" sx={{ mt: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Enter your email"
                                type="email"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button fullWidth variant="contained" color="primary" size="large">
                                Sign Up
                            </Button>
                        </Grid>
                    </Grid>
                    <Typography variant="caption" align="center" sx={{ mt: 2, display: 'block' }}>
                        Free plan available. No credit card required.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}