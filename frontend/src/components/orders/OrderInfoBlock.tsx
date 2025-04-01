import {Blockquote, Group, Paper, Text, Title} from "@mantine/core";
import {OrderDetails, OrderStatus} from "src/models/types.tsx";
import OrderActionButton from "src/components/fillers/actionButton/OrderActionButton.tsx";
import {IconNotes} from "@tabler/icons-react";
import UserAvatar from "src/components/common/userAvatar/UserAvatar.tsx";

interface props {
    orderDetails: OrderDetails|null
    loading: boolean
    changeState: (status: OrderStatus) => void
    toggleAssigned: () => void
}
export function OrderInfoBlock({ orderDetails, loading, changeState, toggleAssigned}: props) {

    return (<>
        <Paper  shadow="xs" p="xl">
            <Group justify={'space-between'} pr={10} mb={10}>
                <Title order={2}>Order: {orderDetails?.id}</Title>
                <OrderActionButton
                    onStateChange={changeState}
                    toggleAssigned={toggleAssigned}
                    order={orderDetails}
                    loading={loading} />

            </Group>
            <Text>
                <Text span c="gray.6">Customer:</Text> {`${orderDetails?.customer?.firstName || ''} ${orderDetails?.customer?.lastName || ''}`.trim()}
            </Text>
            <Text>
                { orderDetails?.assignee && <><Text span c="gray.6">Assignee </Text><UserAvatar user={orderDetails!.assignee} /></>}
                { !orderDetails?.assignee && <Text fw={600} span c="gray.6">[unassigned]</Text>}
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
