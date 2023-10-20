import {useEffect} from "react";
import useApi from "../hooks/useApi";
import ordersApi from "../services/ordersApi";
import {useAuth0} from "@auth0/auth0-react";
import userApi from "../services/userApi";
import { Badge } from '@mantine/core';
import {Link} from "react-router-dom";


function OrdersPage() {
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

    return (
        <>
            <div style={{maxWidth: '75vw'}}>

                <h1>Open Orders</h1>
                <Link to={"/order/create"} >Create New</Link>

                <div>
                    {getOrdersApi.loading && <p>Orders are loading!</p>}
                    {!getOrdersApi.loading && <>
                        {getOrdersApi.error && <p>{getOrdersApi.error}</p>}

                    {getOrdersApi.data?.content.map((order) => (
                        <div key={order.uuid}>
                            <Badge>{order.orderStatus}</Badge>  {order.customer.name} | Order #{order.id} | Details
                        </div>
                        ))}

                    </>
                    }
                </div>
            </div>
        </>
    )
}

export default OrdersPage;
