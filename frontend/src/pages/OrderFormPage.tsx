import useApi from "../hooks/useApi.tsx";
import ordersApi from "../services/ordersApi.tsx";
import {Link} from "react-router-dom";
import {TextInput, Checkbox, Button, Group, Box, Textarea, Autocomplete, Table, CloseButton} from '@mantine/core';
import { useForm } from '@mantine/form';
import {IconXboxX} from "@tabler/icons-react";

function OrderFormPageSample() {
    const createOrderAPI = useApi(ordersApi.createOrder);
    const form = useForm({
        initialValues: {
            customerName: '',
            phoneNumber: '',
            optInNotifications: false,
            specialInstructions: '',
            items: [{}]
        },

        validate: {
            customerName: (value) => !value ? 'Customer name is required' : null
        },
    });

    return (<>
        {createOrderAPI.loading && <div>Creating</div>}
        {!createOrderAPI.loading && createOrderAPI.data !== null &&
            <div>
                <div>Created Order #{createOrderAPI.data.id}</div>
            </div>
        }

        <Box maw={340} mx="auto">
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
                <TextInput
                    withAsterisk
                    label="Customer Name"
                    placeholder="John Doe"
                    {...form.getInputProps('customerName')}
                />
                <TextInput
                    label="Phone Number"
                    placeholder="5125550000"
                    {...form.getInputProps('phoneNumber')}
                />

                <Checkbox
                    mt="md"
                    label="Opt-in to order notifications"
                    {...form.getInputProps('optInNotifications', { type: 'checkbox' })}
                />

                <Autocomplete
                    mb={'10px'}
                    label="Add Item"
                    placeholder="Pick item or enter anything"
                    data={['Pants', 'Socks', 'Shoes', 'Shirt']}
                    // onKeyDown={form.values.}
                />

                <Table striped withTableBorder
                       mb={'10px'}>
                    <Table.Tbody>{form.values.items.map(item => {
                        return (
                            <>
                            <Table.Tr>
                                <Table.Td>Socks</Table.Td>
                                <Table.Td>2</Table.Td>
                                <Table.Td><CloseButton icon={<IconXboxX size={18} stroke={1.5} />} /></Table.Td>
                            </Table.Tr>
                            </>
                        )
                    })}</Table.Tbody>
                </Table>

                <Textarea
                    label="Special Instructions"
                    placeholder="No blue jeans"
                    {...form.getInputProps('specialInstructions')}

                />

                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit Order</Button>
                </Group>
            </form>
            <Link to={"/orders"}>Back to orders</Link>
        </Box>

        {/*<div>*/}
    </>);
}

export default OrderFormPageSample;
