import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {
    TextInput,
    Button,
    Group,
    Textarea,
    Paper, Divider, LoadingOverlay, Text, Modal, Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {useEffect, useState} from "react";
import itemsApi from "src/services/itemsApi.tsx";
import {randomId} from "@mantine/hooks";
import {Order, OrderDetails, OrderRequest} from "src/models/types.tsx";
import OrderItemForm from "src/components/orderform/OrderItemForm.tsx";
import OrderItemDisplay from "src/components/orderform/OrderItemDisplay.tsx";

export interface FormItem {
    description: string,
    notes?: string,
    quantity: number,
    itemkey?: string,
}

interface props {
    order?: Order
}

function OrderForm({order}: props) {
    const createOrderAPI = useApi(ordersApi.createOrder);
    const suggestedItemsApi = useApi(itemsApi.getSuggestedItems);
    const [updatingItem, setUpdatingItem] = useState<FormItem|null>(null);
    const orderDetailApi = useApi(ordersApi.getOrderById);

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
            customerFirstName: '',
            customerLastName: '',
            phoneNumber: '',
            optInNotifications: false,
            specialInstructions: '',
            items: [],
        },

        validate: {
            customerFirstName: (value) => !value ? 'First name is required' : null,
            customerLastName: (value) => !value ? 'Last name is required' : null,
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
            customerFirstName: values.customerFirstName,
            customerLastName: values.customerLastName,
            customerPhone: values.customerPhone,
            specialInstructions: values.specialInstructions,
            optInNotifications: values.optInNotifications,
            items: values.items,
        };
        createOrderAPI.request(request);
    }
    const itemFields = form.values.items.map((formItem: FormItem, index: number) => (
        <OrderItemDisplay
            formItem={formItem}
            onEditSelected={() => setUpdatingItem(formItem)}
            onDelete={() => form.removeListItem('items', index)}
            handleQuantityChange={(quantity) => {
                form.setValues((currentValues: any) => ({
                    items: currentValues.items
                        .map((currentItem: FormItem) =>
                            formItem.itemkey === currentItem.itemkey ?
                                { ...currentItem, quantity: quantity } :
                                currentItem)
                }));

            }}
        />
    ));

    const addNewItem = () => {
        setUpdatingItem({ description: '',  quantity: 1, notes: "" });
    };

    function updateFromDraftItem(draftItem: FormItem) {
        if (draftItem.itemkey) {
            form.setValues((currentValues: any) => ({
                items: currentValues.items.map((currentItem: FormItem) =>
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
        <Paper  withBorder shadow="md" p={30} mt={30} radius="md" maw={600}  miw={400} mx="auto">

            {<Modal opened={!!updatingItem} onClose={() => setUpdatingItem(null)}>
                {/*<Card center maw={200}>*/}
                { updatingItem && <OrderItemForm
                    suggestedItems={suggestedItemsApi?.data ?? []}
                    formItem={updatingItem}
                    onCancel={() => setUpdatingItem(null)}
                    handleItemUpdate={updateFromDraftItem}></OrderItemForm> }
                {/*</Card>*/}
            </Modal> }
            <form onSubmit={form.onSubmit((values) => submitOrder(values))}>
                <TextInput
                    label="First Name"
                    placeholder="First name"
                    required
                    {...form.getInputProps('customerFirstName')}
                />
                <TextInput
                    label="Last Name"
                    placeholder="Last initial"
                    required
                    {...form.getInputProps('customerLastName')}
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
                    <Button onClick={addNewItem} variant={"outline"}>
                        <Text c={'dimmed'} size={'s'}>Add an item</Text>
                    </Button>
                </Group>

                <Divider my="md" />

                <Textarea
                    label="Special Instructions"
                    placeholder="General notes about the order"
                    {...form.getInputProps('specialInstructions')}
                />

                <Group justify={'space-between'}>
                    <Button variant="outline" color="gray"  mt="xl" onClick={() => form.reset()}>
                        Clear Form
                    </Button>
                    <Button mt="xl" type="submit">
                        Create Order
                    </Button>
                </Group>
            </form>
        </Paper>

    </>);
}

export default OrderForm;
