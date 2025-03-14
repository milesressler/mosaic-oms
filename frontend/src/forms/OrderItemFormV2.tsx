import {Button, Group, Stack, Textarea, Text} from "@mantine/core";
import {useState} from "react";
import {FormOrderItem} from "src/models/forms.tsx";

interface OrderItemFormProps {
    formItem: FormOrderItem,
    onSave: (formItem: FormOrderItem) => void,
    onCancel?: () => void,
}

export function OrderItemFormv2({formItem,  onSave, onCancel}: OrderItemFormProps) {

    const [draftItem, setDraftItem] = useState(formItem);

    const handleNoteChange = (event: any) => {
        setDraftItem((prevItem: FormOrderItem) => ({...prevItem, notes: event.target.value}));
    }

    const returnItem = () => {
        onSave(draftItem);
    }

    return (<>
            <Stack>
                    <Textarea
                        label="Additional item note"
                        required={!!formItem?.item?.placeholder}
                        placeholder={"Size, color, preferences, etc"}
                        onChange={handleNoteChange}
                        value={draftItem?.notes}
                    />
                {
                    formItem?.item?.placeholder && <Text size={'xs'} c={'dimmed'} fw={600}>
                        Details are required for this item: <br/>{formItem?.item?.placeholder}
                    </Text>
                }

                <Group justify={"space-between"} my="md">
                    <Button  variant="outline" color="gray"  onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={returnItem}>Done</Button>
                </Group>
            </Stack>
        </>
    );
}

export default OrderItemFormv2;
