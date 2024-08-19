import {Blockquote, Group, Paper, Text, Title} from "@mantine/core";
import {OrderDetails, OrderStatus} from "src/models/types.tsx";
import FillerOrderActionButton from "src/components/fillers/actionButton/FillerOrderActionButton.tsx";
import {IconNotes} from "@tabler/icons-react";

interface props {
    orderDetails: OrderDetails|null
    loading: boolean
    changeState: (status: OrderStatus) => void
    toggleAssigned: () => void
}
export function OrderInfoBlock({ orderDetails, loading, changeState, toggleAssigned}: props) {

    return (<>
        <Group justify={'space-between'} pr={10} mb={10}>
            <Title>Order: {orderDetails?.id}</Title>
            <FillerOrderActionButton
                onStateChange={changeState}
                toggleAssigned={toggleAssigned}
                order={orderDetails}
                loading={loading} />

        </Group>
        <Paper  shadow="xs" p="xl">
            <Text>
                <Text span fw={500}>Customer:</Text> {orderDetails?.customer?.name}
            </Text>
            <Text>
                <Text span fw={500}>Assigned:</Text>
                { orderDetails?.assignee?.name ?? "[unassigned]"}
            </Text>
            { orderDetails?.specialInstructions && <Text>
                {/*<Text span fw={700} c={'green'}>Notes:</Text>/!**!/*/}
                <Blockquote color="green" icon={<IconNotes />} mt="md"  iconSize={15} radius={5} p={8}>
                    {orderDetails?.specialInstructions}
                </Blockquote>
            </Text> }
        </Paper>
    </>)
}

export default OrderInfoBlock;
