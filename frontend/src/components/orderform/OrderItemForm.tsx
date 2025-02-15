import {Item} from "src/models/types.tsx";
import {Autocomplete, Button, Group, Stack, Textarea, Text} from "@mantine/core";
import {useState} from "react";
import {FormItem} from "src/pages/orders/OrderFormPage.tsx";

interface OrderItemFormProps {
    formItem: FormItem,
    suggestedItems?: Item[],
    handleItemUpdate: (formItem: FormItem) => void,
    onCancel?: () => void,
}

export function OrderItemForm({formItem, suggestedItems = [], handleItemUpdate, onCancel}: OrderItemFormProps) {

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
        if (draftItem?.description) {
            handleItemUpdate(draftItem);
        }
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
                        label="Additional item note"
                        required={!!selectedItem?.placeholder}
                        placeholder={"Size, color, preferences, etc"}
                        onChange={handleNoteChange}
                        value={draftItem?.notes}
                    />
                {
                    selectedItem?.placeholder && <Text size={'xs'} c={'dimmed'} fw={600}>
                        Details are required for this item: <br/>{selectedItem?.placeholder}
                    </Text>
                }

                <Group justify={"space-between"} my="md">
                    <Button  variant="outline" color="gray"  onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={returnItem}>
                        { formItem?.itemkey ? 'Update item' : 'Add to order'}
                    </Button>
                </Group>
            </Stack>
        </>
    );
}

export default OrderItemForm;
