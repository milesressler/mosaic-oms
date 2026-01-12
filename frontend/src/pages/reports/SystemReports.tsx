import React, {useEffect, useState} from 'react';
import {
    Alert,
    Button,
    Container,
    Grid,
    Group,
    LoadingOverlay,
    Select,
    SimpleGrid,
    Tabs,
    Title,
} from '@mantine/core';
import {DatePickerInput} from '@mantine/dates';
import {IconUsers, IconTruck, IconPackage, IconTrendingUp} from '@tabler/icons-react';
import useApi from 'src/hooks/useApi';
import reportsApi from 'src/services/reportsApi';
import SystemOverviewWidget from 'src/components/reports/widgets/SystemOverviewWidget';
import WeeklyCustomersWidget from 'src/components/reports/widgets/WeeklyCustomersWidget';
import ItemFulfillmentWidget from 'src/components/reports/widgets/ItemFulfillmentWidget';
import OrderCreationPatternsWidget from 'src/components/reports/widgets/OrderCreationPatternsWidget';
import BiggestMoversWidget from 'src/components/reports/widgets/BiggestMoversWidget';
import ProcessTimesWidget from 'src/components/reports/widgets/ProcessTimesWidget';

const SystemReports: React.FC = () => {
    const [viewMode, setViewMode] = useState<string>('overview');
    const [dateRange, setDateRange] = useState<string>('6weeks');
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
    
    const systemMetricsApi = useApi(reportsApi.getSystemMetrics);
    const weeklyCustomersApi = useApi(reportsApi.getWeeklyCustomersServed);
    const weeklyItemFulfillmentApi = useApi(reportsApi.getWeeklyItemFulfillment);
    const orderCreationPatternsApi = useApi(reportsApi.getOrderCreationPatterns);
    const biggestMoversApi = useApi(reportsApi.getBiggestMovers);
    const processTimingsApi = useApi(reportsApi.getProcessTimings);

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
            orderCreationPatternsApi.request(params);
            biggestMoversApi.request(params);
            processTimingsApi.request(params);
        }
    }, [dateRange, customDateRange, viewMode]);

    const thisYear = (new Date()).getFullYear();
    
    // Helper function to get the most recent Sunday
    const getMostRecentSunday = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    };
    
    // Helper function to format date for display
    const formatDateRange = (startDate: Date) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[startDate.getMonth()]} ${startDate.getDate()}`;
    };
    
    // Get available date range options
    const getDateRangeOptions = () => {
        const today = new Date();
        const thisWeekStart = getMostRecentSunday(today);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        
        return [
            { value: 'thisweek', label: `This Week (${formatDateRange(thisWeekStart)})` },
            { value: 'lastweek', label: `Last Week (${formatDateRange(lastWeekStart)})` },
            { value: '6weeks', label: '6 Weeks' },
            { value: '3months', label: '3 Months' },
            { value: '6months', label: '6 Months' },
            { value: '1year', label: '1 Year (12 months)' },
            { value: `thisyear`, label: `This year (${thisYear})` },
            { value: `lastyear`, label: `Last Year (${thisYear-1})` },
            { value: 'custom', label: 'Custom Range' },
        ];
    };

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
            orderCreationPatternsApi.request(params);
            biggestMoversApi.request(params);
            processTimingsApi.request(params);
        }
    };

    const handleReset = () => {
        setDateRange('6weeks');
        setCustomDateRange([null, null]);
    };

    // if (systemMetricsApi.error) {
    //     return (
    //         <Container size="xl" py="md">
    //             <Alert variant="light" color="red" title="Error Loading Reports">
    //                 {systemMetricsApi.error}
    //             </Alert>
    //         </Container>
    //     );
    // }

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
                        <Grid.Col span={{ base: 12, lg: 4 }}>
                            <WeeklyCustomersWidget 
                                data={weeklyCustomersApi.data || []}
                                loading={weeklyCustomersApi.loading}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 4 }}>
                            <ItemFulfillmentWidget 
                                data={weeklyItemFulfillmentApi.data || []}
                                loading={weeklyItemFulfillmentApi.loading}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 4 }}>
                            <BiggestMoversWidget 
                                data={biggestMoversApi.data || []}
                                loading={biggestMoversApi.loading}
                                dateInfo={dateRange === 'thisweek' ? formatDateRange(getMostRecentSunday(new Date())) :
                                         dateRange === 'lastweek' ? formatDateRange((() => {
                                            const lastWeek = new Date(getMostRecentSunday(new Date()));
                                            lastWeek.setDate(lastWeek.getDate() - 7);
                                            return lastWeek;
                                         })()) : undefined}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 8 }}>
                            <OrderCreationPatternsWidget 
                                data={orderCreationPatternsApi.data || {}}
                                loading={orderCreationPatternsApi.loading}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 4 }}>
                            <ProcessTimesWidget 
                                data={processTimingsApi.data?.processStages || []}
                                loading={processTimingsApi.loading}
                            />
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
};

export default SystemReports;
