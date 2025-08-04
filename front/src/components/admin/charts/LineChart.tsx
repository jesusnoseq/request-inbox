import React from 'react';
import { Box } from '@mui/material';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
    data: Array<{ date: string; count: number }>;
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#666' }}
                    />
                    <YAxis 
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#666' }}
                    />
                    <Tooltip 
                        formatter={(value: number) => [value.toLocaleString(), 'Count']}
                        labelStyle={{ color: '#666' }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#1976d2" 
                        strokeWidth={3}
                        dot={{ fill: '#1976d2', strokeWidth: 2, stroke: '#fff', r: 4 }}
                        activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2 }}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default LineChart;
