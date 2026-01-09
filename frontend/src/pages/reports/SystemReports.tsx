import React, {useEffect, useState} from 'react';
import {
    Alert,
    Button,
    Container,
    Grid,
    Group,
    LoadingOverlay,
    Paper,
    Select,
    SimpleGrid,
    Tabs,
    Text,
    Title,
} from '@mantine/core';
import {DatePickerInput} from '@mantine/dates';
import {AreaChart, LineChart} from '@mantine/charts';
import {IconUsers, IconTruck, IconPackage, IconTrendingUp} from '@tabler/icons-react';
import useApi from 'src/hooks/useApi';
import reportsApi, {WeeklyCustomerCount, WeeklyItemFulfillment} from 'src/services/reportsApi';
import SystemOverviewWidget from 'src/components/reports/widgets/SystemOverviewWidget';

const SystemReports: React.FC = () => {
    const [viewMode, setViewMode] = useState<string>('overview');
    const [dateRange, setDateRange] = useState<string>('6weeks');
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
    
    const systemMetricsApi = useApi(reportsApi.getSystemMetrics);
    const weeklyCustomersApi = useApi(reportsApi.getWeeklyCustomersServed);
    const weeklyItemFulfillmentApi = useApi(reportsApi.getWeeklyItemFulfillment);

    useEffect(() => {
        // Load initial data
        const params: any = { range: dateRange };
        
        if (dateRange === 'custom' && customDateRange[0] && customDateRange[1]) {
            params.startDate = customDateRange[0].toISOString().split('T')[0];
            params.endDate = customDateRange[1].toISOString().split('T')[0];
        }
        
        systemMetricsApi.request(params);
        if (viewMode === 'overview') {
            weeklyCustomersApi.request(params);
            weeklyItemFulfillmentApi.request(params);
        }
    }, [dateRange, customDateRange, viewMode]);

    const thisYear = (new Date()).getFullYear();
    // Get available date range options
    const getDateRangeOptions = () => [
        { value: '6weeks', label: '6 Weeks' },
        { value: '3months', label: '3 Months' },
        { value: '6months', label: '6 Months' },
        { value: '1year', label: '1 Year (12 months)' },
        { value: `thisyear`, label: `This year (${thisYear})` },
        { value: `lastyear`, label: `Last Year (${thisYear-1})` },
        { value: 'custom', label: 'Custom Range' },
    ];

    const handleRefresh = () => {
        const params: any = { range: dateRange };
        
        if (dateRange === 'custom' && customDateRange[0] && customDateRange[1]) {
            params.startDate = customDateRange[0].toISOString().split('T')[0];
            params.endDate = customDateRange[1].toISOString().split('T')[0];
        }
        
        systemMetricsApi.request(params);
        if (viewMode === 'overview') {
            weeklyCustomersApi.request(params);
            weeklyItemFulfillmentApi.request(params);
        }
    };

    const handleReset = () => {
        setDateRange('6weeks');
        setCustomDateRange([null, null]);
    };

    if (systemMetricsApi.error) {
        return (
            <Container size="xl" py="md">
                <Alert variant="light" color="red" title="Error Loading Reports">
                    {systemMetricsApi.error}
                </Alert>
            </Container>
        );
    }

    const data = systemMetricsApi.data;

    return (
        <Container size="xl" py="md">
            <LoadingOverlay visible={systemMetricsApi.loading} overlayProps={{ blur: 2 }} />
            
            <Group justify="space-between" mb="lg">
                <Title order={1}>Operations Overview</Title>
            </Group>

            {/* Controls */}
            <Group mb="lg" align="flex-end">
                <Select
                    label="Date Range"
                    value={dateRange}
                    onChange={(value) => setDateRange(value || '6weeks')}
                    data={getDateRangeOptions()}
                    w={200}
                />
                
                {dateRange === 'custom' && (
                    <DatePickerInput
                        type="range"
                        label="Custom Date Range"
                        value={customDateRange}
                        onChange={setCustomDateRange}
                        clearable
                        w={250}
                    />
                )}

                <Button variant="light" size="sm" onClick={handleRefresh}>
                    Refresh
                </Button>

                <Button variant="light" size="sm" onClick={handleReset}>
                    Reset Filters
                </Button>
            </Group>

            {/* Key Performance Indicators - Always visible */}
            {data && (
                <SimpleGrid cols={{ base: 2, md: 4, lg: 6 }} mb="xl">
                    <SystemOverviewWidget
                        value={data.overview.totalOrders.toLocaleString()}
                        label="Orders Completed"
                        tooltip="Number of orders completed during the selected time period"
                        icon={<IconUsers size={24} />}
                        color="var(--mantine-color-blue-6)"
                    />
                    
                    <SystemOverviewWidget
                        value={data.overview.totalCustomers.toLocaleString()}
                        label="Customers Served"
                        tooltip="Unique customers who received orders during the selected time period"
                        icon={<IconUsers size={24} />}
                        color="var(--mantine-color-green-6)"
                    />
                    
                    <SystemOverviewWidget
                        value={`${(data.overview.fillRate * 100).toFixed(1)}%`}
                        label="Fill Rate"
                        tooltip="Percentage of requested items that were successfully fulfilled"
                        icon={<IconTruck size={24} />}
                        color="var(--mantine-color-orange-6)"
                    />
                    
                    <SystemOverviewWidget
                        value={data.overview.totalItems.toLocaleString()}
                        label="Total Items"
                        tooltip="Total number of items distributed during the selected period"
                        icon={<IconPackage size={24} />}
                        color="var(--mantine-color-violet-6)"
                    />
                    
                    <SystemOverviewWidget
                        value={data.overview.activeVolunteers}
                        label="Active Volunteers"
                        tooltip="Number of volunteers who actively participated in order fulfillment during the selected period"
                        icon={<IconUsers size={24} />}
                        color="var(--mantine-color-teal-6)"
                    />
                    
                    <SystemOverviewWidget
                        value={data.overview.avgItemsPerOrder.toFixed(1)}
                        label="Avg Items Per Order"
                        tooltip="Average number of items per order during the selected period"
                        icon={<IconTrendingUp size={24} />}
                        color="var(--mantine-color-indigo-6)"
                    />
                </SimpleGrid>
            )}

            {/* Detailed Reports Tabs */}
            <Tabs value={viewMode} onChange={setViewMode}>
                <Tabs.List>
                    <Tabs.Tab value="overview">System Overview</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview" pt="md">
                    <Grid>
                        <Grid.Col span={{ base: 12, lg: 6 }}>
                            {weeklyCustomersApi.data && (
                                <Paper p="md" mb="lg" withBorder>
                                    <Title order={3} mb="md">{(weeklyCustomersApi.data || []).length > 20 ? 'Monthly' : 'Weekly'} Customers Served</Title>
                                    <AreaChart
                                        h={280}
                                        data={(() : Array<{period: string, totalCustomers: number, newCustomers: number}> => {
                                            const rawData = weeklyCustomersApi.data.map((item: WeeklyCustomerCount) => ({
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
                                        })()}
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
                            )}
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 6 }}>
                            {weeklyItemFulfillmentApi.data && (
                                <Paper p="md" mb="lg" withBorder>
                                    <Title order={3} mb="md">{(weeklyItemFulfillmentApi.data || []).length > 20 ? 'Monthly' : 'Weekly'} Item Fulfillment</Title>
                                    <AreaChart
                                        h={280}
                                        data={(() : Array<{period: string, filledItems: number, unfilledItems: number}> => {
                                            const rawData = weeklyItemFulfillmentApi.data.map((item: WeeklyItemFulfillment) => ({
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
                                        })()}
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
                                        data={(() : Array<{period: string, fillRate: number}> => {
                                            const rawData = weeklyItemFulfillmentApi.data.map((item: WeeklyItemFulfillment) => ({
                                                weekStart: item.weekStart,
                                                fillRate: item.totalItems > 0 ? Math.round((item.filledItems / item.totalItems) * 100) : 0,
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
                                                    
                                                    const originalItem = weeklyItemFulfillmentApi.data.find(d => d.weekStart === item.weekStart);
                                                    if (originalItem) {
                                                        acc[monthKey].filledItems += originalItem.filledItems;
                                                        acc[monthKey].totalItems += originalItem.totalItems;
                                                    }
                                                    
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
                                        })()}
                                        dataKey="period"
                                        series={[
                                            { name: 'fillRate', label: 'Fill Rate (%)', color: 'orange.6' }
                                        ]}
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
                            )}
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
};

export default SystemReports;
