import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { queryUserData, doSignOut } from '../services/users';
import { Link as LinkDOM } from "react-router-dom";


const UserHeader: React.FC = () => {
    const [user, setUser] = useState<any>(null);

    const checkUser = async () => {
        try {
            const userData = await queryUserData();
            setUser(userData);
        } catch (error) {
            console.log('Not signed in', error);
            setUser(null);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const handleSignOut = async () => {
        try {
            await doSignOut()
            setUser(null);
            console.log("User signed out");
        } catch (error) {
            console.log('Error signing out: ', error);
        }
    };

    return (
        <div>
            {user ? (
                <>
                    <Button color="inherit"
                        onClick={handleSignOut}>
                        Logout
                    </Button>
                </>
            ) : (
                <Button color="inherit" component={LinkDOM} to="/sign-in">Sign in</Button>
            )}
        </div>
    );
};

export default UserHeader;