import { notifications } from '@mantine/notifications';
import {useSubscription} from "react-stomp-hooks";

export function NotificationsHandler({}) {
    useSubscription("/topic/orders", (message) => {
        console.log(message.body);
        notifications.show({
            title: 'New Order Created',
            message: 'Someone created a new order.',
            autoClose: 3000,
        })
    });

    return (<></>)
}

export default NotificationsHandler
