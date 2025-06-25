import {Alert, Stack, Text} from "@mantine/core";
import OrdersOpenSwitch from "src/components/features/OrdersOpenSwitch.tsx";

interface props {
    withToggle?: boolean;
}

export const OrdersClosedAlert = ({withToggle}: props) => {
    return (
        <Alert m={'xs'} color="red" title="Orders are currently closed" mb="md">
            <Stack>
                <Text>We’re not accepting new orders right now.</Text>

                {!!withToggle && <OrdersOpenSwitch/> }
            </Stack>
        </Alert>
    );
}

export default OrdersClosedAlert;
