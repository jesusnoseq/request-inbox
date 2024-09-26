import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser, logout as postLogout } from '../services/inbox';


interface UserContextType {
    user: any;
    logout: () => void;
    isLoggedIn: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await getUser();
                setUser(userResponse);
            } catch (err) {
                console.log("Some error occurred", err);
            }
        };

        fetchData();
    }, []);

    const isLoggedIn = (): boolean => {
        return user !== null;
    };

    const logout = async () => {
        const resp = await postLogout();
        console.log(resp);
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, logout, isLoggedIn }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};