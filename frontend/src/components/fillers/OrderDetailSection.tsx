import {OrderStatus} from "src/models/types.tsx";
import {useEffect} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {Box, Button, Group, isNumberLike, LoadingOverlay, Paper, Text, Title} from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate, useParams} from "react-router-dom";
import {useSelectedOrder} from "src/contexts/SelectedOrderContext";

export function OrderDetailSection({}) {

    const { doForceRefresh } = useSelectedOrder();
    const {user} = useAuth0();
    const orderDetailApi = useApi(ordersApi.getOrderById);
    const updateStateApi = useApi(ordersApi.updateOrderStatus);
    const changeAssigneeApi = useApi(ordersApi.changeAssignee);


    const { id } = useParams();
    const navigate = useNavigate();
    const buttonStyle = {width: "130px"}


    useEffect(() => {
        if (id && isNumberLike(id)) {
            doForceRefresh();
            orderDetailApi.request(+id);
        }
    }, [id, updateStateApi.data, changeAssigneeApi.data]);

    const getButton = () => {
        const loading = changeAssigneeApi.loading ||
            orderDetailApi.loading ||
            updateStateApi.loading;
        switch (orderDetailApi.data?.orderStatus) {
            case OrderStatus.PENDING_ACCEPTANCE:
                return <>
                    <Button style={buttonStyle} loading={loading} disabled={loading} onClick={acceptOrder}>Accept Order</Button>
                    </>
            case OrderStatus.ACCEPTED:
                return <Button style={buttonStyle} loading={loading} disabled={loading} onClick={toggleAssigned} >{assignedToMe ? "Unassign" : "Assign to Me"}</Button>
            default:
                return <></>
        }
    }


    const assignedToMe = orderDetailApi.data?.assignee?.externalId === user?.sub;

    const toggleAssigned = () => {
        if (assignedToMe) {
            return unassign();
        } else {
            return changeAssigneeApi.request(orderDetailApi.data!.uuid, false);
        }
    }
    const unassign = () => changeAssigneeApi.request(orderDetailApi.data!.uuid, true);
    const acceptOrder = () => updateStateApi.request(orderDetailApi.data!.uuid, OrderStatus.ACCEPTED);
    const returnOrder = () => updateStateApi.request(orderDetailApi.data!.uuid, OrderStatus.PENDING_ACCEPTANCE);

    const startFilling = () => {
        if (!assignedToMe) {
            toggleAssigned().then(() =>
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
            { getButton() }
        </Group>
        {/*<Divider></Divider>*/}
        <Paper  shadow="xs" p="xl">
            <Text>
                <Text span fw={500}>Customer:</Text> {orderDetailApi.data?.customer?.name}
            </Text>
            <Text>
                <Text span fw={500}>Assigned:</Text>
                { orderDetailApi.data?.assignee?.name ?? "[unassigned]"}
            </Text>
            { orderDetailApi.data?.specialInstructions && <Text>
                <Text span fw={700} c={'green'}>Notes:</Text>
                {orderDetailApi?.data?.specialInstructions}
            </Text> }
        </Paper>

            { (orderDetailApi.data?.orderStatus === OrderStatus.ACCEPTED) && <Group grow my={10}>
                <Button onClick={startFilling} disabled={!assignedToMe}>
                    Begin Filling
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
