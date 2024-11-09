
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { newInbox } from '../services/inbox';
import { useError } from '../context/ErrorContext';

export default function CreateNewInboxButton() {
    const [loading, setLoading] = useState(false);
    const { setError } = useError();

    const navigate = useNavigate();

    const handleCreateInbox = async () => {
        setLoading(true);
        try {
            const inbox = await newInbox();
            navigate(`inbox/${inbox.ID}`);
        } catch (err) {
            setError('Failed to create inbox');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LoadingButton
                variant="contained"
                color="primary"
                onClick={handleCreateInbox}
                loading={loading}
            >
                Create new Inbox
            </LoadingButton>
        </>
    );
}