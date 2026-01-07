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
    Center,
    Box,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { AreaChart, BarChart, LineChart, DonutChart, ScatterChart } from '@mantine/charts';
import { 
    IconUsers, 
    IconClock,
    IconTrendingUp,
    IconTrendingDown,
    IconAlertTriangle,
    IconCheck,
    IconInfoCircle,
    IconTarget,
    IconActivity,
    IconCalendarEvent,
    IconChartDots,
    IconReportAnalytics,
    IconZoomIn
} from '@tabler/icons-react';

// Predictive analytics mock data
const predictiveData = {
    nextWeekPredictions: {
        expectedVisitors: 342,
        visitorConfidence: 89,
        weatherImpact: 'Sunny, +15% expected',
        holidayImpact: 'MLK Day approaching, +8% expected',
        expectedTopItems: [
            { item: 'Winter Jackets - Large', predicted: 45, confidence: 91 },
            { item: 'Jeans MENS 32x34', predicted: 38, confidence: 94 },
            { item: 'Diapers Size 4', predicted: 67, confidence: 88 },
            { item: 'Canned Soup Variety', predicted: 29, confidence: 82 },
            { item: 'Hygiene Kits', predicted: 56, confidence: 85 },
        ]
    },
    demandForecasting: {
        predictions: [
            { category: 'Clothing', currentWeek: 245, predictedNext: 267, confidence: 87, trend: 'up' },
            { category: 'Food', currentWeek: 189, predictedNext: 195, confidence: 92, trend: 'stable' },
            { category: 'Hygiene', currentWeek: 156, predictedNext: 142, confidence: 79, trend: 'down' },
            { category: 'Household', currentWeek: 98, predictedNext: 108, confidence: 84, trend: 'up' },
        ],
        alerts: [
            { item: 'Jeans MENS Size 32', predicted: 'High demand', action: 'Increase stock by 25%', urgency: 'high' },
            { item: 'Winter Jackets', predicted: 'Seasonal decline', action: 'Reduce orders', urgency: 'medium' },
            { item: 'Diapers Size 4', predicted: 'Stock out risk', action: 'Emergency restock', urgency: 'critical' },
        ]
    }
};

const ReportingPOC5: React.FC = () => {
    return (
        <Container size="xl" py="md">
            <Group justify="space-between" mb="lg">
                <Title order={1}>Reports POC v5 - Demand Forecasting & Predictions</Title>
                <Group gap="xs">
                    <Badge variant="light" color="purple">ML Powered</Badge>
                    <Badge variant="light" color="orange">Predictive Analytics</Badge>
                </Group>
            </Group>

            {/* Predictive Metrics Cards */}
            <SimpleGrid cols={{ base: 2, md: 4 }} mb="xl">
                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <IconUsers size={24} color="var(--mantine-color-blue-6)" />
                        <Badge size="sm" color="blue">{predictiveData.nextWeekPredictions.visitorConfidence}% confidence</Badge>
                    </Group>
                    <Text size="xl" fw={700}>{predictiveData.nextWeekPredictions.expectedVisitors}</Text>
                    <Text size="sm" c="dimmed">Expected Visitors Next Week</Text>
                    <Progress 
                        value={predictiveData.nextWeekPredictions.visitorConfidence} 
                        color="blue" 
                        size="xs" 
                        mt="xs"
                    />
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <IconCalendarEvent size={24} color="var(--mantine-color-green-6)" />
                        <Badge size="sm" color="green">Holiday Factor</Badge>
                    </Group>
                    <Text size="md" fw={700}>{predictiveData.nextWeekPredictions.holidayImpact}</Text>
                    <Text size="sm" c="dimmed">Seasonal Impact Prediction</Text>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <IconActivity size={24} color="var(--mantine-color-orange-6)" />
                        <Badge size="sm" color="orange">Weather Factor</Badge>
                    </Group>
                    <Text size="md" fw={700}>{predictiveData.nextWeekPredictions.weatherImpact}</Text>
                    <Text size="sm" c="dimmed">Weather Impact Prediction</Text>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <IconTarget size={24} color="var(--mantine-color-violet-6)" />
                        <Badge size="sm" color="violet">Top Item</Badge>
                    </Group>
                    <Text size="lg" fw={700}>{predictiveData.nextWeekPredictions.expectedTopItems[2].item}</Text>
                    <Text size="sm" c="dimmed">Highest Predicted Demand ({predictiveData.nextWeekPredictions.expectedTopItems[2].predicted} units)</Text>
                </Card>
            </SimpleGrid>

            {/* Main Demand Forecasting Content */}
            <Grid>
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Card padding="lg" radius="md" withBorder mb="md">
                        <Group justify="space-between" mb="md">
                            <Text fw={500}>🔮 Next Week Demand Predictions by Category</Text>
                            <Badge color="blue">ML Confidence: 86%</Badge>
                        </Group>
                        <BarChart
                            h={300}
                            data={predictiveData.demandForecasting?.predictions || []}
                            dataKey="category"
                            series={[
                                { name: 'currentWeek', label: 'Current Week', color: 'blue.6' },
                                { name: 'predictedNext', label: 'Predicted Next', color: 'green.6' }
                            ]}
                            withLegend
                            withTooltip
                        />
                    </Card>

                    <Card padding="lg" radius="md" withBorder>
                        <Text fw={500} mb="md">📈 Category Prediction Details</Text>
                        <Table striped>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Category</Table.Th>
                                    <Table.Th>Current</Table.Th>
                                    <Table.Th>Predicted</Table.Th>
                                    <Table.Th>Change</Table.Th>
                                    <Table.Th>Confidence</Table.Th>
                                    <Table.Th>Trend</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {(predictiveData.demandForecasting?.predictions || []).map((pred) => {
                                    const change = pred.predictedNext - pred.currentWeek;
                                    const changePercent = ((change / pred.currentWeek) * 100).toFixed(1);
                                    return (
                                        <Table.Tr key={pred.category}>
                                            <Table.Td>
                                                <Text size="sm" fw={500}>{pred.category}</Text>
                                            </Table.Td>
                                            <Table.Td>{pred.currentWeek}</Table.Td>
                                            <Table.Td>
                                                <Text fw={500}>{pred.predictedNext}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text color={change > 0 ? 'green' : change < 0 ? 'red' : 'gray'}>
                                                    {change > 0 ? '+' : ''}{change} ({changePercent}%)
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    color={pred.confidence >= 85 ? 'green' : pred.confidence >= 75 ? 'yellow' : 'red'}
                                                    variant="light"
                                                >
                                                    {pred.confidence}%
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                {pred.trend === 'up' && <IconTrendingUp size={16} color="green" />}
                                                {pred.trend === 'down' && <IconTrendingDown size={16} color="red" />}
                                                {pred.trend === 'stable' && <IconCheck size={16} color="gray" />}
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Card padding="lg" radius="md" withBorder mb="md">
                        <Text fw={500} mb="md">🏆 Expected Top Items Next Week</Text>
                        <Stack gap="sm">
                            {(predictiveData.nextWeekPredictions?.expectedTopItems || []).map((item, index) => (
                                <Paper key={item.item} p="sm" withBorder>
                                    <Group justify="space-between" align="center">
                                        <div>
                                            <Text size="sm" fw={500}>{item.item}</Text>
                                            <Text size="xs" c="dimmed">{item.confidence}% confidence</Text>
                                        </div>
                                        <Badge variant="light" color={index === 0 ? 'red' : index === 1 ? 'orange' : 'blue'}>
                                            {item.predicted}
                                        </Badge>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    </Card>

                    <Card padding="lg" radius="md" withBorder>
                        <Text fw={500} mb="md">🚨 Action Items</Text>
                        <Stack gap="md">
                            {(predictiveData.demandForecasting?.alerts || []).map((alert, index) => (
                                <Alert
                                    key={index}
                                    color={alert.urgency === 'critical' ? 'red' : alert.urgency === 'high' ? 'orange' : 'blue'}
                                    icon={<IconAlertTriangle size={16} />}
                                >
                                    <Stack gap={4}>
                                        <Text size="sm" fw={500}>{alert.item}</Text>
                                        <Text size="xs" c="dimmed">{alert.predicted}</Text>
                                        <Text size="sm">{alert.action}</Text>
                                        <Badge size="xs" color={alert.urgency === 'critical' ? 'red' : alert.urgency === 'high' ? 'orange' : 'blue'}>
                                            {alert.urgency.toUpperCase()}
                                        </Badge>
                                    </Stack>
                                </Alert>
                            ))}
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default ReportingPOC5;
