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
import {OrderRequest} from "src/models/types.tsx";
import OrderItemForm from "src/components/orderform/OrderItemForm.tsx";
import OrderItemDisplay from "src/components/orderform/OrderItemDisplay.tsx";

export interface FormItem {
    description: string,
    notes?: string,
    quantity: number,
    itemkey?: string,
}

function OrderFormPage() {
    const createOrderAPI = useApi(ordersApi.createOrder);
    const suggestedItemsApi = useApi(itemsApi.getSuggestedItems);
    const [updatingItem, setUpdatingItem] = useState<FormItem|null>(null);


    useEffect(() => {
        suggestedItemsApi.request();
    }, [true]);



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
                    label="Customer Name"
                    placeholder="First name and last initial"
                    required
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

                <Group justify={"flex-end"} my="md">
                    <Button onClick={addNewItem}>
                        Add item
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

export default OrderFormPage;
