import React from 'react';
import {
    Box,
    Container,
    Typography,
    Stack,
    Grid,
    useTheme,
    useMediaQuery,
    Link,
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
} from '@mui/lab';
import SignUpButton from '../components/SignUpButton';
import { bandBackground } from '../theme';
import { CodeIcon, CloudIcon, BoltIcon, GitHubIcon } from '../components/icons/StrokeIcons';

const SECTION_PADDING = { xs: 6, md: 9 };

const VALUES = [
    {
        title: 'Cutting-edge technology',
        Icon: CodeIcon,
        body: 'Built with the latest web technologies, ensuring speed, reliability, and a seamless user experience.',
    },
    {
        title: 'Always available',
        Icon: CloudIcon,
        body: 'Your dedicated URL is always ready, providing a reliable endpoint for all your webhook testing needs.',
    },
    {
        title: 'Streamlined workflow',
        Icon: BoltIcon,
        body: 'Designed to make your life easier, saving you time and reducing frustration in your development process.',
    },
];

const JOURNEY = [
    { title: 'The Problem', body: 'Developers struggled with unreliable webhook testing solutions.' },
    { title: 'The Idea', body: 'We envisioned a tool that would always be there when you need it.' },
    { title: 'The Solution', body: 'Request Inbox was born, offering reliable URLs for webhook testing.' },
    { title: 'The Future', body: 'Continuously evolving to meet the needs of developers worldwide.' },
];

export default function AboutPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const band = bandBackground(isDark);
    const ground = theme.palette.background.default;
    const paper = theme.palette.background.paper;

    return (
        <>
            {/* ============ HERO ============ */}
            <Box component="section" sx={{ bgcolor: band, borderBottom: 1, borderColor: 'divider', py: SECTION_PADDING }}>
                <Container maxWidth="md">
                    <Stack alignItems="center" spacing={2}>
                        <Typography
                            variant="h1"
                            sx={{ fontSize: { xs: 32, md: 44 }, textAlign: 'center', textWrap: 'pretty' }}
                        >
                            About Request Inbox
                        </Typography>
                        <Typography
                            sx={{ maxWidth: 640, fontSize: { xs: 16.5, md: 19 }, lineHeight: 1.55, textAlign: 'center', color: 'text.secondary' }}
                        >
                            It&apos;s a tool for testing and debugging webhooks, built to make a developer&apos;s life easier.
                            If you&apos;re tired of hunting for reliable webhook endpoints, Request Inbox has your back &mdash;
                            simple, dependable, and out of your way so you can focus on what you do best.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            {/* ============ VALUES ============ */}
            <Box component="section" sx={{ bgcolor: ground, py: SECTION_PADDING }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3.5}>
                        {VALUES.map(({ title, body, Icon }) => (
                            <Grid size={{ xs: 12, md: 4 }} key={title}>
                                <Stack
                                    spacing={1.75}
                                    alignItems="center"
                                    sx={{ height: '100%', p: { xs: 2.5, md: 3.5 }, textAlign: 'center', bgcolor: paper, border: 1, borderColor: 'divider', borderRadius: 2 }}
                                >
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2,
                                            bgcolor: isDark ? 'rgba(144, 202, 249, 0.14)' : 'rgba(25, 118, 210, 0.1)',
                                            color: 'primary.main',
                                        }}
                                    >
                                        <Icon size={24} />
                                    </Box>
                                    <Typography variant="h3" sx={{ fontSize: { xs: 18.5, md: 20 } }}>
                                        {title}
                                    </Typography>
                                    <Typography sx={{ fontSize: 15.5, lineHeight: 1.6, color: 'text.secondary' }}>
                                        {body}
                                    </Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ============ OUR JOURNEY ============ */}
            <Box component="section" sx={{ bgcolor: isDark ? ground : band, borderTop: 1, borderColor: 'divider', py: SECTION_PADDING }}>
                <Container maxWidth="md">
                    <Typography variant="h2" sx={{ fontSize: { xs: 27, md: 36 }, textAlign: 'center', mb: 5 }}>
                        Our Journey
                    </Typography>
                    <Box sx={{ bgcolor: paper, border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 1, md: 2 } }}>
                        <Timeline position={isMobile ? 'right' : 'alternate'}>
                            {JOURNEY.map((step, i) => (
                                <TimelineItem key={step.title}>
                                    <TimelineSeparator>
                                        <TimelineDot color="primary" />
                                        {i < JOURNEY.length - 1 && <TimelineConnector />}
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Typography variant="h3" sx={{ fontSize: 17 }}>
                                            {step.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>{step.body}</Typography>
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </Timeline>
                    </Box>
                </Container>
            </Box>

            {/* ============ FINAL CTA ============ */}
            <Box
                component="section"
                sx={{
                    bgcolor: isDark ? band : 'primary.main',
                    color: isDark ? 'text.primary' : 'primary.contrastText',
                    borderTop: 1,
                    borderColor: isDark ? 'divider' : 'transparent',
                    py: { xs: 6, md: 9 },
                }}
            >
                <Container maxWidth="sm">
                    <Stack alignItems="center" spacing={2.5}>
                        <Typography
                            variant="h2"
                            sx={{ fontSize: { xs: 26, md: 34 }, textAlign: 'center', textWrap: 'pretty', color: 'inherit' }}
                        >
                            Ready to simplify your webhook testing?
                        </Typography>

                        <Box sx={{ maxWidth: 280, width: '100%' }}>
                            <SignUpButton
                                text="Get started now"
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={
                                    isDark
                                        ? {}
                                        : {
                                            bgcolor: 'common.white',
                                            color: 'primary.main',
                                            '&:hover': { bgcolor: 'grey.100' },
                                        }
                                }
                            />
                        </Box>

                        <Link
                            href="https://github.com/jesusnoseq/request-inbox"
                            target="_blank"
                            rel="noopener"
                            underline="hover"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                pt: 2,
                                color: 'inherit',
                                opacity: 0.9,
                                '&:hover': { opacity: 1 },
                            }}
                        >
                            <GitHubIcon size={18} />
                            <Typography variant="button" sx={{ color: 'inherit' }}>
                                View on GitHub
                            </Typography>
                        </Link>
                    </Stack>
                </Container>
            </Box>
        </>
    );
}
