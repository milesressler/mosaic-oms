import {OrderStatus} from "src/models/types.tsx";
import {useEffect, useState} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {Box, isNumberLike, LoadingOverlay, Paper, Text} from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useSelectedOrder} from "src/contexts/SelectedOrderContext";
import OrderInfoBlock from "src/components/orders/OrderInfoBlock.tsx";
import ItemQuantitySelector from "src/components/fillers/ItemQuantitySelector.tsx";

export function OrderDetailSection({}) {

    const { doForceRefresh, loading, selectedOrder } = useSelectedOrder();
    const {user} = useAuth0();
    const updateStateApi = useApi(ordersApi.updateOrderStatus);
    const changeAssigneeApi = useApi(ordersApi.changeAssignee);
    const navigate = useNavigate();


    useEffect(() => {
        doForceRefresh();
    }, [updateStateApi.data, changeAssigneeApi.data]);

    const isLoading = changeAssigneeApi.loading ||
        loading ||
        updateStateApi.loading;


    const assignedToMe = selectedOrder?.assignee?.externalId === user?.sub;

    const toggleAssigned = () => {
        if (assignedToMe) {
            return unassign();
        } else {
            return changeAssigneeApi.request(selectedOrder!.uuid, false);
        }
    }

    const changeState = (orderStatus: OrderStatus) => {
        if (orderStatus === OrderStatus.ACCEPTED
            || orderStatus === OrderStatus.REJECTED
            || orderStatus === OrderStatus.CANCELLED
            || orderStatus === OrderStatus.NEEDS_INFO) {
            updateStateApi.request(selectedOrder!.uuid, orderStatus)
        }
        if (orderStatus !==  OrderStatus.ACCEPTED ) {
            doForceRefresh();
            navigate("/dashboard/filler");
        }
    }
    const unassign = () => changeAssigneeApi.request(selectedOrder!.uuid, true);


    useEffect(() => {
        if (!updateStateApi.loading && !updateStateApi.error && selectedOrder?.id) {
            // onModified();
            // orderDetailApi.request(orderDetailApi.data!.id);
            doForceRefresh();
        }
    }, [updateStateApi.data]);

    return (<>
        <Box pos="relative" p={10}>
        <LoadingOverlay visible={isLoading}
                        zIndex={1000}
                        overlayProps={{ radius: "sm", blur: 2 }} />
        <OrderInfoBlock
            loading={isLoading}
            orderDetails={selectedOrder}
            toggleAssigned={toggleAssigned}
            changeState={changeState}
        ></OrderInfoBlock>
        <Paper  shadow="xs">
            {/*<ul>*/}
            {selectedOrder?.items?.map((item) => {
                return(
                // <li key={item.id}>
                        <div key={item.id}>
                            <Text span fw={500}> {item.quantityRequested}</Text> {item.description}
                            <Text c={'dimmed'}>{item.notes}</Text>
                            <ItemQuantitySelector max={item.quantityRequested}></ItemQuantitySelector>
                        </div>
                    // </li>
                )
            })}
            {/*</ul>*/}
        </Paper>
        </Box>
    </>);
}

export default OrderDetailSection;
