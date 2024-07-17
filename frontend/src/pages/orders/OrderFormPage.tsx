import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {
    TextInput,
    Button,
    Group,
    Textarea,
    Autocomplete,
    Paper, Divider, LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {useEffect, useState} from "react";
import itemsApi from "src/services/itemsApi.tsx";
import {randomId} from "@mantine/hooks";
import {Item, OrderRequest} from "src/models/types.tsx";
import OrderItemForm from "src/components/orderform/OrderItemForm.tsx";

function OrderFormPage() {
    const createOrderAPI = useApi(ordersApi.createOrder);
    const suggestedItemsApi = useApi(itemsApi.getSuggestedItems);

    const [ selectedItem, setSelectedItem] = useState<Item|null>(null);
    const [itemDescription, setItemDescription] = useState('');


    useEffect(() => {
        suggestedItemsApi.request();
    }, [true]);


    const handleItemChange = (value: string) => {
        setItemDescription(value);
        const item = suggestedItemsApi.data?.find(item => item.description === value) ?? null;
        setSelectedItem(item);
    }

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
    const itemFields = form.values.items.map((item: Item, index: number) => (
        <OrderItemForm form={form} item={item} index={index} suggestedItems={suggestedItemsApi.data ?? []}/>
    ));

    return (<>
        <Paper  withBorder shadow="md" p={30} mt={30} radius="md" maw={600}  miw={400} mx="auto">
            <LoadingOverlay visible={createOrderAPI.loading} />
            <form onSubmit={form.onSubmit((values) => submitOrder(values))}>
                <TextInput
                    label="Customer Name"
                    placeholder="Jim Smith"
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

                <Autocomplete
                    mb={'10px'}
                    label="Item"
                    placeholder="Pick item or enter anything"
                    data={suggestedItemsApi.data && suggestedItemsApi.data.length > 0 ? suggestedItemsApi.data.map(i => i.description) : []}
                    onChange={handleItemChange}
                    value={itemDescription}
                />
                <Textarea
                    label="Additional Item details (size, color, etc)"
                    required={!!selectedItem?.placeholder}
                    placeholder={selectedItem?.placeholder ? selectedItem.placeholder : "Additional item detail"}
                />

                <Group justify={"flex-end"} my="md">
                    <Button
                        onClick={() =>
                            form.insertListItem('items', { name: itemDescription,  quantity: 1, notes: "", key: randomId() })
                        }
                    >
                        Add item
                    </Button>
                </Group>
                <Divider/>


                {itemFields}


                <Divider my="md" />

                <Textarea
                    label="Special Instructions"
                    placeholder="General notes about the order as a whole"
                    {...form.getInputProps('specialInstructions')}

                />

                <Button fullWidth mt="xl" type="submit">
                    Create Order
                </Button>

                {/*<Group justify="flex-end" mt="md">*/}
                {/*    <Button type="submit">Submit Order</Button>*/}
                {/*</Group>*/}
            </form>
        </Paper>

        {/*<div>*/}
    </>);
}

export default OrderFormPage;
