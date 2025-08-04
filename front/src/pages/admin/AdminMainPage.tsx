import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import AdminLayout from '../../components/admin/AdminLayout';
import { useUser } from '../../context/UserContext';

const AdminDashboardPage = lazy(() => import('./AdminDashboardPage'));

const AdminMainPage: React.FC = () => {
    const { user, isLoggedIn } = useUser();

    // Check if user is admin
    if (!isLoggedIn() || !user || user.Role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <AdminLayout>
            <Suspense
                fallback={
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <CircularProgress />
                    </Box>
                }
            >
                <Routes>
                    <Route path="/" element={<AdminDashboardPage />} />
                </Routes>
            </Suspense>
        </AdminLayout>
    );
};

export default AdminMainPage;
