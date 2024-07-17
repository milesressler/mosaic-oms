import {Item} from "src/models/types.tsx";
import {ActionIcon, Group, NumberInput, Stack, TextInput} from "@mantine/core";
import {IconTrash} from "@tabler/icons-react";

interface OrderItemFormProps {
    form: any,
    item: Item,
    index: number,
    suggestedItems?: Item[],
}

export function OrderItemForm({form, item, index, suggestedItems = []}: OrderItemFormProps) {

    return (<>
            <Stack>
                <Group key={item.description} mt="xs" justify={'space-between'} >
                    <TextInput
                        label={"Item"}
                        placeholder=""
                        withAsterisk
                        sx={{ flex: 1 }}
                        {...form.getInputProps(`items.${index}.description`)}
                    />

                    <NumberInput
                        label="Item Quantity"
                        placeholder="Quantity"
                        clampBehavior="strict"
                        min={1}
                        max={100}
                        allowDecimal={false}
                        {...form.getInputProps(`items.${index}.quantity`)}
                    />
                    <ActionIcon onClick={() => form.removeListItem('items', index)}>
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
                <Group grow>
                    <TextInput
                        label={"Notes"}
                        placeholder="Size, etc"
                        withAsterisk={true}
                        sx={{ flex: 1 }}
                        {...form.getInputProps(`items.${index}.notes`)}
                    />
                </Group>
            </Stack>
        </>
    );
}

export default OrderItemForm;
