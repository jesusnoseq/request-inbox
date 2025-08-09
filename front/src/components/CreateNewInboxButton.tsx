
import React, { useState } from 'react';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';
import { newInbox } from '../services/inbox';
import { useError } from '../context/ErrorContext';



interface CreateNewInboxButtonProps extends LoadingButtonProps {
    text?: string;
    source?: string;
}

const CreateNewInboxButton: React.FC<CreateNewInboxButtonProps> = ({ text = "Create new Inbox", source = "unknown", ...props }) => {
    const [loading, setLoading] = useState(false);
    const { setError } = useError();
    const posthog = usePostHog();

    const navigate = useNavigate();

    const handleCreateInbox = async () => {
        setLoading(true);
        
        // Send PostHog event
        if (posthog) {
            posthog.capture('create_new_inbox_clicked', {
                source: source,
            });
        }
        
        try {
            const inbox = await newInbox();
            navigate(`inbox/${inbox.ID}`);
        } catch (err) {
            setError('Failed to create inbox');
            if (posthog) {
                posthog.capture('inbox_creation_failed', {
                    source: source,
                    error: err instanceof Error ? err.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoadingButton
            onClick={handleCreateInbox}
            loading={loading}
            {...props}
        >
            Create new Inbox
        </LoadingButton>
    );
}

export default CreateNewInboxButton;