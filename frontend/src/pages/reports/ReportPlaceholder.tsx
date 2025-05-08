import { useEffect } from 'react';
import { LineChart } from '@mantine/charts';
import {
    Box,
    Flex,
    Title,
    Table,
    Loader,
    Center,
    Text,
    Badge,
} from '@mantine/core';

import useApi from 'src/hooks/useApi.tsx';
import reportingApi from 'src/services/reportingApi.tsx';

export function ReportsPage() {
    const apiOrdersCreated = useApi(reportingApi.ordersCreated);
    const apiTopItems = useApi(reportingApi.topItemsLastWeek);

    useEffect(() => {
        apiOrdersCreated.request();
        apiTopItems.request();
    }, []);

    const loading = apiOrdersCreated.loading || apiTopItems.loading;
    if (loading) {
        return (
            <Center style={{ height: '100%' }}>
                <Loader size="lg" />
            </Center>
        );
    }

    const ordersData = apiOrdersCreated.data || [];

    return (
        <Flex gap="md" p="md">
            {/* Chart container: roughly 66% width */}
            <Box style={{ flex: 2 }}>
                <Title order={4} mb="sm">
                    Orders Created (Last {ordersData.length} Weeks)
                </Title>
                <LineChart
                    h={300}
                    data={ordersData}
                    dataKey="label"
                    series={[{ name: 'total', label: 'Orders Created' }]}
                    xAxisProps={{ title: { text: 'Week Starting' } }}
                    yAxisProps={{ title: { text: 'Count' } }}
                    withLegend
                    tickLine="y"
                />
            </Box>

            {/* Table container: roughly 33% width */}
            <Box style={{ flex: 1 }}>
                <Title order={4} mb="sm">
                    Top 10 Items Last Week
                </Title>
                {apiTopItems.data?.data?.length > 0 ? (
                    <Table striped highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>#</Table.Th>
                                <Table.Th>Item</Table.Th>
                                <Table.Th>Requests</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {apiTopItems.data?.data?.map((item, idx) => (
                                <Table.Tr key={item.itemEntityId}>
                                    <Table.Td>{idx + 1}</Table.Td>
                                    <Table.Td>{item.itemName}</Table.Td>
                                    <Table.Td>
                                        <Badge variant="light">
                                            {item.requestCount}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                ) : (
                    <Text>No data for last week</Text>
                )}
            </Box>
        </Flex>
    );
}

export default ReportsPage;
