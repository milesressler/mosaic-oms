import React from 'react';
import {
    Card,
    Text,
    LoadingOverlay,
    Stack,
    Group,
    Box,
    ThemeIcon,
    Alert
} from '@mantine/core';
import { IconTrendingUp, IconTrendingDown, IconMinus, IconAlertCircle } from '@tabler/icons-react';
import { ItemMover } from 'src/services/reportsApi';

interface BiggestMoversWidgetProps {
    data: ItemMover[];
    loading: boolean;
}

const BiggestMoversWidget: React.FC<BiggestMoversWidgetProps> = ({ data, loading }) => {
    const getDirectionIcon = (direction: 'UP' | 'DOWN' | 'FLAT') => {
        switch (direction) {
            case 'UP':
                return <IconTrendingUp size={16} color="var(--mantine-color-green-6)" />;
            case 'DOWN':
                return <IconTrendingDown size={16} color="var(--mantine-color-red-6)" />;
            case 'FLAT':
                return <IconMinus size={16} color="var(--mantine-color-gray-6)" />;
        }
    };

    const getChangeColor = (direction: 'UP' | 'DOWN' | 'FLAT') => {
        switch (direction) {
            case 'UP': return 'var(--mantine-color-green-6)';
            case 'DOWN': return 'var(--mantine-color-red-6)';
            case 'FLAT': return 'var(--mantine-color-gray-6)';
        }
    };

    const formatChange = (mover: ItemMover) => {
        const sign = mover.absoluteChange >= 0 ? '+' : '';
        const percentage = Math.abs(mover.percentageChange);
        return `${sign}${mover.absoluteChange} (${percentage.toFixed(0)}%)`;
    };

    if (!data || data.length === 0) {
        return (
            <Card withBorder h="300px" pos="relative">
                <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
                <Stack gap="sm">
                    <Text fw={600} size="lg">📈 Biggest Movers (vs 4-Week Average)</Text>
                    {!loading && (
                        <Alert icon={<IconAlertCircle size={16} />} color="blue">
                            No significant changes in item requests this week.
                        </Alert>
                    )}
                </Stack>
            </Card>
        );
    }

    return (
        <Card withBorder h="300px" pos="relative">
            <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
            
            <Stack gap="sm">
                <Text fw={600} size="lg">📈 Biggest Movers (vs 4-Week Average)</Text>
                
                <Box style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <Stack gap="xs">
                        {data.map((mover, index) => (
                            <Group key={index} justify="space-between" wrap="nowrap">
                                <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                                    <ThemeIcon 
                                        variant="light" 
                                        size="sm"
                                        color={mover.direction === 'UP' ? 'green' : mover.direction === 'DOWN' ? 'red' : 'gray'}
                                    >
                                        {getDirectionIcon(mover.direction)}
                                    </ThemeIcon>
                                    <Text size="sm" truncate style={{ flex: 1 }}>
                                        {mover.itemName}
                                    </Text>
                                </Group>
                                
                                <Text 
                                    size="sm" 
                                    fw={500}
                                    style={{ 
                                        color: getChangeColor(mover.direction),
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {formatChange(mover)}
                                </Text>
                            </Group>
                        ))}
                    </Stack>
                </Box>
                
                <Text size="xs" c="dimmed" style={{ textAlign: 'center', marginTop: 'auto' }}>
                    Comparing this week vs 4-week average • Requested items only
                </Text>
            </Stack>
        </Card>
    );
};

export default BiggestMoversWidget;