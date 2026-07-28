import React from 'react';
import { Paper, Title } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { WeeklyShowerCount } from 'src/services/reportsApi';

interface WeeklyShowersWidgetProps {
    data: WeeklyShowerCount[];
    loading?: boolean;
}

const WeeklyShowersWidget: React.FC<WeeklyShowersWidgetProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return null;
    }

    const chartData = (() : Array<{period: string, showersCompleted: number}> => {
        const rawData = data.map((item: WeeklyShowerCount) => ({
            weekStart: item.weekStart,
            showersCompleted: item.showersCompleted,
        }));

        // If more than 20 data points, aggregate by month
        if (rawData.length > 20) {
            const monthlyAgg = rawData.reduce((acc: Record<string, {showersCompleted: number}>, item) => {
                const monthKey = new Date(item.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                });

                if (!acc[monthKey]) {
                    acc[monthKey] = { showersCompleted: 0 };
                }

                acc[monthKey].showersCompleted += item.showersCompleted;

                return acc;
            }, {});

            return Object.entries(monthlyAgg).map(([month, data]) => ({
                period: month,
                showersCompleted: data.showersCompleted,
            }));
        } else {
            // Weekly data
            return rawData.map((item) => ({
                period: new Date(item.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }),
                showersCompleted: item.showersCompleted,
            }));
        }
    })();

    const isMonthlyView = data.length > 20;

    return (
        <Paper p="md" mb="lg" withBorder>
            <Title order={3} mb="md">{isMonthlyView ? 'Monthly' : 'Weekly'} Showers Completed</Title>
            <AreaChart
                h={280}
                data={chartData}
                dataKey="period"
                series={[
                    { name: 'showersCompleted', label: 'Showers Completed', color: 'cyan.6' }
                ]}
                withLegend
                withTooltip
            />
        </Paper>
    );
};

export default WeeklyShowersWidget;
