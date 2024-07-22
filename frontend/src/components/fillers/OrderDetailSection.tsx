import {OrderStatus} from "src/models/types.tsx";
import {useEffect} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {Box, Button, Group, isNumberLike, LoadingOverlay, Paper, Text, Title} from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate, useParams} from "react-router-dom";
import { useSelectedOrder } from "src/contexts/SelectedOrderContext";

export function OrderDetailSection({}) {

    const { doForceRefresh } = useSelectedOrder();
    const {user} = useAuth0();
    const orderDetailApi = useApi(ordersApi.getOrderById);
    const updateStateApi = useApi(ordersApi.updateOrderStatus);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id && isNumberLike(id)) {
            doForceRefresh();
            orderDetailApi.request(+id);
        }
    }, [id, updateStateApi.data]);


    const assignedToMe = orderDetailApi.data?.orderStatus === OrderStatus.ASSIGNED &&
        orderDetailApi.data?.lastStatusChange?.assigneeExt === user?.sub;

    const assignToMe = () => {
        if (assignedToMe) {
            return unassign();
        } else {
            return updateStateApi.request(orderDetailApi.data!.uuid, OrderStatus.ASSIGNED);
        }
    }
    const unassign = () => updateStateApi.request(orderDetailApi.data!.uuid, OrderStatus.CREATED);


    const startFilling = () => {
        if (!assignedToMe) {
            assignToMe().then(() =>
                navigate(`/dashboard/filler/fill/${id}`));
        } else {
            navigate(`/dashboard/filler/fill/${id}`);
        }

    }

    useEffect(() => {
        if (!updateStateApi.loading && !updateStateApi.error && orderDetailApi.data?.id) {
            // onModified();
            orderDetailApi.request(orderDetailApi.data!.id);
        }
    }, [updateStateApi.data]);

    return (<>
        <Box pos="relative" p={10}>
        <LoadingOverlay visible={orderDetailApi.loading || updateStateApi.loading}
                        zIndex={1000}
                        overlayProps={{ radius: "sm", blur: 2 }} />
        <Group justify={'space-between'} pr={10} mb={10}>
            <Title>Order: {orderDetailApi.data?.id}</Title>
            <Button onClick={assignToMe} disabled={
                orderDetailApi.loading ||
                orderDetailApi.data === null ||
                updateStateApi.loading ||
                ([OrderStatus.CREATED, OrderStatus.ASSIGNED].indexOf(orderDetailApi.data?.orderStatus) === -1 &&
                !assignedToMe)
            }
            >{assignedToMe ? "Unassign" : "Assign to Me"}</Button>
        </Group>
        {/*<Divider></Divider>*/}
        <Paper  shadow="xs" p="xl">
            <Text>
                <Text span fw={500}>Customer:</Text> {orderDetailApi.data?.customer?.name}
            </Text>
            <Text>
                <Text span fw={500}>Assigned:</Text>
                { orderDetailApi.data?.orderStatus === OrderStatus.ASSIGNED ?
                    orderDetailApi.data?.lastStatusChange?.user ?? "[unassigned]" : "[unassigned]"}
            </Text>
            { orderDetailApi.data?.specialInstructions && <Text>
                <Text span fw={700} c={'green'}>Notes:</Text>
                {orderDetailApi?.data?.specialInstructions}
            </Text> }
        </Paper>

            { (orderDetailApi.data?.orderStatus === OrderStatus.CREATED || assignedToMe) && <Group grow my={10}>
                <Button onClick={startFilling}>
                    {orderDetailApi.data?.orderStatus === OrderStatus.CREATED && 'Assign and '} Start Filling
                </Button>
            </Group>
            }
        {/*<Divider></Divider>*/}

        <Paper  shadow="xs">
            <ul>
            {orderDetailApi.data?.items?.map((item) => {
                return <li key={item.id}>
                        <div key={item.id}>
                            <Text span fw={500}> {item.quantityRequested}</Text> {item.description}
                            <Text c={'dimmed'}>{item.notes}</Text>
                        </div>
                    </li>
            })}
            </ul>
        </Paper>
        </Box>
    </>);
}

export default OrderDetailSection;
