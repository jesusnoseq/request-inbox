
export type AdminDashboardStats = {
    totalUsers: number;
    totalInboxes: number;
    totalRequests: number;
    activeUsers: number;
}

export type ChartPoint = {
    date: string;
    count: number;
}

export type AdminChartData = {
    userRegistrations: ChartPoint[];
    inboxCreations: ChartPoint[];
}