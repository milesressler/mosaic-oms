import {Avatar, Divider, Group, Stack, Text} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect} from "react";
import {DateTime} from "luxon";
import {OrderFeedItem, OrderStatus} from "src/models/types.tsx";
import {Link} from "react-router-dom";

export function ActivityFeed() {

    const feedApi = useApi(ordersApi.getFeed);

    useEffect(() => {
        feedApi.request();
    }, []);


    const linkToOrder = (feedItem: OrderFeedItem) => {
        return <Link style={{textDecoration: 'none'}} to={`order/${feedItem.orderId}`}>#{feedItem.orderId}</Link>
    }

    const actionToString = (feedItem: OrderFeedItem) => {
        switch (feedItem.orderStatus) {
            case OrderStatus.PENDING_ACCEPTANCE:
                return (<>Order {linkToOrder(feedItem)} <Text span fw={600}>created</Text></>)
            case OrderStatus.READY_FOR_CUSTOMER_PICKUP:
                return (<>Order {linkToOrder(feedItem)} is ready for pickup</>)
            case OrderStatus.NEEDS_INFO:
                return (<>Order {linkToOrder(feedItem)} needs more info</>)
            case OrderStatus.ACCEPTED:
                return (<>Order {linkToOrder(feedItem)} <Text span fw={600}>assigned</Text></>)
            case OrderStatus.PACKED:
                return (<>Order {linkToOrder(feedItem)} <Text span fw={600}>packed</Text></>)
            default:
                return (
                    <>
                        Order {linkToOrder(feedItem)} <Text span fw={600}>{feedItem.orderStatus}</Text>
                    </>
                )
        }
    }

    return (
        <Stack>
            {feedApi.data?.map((feedItem) => {
                return (<div key={feedItem.orderId+":"+feedItem.timestamp}>
                    <Group gap={'5px'}>
                        <Text>{actionToString(feedItem)}</Text>
                        <Avatar ml={'auto'} size={18} src={feedItem.user?.avatar} />
                        <Text c="dimmed" size="sm">{DateTime.fromMillis(feedItem.timestamp).toRelative()}</Text>
                    </Group>
                    <Divider/>
                </div>)
            })}
        </Stack>);
}

export default ActivityFeed;
