import React, { useState } from 'react';
import {
    Box,
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
    Checkbox,
    SegmentedControl,
    Tabs,
    Table,
    Paper,
    RingProgress,
    SimpleGrid,
    Alert,
    ActionIcon,
    Tooltip,
    Switch,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { AreaChart, BarChart, LineChart, DonutChart } from '@mantine/charts';
import { 
    IconCalendar, 
    IconTrendingUp, 
    IconTrendingDown, 
    IconEqual,
    IconInfoCircle,
    IconChartLine,
    IconTable,
    IconGitCompare
} from '@tabler/icons-react';

// Time-series focused mock data
const timeSeriesData = {
    'jeans-mens': {
        name: 'Jeans MENS',
        totalRequested: 245,
        totalFulfilled: 201,
        fillRate: 82,
        hasGender: true,
        // Weekly time series data with attribute breakdowns
        timeData: [
            { 
                week: 'Nov 1-7', 
                date: '2024-11-01',
                total: 38, 
                filled: 32,
                sizeBreakdown: { '28': 3, '30': 7, '32': 12, '34': 8, '36': 5, '38': 2, '40': 1 },
                sizeFilled: { '28': 3, '30': 6, '32': 10, '34': 7, '36': 4, '38': 1, '40': 1 },
                colorBreakdown: { 'Blue': 20, 'Black': 12, 'Dark Wash': 6 },
                colorFilled: { 'Blue': 17, 'Black': 10, 'Dark Wash': 5 },
                trend: 'stable',
                events: []
            },
            { 
                week: 'Nov 8-14', 
                date: '2024-11-08',
                total: 45, 
                filled: 38,
                sizeBreakdown: { '28': 4, '30': 9, '32': 15, '34': 10, '36': 4, '38': 2, '40': 1 },
                sizeFilled: { '28': 4, '30': 8, '32': 13, '34': 8, '36': 3, '38': 1, '40': 1 },
                colorBreakdown: { 'Blue': 24, 'Black': 14, 'Dark Wash': 7 },
                colorFilled: { 'Blue': 20, 'Black': 12, 'Dark Wash': 6 },
                trend: 'up',
                events: ['Cold weather alert']
            },
            { 
                week: 'Nov 15-21', 
                date: '2024-11-15',
                total: 42, 
                filled: 35,
                sizeBreakdown: { '28': 3, '30': 8, '32': 14, '34': 9, '36': 5, '38': 2, '40': 1 },
                sizeFilled: { '28': 2, '30': 7, '32': 12, '34': 8, '36': 4, '38': 1, '40': 1 },
                colorBreakdown: { 'Blue': 22, 'Black': 13, 'Dark Wash': 7 },
                colorFilled: { 'Blue': 18, 'Black': 11, 'Dark Wash': 6 },
                trend: 'down',
                events: []
            },
            { 
                week: 'Nov 22-28', 
                date: '2024-11-22',
                total: 52, 
                filled: 43,
                sizeBreakdown: { '28': 5, '30': 10, '32': 18, '34': 12, '36': 4, '38': 2, '40': 1 },
                sizeFilled: { '28': 4, '30': 9, '32': 15, '34': 10, '36': 3, '38': 1, '40': 1 },
                colorBreakdown: { 'Blue': 28, 'Black': 16, 'Dark Wash': 8 },
                colorFilled: { 'Blue': 23, 'Black': 13, 'Dark Wash': 7 },
                trend: 'up',
                events: ['Thanksgiving week', 'Extra volunteers']
            },
            { 
                week: 'Nov 29-Dec 5', 
                date: '2024-11-29',
                total: 41, 
                filled: 33,
                sizeBreakdown: { '28': 4, '30': 8, '32': 13, '34': 9, '36': 4, '38': 2, '40': 1 },
                sizeFilled: { '28': 3, '30': 6, '32': 11, '34': 7, '36': 3, '38': 2, '40': 1 },
                colorBreakdown: { 'Blue': 21, 'Black': 13, 'Dark Wash': 7 },
                colorFilled: { 'Blue': 17, 'Black': 10, 'Dark Wash': 6 },
                trend: 'down',
                events: []
            },
            { 
                week: 'Dec 6-12', 
                date: '2024-12-06',
                total: 47, 
                filled: 40,
                sizeBreakdown: { '28': 4, '30': 9, '32': 16, '34': 11, '36': 4, '38': 2, '40': 1 },
                sizeFilled: { '28': 4, '30': 8, '32': 14, '34': 9, '36': 3, '38': 1, '40': 1 },
                colorBreakdown: { 'Blue': 25, 'Black': 15, 'Dark Wash': 7 },
                colorFilled: { 'Blue': 21, 'Black': 12, 'Dark Wash': 7 },
                trend: 'up',
                events: ['Holiday season surge']
            }
        ]
    },
    'hoodies': {
        name: 'Hoodies',
        totalRequested: 156,
        totalFulfilled: 98,
        fillRate: 63,
        hasGender: false,
        timeData: [
            { 
                week: 'Nov 1-7', 
                date: '2024-11-01',
                total: 22, 
                filled: 14,
                sizeBreakdown: { 'XS': 1, 'S': 3, 'M': 8, 'L': 6, 'XL': 3, '2X': 1, '3X': 0 },
                sizeFilled: { 'XS': 1, 'S': 2, 'M': 5, 'L': 4, 'XL': 2, '2X': 0, '3X': 0 },
                colorBreakdown: { 'Black': 10, 'Gray': 7, 'Navy': 4, 'Red': 1 },
                colorFilled: { 'Black': 6, 'Gray': 4, 'Navy': 3, 'Red': 1 },
                trend: 'stable',
                events: []
            },
            { 
                week: 'Nov 8-14', 
                date: '2024-11-08',
                total: 28, 
                filled: 16,
                sizeBreakdown: { 'XS': 2, 'S': 4, 'M': 10, 'L': 8, 'XL': 3, '2X': 1, '3X': 0 },
                sizeFilled: { 'XS': 1, 'S': 2, 'M': 6, 'L': 5, 'XL': 2, '2X': 0, '3X': 0 },
                colorBreakdown: { 'Black': 12, 'Gray': 9, 'Navy': 5, 'Red': 2 },
                colorFilled: { 'Black': 7, 'Gray': 5, 'Navy': 3, 'Red': 1 },
                trend: 'up',
                events: ['Weather gets colder']
            },
            { 
                week: 'Nov 15-21', 
                date: '2024-11-15',
                total: 35, 
                filled: 19,
                sizeBreakdown: { 'XS': 2, 'S': 5, 'M': 13, 'L': 10, 'XL': 4, '2X': 1, '3X': 0 },
                sizeFilled: { 'XS': 1, 'S': 3, 'M': 7, 'L': 6, 'XL': 2, '2X': 0, '3X': 0 },
                colorBreakdown: { 'Black': 15, 'Gray': 11, 'Navy': 7, 'Red': 2 },
                colorFilled: { 'Black': 8, 'Gray': 6, 'Navy': 4, 'Red': 1 },
                trend: 'up',
                events: []
            },
            { 
                week: 'Nov 22-28', 
                date: '2024-11-22',
                total: 31, 
                filled: 18,
                sizeBreakdown: { 'XS': 2, 'S': 4, 'M': 11, 'L': 9, 'XL': 4, '2X': 1, '3X': 0 },
                sizeFilled: { 'XS': 2, 'S': 2, 'M': 6, 'L': 5, 'XL': 2, '2X': 1, '3X': 0 },
                colorBreakdown: { 'Black': 13, 'Gray': 10, 'Navy': 6, 'Red': 2 },
                colorFilled: { 'Black': 7, 'Gray': 6, 'Navy': 4, 'Red': 1 },
                trend: 'stable',
                events: ['Thanksgiving week']
            },
            { 
                week: 'Nov 29-Dec 5', 
                date: '2024-11-29',
                total: 26, 
                filled: 16,
                sizeBreakdown: { 'XS': 1, 'S': 3, 'M': 9, 'L': 8, 'XL': 4, '2X': 1, '3X': 0 },
                sizeFilled: { 'XS': 1, 'S': 2, 'M': 6, 'L': 5, 'XL': 2, '2X': 0, '3X': 0 },
                colorBreakdown: { 'Black': 11, 'Gray': 8, 'Navy': 5, 'Red': 2 },
                colorFilled: { 'Black': 7, 'Gray': 5, 'Navy': 3, 'Red': 1 },
                trend: 'down',
                events: []
            },
            { 
                week: 'Dec 6-12', 
                date: '2024-12-06',
                total: 39, 
                filled: 21,
                sizeBreakdown: { 'XS': 2, 'S': 6, 'M': 14, 'L': 11, 'XL': 5, '2X': 1, '3X': 0 },
                sizeFilled: { 'XS': 1, 'S': 3, 'M': 8, 'L': 6, 'XL': 2, '2X': 1, '3X': 0 },
                colorBreakdown: { 'Black': 17, 'Gray': 12, 'Navy': 8, 'Red': 2 },
                colorFilled: { 'Black': 9, 'Gray': 7, 'Navy': 4, 'Red': 1 },
                trend: 'up',
                events: ['Winter weather intensifies']
            }
        ]
    }
};

const ReportingPOC3: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<string>('jeans-mens');
    const [viewMode, setViewMode] = useState<string>('trends');
    const [attributeOverlay, setAttributeOverlay] = useState<string>('size');
    const [showComparison, setShowComparison] = useState<boolean>(false);
    const [dateRange, setDateRange] = useState<string>('6weeks');
    const [showEvents, setShowEvents] = useState<boolean>(true);
    const [selectedWeeks, setSelectedWeeks] = useState<string[]>(['Nov 22-28', 'Dec 6-12']); // For comparison

    const currentItem = timeSeriesData[selectedItem as keyof typeof timeSeriesData];

    // Process time series data for charts
    const processTimeSeriesData = () => {
        return currentItem.timeData.map(weekData => ({
            week: weekData.week,
            date: weekData.date,
            requested: weekData.total,
            filled: weekData.filled,
            fillRate: Math.round((weekData.filled / weekData.total) * 100),
            gap: weekData.total - weekData.filled,
            // Add size breakdowns for stacked view
            ...Object.keys(weekData.sizeBreakdown).reduce((acc, size) => {
                acc[`size_${size}_req`] = weekData.sizeBreakdown[size];
                acc[`size_${size}_fill`] = weekData.sizeFilled[size];
                return acc;
            }, {} as any),
            // Add color breakdowns
            ...Object.keys(weekData.colorBreakdown).reduce((acc, color) => {
                acc[`color_${color}_req`] = weekData.colorBreakdown[color];
                acc[`color_${color}_fill`] = weekData.colorFilled[color];
                return acc;
            }, {} as any),
            events: weekData.events,
            trend: weekData.trend
        }));
    };

    // Create stacked series for attribute overlay
    const createStackedSeries = () => {
        if (attributeOverlay === 'size') {
            const sizes = Object.keys(currentItem.timeData[0].sizeBreakdown);
            return sizes.map((size, index) => ({
                name: `size_${size}_req`,
                label: `${size}`,
                color: `var(--mantine-color-blue-${Math.min(9, 3 + index)})`
            }));
        } else {
            const colors = Object.keys(currentItem.timeData[0].colorBreakdown);
            return colors.map((color, index) => ({
                name: `color_${color}_req`,
                label: color,
                color: `var(--mantine-color-violet-${Math.min(9, 3 + index)})`
            }));
        }
    };

    // Calculate week-over-week changes
    const calculateTrends = () => {
        const data = currentItem.timeData;
        return data.map((week, index) => {
            const prevWeek = index > 0 ? data[index - 1] : null;
            const totalChange = prevWeek ? ((week.total - prevWeek.total) / prevWeek.total) * 100 : 0;
            const fillRateChange = prevWeek ? 
                Math.round((week.filled / week.total) * 100) - Math.round((prevWeek.filled / prevWeek.total) * 100) : 0;
            
            return {
                ...week,
                totalChange: Math.round(totalChange),
                fillRateChange,
                isGrowth: totalChange > 5,
                isDecline: totalChange < -5
            };
        });
    };

    const chartData = processTimeSeriesData();
    const stackedSeries = createStackedSeries();
    const trendData = calculateTrends();

    // Comparison data for selected weeks
    const comparisonData = selectedWeeks.map(weekName => {
        const weekData = currentItem.timeData.find(w => w.week === weekName);
        if (!weekData) return null;
        
        const attributeData = attributeOverlay === 'size' ? weekData.sizeBreakdown : weekData.colorBreakdown;
        const filledData = attributeOverlay === 'size' ? weekData.sizeFilled : weekData.colorFilled;
        
        return {
            week: weekName,
            total: weekData.total,
            filled: weekData.filled,
            attributeBreakdown: Object.entries(attributeData).map(([key, value]) => ({
                attribute: key,
                requested: value as number,
                filled: filledData[key] as number,
                fillRate: Math.round(((filledData[key] as number) / (value as number)) * 100)
            }))
        };
    }).filter(Boolean);

    return (
        <Container size="xl" py="md">
            <Group justify="space-between" mb="lg">
                <Title order={1}>Reports POC v3 - Time-Series Analysis</Title>
                <Group gap="xs">
                    <Badge variant="light" color="orange">Time-Focused</Badge>
                    <Badge variant="light" color="blue">Trend Analysis</Badge>
                </Group>
            </Group>

            {/* Priority Items Overview - Consistent across POCs */}
            <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed">Jeans MENS</Text>
                            <Badge color="blue" variant="light">82% Fill Rate</Badge>
                        </Group>
                        <Text fw={500} size="lg">245 Requested</Text>
                        <Text size="sm" c="dimmed">201 Fulfilled</Text>
                        <Button variant="light" size="xs" mt="sm" fullWidth
                               onClick={() => setSelectedItem('jeans-mens')}>
                            View Trends
                        </Button>
                    </Card>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed">Underwear</Text>
                            <Badge color="green" variant="light">88% Fill Rate</Badge>
                        </Group>
                        <Text fw={500} size="lg">189 Requested</Text>
                        <Text size="sm" c="dimmed">167 Fulfilled</Text>
                        <Button variant="light" size="xs" mt="sm" fullWidth disabled>
                            View Trends
                        </Button>
                    </Card>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed">Hoodies</Text>
                            <Badge color="red" variant="light">63% Fill Rate</Badge>
                        </Group>
                        <Text fw={500} size="lg">156 Requested</Text>
                        <Text size="sm" c="dimmed">98 Fulfilled</Text>
                        <Button variant="light" size="xs" mt="sm" fullWidth
                               onClick={() => setSelectedItem('hoodies')}>
                            View Trends
                        </Button>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Time-Focused Analysis */}
            <Card padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                    <Title order={2}>{currentItem.name} - Temporal Analysis</Title>
                    <Group gap="xs">
                        <ActionIcon 
                            variant="light" 
                            color="blue"
                            onClick={() => setShowEvents(!showEvents)}
                        >
                            <Tooltip label="Toggle event annotations">
                                <IconInfoCircle size={16} />
                            </Tooltip>
                        </ActionIcon>
                        <Switch
                            label="Compare periods"
                            checked={showComparison}
                            onChange={(e) => setShowComparison(e.currentTarget.checked)}
                        />
                    </Group>
                </Group>

                {/* Controls */}
                <Stack gap="md" mb="lg">
                    <Group gap="md" align="flex-end">
                        <SegmentedControl
                            data={[
                                { label: 'Trends', value: 'trends' },
                                { label: 'Breakdown', value: 'breakdown' },
                                { label: 'Compare', value: 'compare' },
                            ]}
                            value={viewMode}
                            onChange={setViewMode}
                        />

                        <Select
                            label="Attribute Overlay"
                            value={attributeOverlay}
                            onChange={(value) => setAttributeOverlay(value || 'size')}
                            data={[
                                { value: 'size', label: 'Size Distribution' },
                                { value: 'color', label: 'Color Distribution' },
                            ]}
                            w={180}
                        />

                        <Select
                            label="Date Range"
                            value={dateRange}
                            onChange={(value) => setDateRange(value || '6weeks')}
                            data={[
                                { value: '6weeks', label: 'Last 6 Weeks' },
                                { value: '3months', label: 'Last 3 Months' },
                                { value: '6months', label: 'Last 6 Months' },
                            ]}
                            w={150}
                        />
                    </Group>
                </Stack>

                <Tabs value={viewMode} onChange={setViewMode || 'trends'}>
                    <Tabs.List>
                        <Tabs.Tab value="trends" leftSection={<IconChartLine size={14} />}>
                            Trend Analysis
                        </Tabs.Tab>
                        <Tabs.Tab value="breakdown" leftSection={<IconTable size={14} />}>
                            Temporal Breakdown
                        </Tabs.Tab>
                        <Tabs.Tab value="compare" leftSection={<IconGitCompare size={14} />}>
                            Period Comparison
                        </Tabs.Tab>
                    </Tabs.List>

                    {/* Trend Analysis Tab */}
                    <Tabs.Panel value="trends" pt="md">
                        <Grid>
                            <Grid.Col span={12}>
                                <Text fw={500} size="sm" mb="md">
                                    📈 Demand & Fill Rate Over Time
                                    {showEvents && <Text span size="xs" c="dimmed"> (with events)</Text>}
                                </Text>
                                <AreaChart
                                    h={300}
                                    data={chartData}
                                    dataKey="week"
                                    series={[
                                        { name: 'requested', label: 'Requested', color: 'blue.6' },
                                        { name: 'filled', label: 'Filled', color: 'green.6' },
                                        { name: 'gap', label: 'Gap', color: 'red.6' },
                                    ]}
                                    curveType="natural"
                                    tickLine="xy"
                                    gridAxis="xy"
                                    withLegend
                                    withTooltip
                                />
                            </Grid.Col>
                        </Grid>

                        {/* Weekly Summary Cards */}
                        <SimpleGrid cols={{ base: 2, md: 3, lg: 6 }} mt="md" spacing="xs">
                            {trendData.map((week) => (
                                <Paper key={week.week} p="md" withBorder>
                                    <Group gap={4} mb="xs">
                                        <Text size="xs" fw={500}>{week.week.split(' ')[0]} {week.week.split(' ')[1]}</Text>
                                        {week.isGrowth && <IconTrendingUp size={12} color="green" />}
                                        {week.isDecline && <IconTrendingDown size={12} color="red" />}
                                        {!week.isGrowth && !week.isDecline && <IconEqual size={12} color="gray" />}
                                    </Group>
                                    <Text size="lg" fw={700}>{week.total}</Text>
                                    <Text size="xs" c="dimmed">
                                        {week.totalChange > 0 ? '+' : ''}{week.totalChange}% vs prev
                                    </Text>
                                    <RingProgress
                                        size={40}
                                        thickness={4}
                                        sections={[
                                            { value: (week.filled / week.total) * 100, color: 'green' }
                                        ]}
                                        mt={4}
                                    />
                                    {week.events.length > 0 && showEvents && (
                                        <Alert icon={<IconCalendar size={12} />} size="xs" mt="xs">
                                            <Text size="xs">{week.events[0]}</Text>
                                        </Alert>
                                    )}
                                </Paper>
                            ))}
                        </SimpleGrid>
                    </Tabs.Panel>

                    {/* Temporal Breakdown Tab */}
                    <Tabs.Panel value="breakdown" pt="md">
                        <Text fw={500} size="sm" mb="md">
                            📊 {attributeOverlay === 'size' ? 'Size' : 'Color'} Distribution Over Time
                        </Text>
                        <BarChart
                            h={350}
                            data={chartData}
                            dataKey="week"
                            series={stackedSeries}
                            type="stacked"
                            tickLine="xy"
                            gridAxis="xy"
                            withLegend
                            withTooltip
                        />

                        {/* Attribute Performance Table */}
                        <Box mt="md">
                            <Text fw={500} size="sm" mb="xs">
                                Weekly {attributeOverlay === 'size' ? 'Size' : 'Color'} Performance
                            </Text>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Week</Table.Th>
                                        <Table.Th>Total</Table.Th>
                                        <Table.Th>Fill Rate</Table.Th>
                                        <Table.Th>Top {attributeOverlay === 'size' ? 'Size' : 'Color'}</Table.Th>
                                        <Table.Th>Biggest Gap</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {currentItem.timeData.map((week) => {
                                        const breakdown = attributeOverlay === 'size' ? week.sizeBreakdown : week.colorBreakdown;
                                        const filled = attributeOverlay === 'size' ? week.sizeFilled : week.colorFilled;
                                        const topAttribute = Object.entries(breakdown)
                                            .sort(([,a], [,b]) => (b as number) - (a as number))[0];
                                        const biggestGap = Object.entries(breakdown)
                                            .map(([key, req]) => [key, (req as number) - (filled[key] as number)])
                                            .sort(([,a], [,b]) => (b as number) - (a as number))[0];

                                        return (
                                            <Table.Tr key={week.week}>
                                                <Table.Td>
                                                    <Text size="sm">{week.week.split(' ')[0]} {week.week.split(' ')[1]}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text fw={500}>{week.total}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge 
                                                        size="sm" 
                                                        color={week.filled/week.total > 0.8 ? 'green' : 'orange'}
                                                    >
                                                        {Math.round((week.filled/week.total) * 100)}%
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{topAttribute[0]} ({topAttribute[1]})</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" c={biggestGap[1] > 3 ? 'red' : 'dimmed'}>
                                                        {biggestGap[0]} (-{biggestGap[1]})
                                                    </Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </Tabs.Panel>

                    {/* Period Comparison Tab */}
                    <Tabs.Panel value="compare" pt="md">
                        <Group mb="md">
                            <Text fw={500} size="sm">🔍 Compare Specific Weeks:</Text>
                            <Select
                                placeholder="Select weeks to compare"
                                data={currentItem.timeData.map(w => ({ value: w.week, label: w.week }))}
                                value={selectedWeeks[0]}
                                onChange={(value) => value && setSelectedWeeks([value, selectedWeeks[1]])}
                                w={200}
                            />
                            <Text size="sm" c="dimmed">vs</Text>
                            <Select
                                placeholder="Compare with..."
                                data={currentItem.timeData.map(w => ({ value: w.week, label: w.week }))}
                                value={selectedWeeks[1]}
                                onChange={(value) => value && setSelectedWeeks([selectedWeeks[0], value])}
                                w={200}
                            />
                        </Group>

                        <Grid>
                            {comparisonData.map((period, index) => (
                                <Grid.Col key={period?.week} span={6}>
                                    <Paper p="md" withBorder>
                                        <Text fw={500} mb="md">{period?.week}</Text>
                                        <Group mb="md">
                                            <div>
                                                <Text size="xs" c="dimmed">Total Requested</Text>
                                                <Text size="lg" fw={700}>{period?.total}</Text>
                                            </div>
                                            <div>
                                                <Text size="xs" c="dimmed">Filled</Text>
                                                <Text size="lg" fw={700}>{period?.filled}</Text>
                                            </div>
                                            <div>
                                                <Text size="xs" c="dimmed">Fill Rate</Text>
                                                <Text size="lg" fw={700}>
                                                    {Math.round((period?.filled! / period?.total!) * 100)}%
                                                </Text>
                                            </div>
                                        </Group>

                                        <DonutChart
                                            data={period?.attributeBreakdown.map((item, i) => ({
                                                name: `${item.attribute} (${item.fillRate}%)`,
                                                value: item.requested,
                                                color: `var(--mantine-color-blue-${3 + i})`
                                            })) || []}
                                            size={120}
                                            thickness={20}
                                            withTooltip
                                        />

                                        <Stack gap={4} mt="sm">
                                            {period?.attributeBreakdown.map((item) => (
                                                <Group key={item.attribute} justify="space-between">
                                                    <Text size="xs">{item.attribute}:</Text>
                                                    <Text size="xs">
                                                        {item.filled}/{item.requested} ({item.fillRate}%)
                                                    </Text>
                                                </Group>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                            ))}
                        </Grid>
                    </Tabs.Panel>
                </Tabs>
            </Card>
        </Container>
    );
};

export default ReportingPOC3;
