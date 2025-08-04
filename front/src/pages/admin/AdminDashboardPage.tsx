import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
    Container,
    Typography,
    Grid2,
    Paper,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    People as PeopleIcon,
    Inbox as InboxIcon,
    TrendingUp as TrendingUpIcon,
    Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAdminChartData, } from '../../services/admin';
import { AdminDashboardStats, AdminChartData  } from '../../types/admin';

// Lazy load chart components for code splitting
const LazyLineChart = lazy(() => import('../../components/admin/charts/LineChart'));
const LazyBarChart = lazy(() => import('../../components/admin/charts/BarChart'));
const LazyPieChart = lazy(() => import('../../components/admin/charts/PieChart'));

const AdminDashboardPage: React.FC = () => {
    const { user, isLoggedIn } = useUser();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminDashboardStats>({
        totalUsers: 0,
        totalInboxes: 0,
        totalRequests: 0,
        activeUsers: 0
    });
    const [chartData, setChartData] = useState<AdminChartData>({
        userRegistrations: [],
        inboxCreations: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if user is admin
        if (!isLoggedIn() || !user || user.Role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                
                // Try to fetch real data from API
                try {
                    const statsResponse = await getAdminStats();
                    const chartResponse = await getAdminChartData();
                    
                    setStats(statsResponse);
                    setChartData(chartResponse);
                } catch (apiError) {
                    // Fall back to mock data if API fails
                    console.warn('API call failed, using mock data:', apiError);
                    
                    const mockStats: AdminDashboardStats = {
                        totalUsers: 0,
                        totalInboxes: 0,
                        totalRequests: 0,
                        activeUsers: 0
                    };

                    const mockChartData: AdminChartData = {
                        userRegistrations: [
                            { date: '2024-01', count: 0 },
                            { date: '2024-02', count: 0 },
                        ],
                        inboxCreations: [
                            { date: '2024-01', count: 0 },
                            { date: '2024-02', count: 0 },
                        ],
                    };

                    setStats(mockStats);
                    setChartData(mockChartData);
                }
                
                setError(null);
            } catch (err) {
                setError('Failed to load dashboard data');
                console.error('Dashboard data fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, isLoggedIn, navigate]);

    if (isLoading) {
        return (
            <Container>
                <Grid2 container spacing={0} justifyContent="center" alignItems="center" sx={{ minHeight: '50vh' }}>
                    <CircularProgress />
                </Grid2>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert variant="outlined" severity="error">
                    {error}
                </Alert>
            </Container>
        );
    }

    const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({
        title,
        value,
        icon,
        color
    }) => (
        <Card elevation={3} sx={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div">
                            {value.toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{ color: color, opacity: 0.7 }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Welcome back, {user?.Name || user?.Email}
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid2 container spacing={3} sx={{ mb: 4 }}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<PeopleIcon sx={{ fontSize: 40 }} />}
                        color="#1976d2"
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Inboxes"
                        value={stats.totalInboxes}
                        icon={<InboxIcon sx={{ fontSize: 40 }} />}
                        color="#ed6c02"
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total Requests"
                        value={stats.totalRequests}
                        icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                        color="#2e7d32"
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Active Users"
                        value={stats.activeUsers}
                        icon={<AnalyticsIcon sx={{ fontSize: 40 }} />}
                        color="#9c27b0"
                    />
                </Grid2>
            </Grid2>

            {/* Charts */}
            <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 12 }}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            User Registrations Over Time
                        </Typography>
                        <Suspense fallback={<CircularProgress />}>
                            <LazyLineChart data={chartData.userRegistrations} />
                        </Suspense>
                    </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                    <Paper elevation={3} sx={{ p: 3}}>
                        <Typography variant="h6" gutterBottom>
                            Inbox Creations Over Time
                        </Typography>
                        <Suspense fallback={<CircularProgress />}>
                            <LazyBarChart data={chartData.inboxCreations} />
                        </Suspense>
                    </Paper>
                </Grid2>
            </Grid2>
        </Container>
    );
};

export default AdminDashboardPage;
