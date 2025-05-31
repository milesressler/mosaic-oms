import {Grid, GridCol} from "@mantine/core";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {OrdersView} from "src/components/orders/OrdersTableConfig.tsx";
import {OrderStatus} from "src/models/types.tsx";
import OrderFormV2 from "src/forms/OrderFormV2.tsx";
import {useForm} from "@mantine/form";
import {FormOrderItem, OrderFormValues} from "src/models/forms.tsx";

export function OrderTakerDashboard() {
    const form = useForm<OrderFormValues>({
        initialValues: {
            // customerId: order?.customer?.?.toString() || "",
            customerPhone: '',
            customerId: "",
            firstName: "",
            lastName: "",
            specialInstructions: null,
            items: [],
        },
        validate: {
            firstName: (value) => (value.trim().length > 0 ? null : "First name is required"),
            lastName: (value) => (value.trim().length > 0 ? null : "Last name is required"),
            items: (value => value.length > 0 ? null : "No items selected"),
        },
    });

    return (
         <OrderFormV2 form={form}/>
   );
}
export default OrderTakerDashboard;
