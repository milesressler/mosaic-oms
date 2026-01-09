import React, { useMemo } from 'react';
import { Paper, Title, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { OrderCreationPatterns } from 'src/services/reportsApi';

interface OrderCreationPatternsWidgetProps {
    data: OrderCreationPatterns;
    loading?: boolean;
}

const OrderCreationPatternsWidget: React.FC<OrderCreationPatternsWidgetProps> = ({ data, loading }) => {
    if (!data || Object.keys(data).length === 0) {
        return null;
    }

    const { chartData, chartSeries, isMonthlyView } = useMemo(() => {
        const timeSlots = Object.keys(data).sort((a, b) => {
            // Parse time strings like "9:00-9:10" and sort by start time
            const timeA = a.split('-')[0];
            const timeB = b.split('-')[0];
            const [hoursA, minutesA] = timeA.split(':').map(Number);
            const [hoursB, minutesB] = timeB.split(':').map(Number);
            
            if (hoursA !== hoursB) {
                return hoursA - hoursB;
            }
            return minutesA - minutesB;
        });
        const allDates = new Set<string>();
        
        // Collect all dates across all time slots
        Object.values(data).forEach(timeSlotData => {
            Object.keys(timeSlotData).forEach(date => allDates.add(date));
        });
        
        const sortedDates = Array.from(allDates).sort();
        const isMonthlyView = sortedDates.length > 20;
        
        // For monthly view: group by month and sum counts
        const processedData = isMonthlyView ? 
            groupByMonth(data, timeSlots, sortedDates) :
            formatWeeklyData(data, timeSlots, sortedDates);

        // Create chart data: each time slot becomes a row with date columns + average
        const chartData = timeSlots.map(timeSlot => {
            const row: any = { timeSlot };
            const values: number[] = [];
            
            Object.keys(processedData[timeSlot] || {}).forEach(period => {
                const value = processedData[timeSlot][period] || 0;
                row[period] = value;
                values.push(value);
            });
            
            // Calculate average
            row.averageOrders = values.length > 0 ? 
                Number((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)) : 0;
            
            return row;
        });

        // Create chart series
        const periods = Object.keys(processedData[timeSlots[0]] || {});
        const lightColors = ['gray.4', 'blue.3', 'green.3', 'orange.3', 'purple.3', 'red.3', 'teal.3', 'yellow.3', 'pink.3', 'indigo.3'];
        
        const chartSeries = [
            { name: 'averageOrders', label: 'Average Orders', color: 'blue.6', strokeWidth: 4 },
            ...periods.map((period, index) => {
                const date = new Date(period + 'T00:00:00');
                const label = isMonthlyView ? 
                    date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return {
                    name: period,
                    label,
                    color: lightColors[index % lightColors.length],
                    strokeWidth: 1,
                    strokeDasharray: '2 2'
                };
            })
        ];

        return { chartData, chartSeries, isMonthlyView };
    }, [data]);

    // Helper function to group weekly data by month
    function groupByMonth(data: OrderCreationPatterns, timeSlots: string[], dates: string[]) {
        const result: Record<string, Record<string, number>> = {};
        
        timeSlots.forEach(timeSlot => {
            const monthGroups: Record<string, number> = {};
            
            dates.forEach(date => {
                const monthKey = date.substring(0, 7); // "2024-01"
                const count = data[timeSlot]?.[date] || 0;
                monthGroups[monthKey] = (monthGroups[monthKey] || 0) + count;
            });
            
            result[timeSlot] = monthGroups;
        });
        
        return result;
    }

    // Helper function to format weekly data as-is
    function formatWeeklyData(data: OrderCreationPatterns, timeSlots: string[], dates: string[]) {
        const result: Record<string, Record<string, number>> = {};
        
        timeSlots.forEach(timeSlot => {
            result[timeSlot] = data[timeSlot] || {};
        });
        
        return result;
    }

    return (
        <Paper p="md" mb="lg" withBorder>
            <Title order={3} mb="md">Order Creation Patterns - Sunday Service Window (9:00-11:00 AM Central)</Title>
            <LineChart
                h={300}
                data={chartData}
                dataKey="timeSlot"
                series={chartSeries}
                withDots={{
                    averageOrders: { fill: 'blue.6', stroke: 'blue.6', strokeWidth: 2, r: 4 }
                }}
                withLegend
                withTooltip
            />
            <Text size="xs" c="dimmed" mt="xs">
                Order creation patterns across 10-minute intervals during Sunday service window.  Each colored line represents different time periods in the selected date range.
            </Text>
        </Paper>
    );
};

export default OrderCreationPatternsWidget;
