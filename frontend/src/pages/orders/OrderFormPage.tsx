import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {
    TextInput,
    Button,
    Group,
    Textarea,
    Paper, Divider, LoadingOverlay, Text, Modal
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {useEffect, useState} from "react";
import itemsApi from "src/services/itemsApi.tsx";
import {randomId} from "@mantine/hooks";
import {Order, OrderDetails, OrderRequest} from "src/models/types.tsx";
import OrderItemForm from "src/components/orderform/OrderItemForm.tsx";
import OrderItemDisplay from "src/components/orderform/OrderItemDisplay.tsx";
import {useFeatures} from "src/contexts/FeaturesContext.tsx";
import {FormOrderItem} from "src/models/forms.tsx";


interface props {
    order?: Order
}

function OrderForm({order}: props) {
    const createOrderAPI = useApi(ordersApi.createOrder);
    const suggestedItemsApi = useApi(itemsApi.getSuggestedItems);
    const [updatingItem, setUpdatingItem] = useState<FormOrderItem|null>(null);
    const orderDetailApi = useApi(ordersApi.getOrderById);
    const { groupMeEnabled } = useFeatures();

    function propsIsDetailed(input: Order): input is OrderDetails {
        return (input as OrderDetails) !== undefined;
    }
    const orderDetailInput = (order && propsIsDetailed(order)) ? (order as OrderDetails) : null;
    const [ orderDetail, setOrderDetail] = useState<OrderDetails|null>(orderDetailInput);

    useEffect(() => {
        suggestedItemsApi.request();
    }, [true]);

    useEffect(() => {
        if (order && orderDetail == null) {
            // get order detail
            orderDetailApi.request(order.id);
        }
    }, [orderDetail, order]);

    useEffect(() => {
        if (orderDetailApi.data) {
            setOrderDetail(orderDetailApi.data);
        }
    }, [orderDetailApi.data]);

    const form = useForm({
        initialValues: {
            customerName: '',
            phoneNumber: '',
            optInNotifications: false,
            specialInstructions: '',
            items: [],
        },

        validate: {
            customerName: (value) => !value ? 'Customer name is required' : null,
            items: (value) => value.length === 0 ? 'At least one item is required' : null,
        },
    });

    useEffect(() => {
        if (createOrderAPI.data) {
            form.reset();
        }
    }, [createOrderAPI.data]);


    const submitOrder = (values: any) => {
        form.validate();
        const request: OrderRequest = {
            customerName: values.customerName,
            customerPhone: values.customerPhone,
            specialInstructions: values.specialInstructions,
            optInNotifications: values.optInNotifications,
            items: values.items,
        };
        createOrderAPI.request(request);
    }
    const itemFields = form.values.items.map((formItem: FormOrderItem, index: number) => (
        <OrderItemDisplay
            formItem={formItem}
            onEditSelected={() => setUpdatingItem(formItem)}
            onDelete={() => form.removeListItem('items', index)}
            handleQuantityChange={(quantity) => {
                form.setValues((currentValues: any) => ({
                    items: currentValues.items
                        .map((currentItem: FormOrderItem) =>
                            formItem.item.id === currentItem.item.id ?
                                { ...currentItem, quantity: quantity } :
                                currentItem)
                }));

            }}
        />
    ));

    const addNewItem = () => {
        setUpdatingItem({ description: '',  quantity: 1, notes: "" });
    };

    function updateFromDraftItem(draftItem: FormOrderItem) {
        if (draftItem.itemkey) {
            form.setValues((currentValues: any) => ({
                items: currentValues.items.map((currentItem: FormOrderItem) =>
                    draftItem.itemkey === currentItem.itemkey ? {
                        ...currentItem,
                        description: draftItem.description,
                        notes: draftItem.notes,
                    } : currentItem
                ),
            }));
        } else {
            form.insertListItem('items',
                {...draftItem, itemkey: randomId()}
            );
        }
        setUpdatingItem(null);
    }

    return (<>
        <LoadingOverlay visible={createOrderAPI.loading} />
        <Paper  p={15} radius="md" maw={600}  miw={400} mx="auto">

            {<Modal opened={!!updatingItem} onClose={() => setUpdatingItem(null)}>
                {/*<Card center maw={200}>*/}
                { updatingItem && <OrderItemForm
                    formItem={updatingItem}
                    onCancel={() => setUpdatingItem(null)}
                    handleItemUpdate={updateFromDraftItem}></OrderItemForm> }
                {/*</Card>*/}
            </Modal> }
            <form onSubmit={form.onSubmit((values) => submitOrder(values))}>
                <TextInput
                    label="Customer Name"
                    placeholder="First name and last initial"
                    required
                    size={"lg"}
                    {...form.getInputProps('customerName')}
                />
                <Divider my="md" />
                {/*<TextInput*/}
                {/*    label="Phone Number"*/}
                {/*    placeholder="5125550000"*/}
                {/*    {...form.getInputProps('phoneNumber')}*/}
                {/*/>*/}

                {/*<Checkbox*/}
                {/*    mt="md"*/}
                {/*    label="Opt-in to order notifications"*/}
                {/*    {...form.getInputProps('optInNotifications', { type: 'checkbox' })}*/}
                {/*/>*/}


                {itemFields.length === 0 && <Text c={'dimmed'}>No items added </Text> }
                {itemFields}

                <Group grow justify={"stretch"} my="md" >
                    <Button onClick={addNewItem} variant={"outline"} size={"lg"}>
                        <Text c={'dimmed'} size={'s'}>Add an item</Text>
                    </Button>
                </Group>

                <Divider my="md" />

                <Textarea
                    label="Special Instructions"
                    placeholder="General notes about the order"
                    {...form.getInputProps('specialInstructions')}
                    size={"lg"}
                />

                <Group justify={'space-between'}>
                    <Button variant="outline" color="gray"  mt="xl" onClick={() => form.reset()}>
                        Clear Form
                    </Button>
                    <Button mt="xl" type="submit">
                        { groupMeEnabled ? "Send to GroupMe" : "Create Order"}
                    </Button>
                </Group>
            </form>
        </Paper>

    </>);
}

export default OrderForm;
