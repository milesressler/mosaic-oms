import {OrderStatus} from "src/models/types.tsx";
import {useEffect, useState} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {Box, isNumberLike, LoadingOverlay, Paper, Text} from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";
import {Outlet, useParams} from "react-router-dom";
import {useSelectedOrder} from "src/contexts/SelectedOrderContext";
import OrderInfoBlock from "src/components/orders/OrderInfoBlock.tsx";

export function OrderDetailSection({}) {

    const { doForceRefresh } = useSelectedOrder();
    const {user} = useAuth0();
    const orderDetailApi = useApi(ordersApi.getOrderById);
    const updateStateApi = useApi(ordersApi.updateOrderStatus);
    const changeAssigneeApi = useApi(ordersApi.changeAssignee);
    const { id } = useParams();


    useEffect(() => {
        if (id && isNumberLike(id)) {
            doForceRefresh();
            orderDetailApi.request(+id);
        }
    }, [id, updateStateApi.data, changeAssigneeApi.data]);

    const isLoading = changeAssigneeApi.loading ||
        orderDetailApi.loading ||
        updateStateApi.loading;


    const assignedToMe = orderDetailApi.data?.assignee?.externalId === user?.sub;

    const toggleAssigned = () => {
        if (assignedToMe) {
            return unassign();
        } else {
            return changeAssigneeApi.request(orderDetailApi.data!.uuid, false);
        }
    }

    const changeState = (orderStatus: OrderStatus) => {
        if (orderStatus === OrderStatus.ACCEPTED
            || orderStatus === OrderStatus.REJECTED
            || orderStatus === OrderStatus.CANCELLED
            || orderStatus === OrderStatus.NEEDS_INFO) {
            updateStateApi.request(orderDetailApi.data!.uuid, orderStatus)
        }
    }
    const unassign = () => changeAssigneeApi.request(orderDetailApi.data!.uuid, true);


    useEffect(() => {
        if (!updateStateApi.loading && !updateStateApi.error && orderDetailApi.data?.id) {
            // onModified();
            orderDetailApi.request(orderDetailApi.data!.id);
        }
    }, [updateStateApi.data]);

    return (<>
        <Box pos="relative" p={10}>
        <LoadingOverlay visible={isLoading}
                        zIndex={1000}
                        overlayProps={{ radius: "sm", blur: 2 }} />
        <OrderInfoBlock
            loading={isLoading}
            orderDetails={orderDetailApi.data}
            toggleAssigned={toggleAssigned}
            changeState={changeState}
        ></OrderInfoBlock>
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
