import React, { useMemo, useState } from 'react';
import { InboxRequest } from '../types/inbox';
import Container from '@mui/material/Container';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import RequestDetail from './RequestDetail';
import MethodChip from './MethodChip';

type Props = {
    requests: InboxRequest[];
};

const RequestList: React.FC<Props> = ({ requests }) => {
    const [methodFilter, setMethodFilter] = useState<string>('ALL');

    const methods = useMemo(() => {
        const counts = new Map<string, number>();
        requests.forEach((r) => counts.set(r.Method, (counts.get(r.Method) || 0) + 1));
        return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [requests]);

    const filtered = methodFilter === 'ALL' ? requests : requests.filter((r) => r.Method === methodFilter);

    return (
        <Container>
            {methods.length > 1 && (
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={2}>
                    <Box
                        onClick={() => setMethodFilter('ALL')}
                        sx={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            height: 24,
                            px: 1.5,
                            borderRadius: 3,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            bgcolor: methodFilter === 'ALL' ? 'primary.main' : 'transparent',
                            color: methodFilter === 'ALL' ? 'primary.contrastText' : 'text.secondary',
                            border: 1,
                            borderColor: methodFilter === 'ALL' ? 'primary.main' : 'divider',
                        }}
                    >
                        All &middot; {requests.length}
                    </Box>
                    {methods.map(([method, count]) => (
                        <Box
                            key={method}
                            onClick={() => setMethodFilter(method)}
                            sx={{
                                cursor: 'pointer',
                                opacity: methodFilter !== 'ALL' && methodFilter !== method ? 0.5 : 1,
                                outline: methodFilter === method ? '2px solid' : 'none',
                                outlineColor: 'primary.main',
                                outlineOffset: '1px',
                                borderRadius: 1,
                            }}
                        >
                            <MethodChip
                                method={method}
                                label={`${method} · ${count}`}
                                size="small"
                            />
                        </Box>
                    ))}
                </Box>
            )}
            {filtered.length === 0 ? (
                requests.length === 0 ? (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        textAlign="center"
                        gap={1}
                        sx={{ py: 7, bgcolor: 'background.paper', border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 2 }}
                    >
                        <InboxIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                        <Typography color="text.secondary">
                            No requests captured yet. Send something to the inbox URL above.
                        </Typography>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={1} sx={{ py: 4 }}>
                        <FilterAltOffIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
                        <Typography color="text.secondary">
                            No requests match this filter.
                        </Typography>
                    </Box>
                )
            ) : (
                filtered.slice().reverse().map((request) => (
                    <React.Fragment key={request.ID}>
                        <RequestDetail request={request} />
                    </React.Fragment>
                ))
            )}
            <Box id="bottom-anchor" />
        </Container>
    );
};

export default RequestList;
