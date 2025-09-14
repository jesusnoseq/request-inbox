import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    IconButton,
    Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { InboxCallback } from '../types/inbox';

interface CallbackListProps {
    callbacks: InboxCallback[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    readonly?: boolean;
}

const CallbackList: React.FC<CallbackListProps> = ({ callbacks, onEdit, onDelete, readonly = false }) => {
    if (!callbacks || callbacks.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="textSecondary">
                    No callbacks configured
                </Typography>
            </Box>
        );
    }

    const getMethodColor = (method: string) => {
        const colors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
            'GET': 'default',
            'POST': 'default',
            'PUT': 'default',
            'DELETE': 'default',
            'PATCH': 'default',
        };
        return colors[method.toUpperCase()] || 'primary';
    };

    return (
        <Box>
            {callbacks.map((callback, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Chip
                                label={callback.IsEnabled ? 'Enabled' : 'Disabled'}
                                color={callback.IsEnabled ? 'info' : 'default'}
                                size="small"
                            />
                            <Chip
                                label={callback.Method || 'GET'}
                                color={getMethodColor(callback.Method || 'GET')}
                                size="small"
                            />
                            <Typography sx={{ flexGrow: 1, fontSize: '0.9rem' }} noWrap>
                                {callback.ToURL || 'No URL set'}
                            </Typography>
                            {callback.IsDynamic && (
                                <Chip
                                    label="Dynamic"
                                    color="info"
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                            {!readonly && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Edit callback">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(index);
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete callback">
                                        <IconButton
                                            size="small"
                                            color="default"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(index);
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    URL
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1 }}>
                                    {callback.ToURL || 'Not set'}
                                </Typography>
                            </Box>

                            {callback.Headers && Object.keys(callback.Headers).length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Headers
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableBody>
                                                {Object.entries(callback.Headers).map(([key, value]) => (
                                                    <TableRow key={key}>
                                                        <TableCell sx={{ fontFamily: 'monospace', width: '30%' }}>
                                                            {key}
                                                        </TableCell>
                                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                                            {value}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {callback.Body && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Body
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        component="pre"
                                        sx={{ 
                                            fontFamily: 'monospace', 
                                            backgroundColor: 'rgba(0,0,0,0.1)', 
                                            p: 1, 
                                            borderRadius: 1,
                                            whiteSpace: 'pre-wrap',
                                            maxHeight: '200px',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {callback.Body}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default CallbackList;