import React, {useEffect} from 'react';
import {Container, Card, Text, Button, Badge} from '@mantine/core';
import useApi from "../hooks/useApi.tsx";
import ordersApi from "../services/ordersApi.tsx";
import userApi from "../services/userApi.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {Link} from "react-router-dom";

const Dashboard = () => {
    const getOrdersApi = useApi(ordersApi.getOrders);

    /** User sync should move somewhere else **/
    const syncUser = useApi(userApi.syncUser);
    const { user } = useAuth0();

    useEffect(() => {
        syncUser.request(user.name, user.email);
    }, [user]);
    /** end user sync **/

    useEffect(() => {
        getOrdersApi.request()
        const interval = setInterval(() => {
            getOrdersApi.request()
        },3000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsReady = (orderId) => {
        // Add functionality to mark order as ready
        console.log(`Order ${orderId} marked as ready`);
    };

    return (
        <>

            {/*<Card shadow="xs" padding="md" radius="md" style={{ marginBottom: '1rem' }}>*/}
            {/*    <Text size="md">Orders to Pick</Text>*/}
            {/*    <Button size="sm" fullWidth color="blue" variant="light">*/}
            {/*        Refresh Dashboard*/}
            {/*    </Button>*/}
            {/*</Card>*/}

            {/*<Card shadow="xs" padding="md" radius="md">*/}
            {/*    <Text size="md">Order List</Text>*/}
                <Button size="sm" fullWidth color="blue" variant="light"    component={Link} to={"/order/create"}>Create New</Button>
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

export default Dashboard;
