import React from 'react';
import { Paper, Title, Text } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { WeeklyCustomerCount } from 'src/services/reportsApi';

interface WeeklyCustomersWidgetProps {
    data: WeeklyCustomerCount[];
    loading?: boolean;
}

const WeeklyCustomersWidget: React.FC<WeeklyCustomersWidgetProps> = ({ data, loading }) => {
    if (!data || data.length === 0) {
        return null;
    }

    const chartData = (() : Array<{period: string, totalCustomers: number, newCustomers: number}> => {
        const rawData = data.map((item: WeeklyCustomerCount) => ({
            weekStart: item.weekStart,
            totalCustomers: item.totalCustomers,
            newCustomers: item.newCustomers,
        }));

        // If more than 20 data points, aggregate by month
        if (rawData.length > 20) {
            const monthlyAgg = rawData.reduce((acc: Record<string, {totalCustomers: number, newCustomers: number}>, item) => {
                const monthKey = new Date(item.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                });
                
                if (!acc[monthKey]) {
                    acc[monthKey] = { totalCustomers: 0, newCustomers: 0 };
                }
                
                acc[monthKey].totalCustomers += item.totalCustomers;
                acc[monthKey].newCustomers += item.newCustomers;
                
                return acc;
            }, {});

            return Object.entries(monthlyAgg).map(([month, data]) => ({
                period: month,
                totalCustomers: data.totalCustomers,
                newCustomers: data.newCustomers,
            }));
        } else {
            // Weekly data
            return rawData.map((item) => ({
                period: new Date(item.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short', 
                    day: 'numeric' 
                }),
                totalCustomers: item.totalCustomers,
                newCustomers: item.newCustomers,
            }));
        }
    })();

    const isMonthlyView = data.length > 20;

    return (
        <Paper p="md" mb="lg" withBorder>
            <Title order={3} mb="md">{isMonthlyView ? 'Monthly' : 'Weekly'} Customers Served</Title>
            <AreaChart
                h={280}
                data={chartData}
                dataKey="period"
                series={[
                    { name: 'totalCustomers', label: 'Total Customers', color: 'blue.6' },
                    { name: 'newCustomers', label: 'New Customers', color: 'orange.6' }
                ]}
                type="stacked"
                withLegend
                withTooltip
            />
            <Text size="xs" c="dimmed" mt="xs">
                Each customer counted only once per week and is considered new for only the week of their very first order.
            </Text>
        </Paper>
    );
};

export default WeeklyCustomersWidget;