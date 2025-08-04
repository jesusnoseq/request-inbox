import { User } from "../types/inbox";
import { AdminDashboardStats, AdminChartData } from "../types/admin";


const BASE_URL = process.env.REACT_APP_REQUEST_INBOX_API_URL;

const defaultHeaders = {
    "Content-Type": "application/json",
};



export const getAdminStats = async (): Promise<AdminDashboardStats> => {
    const resp = await fetch(`${BASE_URL}/api/v1/admin/stats`, {
        method: "GET",
        headers: defaultHeaders,
        credentials: 'include',
    });
    
    if (!resp.ok) {
        throw new Error(`Failed to fetch admin stats: ${resp.statusText}`);
    }
    
    return await resp.json();
};

export const getAdminChartData = async (): Promise<AdminChartData> => {
    const resp = await fetch(`${BASE_URL}/api/v1/admin/chart-data`, {
        method: "GET",
        headers: defaultHeaders,
        credentials: 'include',
    });
    
    if (!resp.ok) {
        throw new Error(`Failed to fetch admin chart data: ${resp.statusText}`);
    }
    
    return await resp.json();
};
