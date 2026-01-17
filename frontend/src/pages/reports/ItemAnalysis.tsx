import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Container,
    Title,
    Group,
    Card,
    Text,
    Badge,
    Grid,
    Stack,
    Alert,
    Button,
    LoadingOverlay,
    SimpleGrid,
    SegmentedControl,
    Select,
    Collapse,
    ActionIcon,
    Progress,
    Tooltip,
} from '@mantine/core';
import { IconInfoCircle, IconShoppingCart, IconPackage, IconTrendingUp, IconChartLine, IconChartBar, IconChevronDown, IconChevronRight, IconDownload } from '@tabler/icons-react';
import { BarChart } from '@mantine/charts';
import ItemSearch from 'src/components/common/ItemSearch';
import DateRangeSelector, { useDateRangeState } from 'src/components/common/DateRangeSelector';
import SystemOverviewWidget from 'src/components/reports/widgets/SystemOverviewWidget';
import { Item } from 'src/models/types';
import useApi from 'src/hooks/useApi';
import itemsApi from 'src/services/itemsApi';
import reportsApi from 'src/services/reportsApi';

const ItemAnalysis: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Chart state
    const [distributionMetric, setDistributionMetric] = useState<'requested' | 'fulfilled'>('requested');
    const [breakdownAttribute, setBreakdownAttribute] = useState<string>('size');
    const [secondaryBreakdownAttribute, setSecondaryBreakdownAttribute] = useState<string>('');
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    
    // Get item from URL parameter on mount
    const itemParam = searchParams.get('item');
    
    // Date range state
    const {
        dateRange,
        customDateRange,
        setDateRange,
        setCustomDateRange,
        getDateRangeParams
    } = useDateRangeState('6weeks');
    
    // API to fetch all items
    const suggestedItemsApi = useApi(itemsApi.getSuggestedItems);
    
    // API to fetch item metrics
    const itemMetricsApi = useApi(reportsApi.getItemMetrics);
    
    // API to fetch breakdown data
    const itemBreakdownApi = useApi(reportsApi.getItemBreakdown);
    const secondaryBreakdownApi = useApi(reportsApi.getItemBreakdown);
    
    // API to fetch item details for attributes
    const itemDetailsApi = useApi(itemsApi.getAdminItem);
    
    // Load all items on mount
    useEffect(() => {
        suggestedItemsApi.request();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    // When items are loaded and we have a URL param, find and set the item
    useEffect(() => {
        if (itemParam && !selectedItem && suggestedItemsApi.data) {
            setLoading(true);
            
            // Flatten all items from all categories
            const allItems = Object.values(suggestedItemsApi.data).flat();
            
            // Try to find by ID first, then by description
            const itemId = parseInt(itemParam);
            let foundItem: Item | undefined;
            
            if (!isNaN(itemId)) {
                foundItem = allItems.find(item => item.id === itemId);
            }
            
            // If not found by ID, try by description (case insensitive)
            if (!foundItem) {
                foundItem = allItems.find(item => 
                    item.description.toLowerCase().includes(itemParam.toLowerCase())
                );
            }
            
            if (foundItem) {
                setSelectedItem(foundItem);
            }
            
            setLoading(false);
        }
    }, [itemParam, selectedItem, suggestedItemsApi.data]);
    
    const handleItemSelect = (item: Item | null) => {
        setSelectedItem(item);
        
        if (item) {
            // Update URL parameter when item is selected
            setSearchParams({ item: item.id.toString() });
        } else {
            // Clear URL parameter when item is cleared
            setSearchParams({});
        }
    };
    
    // Load item details when item is selected to get attributes
    useEffect(() => {
        if (selectedItem) {
            itemDetailsApi.request(selectedItem.id);
        }
    }, [selectedItem]); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Load item metrics when item is selected or date range changes
    useEffect(() => {
        if (selectedItem) {
            const params = {
                itemId: selectedItem.id,
                ...getDateRangeParams()
            };
            itemMetricsApi.request(params);
        }
    }, [selectedItem, dateRange, customDateRange]); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Load breakdown data when item, date range, or breakdown attribute changes
    useEffect(() => {
        if (selectedItem) {
            const params = {
                itemId: selectedItem.id,
                groupBy: breakdownAttribute,
                ...getDateRangeParams()
            };
            itemBreakdownApi.request(params);
        }
    }, [selectedItem, dateRange, customDateRange, breakdownAttribute]); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Update default breakdown attribute when item details are loaded
    useEffect(() => {
        if (itemDetailsApi.data && itemDetailsApi.data.attributes) {
            const attributes = itemDetailsApi.data.attributes
                .map(attr => attr.key)
                .filter(key => key && key.trim() !== '');
                
            if (attributes.length > 0) {
                const firstAttribute = attributes[0];
                if (firstAttribute && breakdownAttribute !== firstAttribute) {
                    setBreakdownAttribute(firstAttribute);
                    setSecondaryBreakdownAttribute(''); // Reset secondary breakdown
                }
            }
        }
    }, [itemDetailsApi.data]); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Load secondary breakdown data when secondary attribute is selected
    useEffect(() => {
        if (selectedItem && secondaryBreakdownAttribute) {
            const params = {
                itemId: selectedItem.id,
                groupBy: breakdownAttribute,
                secondaryGroupBy: secondaryBreakdownAttribute,
                ...getDateRangeParams()
            };
            secondaryBreakdownApi.request(params);
        }
    }, [selectedItem, dateRange, customDateRange, breakdownAttribute, secondaryBreakdownAttribute]); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Handle refresh button click
    const handleRefresh = () => {
        if (selectedItem) {
            const params = {
                itemId: selectedItem.id,
                ...getDateRangeParams()
            };
            itemMetricsApi.request(params);
            
            // Refresh breakdown data
            itemBreakdownApi.request({
                ...params,
                groupBy: breakdownAttribute
            });
            
            // Refresh secondary breakdown if enabled
            if (secondaryBreakdownAttribute) {
                secondaryBreakdownApi.request({
                    ...params,
                    groupBy: breakdownAttribute,
                    secondaryGroupBy: secondaryBreakdownAttribute
                });
            }
        }
    };
    
    // Get metrics data from API
    const metrics = itemMetricsApi.data;
    
    // Transform breakdown data for nested view
    const transformBreakdownData = () => {
        const breakdownData = itemBreakdownApi.data;
        if (!breakdownData || !breakdownData.data) return {};

        const grouped = breakdownData.data.reduce((acc: any, item) => {
            const key = item.primaryValue;
            if (!acc[key]) {
                acc[key] = {
                    total: 0,
                    filled: 0,
                    fillRate: 0,
                    breakdown: {}
                };
            }
            
            acc[key].total += item.requestedCount;
            acc[key].filled += item.fulfilledCount;
            acc[key].fillRate = acc[key].total > 0 ? Math.round((acc[key].filled / acc[key].total) * 100) : 0;
            
            return acc;
        }, {});

        return grouped;
    };
    
    // Transform secondary breakdown data
    const transformSecondaryBreakdownData = () => {
        const secondaryData = secondaryBreakdownApi.data;
        if (!secondaryData || !secondaryData.data || !secondaryBreakdownAttribute) return {};

        const grouped = secondaryData.data.reduce((acc: any, item) => {
            const primaryKey = item.primaryValue;
            const secondaryKey = item.secondaryValue || 'Unknown';
            
            if (!acc[primaryKey]) {
                acc[primaryKey] = {};
            }
            if (!acc[primaryKey][secondaryKey]) {
                acc[primaryKey][secondaryKey] = 0;
            }
            
            acc[primaryKey][secondaryKey] += item.requestedCount;
            return acc;
        }, {});

        return grouped;
    };
    
    // Get combined breakdown data
    const getBreakdownData = () => {
        const primaryData = transformBreakdownData();
        const secondaryData = transformSecondaryBreakdownData();
        
        // Merge secondary breakdown into primary data
        Object.keys(primaryData).forEach(key => {
            if (secondaryData[key]) {
                primaryData[key].breakdown = { [secondaryBreakdownAttribute]: secondaryData[key] };
            }
        });
        
        return primaryData;
    };
    
    // Transform breakdown data for temporal chart
    const getTemporalData = () => {
        const breakdownData = itemBreakdownApi.data;
        if (!breakdownData || !breakdownData.data) return [];

        // Group by week and calculate totals per attribute value
        const weeklyData = breakdownData.data.reduce((acc: any, item) => {
            const weekKey = item.weekStart;
            const attributeValue = item.primaryValue;
            const requestedCount = distributionMetric === 'requested' ? item.requestedCount : item.fulfilledCount;
            
            if (!acc[weekKey]) {
                acc[weekKey] = { 
                    week: new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    total: 0 
                };
            }
            
            const seriesKey = `${breakdownAttribute}_${attributeValue}_req`;
            acc[weekKey][seriesKey] = (acc[weekKey][seriesKey] || 0) + requestedCount;
            acc[weekKey].total += requestedCount;
            
            return acc;
        }, {});

        // Convert to array and sort by date
        return Object.entries(weeklyData)
            .map(([date, data]) => ({ ...data, weekStart: date }))
            .sort((a: any, b: any) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());
    };

    // Mock nested breakdown data for drill-down
    const mockNestedBreakdownData = {
        size: {
            'Size 32': { 
                total: 67, filled: 57, fillRate: 85,
                breakdown: { color: { 'Blue': 35, 'Black': 20, 'Dark Wash': 12 } }
            },
            'Size 30': { 
                total: 45, filled: 35, fillRate: 78,
                breakdown: { color: { 'Blue': 23, 'Black': 14, 'Dark Wash': 8 } }
            },
            'Size 34': { 
                total: 38, filled: 35, fillRate: 92,
                breakdown: { color: { 'Blue': 20, 'Black': 12, 'Dark Wash': 6 } }
            },
            'Size 28': { 
                total: 32, filled: 28, fillRate: 88,
                breakdown: { color: { 'Blue': 17, 'Black': 10, 'Dark Wash': 5 } }
            },
            'Size 36': { 
                total: 25, filled: 18, fillRate: 72,
                breakdown: { color: { 'Blue': 13, 'Black': 8, 'Dark Wash': 4 } }
            }
        },
        color: {
            'Blue': { 
                total: 142, filled: 118, fillRate: 83,
                breakdown: { size: { 'Size 32': 35, 'Size 30': 23, 'Size 34': 20, 'Size 28': 17, 'Size 36': 13 } }
            },
            'Black': { 
                total: 78, filled: 65, fillRate: 83,
                breakdown: { size: { 'Size 32': 20, 'Size 30': 14, 'Size 34': 12, 'Size 28': 10, 'Size 36': 8 } }
            },
            'Dark Wash': { 
                total: 47, filled: 40, fillRate: 85,
                breakdown: { size: { 'Size 32': 12, 'Size 30': 8, 'Size 34': 6, 'Size 28': 5, 'Size 36': 4 } }
            }
        }
    };
    
    // Get available attributes from item details
    const getAvailableAttributes = () => {
        if (!itemDetailsApi.data || !itemDetailsApi.data.attributes) {
            return [];
        }
        
        return itemDetailsApi.data.attributes
            .map(attr => attr.key)
            .filter(key => key && key.trim() !== ''); // Filter out empty/null keys
    };
    
    const availableAttributes = getAvailableAttributes();
    
    // Get unique values from breakdown data for chart series
    const getUniqueBreakdownValues = () => {
        const breakdownData = itemBreakdownApi.data;
        if (!breakdownData || !breakdownData.data) return [];

        const uniqueValues = [...new Set(breakdownData.data.map(item => item.primaryValue))];
        return uniqueValues.sort();
    };

    // Create stacked series for temporal breakdown
    const createStackedSeries = () => {
        const uniqueValues = getUniqueBreakdownValues();
        return uniqueValues.map((value, index) => ({
            name: `${breakdownAttribute}_${value}_req`,
            label: value,
            color: `var(--mantine-color-blue-${Math.min(9, 3 + index)})`
        }));
    };
    
    // Get secondary breakdown options
    const getSecondaryOptions = () => {
        return availableAttributes.filter(attr => attr !== breakdownAttribute);
    };
    
    // Toggle expanded row
    const toggleRow = (rowKey: string) => {
        setExpandedRows(prev => 
            prev.includes(rowKey) 
                ? prev.filter(key => key !== rowKey)
                : [...prev, rowKey]
        );
    };
    
    // Export breakdown data
    const exportBreakdownData = () => {
        const data = getBreakdownData();
        console.log('Exporting breakdown data:', data);
        // TODO: Implement actual export functionality
    };
    
    return (
        <Container size="xl" py="md">
            <LoadingOverlay visible={loading || itemMetricsApi.loading} overlayProps={{ blur: 2 }} />
            
            <Stack gap="lg">
                <Group justify="space-between" align="center">
                    <Title order={1}>Item Analysis</Title>

                    <DateRangeSelector
                        dateRange={dateRange}
                        customDateRange={customDateRange}
                        onDateRangeChange={setDateRange}
                        onCustomDateRangeChange={setCustomDateRange}
                        onRefresh={handleRefresh}
                        showRefreshButton={true}
                    />
                </Group>
                <ItemSearch
                    onItemSelect={handleItemSelect}
                    placeholder="Search for an item to analyze..."
                    size="lg"
                    value={selectedItem?.description || ''}
                />
                
                {!selectedItem && (
                    <Alert variant="light" color="blue" icon={<IconInfoCircle />}>
                        <Text>
                            Use the search above to select an item and view detailed metrics including:
                        </Text>
                        <Text component="ul" mt="sm">
                            <li>Order frequency and trends</li>
                            <li>Fulfillment rates and patterns</li>
                            <li>Popular variants and attributes</li>
                            <li>Seasonal demand analysis</li>
                            <li>Inventory recommendations</li>
                        </Text>
                    </Alert>
                )}
                
                {selectedItem && (
                    <Stack gap="lg">
                        <Group justify="space-between" align="center">
                            <Group gap="sm">
                                <Title order={2}>{selectedItem.description}</Title>
                                <Badge variant="light" color="blue">
                                    {selectedItem.category}
                                </Badge>
                                {selectedItem.availability !== 'AVAILABLE' && (
                                    <Badge variant="light" color="orange">
                                        {selectedItem.availability}
                                    </Badge>
                                )}
                            </Group>
                        </Group>
                        
                        {/* Key Metrics Cards */}
                        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                            <SystemOverviewWidget
                                value={metrics?.totalRequested?.toLocaleString() || '0'}
                                label="Total Requested"
                                tooltip="Total number of times this item was requested during the selected time period"
                                icon={<IconShoppingCart size={24} />}
                                color="var(--mantine-color-blue-6)"
                            />
                            
                            <SystemOverviewWidget
                                value={metrics?.totalFulfilled?.toLocaleString() || '0'}
                                label="Total Fulfilled"
                                tooltip="Total number of times this item was successfully fulfilled during the selected time period"
                                icon={<IconPackage size={24} />}
                                color="var(--mantine-color-green-6)"
                            />
                            
                            <SystemOverviewWidget
                                value={`${Math.round((metrics?.fillRate || 0) * 100)}%`}
                                label="Fill Rate"
                                tooltip="Percentage of requests for this item that were successfully fulfilled"
                                icon={<IconTrendingUp size={24} />}
                                color="var(--mantine-color-violet-6)"
                            />
                        </SimpleGrid>

                        {/* Temporal Breakdown Chart */}
                        <Card withBorder>
                            <Stack gap="md">
                                <Group justify="space-between" align="center">
                                    <Group gap="sm" align="center">
                                        <IconChartLine size={20} />
                                        <Title order={4}>Temporal Breakdown</Title>
                                    </Group>
                                    <Group gap="md">
                                        <SegmentedControl
                                            value={distributionMetric}
                                            onChange={(value) => setDistributionMetric(value as 'requested' | 'fulfilled')}
                                            data={[
                                                { label: 'Requested', value: 'requested' },
                                                { label: 'Fulfilled', value: 'fulfilled' }
                                            ]}
                                        />
                                        <Select
                                            value={breakdownAttribute}
                                            onChange={(value) => setBreakdownAttribute(value || 'size')}
                                            data={availableAttributes.map(attr => ({ 
                                                value: attr, 
                                                label: attr.charAt(0).toUpperCase() + attr.slice(1) 
                                            }))}
                                            w={120}
                                        />
                                    </Group>
                                </Group>
                                
                                <Text fw={500} size="sm" mb="md">
                                    📊 {breakdownAttribute.charAt(0).toUpperCase() + breakdownAttribute.slice(1)} Distribution Over Time
                                </Text>
                                
                                <BarChart
                                    h={350}
                                    data={getTemporalData()}
                                    dataKey="week"
                                    series={createStackedSeries()}
                                    type="stacked"
                                    tickLine="xy"
                                    gridAxis="xy"
                                    withLegend
                                    withTooltip
                                />
                            </Stack>
                        </Card>

                        {/* Nested Attribute Breakdown */}
                        <Card withBorder>
                            <Stack gap="md">
                                <Group justify="space-between" align="center">
                                    <Group gap="sm" align="center">
                                        <IconChartBar size={20} />
                                        <Title order={4}>Attribute Breakdown</Title>
                                    </Group>
                                    <Group gap="md">
                                        <Select
                                            label="Primary Breakdown"
                                            value={breakdownAttribute}
                                            onChange={(value) => {
                                                setBreakdownAttribute(value || 'size');
                                                setSecondaryBreakdownAttribute('');
                                            }}
                                            data={availableAttributes.map(attr => ({ 
                                                value: attr, 
                                                label: attr.charAt(0).toUpperCase() + attr.slice(1) 
                                            }))}
                                            w={140}
                                        />
                                        <Select
                                            label="Secondary Breakdown"
                                            placeholder="Add second dimension..."
                                            value={secondaryBreakdownAttribute}
                                            onChange={(value) => setSecondaryBreakdownAttribute(value || '')}
                                            data={getSecondaryOptions().map(attr => ({ 
                                                value: attr, 
                                                label: attr.charAt(0).toUpperCase() + attr.slice(1) 
                                            }))}
                                            w={140}
                                            clearable
                                        />
                                    </Group>
                                </Group>
                                
                                <Grid>
                                    <Grid.Col span={12}>
                                        <Group justify="space-between" align="center" mb="md">
                                            <Text fw={500} size="sm">
                                                📊 {breakdownAttribute.charAt(0).toUpperCase() + breakdownAttribute.slice(1)} Breakdown
                                                {secondaryBreakdownAttribute && (
                                                    <Text span size="xs" c="dimmed"> → {secondaryBreakdownAttribute}</Text>
                                                )}
                                            </Text>
                                            <Tooltip label="Click rows to expand secondary breakdown">
                                                <Text size="xs" c="dimmed">
                                                    {secondaryBreakdownAttribute ? 'Click to expand' : 'Add secondary for drill-down'}
                                                </Text>
                                            </Tooltip>
                                        </Group>
                                        
                                        <Stack gap="xs">
                                            {Object.entries(getBreakdownData() || {}).map(([key, data]) => (
                                                <div key={key}>
                                                    <Group 
                                                        justify="space-between" 
                                                        p="sm" 
                                                        style={{ 
                                                            borderRadius: 4, 
                                                            backgroundColor: 'var(--mantine-color-gray-0)',
                                                            cursor: secondaryBreakdownAttribute ? 'pointer' : 'default'
                                                        }}
                                                        onClick={() => secondaryBreakdownAttribute && toggleRow(key)}
                                                    >
                                                        <Group gap="sm">
                                                            {secondaryBreakdownAttribute && (
                                                                <ActionIcon variant="subtle" size="sm">
                                                                    {expandedRows.includes(key) ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                                                                </ActionIcon>
                                                            )}
                                                            <Text fw={500}>{key}</Text>
                                                        </Group>
                                                        <Group gap="md">
                                                            <Progress 
                                                                value={(data.filled / data.total) * 100}
                                                                size="sm"
                                                                w={80}
                                                                color={data.fillRate > 80 ? "green" : "orange"}
                                                            />
                                                            <Text size="sm">{data.total} req.</Text>
                                                            <Text size="sm" c="green">{data.filled} filled</Text>
                                                            <Badge 
                                                                size="sm" 
                                                                variant="light" 
                                                                color={data.fillRate > 80 ? "green" : "orange"}
                                                            >
                                                                {data.fillRate}%
                                                            </Badge>
                                                        </Group>
                                                    </Group>
                                                    
                                                    {secondaryBreakdownAttribute && expandedRows.includes(key) && (
                                                        <Collapse in={expandedRows.includes(key)}>
                                                            <Stack gap="xs" pl="xl" pt="xs">
                                                                {Object.entries(data.breakdown[secondaryBreakdownAttribute] || {}).map(([subKey, subValue]) => (
                                                                    <Group key={subKey} justify="space-between" p="xs" style={{ 
                                                                        borderRadius: 4, 
                                                                        backgroundColor: 'var(--mantine-color-gray-1)' 
                                                                    }}>
                                                                        <Text size="sm" pl="md">↳ {subKey}</Text>
                                                                        <Group gap="sm">
                                                                            <Text size="sm">{subValue} req.</Text>
                                                                            <Badge size="xs" variant="outline">
                                                                                {Math.round((subValue as number) / data.total * 100)}%
                                                                            </Badge>
                                                                        </Group>
                                                                    </Group>
                                                                ))}
                                                            </Stack>
                                                        </Collapse>
                                                    )}
                                                </div>
                                            ))}
                                        </Stack>
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            mt="md"
                                            leftSection={<IconDownload size={16} />}
                                            onClick={exportBreakdownData}
                                        >
                                            📤 Export Breakdown Data
                                        </Button>
                                    </Grid.Col>
                                </Grid>
                            </Stack>
                        </Card>
                    </Stack>
                )}
            </Stack>
        </Container>
    );
};

export default ItemAnalysis;
