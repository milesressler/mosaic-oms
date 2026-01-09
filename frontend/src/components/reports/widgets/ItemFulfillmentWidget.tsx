import React from 'react';
import { Paper, Title, Text } from '@mantine/core';
import { AreaChart, LineChart } from '@mantine/charts';
import { WeeklyItemFulfillment } from 'src/services/reportsApi';

interface ItemFulfillmentWidgetProps {
    data: WeeklyItemFulfillment[];
    loading?: boolean;
}

const ItemFulfillmentWidget: React.FC<ItemFulfillmentWidgetProps> = ({ data, loading }) => {
    if (!data || data.length === 0) {
        return null;
    }

    const stackedChartData = (() : Array<{period: string, filledItems: number, unfilledItems: number}> => {
        const rawData = data.map((item: WeeklyItemFulfillment) => ({
            weekStart: item.weekStart,
            filledItems: item.filledItems,
            unfilledItems: item.unfilledItems,
        }));

        // If more than 20 data points, aggregate by month
        if (rawData.length > 20) {
            const monthlyAgg = rawData.reduce((acc: Record<string, {filledItems: number, unfilledItems: number}>, item) => {
                const monthKey = new Date(item.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                });
                
                if (!acc[monthKey]) {
                    acc[monthKey] = { filledItems: 0, unfilledItems: 0 };
                }
                
                acc[monthKey].filledItems += item.filledItems;
                acc[monthKey].unfilledItems += item.unfilledItems;
                
                return acc;
            }, {});

            return Object.entries(monthlyAgg).map(([month, data]) => ({
                period: month,
                filledItems: data.filledItems,
                unfilledItems: data.unfilledItems,
            }));
        } else {
            // Weekly data
            return rawData.map((item) => ({
                period: new Date(item.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short', 
                    day: 'numeric' 
                }),
                filledItems: item.filledItems,
                unfilledItems: item.unfilledItems,
            }));
        }
    })();

    const fillRateChartData = (() : Array<{period: string, fillRate: number}> => {
        const rawData = data.map((item: WeeklyItemFulfillment) => ({
            weekStart: item.weekStart,
            fillRate: item.totalItems > 0 ? Math.round((item.filledItems / item.totalItems) * 100) : 0,
            filledItems: item.filledItems,
            totalItems: item.totalItems,
        }));

        // If more than 20 data points, aggregate by month
        if (rawData.length > 20) {
            const monthlyAgg = rawData.reduce((acc: Record<string, {filledItems: number, totalItems: number}>, item) => {
                const monthKey = new Date(item.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                });
                
                if (!acc[monthKey]) {
                    acc[monthKey] = { filledItems: 0, totalItems: 0 };
                }
                
                acc[monthKey].filledItems += item.filledItems;
                acc[monthKey].totalItems += item.totalItems;
                
                return acc;
            }, {});

            return Object.entries(monthlyAgg).map(([month, data]) => ({
                period: month,
                fillRate: data.totalItems > 0 ? Math.round((data.filledItems / data.totalItems) * 100) : 0,
            }));
        } else {
            // Weekly data
            return rawData.map((item) => ({
                period: new Date(item.weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short', 
                    day: 'numeric' 
                }),
                fillRate: item.fillRate,
            }));
        }
    })();

    const isMonthlyView = data.length > 20;

    return (
        <Paper p="md" mb="lg" withBorder>
            <Title order={3} mb="md">{isMonthlyView ? 'Monthly' : 'Weekly'} Item Fulfillment</Title>
            <AreaChart
                h={280}
                data={stackedChartData}
                dataKey="period"
                series={[
                    { name: 'filledItems', label: 'Items Filled', color: 'green.6' },
                    { name: 'unfilledItems', label: 'Items Unfilled', color: 'red.6' }
                ]}
                type="stacked"
                withLegend
                withTooltip
            />
            <LineChart
                h={120}
                data={fillRateChartData}
                dataKey="period"
                series={[
                    { name: 'fillRate', label: 'Period Fill Rate (%)', color: 'orange.6' }
                ]}
                withDots={{
                    fillRate: { fill: 'orange.7', stroke: 'orange.7', strokeWidth: 2, r: 4 }
                }}
                withLegend
                withTooltip
                yAxisProps={{
                    domain: [0, 100]
                }}
            />
            <Text size="xs" c="dimmed" mt="xs">
                Total stack height represents total requested items. Fill rate shows percentage of items successfully fulfilled.
            </Text>
        </Paper>
    );
};

export default ItemFulfillmentWidget;