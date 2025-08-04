import React from 'react';
import { Box } from '@mui/material';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
    data: Array<{ date: string; count: number }>;
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    <Bar 
                        dataKey="count" 
                        fill="#ed6c02" 
                        radius={[4, 4, 0, 0]}
                    />
                </RechartsBarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default BarChart;
