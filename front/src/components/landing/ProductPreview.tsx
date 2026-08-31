import React from 'react';
import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import { monoFontFamily } from '../../theme';
import { CopyIcon, LockIcon, PencilIcon, RefreshIcon, ChevronDownIcon } from '../icons/StrokeIcons';

/**
 * A static recreation of the inbox detail screen, used as the landing page
 * hero shot. The values below are illustrative sample data, not a real inbox.
 */

const SAMPLE_INBOX_ID = 'a3f9c2d1-7b4e-4a90-b2c8-11d3e5f70a6b';
const SAMPLE_INBOX_PATH = `/inboxes/${SAMPLE_INBOX_ID}/in`;
const SAMPLE_INBOX_URL = `https://request-inbox.com/api/v1${SAMPLE_INBOX_PATH}`;

const ProductPreview: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const chromeBg = isDark ? '#1e1e1e' : '#eceef1';
    const canvasBg = isDark ? '#121212' : '#f4f5f7';
    const surfaceBg = isDark ? '#1e1e1e' : '#ffffff';
    const insetBg = isDark ? '#121212' : '#f4f5f7';
    const dotBg = isDark ? '#3a3a3a' : '#d9dce0';
    const successColor = isDark ? '#66bb6a' : '#2e7d32';

    const json = {
        punct: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.38)',
        key: isDark ? '#ce93d8' : '#6a1b9a',
        string: isDark ? '#a5d6a7' : '#2e7d32',
        number: isDark ? '#90caf9' : '#0d47a1',
    };

    return (
        <Box
            sx={{
                width: '100%',
                borderRadius: 2.5,
                overflow: 'hidden',
                border: 1,
                borderColor: 'divider',
                bgcolor: canvasBg,
                boxShadow: isDark
                    ? '0px 12px 24px -8px rgba(0,0,0,0.6), 0px 40px 64px -32px rgba(0,0,0,0.7)'
                    : '0px 12px 24px -8px rgba(0,0,0,0.18), 0px 40px 64px -32px rgba(0,0,0,0.22)',
            }}
        >
            {/* browser chrome */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                    height: 44,
                    px: 2,
                    bgcolor: chromeBg,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: { xs: 'none', sm: 'flex' },
                }}
            >
                <Stack direction="row" spacing={1}>
                    {[0, 1, 2].map((i) => (
                        <Box key={i} sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: dotBg }} />
                    ))}
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        flexGrow: 1,
                        height: 26,
                        px: 1.5,
                        borderRadius: 13,
                        bgcolor: surfaceBg,
                        border: 1,
                        borderColor: 'divider',
                        overflow: 'hidden',
                    }}
                >
                    <Box component="span" sx={{ color: successColor, display: 'flex' }}>
                        <LockIcon size={11} strokeWidth={2.4} />
                    </Box>
                    <Typography
                        noWrap
                        sx={{ fontFamily: monoFontFamily, fontSize: 12, color: 'text.secondary' }}
                    >
                        request-inbox.com/inbox/{SAMPLE_INBOX_ID}
                    </Typography>
                </Stack>
            </Stack>

            {/* app canvas */}
            <Stack spacing={2} sx={{ p: { xs: 1.75, sm: 3 }, bgcolor: canvasBg }}>

                {/* inbox detail */}
                <Paper elevation={isDark ? 0 : 1} sx={{ p: { xs: 1.75, sm: 2.5 }, bgcolor: surfaceBg }}>
                    <Stack spacing={2}>
                        <Stack direction="row" alignItems="baseline" spacing={1.25} flexWrap="wrap">
                            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Inbox</Typography>
                            <Typography sx={{ fontSize: { xs: 17, sm: 22 }, fontWeight: 500, letterSpacing: '-0.01em' }}>
                                Stripe payment events
                            </Typography>
                            <Box component="span" sx={{ color: 'text.disabled', display: 'flex' }}>
                                <PencilIcon size={15} />
                            </Box>
                        </Stack>

                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                                Open since August 30, 2025 6:41 PM
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Private</Typography>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        width: 36,
                                        height: 18,
                                        p: '2px',
                                        borderRadius: 10,
                                        bgcolor: isDark ? 'rgba(144, 202, 249, 0.5)' : 'primary.main',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: '50%',
                                            bgcolor: isDark ? 'primary.main' : '#ffffff',
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Stack>

                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ py: 1.25, px: 1.5, borderRadius: 1, bgcolor: insetBg, border: 1, borderColor: 'divider' }}
                        >
                            <Box component="span" sx={{ color: 'primary.main', display: 'flex', flexShrink: 0 }}>
                                <CopyIcon size={17} />
                            </Box>
                            <Typography
                                sx={{
                                    fontFamily: monoFontFamily,
                                    fontSize: { xs: 10.5, sm: 13 },
                                    wordBreak: 'break-all',
                                }}
                            >
                                {SAMPLE_INBOX_URL}
                            </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Responds with</Typography>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    height: 22,
                                    px: 1.125,
                                    borderRadius: 1,
                                    bgcolor: isDark ? 'rgba(102, 187, 106, 0.16)' : 'rgba(46, 125, 50, 0.12)',
                                    color: successColor,
                                    fontFamily: monoFontFamily,
                                    fontSize: 12,
                                    fontWeight: 500,
                                }}
                            >
                                200
                            </Box>
                            <Typography
                                sx={{
                                    fontFamily: monoFontFamily,
                                    fontSize: 12,
                                    color: 'text.secondary',
                                    display: { xs: 'none', md: 'block' },
                                }}
                            >
                                content-type: application/json
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: monoFontFamily,
                                    fontSize: 12,
                                    color: 'text.secondary',
                                    display: { xs: 'none', md: 'block' },
                                }}
                            >
                                {'{"received": true}'}
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>

                {/* request list */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontSize: 15, fontWeight: 500 }}>2 requests</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.875} sx={{ color: successColor }}>
                        <RefreshIcon size={14} strokeWidth={2} />
                        <Typography sx={{ fontSize: 13, color: 'inherit' }}>Auto-refresh on</Typography>
                    </Stack>
                </Stack>

                <Box sx={{ p: 2, borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: surfaceBg }}>
                    <Stack spacing={1.25}>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
                            N&ordm; 2<br />August 30, 2025 6:44 PM
                        </Typography>
                        <Box
                            sx={{
                                fontFamily: monoFontFamily,
                                fontSize: { xs: 13, sm: 15 },
                                lineHeight: 1.5,
                                wordBreak: 'break-all',
                            }}
                        >
                            <Box component="span" sx={{ fontWeight: 500 }}>HTTP/1.1 POST </Box>
                            <Box component="span" sx={{ opacity: 0.5, fontSize: '0.93em', letterSpacing: '-0.5px' }}>
                                {SAMPLE_INBOX_PATH}
                            </Box>
                            <Box component="span">/payment</Box>
                        </Box>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{
                                color: 'primary.main',
                                fontSize: 13,
                                fontWeight: 500,
                                letterSpacing: '0.02857em',
                                textTransform: 'uppercase',
                            }}
                        >
                            <Box component="span">Show headers</Box>
                            <ChevronDownIcon size={16} />
                        </Stack>
                        <Box
                            sx={{
                                bgcolor: insetBg,
                                borderRadius: 1,
                                py: 1.5,
                                px: 1.75,
                                fontFamily: monoFontFamily,
                                fontSize: { xs: 11, sm: 12.5 },
                                lineHeight: 1.7,
                            }}
                        >
                            <Box sx={{ color: json.punct }}>{'{'}</Box>
                            <Box sx={{ pl: 2 }}>
                                <Box component="span" sx={{ color: json.key }}>&quot;type&quot;</Box>
                                {': '}
                                <Box component="span" sx={{ color: json.string }}>&quot;payment_intent.succeeded&quot;</Box>,
                            </Box>
                            <Box sx={{ pl: 2, display: { xs: 'none', sm: 'block' } }}>
                                <Box component="span" sx={{ color: json.key }}>&quot;id&quot;</Box>
                                {': '}
                                <Box component="span" sx={{ color: json.string }}>&quot;evt_3QxL9pK2Hd8vN1aZ&quot;</Box>,
                            </Box>
                            <Box sx={{ pl: 2 }}>
                                <Box component="span" sx={{ color: json.key }}>&quot;amount&quot;</Box>
                                {': '}
                                <Box component="span" sx={{ color: json.number }}>4200</Box>,
                            </Box>
                            <Box sx={{ pl: 2 }}>
                                <Box component="span" sx={{ color: json.key }}>&quot;currency&quot;</Box>
                                {': '}
                                <Box component="span" sx={{ color: json.string }}>&quot;eur&quot;</Box>
                            </Box>
                            <Box sx={{ color: json.punct }}>{'}'}</Box>
                        </Box>
                    </Stack>
                </Box>

                <Box
                    sx={{
                        p: 2,
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: surfaceBg,
                        display: { xs: 'none', sm: 'block' },
                    }}
                >
                    <Stack spacing={1.25}>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
                            N&ordm; 1<br />August 30, 2025 6:42 PM
                        </Typography>
                        <Box sx={{ fontFamily: monoFontFamily, fontSize: 15, lineHeight: 1.5, wordBreak: 'break-all' }}>
                            <Box component="span" sx={{ fontWeight: 500 }}>HTTP/1.1 POST </Box>
                            <Box component="span" sx={{ opacity: 0.5, fontSize: '0.93em', letterSpacing: '-0.5px' }}>
                                {SAMPLE_INBOX_PATH}
                            </Box>
                        </Box>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{
                                color: 'primary.main',
                                fontSize: 13,
                                fontWeight: 500,
                                letterSpacing: '0.02857em',
                                textTransform: 'uppercase',
                            }}
                        >
                            <Box component="span">Show headers</Box>
                            <ChevronDownIcon size={16} />
                        </Stack>
                    </Stack>
                </Box>

            </Stack>
        </Box>
    );
};

export default ProductPreview;
