import React from 'react';
import { Paper, Title, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { OrderCreationPattern } from 'src/services/reportsApi';

interface OrderCreationPatternsWidgetProps {
    data: OrderCreationPattern[];
    loading?: boolean;
}

const OrderCreationPatternsWidget: React.FC<OrderCreationPatternsWidgetProps> = ({ data, loading }) => {
    if (!data || data.length === 0) {
        return null;
    }

    const chartData = (() => {
        const firstRow = data[0];
        const weekColumns = Object.keys(firstRow).filter(key => key.startsWith('week_'));
        
        // Calculate average orders per time slot across all weeks (as decimal)
        const dataWithAverages = data.map(row => {
            const weekValues = weekColumns.map(weekCol => Number(row[weekCol]) || 0);
            const average = weekValues.length > 0 ? 
                Number((weekValues.reduce((sum, val) => sum + val, 0) / weekValues.length).toFixed(1)) : 0;
            
            return {
                ...row,
                averageOrders: average
            };
        });
        
        return dataWithAverages;
    })();

    const chartSeries = (() => {
        // Generate average line (prominent) plus individual week lines (light)
        const firstRow = data[0];
        const weekColumns = Object.keys(firstRow).filter(key => key.startsWith('week_'));
        const lightColors = ['gray.4', 'blue.3', 'green.3', 'orange.3', 'purple.3', 'red.3', 'teal.3', 'yellow.3', 'pink.3', 'indigo.3'];
        
        const isMonthlyView = weekColumns.length > 20;
        
        // Start with the average line as the primary series (thick and filled)
        const series = [
            { name: 'averageOrders', label: 'Average Orders', color: 'blue.6', strokeWidth: 4 }
        ];
        
        // Add individual week series as thin lines
        weekColumns.forEach((weekKey, index) => {
            const dateStr = weekKey.replace('week_', '');
            const date = new Date(dateStr + 'T00:00:00');
            
            let label;
            if (isMonthlyView) {
                label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            } else {
                label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            
            series.push({
                name: weekKey,
                label,
                color: lightColors[index % lightColors.length],
                strokeWidth: 1,
                strokeDasharray: '2 2'
            });
        });
        
        return series;
    })();

    const weekColumns = Object.keys(data[0]).filter(key => key.startsWith('week'));
    const isMonthlyView = weekColumns.length > 20;

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
