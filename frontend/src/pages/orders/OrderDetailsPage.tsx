import { Timeline, Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import useApi from "src/hooks/useApi";
import ordersApi from "src/services/ordersApi";
import {useEffect} from "react";
import { DateTime } from "luxon";

function OrderDetailsPage() {
    const { id } = useParams();
    const getOrderApi = useApi(ordersApi.getOrderById);
    const orderHistoryApi = useApi(ordersApi.getOrderHistory);


    useEffect(() => {
        if (!getOrderApi.data) {
            getOrderApi.request(id);
        }
    }, [id])

    return (<>
        <Timeline active={1} bulletSize={24} lineWidth={2}>
            {
                getOrderApi.data?.history.map(historyItem =>
                    <Timeline.Item title={historyItem.status}>
                        {historyItem.user}
                        <Text c={'dimmed'} size={'sm'}>{DateTime.fromISO(historyItem.timestamp).toRelative()}</Text>
                    </Timeline.Item>
                )
            }

        </Timeline>
        </>)
}


export default OrderDetailsPage;
