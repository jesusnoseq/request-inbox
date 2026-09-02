
import React, { useState } from 'react';
import type {} from '@mcp-b/react-webmcp';
import { Button, ButtonProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';
import { buildInboxURL, newInbox } from '../services/inbox';
import { useError } from '../context/ErrorContext';



interface CreateNewInboxButtonProps extends ButtonProps {
    text?: string;
    source?: string;
    webMCP?: boolean;
}

const CreateNewInboxButton: React.FC<CreateNewInboxButtonProps> = ({
    text = "Create new Inbox",
    source = "unknown",
    webMCP = false,
    children,
    ...props
}) => {
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
            const detailPath = `/inbox/${inbox.ID}`;
            navigate(detailPath);

            return {
                inboxId: inbox.ID,
                name: inbox.Name,
                captureUrl: buildInboxURL(inbox.ID),
                detailUrl: new URL(detailPath, window.location.origin).href,
                isPrivate: inbox.IsPrivate,
                ...(inbox.OwnerID
                    ? {}
                    : { warning: 'This inbox is anonymous and can be accessed or modified by anyone with its ID.' }),
            };
        } catch (err) {
            setError('Failed to create inbox');
            if (posthog) {
                posthog.capture('inbox_creation_failed', {
                    source: source,
                    error: err instanceof Error ? err.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                });
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleClick = () => {
        void handleCreateInbox().catch(() => undefined);
    };

    const handleToolSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const submitEvent = event.nativeEvent as SubmitEvent;
        const creation = handleCreateInbox();

        if (submitEvent.agentInvoked && submitEvent.respondWith) {
            submitEvent.respondWith(creation);
        } else {
            void creation.catch(() => undefined);
        }
    };

    const button = (
        <Button
            onClick={webMCP ? undefined : handleClick}
            type={webMCP ? 'submit' : 'button'}
            loading={loading}
            {...props}
        >
            {children ?? text}
        </Button>
    );

    if (webMCP) {
        return (
            <form
                aria-label="Create request inbox"
                toolname="create_request_inbox"
                tooltitle="Create Request Inbox"
                tooldescription="Create an HTTP request inbox for webhook testing. If the user is not signed in, the inbox is public and ownerless."
                toolautosubmit=""
                onSubmit={handleToolSubmit}
                style={{ display: 'contents' }}
            >
                {button}
            </form>
        );
    }

    return button;
}

export default CreateNewInboxButton;
