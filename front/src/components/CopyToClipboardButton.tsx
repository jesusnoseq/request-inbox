import React, { useState } from 'react';
import { IconButton, Tooltip, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type CopyToClipboardButtonProps = {
    textToCopy: string;
    tooltipTitle?: string;
    copyEventMessage?: string;
};

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = (
    {
        textToCopy,
        tooltipTitle = 'Copy to Clipboard',
        copyEventMessage = "Copied to clipboard"
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
                <IconButton onClick={handleCopyToClipboard}>
                    <ContentCopyIcon />
                </IconButton>
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