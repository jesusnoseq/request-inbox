
import React, { useState } from 'react';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { newInbox } from '../services/inbox';
import { useError } from '../context/ErrorContext';



interface CreateNewInboxButtonProps extends LoadingButtonProps {
    text?: string;
}

const CreateNewInboxButton: React.FC<CreateNewInboxButtonProps> = ({ text = "Create new Inbox", ...props }) => {
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