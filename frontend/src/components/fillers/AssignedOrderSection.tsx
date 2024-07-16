import {Order, OrderDetails} from "src/models/types.tsx";
import {useEffect, useState} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {Button, Divider, Group, Text, Title} from "@mantine/core";
interface AssignedOrderSectionProps {
    order: Order;
}

export function AssignedOrderSection({order}: AssignedOrderSectionProps) {

    const orderDetailApi = useApi(ordersApi.getOrderById);

    useEffect(() => {
        orderDetailApi.request(order.id);
    }, [order]);

    return (<>
        <Text><Text span fw={500}>Customer:</Text> {orderDetailApi.data?.customer?.name}</Text>
        <Divider></Divider>
        <ul>
        {orderDetailApi.data?.items?.map((item) => {
            return <li>
                    <div>
                        <Text span fw={500}> {item.quantityRequested}</Text> {item.description}
                        <Text c={'dimmed'}>{item.notes}</Text>
                    </div>
                </li>
        })}
        </ul>
        <Group justify={'center'} px={10}>
            {/*<Title>Order Details</Title>*/}
            <Button>Order ready in Red Cart</Button>
            <Button>Order ready in Blue Cart</Button>
            {/*<Button>Red Cart</Button>*/}
        </Group>
    </>);
}

export default AssignedOrderSection;
