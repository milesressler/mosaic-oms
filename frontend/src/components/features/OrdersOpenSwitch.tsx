import {Switch} from "@mantine/core";
import {useFeatures} from "src/context/FeaturesContext.tsx";

export const OrdersOpenSwitch = () => {
    const { setOrdersOpen, ordersOpen, featuresLoading} = useFeatures();
    return (

        <Switch
            checked={ordersOpen}
            disabled={featuresLoading}
            label="Orders Open"
            description="Enable or disable creating orders"
            onChange={(event) => setOrdersOpen(event.currentTarget.checked)}
        />)
};

export default OrdersOpenSwitch;
