import React from 'react';
import { Paper, Title, Text, Stack, Group } from '@mantine/core';

interface ProcessStage {
    stage: string;
    avgTime: number;
    description: string;
    source: string;
}

interface ProcessTimesWidgetProps {
    data: ProcessStage[];
    loading?: boolean;
    totalEndToEndTime: number;
}

const ProcessTimesWidget: React.FC<ProcessTimesWidgetProps> = ({ data, loading, totalEndToEndTime }) => {
    if (!data || data.length === 0) {
        return null;
    }

    return (
        <Paper p="md" mb="lg" withBorder>
            <Group justify={'space-between'}>
                <Title order={3} mb="md">Process Times</Title>
                <Title order={4} mb="md">Total: {(totalEndToEndTime / 60).toFixed(1)}m</Title>
            </Group>
            <Stack gap="md">
                {data.map((stage) => (
                    <Paper key={stage.stage} p="xs" withBorder>
                        <Group justify="space-between" align="center">
                            <div>
                                <Text size="sm" fw={500}>{stage.stage}</Text>
                                <Text size="xs" c="dimmed">{stage.description}</Text>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                {stage.avgTime && stage.avgTime > 120 ? (
                                    <>
                                        <Text size="xl" fw={700} c="blue">{(stage.avgTime / 60).toFixed(1)}</Text>
                                        <Text size="xs" c="dimmed">minutes</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text size="xl" fw={700} c="blue">{stage.avgTime?.toFixed(0) || '--'}</Text>
                                        <Text size="xs" c="dimmed">seconds</Text>
                                    </>
                                )}
                            </div>
                        </Group>
                    </Paper>
                ))}
            </Stack>
            <Text size="xs" c="dimmed" mt="md">
                📊 These are averaged times based on completed orders during the selected time period.
            </Text>
        </Paper>
    );
};

export default ProcessTimesWidget;
