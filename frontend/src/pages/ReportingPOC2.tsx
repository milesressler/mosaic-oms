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
    Collapse,
    ThemeIcon,
    ActionIcon,
    Divider,
    Progress,
    Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { BarChart, DonutChart } from '@mantine/charts';
import { IconChevronDown, IconChevronRight, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

// Enhanced mock data with nested grouping structure
const mockData = {
    'jeans-mens': {
        name: 'Jeans MENS',
        totalRequested: 245,
        totalFulfilled: 201,
        fillRate: 82,
        hasGender: true,
        attributes: {
            size: {
                name: 'Size',
                values: ['28', '30', '32', '34', '36', '38', '40'],
                nestedData: {
                    '28': { total: 40, filled: 35, breakdown: { color: { 'Blue': 22, 'Black': 13, 'Dark Wash': 5 }, gender: { 'Male': 38, 'Female': 2 } }},
                    '30': { total: 81, filled: 72, breakdown: { color: { 'Blue': 45, 'Black': 24, 'Dark Wash': 12 }, gender: { 'Male': 75, 'Female': 6 } }},
                    '32': { total: 130, filled: 114, breakdown: { color: { 'Blue': 68, 'Black': 42, 'Dark Wash': 20 }, gender: { 'Male': 118, 'Female': 12 } }},
                    '34': { total: 105, filled: 91, breakdown: { color: { 'Blue': 55, 'Black': 32, 'Dark Wash': 18 }, gender: { 'Male': 95, 'Female': 10 } }},
                    '36': { total: 82, filled: 67, breakdown: { color: { 'Blue': 38, 'Black': 28, 'Dark Wash': 16 }, gender: { 'Male': 75, 'Female': 7 } }},
                    '38': { total: 46, filled: 40, breakdown: { color: { 'Blue': 22, 'Black': 15, 'Dark Wash': 9 }, gender: { 'Male': 41, 'Female': 5 } }},
                    '40': { total: 25, filled: 23, breakdown: { color: { 'Blue': 12, 'Black': 8, 'Dark Wash': 5 }, gender: { 'Male': 23, 'Female': 2 } }}
                }
            },
            color: {
                name: 'Color',
                values: ['Blue', 'Black', 'Dark Wash'],
                nestedData: {
                    'Blue': { total: 262, filled: 218, breakdown: { size: { '28': 22, '30': 45, '32': 68, '34': 55, '36': 38, '38': 22, '40': 12 }, gender: { 'Male': 240, 'Female': 22 } }},
                    'Black': { total: 162, filled: 142, breakdown: { size: { '28': 13, '30': 24, '32': 42, '34': 32, '36': 28, '38': 15, '40': 8 }, gender: { 'Male': 148, 'Female': 14 } }},
                    'Dark Wash': { total: 85, filled: 75, breakdown: { size: { '28': 5, '30': 12, '32': 20, '34': 18, '36': 16, '38': 9, '40': 5 }, gender: { 'Male': 77, 'Female': 8 } }}
                }
            }
        }
    },
    hoodies: {
        name: 'Hoodies',
        totalRequested: 156,
        totalFulfilled: 98,
        fillRate: 63,
        hasGender: false,
        attributes: {
            size: {
                name: 'Size',
                values: ['XS', 'S', 'M', 'L', 'XL', '2X', '3X'],
                nestedData: {
                    'XS': { total: 11, filled: 7, breakdown: { color: { 'Black': 6, 'Gray': 3, 'Navy': 2 } }},
                    'S': { total: 48, filled: 25, breakdown: { color: { 'Black': 22, 'Gray': 16, 'Navy': 8, 'Red': 2 } }},
                    'M': { total: 107, filled: 60, breakdown: { color: { 'Black': 45, 'Gray': 32, 'Navy': 24, 'Red': 6 } }},
                    'L': { total: 83, filled: 46, breakdown: { color: { 'Black': 35, 'Gray': 28, 'Navy': 16, 'Red': 4 } }},
                    'XL': { total: 67, filled: 33, breakdown: { color: { 'Black': 28, 'Gray': 22, 'Navy': 15, 'Red': 2 } }},
                    '2X': { total: 43, filled: 31, breakdown: { color: { 'Black': 18, 'Gray': 15, 'Navy': 8, 'Red': 2 } }},
                    '3X': { total: 22, filled: 17, breakdown: { color: { 'Black': 10, 'Gray': 8, 'Navy': 3, 'Red': 1 } }}
                }
            },
            color: {
                name: 'Color',
                values: ['Black', 'Gray', 'Navy', 'Red'],
                nestedData: {
                    'Black': { total: 164, filled: 98, breakdown: { size: { 'XS': 6, 'S': 22, 'M': 45, 'L': 35, 'XL': 28, '2X': 18, '3X': 10 } }},
                    'Gray': { total: 124, filled: 71, breakdown: { size: { 'XS': 3, 'S': 16, 'M': 32, 'L': 28, 'XL': 22, '2X': 15, '3X': 8 } }},
                    'Navy': { total: 76, filled: 43, breakdown: { size: { 'XS': 2, 'S': 8, 'M': 24, 'L': 16, 'XL': 15, '2X': 8, '3X': 3 } }},
                    'Red': { total: 17, filled: 9, breakdown: { size: { 'S': 2, 'M': 6, 'L': 4, 'XL': 2, '2X': 2, '3X': 1 } }}
                }
            }
        }
    }
};

const ReportingPOC2: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<string>('jeans-mens');
    const [primaryGroupBy, setPrimaryGroupBy] = useState<string>('size');
    const [secondaryGroupBy, setSecondaryGroupBy] = useState<string | null>(null);
    const [showUnfilled, setShowUnfilled] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState<string>('6weeks');
    const [timeGrouping, setTimeGrouping] = useState<string>('week');
    const [gender, setGender] = useState<string>('all');
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['32', '34'])); // Default expanded

    const currentItem = mockData[selectedItem as keyof typeof mockData];
    const primaryAttributeData = currentItem.attributes[primaryGroupBy as keyof typeof currentItem.attributes];

    // Datadog-style progressive disclosure
    const getSecondaryOptions = (primary: string) => {
        const available = Object.keys(currentItem.attributes).filter(attr => attr !== primary);
        if (!currentItem.hasGender) {
            return available.filter(attr => attr !== 'gender');
        }
        return [...available, 'gender'];
    };

    // Enhanced data processing for nested grouping
    const processNestedData = () => {
        const nestedData = primaryAttributeData.nestedData;
        
        return Object.entries(nestedData).map(([primaryValue, data]: [string, any]) => {
            const fillRate = Math.round((data.filled / data.total) * 100);
            const unfilled = data.total - data.filled;
            
            let secondaryBreakdown = null;
            if (secondaryGroupBy && data.breakdown[secondaryGroupBy]) {
                secondaryBreakdown = Object.entries(data.breakdown[secondaryGroupBy]).map(([secValue, count]) => ({
                    name: secValue,
                    count: count as number,
                    percentage: Math.round(((count as number) / data.total) * 100)
                }));
            }

            return {
                primaryValue,
                total: data.total,
                filled: data.filled,
                unfilled,
                fillRate,
                secondaryBreakdown,
                trend: fillRate > 80 ? 'up' : fillRate < 60 ? 'down' : 'stable'
            };
        }).sort((a, b) => b.total - a.total); // Sort by demand
    };

    // Tree view component for nested breakdown
    const TreeNode = ({ node, level = 0 }: { node: any, level?: number }) => {
        const isExpanded = expandedNodes.has(node.primaryValue);
        
        const toggleExpansion = () => {
            const newExpanded = new Set(expandedNodes);
            if (isExpanded) {
                newExpanded.delete(node.primaryValue);
            } else {
                newExpanded.add(node.primaryValue);
            }
            setExpandedNodes(newExpanded);
        };

        const hasSecondaryData = node.secondaryBreakdown && node.secondaryBreakdown.length > 0;

        return (
            <Stack gap={4}>
                <Group 
                    gap="xs" 
                    style={{ 
                        padding: '8px 12px', 
                        backgroundColor: level === 0 ? 'var(--mantine-color-gray-0)' : 'transparent',
                        borderRadius: 6,
                        cursor: hasSecondaryData ? 'pointer' : 'default'
                    }}
                    onClick={hasSecondaryData ? toggleExpansion : undefined}
                >
                    {hasSecondaryData && (
                        <ActionIcon variant="subtle" size="xs">
                            {isExpanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                        </ActionIcon>
                    )}
                    
                    {!hasSecondaryData && <Box w={22} />}
                    
                    <Text fw={level === 0 ? 500 : 400} size={level === 0 ? 'sm' : 'xs'}>
                        {node.primaryValue}: {node.total} total
                    </Text>
                    
                    <Text size="xs" c="dimmed">
                        ({node.unfilled} gap, {node.fillRate}%)
                    </Text>
                    
                    <Progress 
                        value={node.fillRate} 
                        size="xs" 
                        style={{ flex: 1, maxWidth: 60 }}
                        color={node.fillRate > 80 ? 'green' : node.fillRate > 60 ? 'yellow' : 'red'}
                    />
                    
                    <ThemeIcon 
                        size="xs" 
                        variant="light" 
                        color={node.trend === 'up' ? 'green' : node.trend === 'down' ? 'red' : 'gray'}
                    >
                        {node.trend === 'up' ? <IconTrendingUp size={10} /> : 
                         node.trend === 'down' ? <IconTrendingDown size={10} /> : 
                         <Box w={10} />}
                    </ThemeIcon>
                </Group>

                {hasSecondaryData && (
                    <Collapse in={isExpanded}>
                        <Stack gap={2} ml={34}>
                            {node.secondaryBreakdown.map((secondary: any) => (
                                <Group key={secondary.name} gap="xs">
                                    <Text size="xs" c="dimmed" style={{ minWidth: 60 }}>
                                        └─ {secondary.name}:
                                    </Text>
                                    <Text size="xs">
                                        {secondary.count} ({secondary.percentage}%)
                                    </Text>
                                    <Progress 
                                        value={secondary.percentage} 
                                        size="xs" 
                                        style={{ flex: 1, maxWidth: 40 }}
                                        color="blue"
                                    />
                                </Group>
                            ))}
                        </Stack>
                    </Collapse>
                )}
            </Stack>
        );
    };

    const nestedData = processNestedData();

    return (
        <Container size="xl" py="md">
            <Title order={1} mb="lg">Reporting POC v2 - Datadog-Style Multi-Dimensional Analysis</Title>
            
            {/* Priority Items Overview - Same as original */}
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

            {/* Enhanced Analysis with Datadog-style controls */}
            <Card padding="lg" radius="md" withBorder>
                <Title order={2} mb="md">{currentItem.name} - Enhanced Multi-Dimensional Analysis</Title>
                
                {/* Progressive Disclosure Controls - Datadog Style */}
                <Stack gap="md" mb="lg">
                    {/* Primary Breakdown */}
                    <Box>
                        <Text size="sm" fw={500} mb="xs">Primary Breakdown</Text>
                        <SegmentedControl
                            data={Object.keys(currentItem.attributes).map(key => ({
                                value: key,
                                label: currentItem.attributes[key as keyof typeof currentItem.attributes].name
                            }))}
                            value={primaryGroupBy}
                            onChange={(value) => {
                                setPrimaryGroupBy(value);
                                // Clear secondary if incompatible
                                if (value === secondaryGroupBy) {
                                    setSecondaryGroupBy(null);
                                }
                            }}
                        />
                    </Box>

                    {/* Secondary Breakdown - Progressive Disclosure */}
                    <Box>
                        <Text size="sm" fw={500} mb="xs">
                            Secondary Breakdown 
                            <Text span size="xs" c="dimmed"> (Optional - drill deeper)</Text>
                        </Text>
                        <Select
                            placeholder="Add second dimension for nested analysis..."
                            data={getSecondaryOptions(primaryGroupBy).map(option => ({
                                value: option,
                                label: option === 'gender' ? 'Gender' : 
                                       currentItem.attributes[option as keyof typeof currentItem.attributes]?.name || option
                            }))}
                            value={secondaryGroupBy}
                            onChange={setSecondaryGroupBy}
                            clearable
                        />
                    </Box>

                    {/* Other Controls */}
                    <Group gap="md" align="flex-end">
                        <Select
                            label="Date Range"
                            value={dateRange}
                            onChange={(value) => setDateRange(value || '6weeks')}
                            data={[
                                { value: '6weeks', label: 'Last 6 Weeks' },
                                { value: '3months', label: 'Last 3 Months' },
                                { value: '6months', label: 'Last 6 Months' },
                                { value: '1year', label: 'Last Year' },
                                { value: 'custom', label: 'Custom Range' },
                            ]}
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

                        {currentItem.hasGender && (
                            <Select
                                label="Gender"
                                value={gender}
                                onChange={(value) => setGender(value || 'all')}
                                data={[
                                    { value: 'all', label: 'All Genders' },
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                ]}
                                w={120}
                            />
                        )}

                        <Checkbox
                            label="Show filled/unfilled split"
                            checked={showUnfilled}
                            onChange={(event) => setShowUnfilled(event.currentTarget.checked)}
                        />
                    </Group>
                </Stack>

                <Divider my="md" />

                <Grid>
                    {/* Left Panel - Datadog-style Tree Breakdown */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack>
                            <Group justify="space-between">
                                <Text fw={500} size="sm">
                                    📊 {primaryAttributeData.name} Breakdown
                                    {secondaryGroupBy && (
                                        <Text span size="xs" c="dimmed"> → {secondaryGroupBy}</Text>
                                    )}
                                </Text>
                                <Tooltip label="Click rows to expand secondary breakdown">
                                    <Text size="xs" c="dimmed">
                                        {secondaryGroupBy ? 'Click to expand' : 'Add secondary for drill-down'}
                                    </Text>
                                </Tooltip>
                            </Group>
                            
                            <Stack gap={2}>
                                {nestedData.map((node) => (
                                    <TreeNode key={node.primaryValue} node={node} />
                                ))}
                            </Stack>
                            
                            <Button variant="outline" size="xs" mt="md">
                                📤 Export Breakdown Data
                            </Button>
                        </Stack>
                    </Grid.Col>
                    
                    {/* Right Panel - Visual Charts */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack>
                            <Box>
                                <Text size="sm" fw={500} mb="md">
                                    Visual Distribution - {primaryAttributeData.name}
                                </Text>
                                <DonutChart
                                    data={nestedData.map((item, index) => ({
                                        name: `${item.primaryValue} (${item.fillRate}%)`,
                                        value: item.total,
                                        color: `var(--mantine-color-blue-${Math.min(9, 3 + index)})`
                                    }))}
                                    size={200}
                                    thickness={40}
                                    withLabels
                                    withTooltip
                                />
                            </Box>
                            
                            {/* Summary Stats */}
                            <Box>
                                <Text size="sm" fw={500} mb="xs">Quick Stats</Text>
                                <Stack gap="xs">
                                    <Group justify="space-between">
                                        <Text size="xs">Total Requested:</Text>
                                        <Text size="xs" fw={500}>{currentItem.totalRequested}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="xs">Total Fulfilled:</Text>
                                        <Text size="xs" fw={500}>{currentItem.totalFulfilled}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="xs">Overall Fill Rate:</Text>
                                        <Badge size="xs" color={currentItem.fillRate > 80 ? 'green' : 'orange'}>
                                            {currentItem.fillRate}%
                                        </Badge>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="xs">Breakdown by:</Text>
                                        <Text size="xs" fw={500}>
                                            {primaryAttributeData.name}
                                            {secondaryGroupBy && ` → ${secondaryGroupBy}`}
                                        </Text>
                                    </Group>
                                </Stack>
                            </Box>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Card>
        </Container>
    );
};

export default ReportingPOC2;