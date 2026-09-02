'use client'

import React from 'react';
import { Helmet } from 'react-helmet';
import {
    Box,
    Button,
    Container,
    Grid,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SignUpButton from '../components/SignUpButton';
import CreateInboxButton from '../components/CreateNewInboxButton';
import ProductPreview from '../components/landing/ProductPreview';
import { bandBackground, monoFontFamily } from '../theme';
import {
    ArrowRightIcon,
    BookIcon,
    BracesIcon,
    CallbackIcon,
    CaptureIcon,
    CodeIcon,
    ContainerIcon,
    GitHubIcon,
    KeyIcon,
    LockIcon,
    MoonIcon,
    RefreshIcon,
    ScaleIcon,
} from '../components/icons/StrokeIcons';

const SECTION_PADDING = { xs: 6, md: 11 };

const TRUST_SIGNALS = [
    { label: 'Open source on GitHub', Icon: GitHubIcon },
    { label: 'Apache 2.0 licensed', Icon: ScaleIcon },
    { label: 'Self-host with Docker', Icon: ContainerIcon },
    { label: 'OpenAPI documented', Icon: BookIcon },
];

const FEATURES = [
    {
        title: 'Full request capture',
        Icon: CaptureIcon,
        body: 'Method, protocol, URI, every header, the raw body and content length — pretty-printed and refreshed as requests arrive.',
    },
    {
        title: 'Programmable responses',
        Icon: CodeIcon,
        body: 'Choose the status code, headers and body your endpoint returns, so you can drive retry logic and error paths on demand.',
    },
    {
        title: 'Callbacks & forwarding',
        Icon: CallbackIcon,
        body: 'Have an inbox call another URL when a request lands — forward the headers, template the body, read each callback’s response inline, and retry the ones that failed.',
    },
];

const SECONDARY_FEATURES = [
    { title: 'Private inboxes', Icon: LockIcon, body: 'Sign in and keep an inbox to yourself.' },
    { title: 'API keys', Icon: KeyIcon, body: 'Create and drive inboxes from scripts and CI.' },
    { title: 'JSON viewer', Icon: BracesIcon, body: 'Collapse, expand and actually read the body.' },
    { title: 'Auto-refresh', Icon: RefreshIcon, body: 'New requests appear without reloading.' },
    { title: 'Light & dark', Icon: MoonIcon, body: 'Follows your system, or pick one and stay there.' },
    { title: 'OpenAPI spec', Icon: BookIcon, body: 'The whole API, documented and browsable.' },
];

export default function LandingPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const band = bandBackground(isDark);
    const ground = theme.palette.background.default;
    const paper = theme.palette.background.paper;

    const featuresSectionBg = isDark ? ground : band;
    const featureCardBg = isDark ? paper : ground;

    const codeChipSx = {
        mt: 0.5,
        py: 1.5,
        px: 1.75,
        borderRadius: 1.5,
        bgcolor: ground,
        border: 1,
        borderColor: 'divider',
        fontFamily: monoFontFamily,
        fontSize: 12,
        lineHeight: 1.6,
        color: 'text.secondary',
        wordBreak: 'break-all' as const,
    };

    const steps = [
        {
            number: '01',
            title: 'Create an inbox',
            body: 'One click, no account. You get a unique URL that starts listening immediately.',
            chip: (
                <Box sx={codeChipSx}>
                    https://request-inbox.com/api/v1/inboxes/
                    <Box component="span" sx={{ color: 'primary.main' }}>a3f9c2d1&hellip;</Box>
                    /in
                </Box>
            ),
        },
        {
            number: '02',
            title: 'Point something at it',
            body: 'Paste it into Stripe, GitHub, your CI job — or just curl it yourself.',
            chip: (
                <Box sx={codeChipSx}>
                    <Box component="span" sx={{ color: isDark ? '#ce93d8' : '#6a1b9a' }}>curl</Box>
                    {' -X POST $INBOX_URL \\'}
                    <br />
                    {'  -d '}
                    <Box component="span" sx={{ color: isDark ? '#a5d6a7' : '#2e7d32' }}>
                        {`'{"hello":"world"}'`}
                    </Box>
                </Box>
            ),
        },
        {
            number: '03',
            title: 'Inspect and respond',
            body: 'Read the full request, then set the status, headers and body it should return.',
            chip: (
                <Box sx={codeChipSx}>
                    <Box component="span" sx={{ color: isDark ? '#ef9a9a' : '#c62828' }}>503</Box>
                    {' Service Unavailable'}
                    <br />
                    {'retry-after: '}
                    <Box component="span" sx={{ color: isDark ? '#90caf9' : '#0d47a1' }}>30</Box>
                </Box>
            ),
        },
    ];

    return (
        <>
            <Helmet>
                <title>Debug webhooks without deploying anything | Request Inbox</title>
                <meta
                    name="description"
                    content="Get a live HTTP endpoint in one click. Capture every webhook in full - headers, body, timing - and configure exactly what it responds with. Free, no account, open source."
                />
                <link rel="canonical" href="https://request-inbox.com/" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "Request Inbox",
                        "url": "https://request-inbox.com/",
                        "potentialAction": {
                            "@type": "Action",
                            "name": "Create Inbox",
                            "target": {
                                "@type": "EntryPoint",
                                "urlTemplate": "https://request-inbox.com/inbox/{inboxID}",
                                "inLanguage": "en"
                            }
                        }
                    })}
                </script>
            </Helmet>

            {/* ============ HERO ============ */}
            <Box
                component="section"
                sx={{ bgcolor: band, borderBottom: 1, borderColor: 'divider', pt: SECTION_PADDING, pb: { xs: 5, md: 9 } }}
            >
                <Container maxWidth="lg">
                    <Stack alignItems="center" spacing={3}>
                        <Typography
                            sx={{
                                fontFamily: monoFontFamily,
                                fontSize: { xs: 11, md: 12 },
                                fontWeight: 500,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: 'primary.main',
                                textAlign: 'center',
                            }}
                        >
                            Open source &middot; Webhook &amp; callback testing
                        </Typography>

                        <Typography
                            variant="h1"
                            sx={{
                                maxWidth: 900,
                                fontSize: { xs: 34, sm: 44, md: 60 },
                                lineHeight: 1.08,
                                textAlign: 'center',
                                textWrap: 'pretty',
                            }}
                        >
                            Debug any webhook without deploying anything
                        </Typography>

                        <Typography
                            sx={{
                                maxWidth: 720,
                                fontSize: { xs: 16.5, md: 20 },
                                lineHeight: 1.55,
                                textAlign: 'center',
                                textWrap: 'pretty',
                                color: 'text.secondary',
                            }}
                        >
                            Get a live endpoint in one click. Every request that hits it is captured in full &mdash; method,
                            headers, body, timing &mdash; and you decide exactly what it responds with.
                        </Typography>

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems="center"
                            spacing={{ xs: 2, sm: 3 }}
                            sx={{ pt: 1, width: { xs: '100%', sm: 'auto' } }}
                        >
                            <CreateInboxButton
                                webMCP
                                variant="contained"
                                color="primary"
                                size="large"
                                source="landing-page-hero"
                                endIcon={<ArrowRightIcon size={18} />}
                                sx={{ width: { xs: '100%', sm: 'auto' }, py: 1.5, px: 3.25 }}
                            />
                            <Button
                                component={RouterLink}
                                to="/docs"
                                color="primary"
                                endIcon={<ArrowRightIcon size={16} />}
                                sx={{ textTransform: 'none', fontSize: 16, fontWeight: 500 }}
                            >
                                Read the docs
                            </Button>
                        </Stack>

                        <Typography sx={{ fontSize: 14, color: 'text.secondary', textAlign: 'center' }}>
                            Free &middot; No account required &middot; Apache 2.0 licensed
                        </Typography>

                        <Box sx={{ width: '100%', maxWidth: 1120, pt: 2 }}>
                            <ProductPreview />
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* ============ TRUST STRIP ============ */}
            <Box component="section" sx={{ bgcolor: band, borderBottom: 1, borderColor: 'divider', py: 3.25 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={{ xs: 1.5, md: 0 }} justifyContent="center">
                        {TRUST_SIGNALS.map(({ label, Icon }) => (
                            <Grid size={{ xs: 6, md: 'auto' }} key={label} sx={{ px: { md: 3.5 } }}>
                                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ color: 'text.secondary' }}>
                                    <Box component="span" sx={{ display: 'flex', flexShrink: 0, opacity: 0.75 }}>
                                        <Icon size={18} />
                                    </Box>
                                    <Typography sx={{ fontSize: { xs: 13, md: 14.5 }, color: 'inherit' }}>{label}</Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ============ HOW IT WORKS ============ */}
            <Box component="section" sx={{ bgcolor: ground, py: SECTION_PADDING }}>
                <Container maxWidth="lg">
                    <Stack alignItems="center" spacing={1.75} sx={{ mb: 6 }}>
                        <Typography variant="h2" sx={{ fontSize: { xs: 27, md: 40 }, textAlign: 'center', textWrap: 'pretty' }}>
                            Three steps, no setup
                        </Typography>
                        <Typography
                            sx={{ maxWidth: 620, fontSize: { xs: 16, md: 18 }, lineHeight: 1.55, textAlign: 'center', color: 'text.secondary' }}
                        >
                            Nothing to install, nothing to tunnel, nothing to deploy.
                        </Typography>
                    </Stack>

                    <Grid container spacing={3.5}>
                        {steps.map((step) => (
                            <Grid size={{ xs: 12, md: 4 }} key={step.number}>
                                <Stack
                                    spacing={1.75}
                                    sx={{ height: '100%', p: { xs: 2.5, md: 3.5 }, bgcolor: paper, border: 1, borderColor: 'divider', borderRadius: 2 }}
                                >
                                    <Typography
                                        sx={{ fontFamily: monoFontFamily, fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', color: 'primary.main' }}
                                    >
                                        {step.number}
                                    </Typography>
                                    <Typography variant="h3" sx={{ fontSize: { xs: 18.5, md: 21 } }}>
                                        {step.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: 15.5, lineHeight: 1.6, color: 'text.secondary' }}>
                                        {step.body}
                                    </Typography>
                                    <Box sx={{ flexGrow: 1 }} />
                                    {step.chip}
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ============ FEATURES ============ */}
            <Box
                component="section"
                sx={{ bgcolor: featuresSectionBg, borderTop: 1, borderBottom: 1, borderColor: 'divider', py: SECTION_PADDING }}
            >
                <Container maxWidth="lg">
                    <Stack alignItems="center" spacing={1.75} sx={{ mb: 6 }}>
                        <Typography variant="h2" sx={{ fontSize: { xs: 27, md: 40 }, textAlign: 'center', textWrap: 'pretty' }}>
                            More than a request dump
                        </Typography>
                        <Typography
                            sx={{ maxWidth: 620, fontSize: { xs: 16, md: 18 }, lineHeight: 1.55, textAlign: 'center', color: 'text.secondary' }}
                        >
                            See every request. Control every response.
                        </Typography>
                    </Stack>

                    <Grid container spacing={3.5}>
                        {FEATURES.map(({ title, body, Icon }) => (
                            <Grid size={{ xs: 12, md: 4 }} key={title}>
                                <Stack
                                    spacing={1.75}
                                    sx={{ height: '100%', p: { xs: 2.5, md: 4 }, bgcolor: featureCardBg, border: 1, borderColor: 'divider', borderRadius: 2 }}
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
                                    <Typography variant="h3" sx={{ fontSize: { xs: 19, md: 22 } }}>
                                        {title}
                                    </Typography>
                                    <Typography sx={{ fontSize: 16, lineHeight: 1.62, color: 'text.secondary' }}>
                                        {body}
                                    </Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ============ SECONDARY FEATURES ============ */}
            <Box component="section" sx={{ bgcolor: ground, py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <Typography variant="h2" sx={{ fontSize: { xs: 24, md: 28 }, textAlign: 'center', mb: 5 }}>
                        And the rest of it
                    </Typography>

                    <Grid container spacing={{ xs: 3, md: 5 }} rowSpacing={4}>
                        {SECONDARY_FEATURES.map(({ title, body, Icon }) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={title}>
                                <Stack direction="row" spacing={1.75}>
                                    <Box component="span" sx={{ display: 'flex', flexShrink: 0, mt: '2px', color: 'primary.main' }}>
                                        <Icon size={20} />
                                    </Box>
                                    <Stack spacing={0.5}>
                                        <Typography variant="h3" sx={{ fontSize: 16.5 }}>{title}</Typography>
                                        <Typography sx={{ fontSize: 15, lineHeight: 1.55, color: 'text.secondary' }}>{body}</Typography>
                                    </Stack>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
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
                    py: { xs: 6, md: 10 },
                }}
            >
                <Container maxWidth="sm">
                    <Stack alignItems="center" spacing={2.5}>
                        <Typography
                            variant="h2"
                            sx={{ fontSize: { xs: 27, md: 40 }, textAlign: 'center', textWrap: 'pretty', color: 'inherit' }}
                        >
                            Ready to catch your first request?
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: { xs: 16, md: 18 },
                                lineHeight: 1.55,
                                textAlign: 'center',
                                textWrap: 'pretty',
                                color: isDark ? 'text.secondary' : 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            No account, no credit card, no install. Create an inbox and point something at it.
                        </Typography>

                        <CreateInboxButton
                            variant="contained"
                            size="large"
                            source="landing-page-footer-cta"
                            endIcon={<ArrowRightIcon size={18} />}
                            sx={{
                                width: { xs: '100%', sm: 'auto' },
                                py: 1.625,
                                px: 3.75,
                                fontWeight: 600,
                                ...(isDark
                                    ? {}
                                    : {
                                        bgcolor: 'common.white',
                                        color: 'primary.main',
                                        '&:hover': { bgcolor: 'grey.100' },
                                    }),
                            }}
                        />

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems="center"
                            justifyContent="center"
                            spacing={2}
                            sx={{
                                width: '100%',
                                mt: 2.5,
                                pt: 3,
                                borderTop: 1,
                                borderColor: isDark ? 'divider' : 'rgba(255, 255, 255, 0.25)',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 15,
                                    textAlign: 'center',
                                    color: isDark ? 'text.secondary' : 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                Want to keep your inboxes and make them private?
                            </Typography>
                            <SignUpButton
                                text="Sign up free"
                                variant="outlined"
                                size="medium"
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: '100%', sm: 'auto' },
                                    ...(isDark
                                        ? {}
                                        : {
                                            color: 'common.white',
                                            borderColor: 'rgba(255, 255, 255, 0.6)',
                                            '&:hover': {
                                                borderColor: 'common.white',
                                                bgcolor: 'rgba(255, 255, 255, 0.08)',
                                            },
                                        }),
                                }}
                            />
                        </Stack>
                    </Stack>
                </Container>
            </Box>
        </>
    );
}
