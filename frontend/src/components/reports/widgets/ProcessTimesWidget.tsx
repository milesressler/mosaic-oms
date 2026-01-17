import React from 'react';
import {Paper, Title, Text, Stack, Group, LoadingOverlay} from '@mantine/core';

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
            <LoadingOverlay visible={loading} opacity={.5}/>
            <Group justify={'space-between'} mb="md">
                <Title order={3}>⏱️ Process Times</Title>
                <div style={{ textAlign: 'center' }}>
                    <Text size="xs" c="dimmed" style={{ marginBottom: 2 }}>Total End-to-End</Text>
                    <Text size="xl" fw={700} c="green">
                        {totalEndToEndTime ? (totalEndToEndTime / 60).toFixed(1) : '--'}
                    </Text>
                    <Text size="xs" c="dimmed">minutes</Text>
                </div>
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
