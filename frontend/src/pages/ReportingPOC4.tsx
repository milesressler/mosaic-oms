import React, { useState } from 'react';
import {
    Container,
    Title,
    Select,
    Group,
    Card,
    Text,
    Badge,
    Button,
    Grid,
    Stack,
    Paper,
    RingProgress,
    SimpleGrid,
    Alert,
    Tabs,
    Table,
    Progress,
    ActionIcon,
    Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { AreaChart, BarChart, LineChart, DonutChart } from '@mantine/charts';
import { 
    IconUsers, 
    IconTruck, 
    IconClock,
    IconTrendingUp,
    IconAlertTriangle,
    IconCheck,
    IconChartPie,
    IconChartBar,
    IconCalendarStats,
    IconInfoCircle,
    IconPackage
} from '@tabler/icons-react';

// Global system metrics mock data
const systemMetrics = {
    overview: {
        totalOrders: 1847,
        totalCustomers: 892,
        totalItems: 156,
        avgOrderValue: 12.4,
        fillRate: 78,
        volunteers: 45,
        activeVolunteers: 32
    },
    weeklyData: [
        { week: 'Nov 1-7', customers: 285, firstTime: 67, returning: 218, itemsRequested: 4171, itemsFilled: 3420, unfilled: 751, avgProcessTime: 24, itemsPerOrder: 14.6, fillTimePerItem: 1.6 },
        { week: 'Nov 8-14', customers: 312, firstTime: 89, returning: 223, itemsRequested: 4739, itemsFilled: 3744, unfilled: 995, avgProcessTime: 26, itemsPerOrder: 15.2, fillTimePerItem: 1.7 },
        { week: 'Nov 15-21', customers: 298, firstTime: 73, returning: 225, itemsRequested: 4768, itemsFilled: 3576, unfilled: 1192, avgProcessTime: 28, itemsPerOrder: 16.0, fillTimePerItem: 1.8 },
        { week: 'Nov 22-28', customers: 356, firstTime: 94, returning: 262, itemsRequested: 5275, itemsFilled: 4272, unfilled: 1003, avgProcessTime: 22, itemsPerOrder: 14.8, fillTimePerItem: 1.5 },
        { week: 'Nov 29-Dec 5', customers: 289, firstTime: 61, returning: 228, itemsRequested: 4503, itemsFilled: 3468, unfilled: 1035, avgProcessTime: 25, itemsPerOrder: 15.6, fillTimePerItem: 1.6 },
        { week: 'Dec 6-12', customers: 307, firstTime: 78, returning: 229, itemsRequested: 4605, itemsFilled: 3684, unfilled: 921, avgProcessTime: 23, itemsPerOrder: 15.0, fillTimePerItem: 1.5 },
    ],
    customerSegments: [
        { timeframe: 'Last 6 weeks', firstTime: 134, occasional: 223, regular: 356, frequent: 179 },
        { timeframe: 'Last 10 weeks', firstTime: 189, occasional: 267, regular: 398, frequent: 238 },
        { timeframe: 'Last 3 months', firstTime: 245, occasional: 334, regular: 445, frequent: 301 },
    ],
    operationalMetrics: {
        avgOrderProcessTime: 24.5, // minutes
        serviceWindowPatterns: [
            { timeSlot: '9:00-9:10', totalOrders: 23, week1: 4, week2: 3, week3: 5, week4: 4, week5: 3, week6: 4, avgBusArrivals: 0.2 },
            { timeSlot: '9:10-9:20', totalOrders: 31, week1: 6, week2: 4, week3: 7, week4: 5, week5: 5, week6: 4, avgBusArrivals: 0.8 },
            { timeSlot: '9:20-9:30', totalOrders: 45, week1: 8, week2: 7, week3: 9, week4: 8, week5: 6, week6: 7, avgBusArrivals: 1.3 },
            { timeSlot: '9:30-9:40', totalOrders: 67, week1: 12, week2: 10, week3: 13, week4: 11, week5: 11, week6: 10, avgBusArrivals: 0.7 },
            { timeSlot: '9:40-9:50', totalOrders: 89, week1: 15, week2: 16, week3: 17, week4: 14, week5: 13, week6: 14, avgBusArrivals: 1.5 },
            { timeSlot: '9:50-10:00', totalOrders: 98, week1: 17, week2: 18, week3: 19, week4: 16, week5: 14, week6: 14, avgBusArrivals: 2.2 },
            { timeSlot: '10:00-10:10', totalOrders: 112, week1: 19, week2: 21, week3: 22, week4: 18, week5: 16, week6: 16, avgBusArrivals: 1.8 },
            { timeSlot: '10:10-10:20', totalOrders: 87, week1: 15, week2: 16, week3: 17, week4: 14, week5: 12, week6: 13, avgBusArrivals: 0.5 },
            { timeSlot: '10:20-10:30', totalOrders: 73, week1: 13, week2: 14, week3: 15, week4: 12, week5: 10, week6: 9, avgBusArrivals: 0.3 },
            { timeSlot: '10:30-10:40', totalOrders: 56, week1: 10, week2: 11, week3: 12, week4: 9, week5: 8, week6: 6, avgBusArrivals: 0.7 },
            { timeSlot: '10:40-10:50', totalOrders: 34, week1: 6, week2: 7, week3: 8, week4: 5, week5: 4, week6: 4, avgBusArrivals: 0.2 },
            { timeSlot: '10:50-11:00', totalOrders: 18, week1: 3, week2: 4, week3: 4, week4: 3, week5: 2, week6: 2, avgBusArrivals: 0.0 },
        ],
        busArrivalPatterns: [
            { time: '9:15', avgPassengers: 12, frequency: 'Weekly - Route A' },
            { time: '9:45', avgPassengers: 23, frequency: 'Weekly - Route B (High Volume)' },
            { time: '9:55', avgPassengers: 18, frequency: 'Bi-weekly - Route C' },
            { time: '10:25', avgPassengers: 8, frequency: 'Monthly - Route D' },
        ],
        bottlenecks: [
            { stage: 'Order Taking', avgTime: 4.2, target: 3.0, status: 'warning' },
            { stage: 'Item Collection', avgTime: 12.8, target: 10.0, status: 'warning' },
            { stage: 'Packing', avgTime: 5.1, target: 4.0, status: 'warning' },
            { stage: 'Distribution', avgTime: 2.4, target: 3.0, status: 'good' },
        ]
    }
};

const ReportingPOC4: React.FC = () => {
    const [viewMode, setViewMode] = useState<string>('overview');
    const [dateRange, setDateRange] = useState<string>('6weeks');
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);

    // Get available date range options
    const getDateRangeOptions = () => [
        { value: '6weeks', label: 'Last 6 Weeks' },
        { value: '3months', label: 'Last 3 Months' },
        { value: '6months', label: 'Last 6 Months' },
        { value: '1year', label: 'Last Year (365 days)' },
        { value: '2025', label: 'Year 2025' },
        { value: 'lastyear', label: 'Previous Year (2024)' },
        { value: 'custom', label: 'Custom Range' },
    ];

    return (
        <Container size="xl" py="md">
            <Group justify="space-between" mb="lg">
                <Title order={1}>Reports POC v4 - System Operations Dashboard</Title>
                <Group gap="xs">
                    <Badge variant="light" color="green">System-Wide</Badge>
                    <Badge variant="light" color="blue">Operations Focus</Badge>
                </Group>
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

                <Button
                    variant="light"
                    size="sm"
                    onClick={() => {
                        setDateRange('6weeks');
                        setCustomDateRange([null, null]);
                    }}
                >
                    Reset Filters
                </Button>
            </Group>

            {/* Key Performance Indicators */}
            <SimpleGrid cols={{ base: 2, md: 4, lg: 6 }} mb="xl">
                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                            <IconUsers size={24} color="var(--mantine-color-blue-6)" />
                            <Tooltip label="Number of orders completed during the selected time period">
                                <ActionIcon variant="subtle" size="xs">
                                    <IconInfoCircle size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                    <Text size="xl" fw={700}>{systemMetrics.overview.totalOrders.toLocaleString()}</Text>
                    <Text size="sm" c="dimmed">Orders Completed</Text>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                            <IconUsers size={24} color="var(--mantine-color-green-6)" />
                            <Tooltip label="Unique customers who received orders during the selected time period">
                                <ActionIcon variant="subtle" size="xs">
                                    <IconInfoCircle size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                    <Text size="xl" fw={700}>{systemMetrics.overview.totalCustomers.toLocaleString()}</Text>
                    <Text size="sm" c="dimmed">Customers Served</Text>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                            <IconTruck size={24} color="var(--mantine-color-orange-6)" />
                            <Tooltip label="Percentage of requested items that were successfully fulfilled">
                                <ActionIcon variant="subtle" size="xs">
                                    <IconInfoCircle size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                    <Text size="xl" fw={700}>{systemMetrics.overview.fillRate}%</Text>
                    <Text size="sm" c="dimmed">Fill Rate</Text>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                            <IconClock size={24} color="var(--mantine-color-violet-6)" />
                            <Tooltip label="Average time from order creation to completion during the selected period">
                                <ActionIcon variant="subtle" size="xs">
                                    <IconInfoCircle size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                    <Text size="xl" fw={700}>{systemMetrics.operationalMetrics.avgOrderProcessTime}m</Text>
                    <Text size="sm" c="dimmed">Avg Process Time</Text>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                            <IconUsers size={24} color="var(--mantine-color-teal-6)" />
                            <Tooltip label="Number of volunteers who actively participated in order fulfillment during the selected period">
                                <ActionIcon variant="subtle" size="xs">
                                    <IconInfoCircle size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                    <Text size="xl" fw={700}>{systemMetrics.overview.activeVolunteers}</Text>
                    <Text size="sm" c="dimmed">Active Volunteers</Text>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                            <IconTrendingUp size={24} color="var(--mantine-color-indigo-6)" />
                            <Tooltip label="Average number of items per order during the selected period">
                                <ActionIcon variant="subtle" size="xs">
                                    <IconInfoCircle size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                    <Text size="xl" fw={700}>{systemMetrics.overview.avgOrderValue}</Text>
                    <Text size="sm" c="dimmed">Avg Items Per Order</Text>
                </Card>
            </SimpleGrid>

            <Tabs value={viewMode} onChange={(value) => setViewMode(value || 'overview')}>
                <Tabs.List>
                    <Tabs.Tab value="overview" leftSection={<IconChartPie size={14} />}>
                        System Overview
                    </Tabs.Tab>
                    <Tabs.Tab value="operations" leftSection={<IconChartBar size={14} />}>
                        Operations Analysis
                    </Tabs.Tab>
                    <Tabs.Tab value="trends" leftSection={<IconCalendarStats size={14} />}>
                        Historical Trends
                    </Tabs.Tab>
                </Tabs.List>

                {/* System Overview Tab */}
                <Tabs.Panel value="overview" pt="md">
                    <Grid>
                        <Grid.Col span={{ base: 12, lg: 4 }}>
                            <Card padding="lg" radius="md" withBorder mb="md">
                                <Text fw={500} mb="md">👥 Weekly Customers Served</Text>
                                <AreaChart
                                    h={280}
                                    data={systemMetrics.weeklyData}
                                    dataKey="week"
                                    series={[
                                        { name: 'firstTime', label: 'First Time Customers', color: 'blue.6' },
                                        { name: 'returning', label: 'Returning Customers', color: 'green.6' }
                                    ]}
                                    type="stacked"
                                    withLegend
                                    withTooltip
                                />
                                <Text size="xs" c="dimmed" mt="xs">
                                    Each customer counted only once per week. First-time designation is lifetime status.
                                </Text>
                            </Card>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 4 }}>
                            <Card padding="lg" radius="md" withBorder mb="md">
                                <Text fw={500} mb="md">📦 Weekly Item Fulfillment</Text>
                                <AreaChart
                                    h={280}
                                    data={systemMetrics.weeklyData}
                                    dataKey="week"
                                    series={[
                                        { name: 'itemsFilled', label: 'Items Filled', color: 'green.6' },
                                        { name: 'unfilled', label: 'Items Unfilled', color: 'red.6' }
                                    ]}
                                    type="stacked"
                                    withLegend
                                    withTooltip
                                />
                                <Text size="xs" c="dimmed" mt="xs">
                                    Total stack height represents total requested items. Fill rate correlates with green proportion.
                                </Text>
                            </Card>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 4 }}>
                            <Card padding="lg" radius="md" withBorder mb="md">
                                <Text fw={500} mb="md">⚡ Process Efficiency Trends</Text>
                                <LineChart
                                    h={280}
                                    data={systemMetrics.weeklyData}
                                    dataKey="week"
                                    series={[
                                        { name: 'avgProcessTime', label: 'Process Time (min)', color: 'orange.6' },
                                        { name: 'itemsPerOrder', label: 'Items per Order', color: 'blue.6' },
                                        { name: 'fillTimePerItem', label: 'Fill Time per Item (min)', color: 'purple.6' }
                                    ]}
                                    withLegend
                                    withTooltip
                                />
                                <Text size="xs" c="dimmed" mt="xs">
                                    Expected correlation: more items per order should increase process time and fill time per item.
                                </Text>
                            </Card>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 8 }}>
                            <Card padding="lg" radius="md" withBorder>
                                <Text fw={500} mb="md">📈 Historical Context</Text>
                                <Text c="dimmed" size="sm">
                                    The three charts above show focused metrics that should correlate:<br/>
                                    • <strong>Customers:</strong> First-time vs returning (lifetime designation)<br/>
                                    • <strong>Items:</strong> Filled vs unfilled requests (visual fill rate)<br/>
                                    • <strong>Efficiency:</strong> Process time vs order complexity relationships
                                </Text>
                            </Card>
                        </Grid.Col>

                    </Grid>
                </Tabs.Panel>

                {/* Operations Analysis Tab */}
                <Tabs.Panel value="operations" pt="md">
                    <Grid>
                        <Grid.Col span={{ base: 12, lg: 8 }}>
                            <Card padding="lg" radius="md" withBorder mb="md">
                                <Text fw={500} mb="md">📅 Order Creation Patterns - Sunday Service Window (9:00-11:00 AM)</Text>
                                <AreaChart
                                    h={300}
                                    data={systemMetrics.operationalMetrics.serviceWindowPatterns}
                                    dataKey="timeSlot"
                                    series={[
                                        { name: 'week1', label: 'Week 1', color: 'blue.3' },
                                        { name: 'week2', label: 'Week 2', color: 'green.3' },
                                        { name: 'week3', label: 'Week 3', color: 'orange.3' },
                                        { name: 'week4', label: 'Week 4', color: 'purple.3' },
                                        { name: 'week5', label: 'Week 5', color: 'red.3' },
                                        { name: 'week6', label: 'Week 6', color: 'teal.3' }
                                    ]}
                                    withLegend
                                    withTooltip
                                />
                                <Text size="xs" c="dimmed" mt="xs">
                                    Order creation patterns across 10-minute intervals during Sunday service window. 
                                </Text>
                            </Card>

                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 4 }}>
                            <Card padding="lg" radius="md" withBorder>
                                <Text fw={500} mb="md">⏱️ Typical Process Times</Text>
                                <Stack gap="md">
                                    {systemMetrics.operationalMetrics.bottlenecks.map((stage) => (
                                        <Paper key={stage.stage} p="md" withBorder>
                                            <Group justify="space-between" align="center">
                                                <div>
                                                    <Text size="sm" fw={500} mb="xs">{stage.stage}</Text>
                                                    <Text size="xs" c="dimmed">Average duration per order</Text>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <Text size="xl" fw={700} c="blue">{stage.avgTime}</Text>
                                                    <Text size="xs" c="dimmed">minutes</Text>
                                                </div>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Stack>
                                <Text size="xs" c="dimmed" mt="md">
                                    📊 These are typical times based on completed orders. Times may vary based on order complexity and volunteer experience.
                                </Text>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>

                {/* Historical Trends Tab */}
                <Tabs.Panel value="trends" pt="md">
                    <Grid>
                        <Grid.Col span={12}>
                            <Card padding="lg" radius="md" withBorder mb="md">
                                <Text fw={500} mb="md">📈 Fill Rate & Process Time Trends</Text>
                                <LineChart
                                    h={300}
                                    data={systemMetrics.weeklyData.map(week => ({
                                        ...week,
                                        fillRate: Math.round((week.itemsFilled / week.itemsRequested) * 100)
                                    }))}
                                    dataKey="week"
                                    series={[
                                        { name: 'fillRate', label: 'Fill Rate %', color: 'green.6' },
                                        { name: 'avgProcessTime', label: 'Avg Process Time (min)', color: 'red.6' }
                                    ]}
                                    withLegend
                                    withTooltip
                                />
                            </Card>
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Card padding="lg" radius="md" withBorder>
                                <Text fw={500} mb="md">📋 Weekly Performance Summary</Text>
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Week</Table.Th>
                                            <Table.Th>Customers</Table.Th>
                                            <Table.Th>Items Requested</Table.Th>
                                            <Table.Th>Fill Rate</Table.Th>
                                            <Table.Th>Process Time</Table.Th>
                                            <Table.Th>Items per Order</Table.Th>
                                            <Table.Th>Fill Time per Item</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {systemMetrics.weeklyData.map((week) => {
                                            const fillRate = Math.round((week.itemsFilled / week.itemsRequested) * 100);
                                            return (
                                                <Table.Tr key={week.week}>
                                                    <Table.Td>
                                                        <Text size="sm" fw={500}>{week.week}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Badge variant="light" color="blue">{week.customers}</Badge>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm">{week.itemsRequested.toLocaleString()}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Badge 
                                                            size="sm" 
                                                            color={fillRate >= 80 ? 'green' : fillRate >= 75 ? 'yellow' : 'red'}
                                                        >
                                                            {fillRate}%
                                                        </Badge>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm">
                                                            {week.avgProcessTime}min
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm">{week.itemsPerOrder}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm">{week.fillTimePerItem}min</Text>
                                                    </Table.Td>
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
                                </Table>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
};

export default ReportingPOC4;
