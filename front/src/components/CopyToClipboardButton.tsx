import React, { useState } from 'react';
import { Button, IconButton, Tooltip, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type CopyToClipboardButtonProps = {
    textToCopy: string;
    tooltipTitle?: string;
    copyEventMessage?: string;
    label?: string;
};

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = (
    {
        textToCopy,
        tooltipTitle = 'Copy to Clipboard',
        copyEventMessage = "Copied to clipboard",
        label
    }) => {
    const [open, setOpen] = useState(false);


    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };


    const handleCopyToClipboard = async () => {
        await navigator.clipboard.writeText(textToCopy).then(() => {
            setOpen(true);
        });
    };

    return (
        <>
            <Tooltip title={tooltipTitle}>
                {label ? (
                    <Button
                        type="button"
                        size="small"
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        onClick={handleCopyToClipboard}
                    >
                        {label}
                    </Button>
                ) : (
                    <IconButton type="button" onClick={handleCopyToClipboard}>
                        <ContentCopyIcon />
                    </IconButton>
                )}
            </Tooltip>
            <Snackbar
                open={open}
                autoHideDuration={1500}
                onClose={handleClose}
                message={copyEventMessage}
            />
        </>
    );
};

export default CopyToClipboardButton;

// Example <CopyToClipboardButton textToCopy={request.Body} tooltipTitle="Copy Body" />
