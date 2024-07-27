import {Button, Group, Paper, Text, Title} from "@mantine/core";
import {OrderDetails, OrderStatus} from "src/models/types.tsx";
import FillerOrderActionButton from "src/components/fillers/actionButton/FillerOrderActionButton.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate, useParams} from "react-router-dom";

interface props {
    orderDetails: OrderDetails|null
    loading: boolean
    changeState: (status: OrderStatus) => void
    toggleAssigned: () => void
}
export function OrderInfoBlock({ orderDetails, loading, changeState, toggleAssigned}: props) {
    const {user} = useAuth0();
    const assignedToMe = orderDetails?.assignee?.externalId === user?.sub;
    const navigate = useNavigate();
    const { id } = useParams();


    const startFilling = () => {
        if (!assignedToMe) {
            toggleAssigned()
            navigate(`/dashboard/filler/fill/${id}`);
        } else {
            navigate(`/dashboard/filler/fill/${id}`);
        }
    }

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
                <Text span fw={700} c={'green'}>Notes:</Text>
                {orderDetails?.specialInstructions}
            </Text> }
        </Paper>
        { orderDetails?.orderStatus === OrderStatus.ACCEPTED && <Group grow my={10}>
            <Button onClick={startFilling} disabled={!assignedToMe}>
                Begin Filling
            </Button>
            </Group>
        }
    </>)
}

export default OrderInfoBlock;
