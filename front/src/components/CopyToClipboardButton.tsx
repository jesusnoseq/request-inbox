import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type CopyToClipboardButtonProps = {
    textToCopy: string;
    tooltipTitle?: string;
};

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({ textToCopy, tooltipTitle = 'Copy to Clipboard' }) => {

    const handleCopyToClipboard = async () => {
        await navigator.clipboard.writeText(textToCopy);
    };

    return (
        <Tooltip title={tooltipTitle}>
            <IconButton onClick={handleCopyToClipboard}>
                <ContentCopyIcon />
            </IconButton>
        </Tooltip>
    );
};

export default CopyToClipboardButton;

// Example <CopyToClipboardButton textToCopy={request.Body} tooltipTitle="Copy Body" />