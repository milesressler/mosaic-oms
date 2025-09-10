import OrderFormV2 from "src/forms/OrderFormV2.tsx";
import {useForm} from "@mantine/form";
import {AttributeValue, FormOrderItem, OrderFormValues} from "src/models/forms.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {LoadingOverlay, Box} from "@mantine/core";
import NeedsInfoBanner from "src/components/notifications/NeedsInfoBanner.tsx";

export function OrderTakerDashboard() {
    const {  id: orderId } = useParams<{ id?: string }>();
    const fetchOrder = useApi(ordersApi.getOrderById);
    const navigate = useNavigate();

    useEffect(() => {
        if (!orderId) return;
        fetchOrder.request(+orderId);
    }, [orderId]);

    useEffect(() => {
        if (!fetchOrder.data) return;
        const o = fetchOrder.data;

        form.setValues({
            customerId:     o.uuid,
            firstName:      o.customer.firstName,
            lastName:       o.customer.lastName,
            specialInstructions: o.specialInstructions ?? null,
            items: o.items.map((oi): FormOrderItem => {
                // build up the AttributeValue record
                const attributes: Record<string, AttributeValue> = {};

                // oi.attributes is { [key: string]: string }
                Object.entries(oi.attributes).forEach(([key, raw]) => {
                    // find the matching ItemAttribute definition on the Item
                    const def = oi.item.attributes.find(a => a.key === key);
                    if (!def) return;

                    if (def.type === 'SINGLE_SELECT') {
                        attributes[key] = {
                            type:  'string',
                            value: raw,
                        };
                    } else if (def.type === 'MULTI_SELECT') {
                        attributes[key] = {
                            type:   'multi',
                            values: raw.split(',').map(v => v?.trim()),
                        };
                    }
                    // if you ever support SizeAttribute, handle it here:
                    // else if (def.type === 'SIZE') { … }
                });

                return {
                    orderItemId: oi.id, // 👈 preserve the existing item ID
                    item:       oi.item,                // your Item object
                    quantity:   oi.quantityRequested,   // map to `quantity`
                    notes:      oi.notes ?? undefined,  // optional notes
                    attributes,                          // the parsed attributes
                };
            }),
        });
    }, [fetchOrder.data]);

    const form = useForm<OrderFormValues>({
        initialValues: {
            // customerId: order?.customer?.?.toString() || "",
            customerPhone: '',
            customerId: "",
            firstName: "",
            lastName: "",
            specialInstructions: null,
            items: [],
            deletedItemIds: [],
        },
        validate: {
            firstName: (value) => (value?.trim()?.length > 0 ? null : "First name is required"),
            lastName: (value) => (value?.trim()?.length > 0 ? null : "Last name is required"),
            items: (value => value.length > 0 ? null : "No items selected"),
        },
    });

    return (
        <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <LoadingOverlay visible={!!orderId && fetchOrder.loading}></LoadingOverlay>
            <Box p={'xs'} style={{ flexShrink: 0 }}><NeedsInfoBanner /></Box>
            <Box style={{ flex: 1, minHeight: 0 }}>
                <OrderFormV2
                    form={form}
                    order={fetchOrder.data}
                    mode={orderId ? "edit" : "create"}
                    onUpdateComplete={() => navigate('/orders')}
                />
            </Box>
        </Box>
   );
}
export default OrderTakerDashboard;
