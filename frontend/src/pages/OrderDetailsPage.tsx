import { Timeline} from "@mantine/core";
import {useParams} from "react-router-dom";
import useApi from "../hooks/useApi";
import ordersApi from "../services/ordersApi";
import {useEffect} from "react";
import { DateTime } from "luxon";

function OrderDetailsPage() {
    const { id } = useParams();
    const getOrderApi = useApi(ordersApi.getOrderById);

    useEffect(() => {
        if (!getOrderApi.data) {
            getOrderApi.request(id);
        }
    }, [id])

    return (<>
        <Timeline active={1} bulletSize={24} lineWidth={2}>
            {
                getOrderApi.data?.history.map(historyItem => {
                    <Timeline.Item title={historyItem.status}>
                        {historyItem.user}
                        {DateTime.fromISO(historyItem.timestamp).toRelative()}
                    </Timeline.Item>
                })
            }
            <Timeline.Item title="Order Created">
        {/*        /!*<Text c="dimmed" size="sm">You&apos;ve created new branch <Text variant="link" component="span" inherit>fix-notifications</Text> from master</Text>*!/*/}
        {/*        /!*<Text size="xs" mt={4}>2 hours ago</Text>*!/*/}
                {!getOrderApi.loading && getOrderApi.data !== null && <>
                    {DateTime.fromISO(getOrderApi.data?.created).toRelative()}
                </>}
            </Timeline.Item>

        {/*    <Timeline.Item title="Packing">*/}
        {/*/!*        <Text c="dimmed" size="sm">You&apos;ve pushed 23 commits to<Text variant="link" component="span" inherit>fix-notifications branch</Text></Text>*!/*/}
        {/*/!*        <Text size="xs" mt={4}>52 minutes ago</Text>*!/*/}
        {/*    </Timeline.Item>*/}

            <Timeline.Item title="Pending Delivery">
            </Timeline.Item>

            <Timeline.Item title="Delivered">
            </Timeline.Item>

        </Timeline>
        </>)
}


export default OrderDetailsPage;
