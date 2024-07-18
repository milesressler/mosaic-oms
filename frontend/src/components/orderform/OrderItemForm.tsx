import {Item} from "src/models/types.tsx";
import {Autocomplete, Button, Group, Stack, Textarea} from "@mantine/core";
import {useState} from "react";
import {FormItem} from "src/pages/orders/OrderFormPage.tsx";

interface OrderItemFormProps {
    formItem: FormItem,
    suggestedItems?: Item[],
    handleItemUpdate: (formItem: FormItem) => void,
}

export function OrderItemForm({formItem, suggestedItems = [], handleItemUpdate}: OrderItemFormProps) {

    const [draftItem, setDraftItem] = useState(formItem);
    const [ selectedItem, setSelectedItem] = useState<Item|null>(null);

    const handleDescriptionChange = (value: string) => {
        setDraftItem((prev: FormItem) => ({...prev, description: value}));
        const item = suggestedItems.find(item => item.description === value) ?? null;
        setSelectedItem(item);
    }
    const handleNoteChange = (event: any) => {
        setDraftItem((prevItem: FormItem) => ({...prevItem, notes: event.target.value}));
    }

    const returnItem = () => {
        handleItemUpdate(draftItem);
    }

    return (<>
            <Stack>
                    <Autocomplete
                        mb={'10px'}
                        label="Item"
                        placeholder="Pick item or enter anything"
                        data={suggestedItems.length > 0 ? suggestedItems.map(i => i.description) : []}
                        onChange={handleDescriptionChange}
                        value={draftItem?.description}
                    />
                    <Textarea
                        label="Additional item note (size, color, etc)"
                        required={!!selectedItem?.placeholder}
                        placeholder={selectedItem?.placeholder ? selectedItem.placeholder : "Additional item detail"}
                        onChange={handleNoteChange}
                        value={draftItem?.notes}
                    />

                <Group justify={"flex-end"} my="md">
                    <Button onClick={returnItem}>
                        { formItem?.itemkey ? 'Update item' : 'Add to order'}
                    </Button>
                </Group>
            </Stack>
        </>
    );
}

export default OrderItemForm;
