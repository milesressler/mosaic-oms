import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {
    TextInput,
    Checkbox,
    Button,
    Group,
    Textarea,
    Autocomplete,
    Table,
    CloseButton,
    Paper, ActionIcon, Switch, Divider, LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {IconTrash, IconXboxX} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import itemsApi from "src/services/itemsApi.tsx";
import {randomId} from "@mantine/hooks";
import {Item} from "src/models/types.tsx";

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
        const item: Item = suggestedItemsApi.data?.find(item => item.description === value);
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
            customerName: (value) => !value ? 'Customer name is required' : null
        },
    });


    const itemFields = form.values.items.map((item: Item, index: number) => (
        <Group key={item.description} mt="xs" justify={'space-between'} >
            <TextInput
                placeholder="Item"
                withAsterisk
                sx={{ flex: 1 }}
                {...form.getInputProps(`items.${index}.description`)}
            />
            <Switch
                label="Active"
                {...form.getInputProps(`items.${index}.active`, { type: 'checkbox' })}
            />
            <ActionIcon onClick={() => form.removeListItem('items', index)}>
                <IconTrash size={16} />
            </ActionIcon>
        </Group>
    ));

    return (<>
        {createOrderAPI.loading && <div>Creating</div>}
        {!createOrderAPI.loading && createOrderAPI.data !== null &&
            <div>
                <div>Created Order #{createOrderAPI.data.id}</div>
            </div>
        }

        <Paper  withBorder shadow="md" p={30} mt={30} radius="md" maw={600}  miw={400} mx="auto">
            <LoadingOverlay visible={createOrderAPI.loading} />
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
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
                    label="Add Item"
                    placeholder="Pick item or enter anything"
                    data={suggestedItemsApi.data && suggestedItemsApi.data.length > 0 ? suggestedItemsApi.data.map(i => i.description) : []}
                    onChange={handleItemChange}
                    value={itemDescription}
                />
                <Textarea
                    label="Item detail"
                    required={!!selectedItem?.placeholder}
                    placeholder={selectedItem?.placeholder ? selectedItem.placeholder : "Additional item detail"}
                />

                <Group position="center" mt="md">
                    <Button
                        onClick={() =>
                            form.insertListItem('items', { name: '', active: false, key: randomId() })
                        }
                    >
                        Add item
                    </Button>
                </Group>


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
