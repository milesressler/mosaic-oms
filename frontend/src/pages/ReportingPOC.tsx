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
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { BarChart, DonutChart } from '@mantine/charts';

// Mock data for demonstration
const mockData = {
    'jeans-mens': {
        name: 'Jeans MENS',
        totalRequested: 245,
        totalFulfilled: 201,
        fillRate: 82,
        hasGender: true, // This item has gender attribute
        attributes: {
            size: {
                name: 'Size',
                values: ['28', '30', '32', '34', '36', '38', '40'],
                weeklyData: [
                    { week: 'Week 1', '28': 8, '28_filled': 7, '30': 12, '30_filled': 11, '32': 18, '32_filled': 15, '34': 15, '34_filled': 13, '36': 10, '36_filled': 9, '38': 7, '38_filled': 6, '40': 4, '40_filled': 4 },
                    { week: 'Week 2', '28': 6, '28_filled': 5, '30': 14, '30_filled': 12, '32': 22, '32_filled': 18, '34': 18, '34_filled': 16, '36': 12, '36_filled': 10, '38': 8, '38_filled': 7, '40': 5, '40_filled': 5 },
                    { week: 'Week 3', '28': 10, '28_filled': 8, '30': 16, '30_filled': 14, '32': 25, '32_filled': 20, '34': 20, '34_filled': 17, '36': 14, '36_filled': 12, '38': 9, '38_filled': 8, '40': 6, '40_filled': 6 },
                    { week: 'Week 4', '28': 7, '28_filled': 6, '30': 11, '30_filled': 10, '32': 20, '32_filled': 17, '34': 16, '34_filled': 14, '36': 11, '36_filled': 10, '38': 6, '38_filled': 5, '40': 3, '40_filled': 3 },
                    { week: 'Week 5', '28': 9, '28_filled': 8, '30': 13, '30_filled': 12, '32': 24, '32_filled': 21, '34': 19, '34_filled': 16, '36': 13, '36_filled': 11, '38': 8, '38_filled': 7, '40': 5, '40_filled': 5 },
                    { week: 'Week 6', '28': 5, '28_filled': 4, '30': 15, '30_filled': 13, '32': 21, '32_filled': 18, '34': 17, '34_filled': 15, '36': 12, '36_filled': 10, '38': 7, '38_filled': 6, '40': 4, '40_filled': 4 },
                ]
            },
            color: {
                name: 'Color',
                values: ['Blue', 'Black', 'Dark Wash'],
                weeklyData: [
                    { week: 'Week 1', 'Blue': 35, 'Blue_filled': 28, 'Black': 20, 'Black_filled': 18, 'Dark Wash': 19, 'Dark Wash_filled': 16 },
                    { week: 'Week 2', 'Blue': 42, 'Blue_filled': 34, 'Black': 24, 'Black_filled': 22, 'Dark Wash': 19, 'Dark Wash_filled': 17 },
                    { week: 'Week 3', 'Blue': 48, 'Blue_filled': 38, 'Black': 28, 'Black_filled': 25, 'Dark Wash': 24, 'Dark Wash_filled': 20 },
                    { week: 'Week 4', 'Blue': 38, 'Blue_filled': 31, 'Black': 22, 'Black_filled': 20, 'Dark Wash': 14, 'Dark Wash_filled': 12 },
                    { week: 'Week 5', 'Blue': 44, 'Blue_filled': 36, 'Black': 26, 'Black_filled': 23, 'Dark Wash': 21, 'Dark Wash_filled': 18 },
                    { week: 'Week 6', 'Blue': 40, 'Blue_filled': 33, 'Black': 23, 'Black_filled': 21, 'Dark Wash': 18, 'Dark Wash_filled': 16 },
                ]
            }
        }
    },
    hoodies: {
        name: 'Hoodies',
        totalRequested: 156,
        totalFulfilled: 98,
        fillRate: 63,
        hasGender: false, // This item doesn't have gender attribute
        attributes: {
            size: {
                name: 'Size',
                values: ['XS', 'S', 'M', 'L', 'XL', '2X', '3X'],
                weeklyData: [
                    { week: 'Week 1', 'XS': 2, 'XS_filled': 1, 'S': 6, 'S_filled': 3, 'M': 15, 'M_filled': 8, 'L': 12, 'L_filled': 7, 'XL': 10, 'XL_filled': 5, '2X': 7, '2X_filled': 5, '3X': 3, '3X_filled': 2 },
                    { week: 'Week 2', 'XS': 1, 'XS_filled': 1, 'S': 8, 'S_filled': 4, 'M': 18, 'M_filled': 10, 'L': 14, 'L_filled': 8, 'XL': 12, 'XL_filled': 6, '2X': 8, '2X_filled': 6, '3X': 4, '3X_filled': 3 },
                    { week: 'Week 3', 'XS': 3, 'XS_filled': 2, 'S': 10, 'S_filled': 5, 'M': 22, 'M_filled': 12, 'L': 16, 'L_filled': 9, 'XL': 14, 'XL_filled': 7, '2X': 9, '2X_filled': 7, '3X': 5, '3X_filled': 3 },
                    { week: 'Week 4', 'XS': 2, 'XS_filled': 1, 'S': 7, 'S_filled': 4, 'M': 16, 'M_filled': 9, 'L': 11, 'L_filled': 6, 'XL': 9, 'XL_filled': 4, '2X': 6, '2X_filled': 4, '3X': 3, '3X_filled': 2 },
                    { week: 'Week 5', 'XS': 1, 'XS_filled': 1, 'S': 9, 'S_filled': 5, 'M': 19, 'M_filled': 11, 'L': 13, 'L_filled': 8, 'XL': 11, 'XL_filled': 6, '2X': 7, '2X_filled': 5, '3X': 4, '3X_filled': 3 },
                    { week: 'Week 6', 'XS': 2, 'XS_filled': 1, 'S': 8, 'S_filled': 4, 'M': 17, 'M_filled': 10, 'L': 12, 'L_filled': 7, 'XL': 10, 'XL_filled': 5, '2X': 6, '2X_filled': 4, '3X': 3, '3X_filled': 2 },
                ]
            },
            color: {
                name: 'Color',
                values: ['Black', 'Gray', 'Navy', 'Red'],
                weeklyData: [
                    { week: 'Week 1', 'Black': 25, 'Black_filled': 15, 'Gray': 18, 'Gray_filled': 10, 'Navy': 10, 'Navy_filled': 6, 'Red': 2, 'Red_filled': 1 },
                    { week: 'Week 2', 'Black': 28, 'Black_filled': 17, 'Gray': 22, 'Gray_filled': 12, 'Navy': 12, 'Navy_filled': 7, 'Red': 3, 'Red_filled': 2 },
                    { week: 'Week 3', 'Black': 32, 'Black_filled': 19, 'Gray': 25, 'Gray_filled': 14, 'Navy': 14, 'Navy_filled': 8, 'Red': 4, 'Red_filled': 2 },
                    { week: 'Week 4', 'Black': 24, 'Black_filled': 14, 'Gray': 19, 'Gray_filled': 10, 'Navy': 10, 'Navy_filled': 5, 'Red': 1, 'Red_filled': 1 },
                    { week: 'Week 5', 'Black': 29, 'Black_filled': 17, 'Gray': 23, 'Gray_filled': 13, 'Navy': 11, 'Navy_filled': 6, 'Red': 1, 'Red_filled': 0 },
                    { week: 'Week 6', 'Black': 26, 'Black_filled': 15, 'Gray': 20, 'Gray_filled': 11, 'Navy': 9, 'Navy_filled': 5, 'Red': 3, 'Red_filled': 1 },
                ]
            }
        }
    }
};

const ReportingPOC: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<string>('jeans-mens');
    const [selectedAttribute, setSelectedAttribute] = useState<string>('size');
    const [showUnfilled, setShowUnfilled] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState<string>('6weeks');
    const [timeGrouping, setTimeGrouping] = useState<string>('week');
    const [gender, setGender] = useState<string>('all');
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);

    const currentItem = mockData[selectedItem as keyof typeof mockData];
    const currentAttributeData = currentItem.attributes[selectedAttribute as keyof typeof currentItem.attributes];

    // Dynamic time grouping based on date range
    const getAutoTimeGrouping = (range: string) => {
        if (range === '2025' || range === 'lastyear' || range === 'custom-large') return 'month';
        if (range === '6months' || range === '1year') return 'month';
        return 'week';
    };

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

    // Determine if gender filter should be shown
    const showGenderFilter = currentItem.hasGender;

    // Process data for the multi-dimensional chart
    const processChartData = () => {
        return currentAttributeData.weeklyData.map(weekData => {
            const processed: any = { week: weekData.week };
            
            currentAttributeData.values.forEach(value => {
                const requested = weekData[value as keyof typeof weekData] as number;
                const filled = weekData[`${value}_filled` as keyof typeof weekData] as number;
                const unfilled = requested - filled;
                
                if (showUnfilled) {
                    processed[`${value}_filled`] = filled;
                    processed[`${value}_unfilled`] = unfilled;
                } else {
                    processed[value] = requested;
                }
            });
            
            return processed;
        });
    };

    // Create series for the chart
    const createChartSeries = () => {
        const series: any[] = [];
        
        currentAttributeData.values.forEach(value => {
            if (showUnfilled) {
                series.push({
                    name: `${value}_filled`,
                    label: `${value} (Filled)`,
                    color: `var(--mantine-color-blue-${Math.min(9, 3 + currentAttributeData.values.indexOf(value))})`,
                });
                series.push({
                    name: `${value}_unfilled`,
                    label: `${value} (Unfilled)`,
                    color: `var(--mantine-color-red-${Math.min(9, 3 + currentAttributeData.values.indexOf(value))})`,
                });
            } else {
                series.push({
                    name: value,
                    label: value,
                    color: `var(--mantine-color-blue-${Math.min(9, 3 + currentAttributeData.values.indexOf(value))})`,
                });
            }
        });
        
        return series;
    };

    // Calculate summary stats for current attribute
    const calculateSummaryStats = () => {
        const stats: any = {};
        
        currentAttributeData.values.forEach(value => {
            let totalRequested = 0;
            let totalFulfilled = 0;
            
            currentAttributeData.weeklyData.forEach(weekData => {
                totalRequested += weekData[value as keyof typeof weekData] as number;
                totalFulfilled += weekData[`${value}_filled` as keyof typeof weekData] as number;
            });
            
            stats[value] = {
                requested: totalRequested,
                fulfilled: totalFulfilled,
                unfilled: totalRequested - totalFulfilled,
                fillRate: Math.round((totalFulfilled / totalRequested) * 100)
            };
        });
        
        return stats;
    };

    // Create donut chart data for current breakdown with percentages
    const createDonutData = () => {
        const stats = calculateSummaryStats();
        const totalRequested = Object.values(stats).reduce((sum: number, stat: any) => sum + stat.requested, 0);
        
        return currentAttributeData.values.map((value, index) => {
            const percentage = Math.round((stats[value].requested / totalRequested) * 100);
            return {
                name: `${value} (${percentage}%)`,
                value: stats[value].requested,
                color: `var(--mantine-color-blue-${Math.min(9, 3 + index)})`
            };
        });
    };

    const chartData = processChartData();
    const chartSeries = createChartSeries();
    const summaryStats = calculateSummaryStats();
    const donutData = createDonutData();

    return (
        <Container size="xl" py="md">
            <Title order={1} mb="lg">Reporting POC - Multi-Dimensional Analysis</Title>
            
            {/* Priority Items Overview */}
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
                            View Details
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
                            View Details
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
                            View Details
                        </Button>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Detailed Analysis */}
            <Card padding="lg" radius="md" withBorder>
                <Title order={2} mb="md">{currentItem.name} - Advanced Analysis</Title>
                
                {/* Controls */}
                <Group mb="lg" align="flex-end">
                    <Select
                        label="Date Range"
                        value={dateRange}
                        onChange={(value) => {
                            const newRange = value || '6weeks';
                            setDateRange(newRange);
                            setTimeGrouping(getAutoTimeGrouping(newRange));
                        }}
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
                    
                    {showGenderFilter && (
                        <Select
                            label="Gender"
                            value={gender}
                            onChange={(value) => setGender(value || 'all')}
                            data={[
                                { value: 'all', label: 'All Genders' },
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' },
                            ]}
                            w={150}
                        />
                    )}
                    
                    {!showGenderFilter && (
                        <Text size="xs" c="dimmed" style={{ alignSelf: 'center', fontStyle: 'italic' }}>
                            ⚠️ This item has no gender attribute
                        </Text>
                    )}
                    
                    <Select
                        label="Segment By"
                        value={selectedAttribute}
                        onChange={(value) => setSelectedAttribute(value || 'size')}
                        data={Object.keys(currentItem.attributes).map(key => ({
                            value: key,
                            label: currentItem.attributes[key as keyof typeof currentItem.attributes].name
                        }))}
                        w={150}
                    />
                    
                    <Select
                        label="Time Grouping"
                        value={timeGrouping}
                        onChange={(value) => setTimeGrouping(value || 'week')}
                        data={[
                            { value: 'week', label: 'Weekly' },
                            { value: 'month', label: 'Monthly' },
                            { value: 'none', label: 'No Grouping' },
                        ]}
                        w={130}
                    />
                    
                    <Checkbox
                        label="Show Filled/Unfilled Split"
                        checked={showUnfilled}
                        onChange={(event) => setShowUnfilled(event.currentTarget.checked)}
                    />
                </Group>

                <Grid>
                    {/* Left Panel - Stats & Controls */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack>
                            <Box>
                                <Text size="sm" fw={500} mb="xs">
                                    Available Segments:
                                </Text>
                                {Object.keys(currentItem.attributes).map(attr => (
                                    <Text key={attr} size="xs" c="dimmed">
                                        • {currentItem.attributes[attr as keyof typeof currentItem.attributes].name} (
                                        {currentItem.attributes[attr as keyof typeof currentItem.attributes].values.length} values)
                                    </Text>
                                ))}
                            </Box>
                            
                            <Box>
                                <Text size="sm" fw={500} mb="xs">
                                    Current Breakdown ({currentAttributeData.name}):
                                </Text>
                                {currentAttributeData.values.map(value => (
                                    <Group key={value} justify="space-between" gap="xs">
                                        <Text size="xs">• {value}:</Text>
                                        <Text size="xs">
                                            {summaryStats[value].requested} 
                                            ({summaryStats[value].unfilled} gap, {summaryStats[value].fillRate}%)
                                        </Text>
                                    </Group>
                                ))}
                            </Box>

                            <Box>
                                <Text size="sm" fw={500} mb="xs">Summary:</Text>
                                <Text size="xs" c="dimmed">Total Req: {currentItem.totalRequested}</Text>
                                <Text size="xs" c="dimmed">Fulfilled: {currentItem.totalFulfilled}</Text>
                                <Text size="xs" c="dimmed">Fill Rate: {currentItem.fillRate}%</Text>
                            </Box>

                            <Button variant="outline" size="xs">Export Data</Button>
                        </Stack>
                    </Grid.Col>
                    
                    {/* Right Panel - Charts */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Stack>
                            <Box>
                                <Text size="sm" fw={500} mb="md">
                                    {showUnfilled ? 'Requested vs Filled' : 'Total Requested'} by {currentAttributeData.name} (Weekly)
                                </Text>
                                <BarChart
                                    h={300}
                                    data={chartData}
                                    dataKey="week"
                                    series={chartSeries}
                                    tickLine="xy"
                                    gridAxis="xy"
                                />
                            </Box>
                            
                            <Group align="flex-start">
                                <Box style={{ flex: 1 }}>
                                    <Text size="sm" fw={500} mb="md">
                                        {currentAttributeData.name} Distribution
                                    </Text>
                                    <DonutChart
                                        data={donutData}
                                        size={160}
                                        thickness={30}
                                        withLabels
                                        withTooltip
                                    />
                                </Box>
                                
                                <Box style={{ flex: 1 }}>
                                    <Text size="sm" fw={500} mb="md">Interactive Controls</Text>
                                    <Stack gap="xs">
                                        <Checkbox label="Show trend lines" size="sm" />
                                        <Checkbox label="Group by month" size="sm" />
                                        <Checkbox label="Highlight peaks" size="sm" />
                                        <Checkbox label="Compare periods" size="sm" />
                                    </Stack>
                                    
                                    <Text size="xs" c="dimmed" mt="md">
                                        Weekly Detail View:
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        Week 12/1: 32(3↑), 30(2↓), 28(5→)...
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        [Click any bar for weekly breakdown]
                                    </Text>
                                </Box>
                            </Group>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Card>
        </Container>
    );
};

export default ReportingPOC;