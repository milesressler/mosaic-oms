import {AppShell, Divider, Stack, Text} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect} from "react";
import {DateTime} from "luxon";
import {OrderFeedItem, OrderStatus} from "src/models/types.tsx";

export function ActivityFeed() {

    const feedApi = useApi(ordersApi.getFeed);

    useEffect(() => {
        feedApi.request();
    }, []);

    const actionToString = (feedItem: OrderFeedItem) => {
        switch (feedItem.orderStatus) {
            case OrderStatus.CREATED:
                return (<><Text span fw={600}>created</Text> order #{feedItem.orderId}</>)
            case OrderStatus.READY_FOR_PICKUP:
                return (<>marked order #{feedItem.orderId} ready for pickup</>)
            case OrderStatus.ASSIGNED:
                return (<>assigned order #{feedItem.orderId}</>)
            default:
                return (
                    <>
                        {feedItem.orderStatus} order #{feedItem.orderId}
                    </>
                )
        }
    }

    return (
        <Stack>
            {feedApi.data?.map((feedItem) => {
                return (<><div key={feedItem.timestamp}>
                    <Text>{feedItem.user.name} {actionToString(feedItem)}</Text>
                    <Text c="dimmed" size="sm">{DateTime.fromMillis(feedItem.timestamp).toRelative()}</Text>
                    <AppShell.Section/>
                </div><Divider/></>)
            })}
        </Stack>);
}

export default ActivityFeed;
