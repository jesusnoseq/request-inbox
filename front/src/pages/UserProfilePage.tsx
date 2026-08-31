import React, { useEffect } from 'react';
import { Container } from '@mui/material';
import { getUser, deleteUser } from '../services/inbox';
import Profile from '../components/Profile';

import { User } from '../types/inbox';


const UserProfilePage: React.FC = () => {

    const [user, setUser] = React.useState<null | User>(null);
    const handleDelete = async (): Promise<void> => {
        await deleteUser();
        window.location.href = '/';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await getUser();
                setUser(userResponse);
            } catch (err) {
                console.log("Some error occur", err);
            }
        };

        fetchData();
    }, []);


    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            {
                user != null &&
                <Profile user={user} onDeleteAccount={handleDelete} />
            }
        </Container>
    );
};


export default UserProfilePage;