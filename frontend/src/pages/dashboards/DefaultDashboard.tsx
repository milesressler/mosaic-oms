import {useEffect} from 'react';
import {Card, Text, Button, Badge} from '@mantine/core';
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {Link} from "react-router-dom";

const DefaultDashboard = () => {
    const getOrdersApi = useApi(ordersApi.getOrders);

    useEffect(() => {
        getOrdersApi.request()
        const interval = setInterval(() => {
            getOrdersApi.request()
        },3000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsReady = (orderId: string) => {
        // Add functionality to mark order as ready
        console.log(`Order ${orderId} marked as ready`);
    };

    return (
        <>

            {/*<Card shadow="xs" padding="md" radius="md" style={{ marginBottom: '1rem' }}>*/}
            {/*    <Text size="md">Orders to Pick</Text>*/}
            {/*    <Button size="sm" fullWidth color="blue" variant="light">*/}
            {/*        Refresh DefaultDashboard*/}
            {/*    </Button>*/}
            {/*</Card>*/}

            {/*<Card shadow="xs" padding="md" radius="md">*/}
            {/*    <Text size="md">Order List</Text>*/}
                {/*{getOrdersApi.loading && <p>Orders are loading!</p>}*/}
                { <>
                    {getOrdersApi.error && <p>{getOrdersApi.error}</p>}
                    <div>
                        {getOrdersApi.data?.content.map((order) => (
                                <div key={order.id} style={{marginBottom: '1rem'}}>
                                    <Card shadow="xs" padding="md" radius="md">
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <div>
                                                <Text size="sm">Status: <Badge>{order.orderStatus}</Badge></Text>
                                                <Text size="sm">Order Number: {order.id}</Text>
                                                <Text size="sm">Customer: {order.customer.name}</Text>
                                                <Link to={`/order/${order.id}`}>Details</Link>
                                            </div>
                                            <Button
                                                size="xs"
                                                color="blue"
                                                variant="outline"
                                                onClick={() => handleMarkAsReady(order.id)}
                                            >
                                                Mark as Ready
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            )
                        )}
                    </div>
                </>}
            {/*</Card>*/}
        </>
    );
};

export default DefaultDashboard;
