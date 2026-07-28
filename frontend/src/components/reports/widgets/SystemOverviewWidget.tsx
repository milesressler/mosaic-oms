import React from 'react';
import {
    Card,
    Text,
    ActionIcon,
    Tooltip, 
    Center,
    Badge,
    Stack,
} from '@mantine/core';
import {
    IconInfoCircle,
} from '@tabler/icons-react';

interface SystemOverviewWidgetProps {
    value: string | number;
    label: string;
    tooltip: string;
    icon: React.ReactNode;
    color?: string;
    trend?: string;
    trendColor?: string;
    trendVariant?: 'light' | 'filled' | 'outline' | 'subtle' | 'transparent' | 'gradient';
}

export function SystemOverviewWidget({ 
    value, 
    label, 
    tooltip, 
    icon, 
    color = "var(--mantine-color-blue-6)",
    trend,
    trendColor = "blue",
    trendVariant = "light"
}: SystemOverviewWidgetProps) {
    return (
        <Card padding="sm" radius="md" withBorder>
            <div style={{ color }}>{icon}</div>
            <Center>
                <Text size="28px" fw={700} mb={4}>{value}</Text>
            </Center>
            <Stack gap={4} align="center">
                <Center>
                    <Text size="xs" c="dimmed" ta="center">{label}</Text>
                    <Tooltip label={tooltip}>
                        <ActionIcon variant="subtle" size="xs">
                            <IconInfoCircle size={12} />
                        </ActionIcon>
                    </Tooltip>
                </Center>
                {trend && (
                    <Badge size="sm" variant={trendVariant} color={trendColor}>
                        {trend}
                    </Badge>
                )}
            </Stack>
        </Card>
    );
}

export default SystemOverviewWidget;
