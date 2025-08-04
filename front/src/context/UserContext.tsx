import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser, logout as postLogout } from '../services/inbox';
import { User } from '../types/inbox';


interface UserContextType {
    user: User | null;
    logout: () => void;
    isLoggedIn: () => boolean;
    isAdmin: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

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

    const isAdmin = (): boolean => {
        return user !== null && user.Role === 'admin';
    };

    const logout = async () => {
        const resp = await postLogout();
        console.log(resp);
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, logout, isLoggedIn, isAdmin }}>
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