import {Box, Group, NumberInput, Text} from "@mantine/core";
import {IconPencil, IconX} from "@tabler/icons-react";
import {FormItem} from "src/pages/orders/OrderFormPage.tsx";

interface OrderItemDisplayProps {
    formItem: FormItem,
    onEditSelected: () => void,
    onDelete: () => void,
    handleQuantityChange: (quantity: number) => void,
}
export function OrderItemDisplay({formItem, handleQuantityChange, onDelete, onEditSelected}: OrderItemDisplayProps) {
    return(
        <Box key={formItem.itemkey} my={4}>
            <Group justify={'space-between'} gap={15}>
                <div style={{marginRight: 'auto'}}>
                    <Text>
                        {formItem.description}
                    </Text>
                    {<Text span c={'dimmed'} size={'xs'}>
                        {/*{'xl size'}*/}
                        {formItem.notes}
                    </Text>}
                </div>
                <NumberInput allowDecimal={false}
                             // placeholder="Quantity"
                             min={1}
                             max={100}
                             maw={70}
                             clampBehavior="strict"
                            value={formItem.quantity}
                onChange={(val) => {handleQuantityChange(+val)}}>

                </NumberInput>
                <IconPencil cursor={'pointer'} onClick={onEditSelected}></IconPencil>
                <IconX cursor={'pointer'} style={{padding: '10px'}} onClick={onDelete}></IconX>
            </Group>
        </Box>);
}

export default OrderItemDisplay;
