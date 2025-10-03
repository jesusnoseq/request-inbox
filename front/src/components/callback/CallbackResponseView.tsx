import React, { useState } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Button, 
    List, 
    ListItem, 
    ListItemText, 
    Collapse 
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { CallbackResponse } from '../../types/inbox';
import BodyView from '../BodyView';

type CallbackResponseViewProps = {
    callbackResponse: CallbackResponse;
    index: number;
};

const CallbackResponseView: React.FC<CallbackResponseViewProps> = ({ 
    callbackResponse, 
    index 
}) => {
    const [headersOpen, setHeadersOpen] = useState<boolean>(false);
    
    const handleHeadersToggle = () => {
        setHeadersOpen(!headersOpen);
    };

    const hasHeaders = callbackResponse.Headers && Object.keys(callbackResponse.Headers).length > 0;

    return (
        <Card variant="outlined" sx={{ marginBottom: 1, marginLeft: 2 }}>
            <CardContent sx={{ paddingBottom: '16px !important' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Callback {index + 1}
                </Typography>
                
                {callbackResponse.URL && (
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                        <strong>URL:</strong>{' '}
                        <Typography 
                            component="a" 
                            href={callbackResponse.URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ 
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            {callbackResponse.URL}
                        </Typography>
                    </Typography>
                )}
                
                {callbackResponse.Method && (
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                        <strong>Method:</strong> {callbackResponse.Method}
                    </Typography>
                )}
                
                {callbackResponse.Error && (
                    <Typography variant="body2" sx={{ 
                        marginBottom: 1, 
                        color: 'error.main',
                        padding: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'error.main'
                    }}>
                        <strong>Error:</strong> {callbackResponse.Error}
                    </Typography>
                )}
                
                {callbackResponse.Code !== 0 && (
                    <Typography variant="body2" sx={{ marginBottom: 1 }}>
                        <strong>Status Code:</strong> {callbackResponse.Code}
                    </Typography>
                )}
                
                {hasHeaders && (
                    <>
                        <Typography sx={{ marginBottom: 1 }}>
                            <Button 
                                onClick={handleHeadersToggle}
                                size="small"
                                sx={{ textTransform: 'none', padding: '4px 8px', minWidth: 'auto' }}
                            >
                                <Typography variant="body2">
                                    Show headers ({Object.keys(callbackResponse.Headers).length})
                                </Typography>
                                {headersOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                            </Button>
                        </Typography>

                        <Collapse in={headersOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ marginBottom: 1 }}>
                                <List dense sx={{ paddingTop: 0, paddingBottom: 0 }}>
                                    {Object.entries(callbackResponse.Headers).map(([key, value], headerIndex) => (
                                        <ListItem key={headerIndex} sx={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 1 }}>
                                            <ListItemText 
                                                primary={key} 
                                                secondary={value}
                                                slotProps={{
                                                    primary: { 
                                                        variant: 'caption', 
                                                        fontWeight: 'bold',
                                                        sx: { fontSize: '0.75rem' }
                                                    },
                                                    secondary: { 
                                                        variant: 'caption',
                                                        sx: { fontSize: '0.75rem' }
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Collapse>
                    </>
                )}
                
                {callbackResponse.Body && (
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
                            Response Body:
                        </Typography>
                        <BodyView data={callbackResponse.Body} />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default CallbackResponseView;