import {Button, Group, Stack, Textarea, Text, Select, MultiSelect} from "@mantine/core";
import {useState} from "react";
import {AttributeValue, FormOrderItem, SingleValueAttribute} from "src/models/forms.tsx";

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

    const handleAttributeSelect = (key: string, val: string | null) => {
        setDraftItem((prevItem: FormOrderItem) => {
            // Ensure we start with an object even if attributes is undefined.
            const newAttributes: Record<string, AttributeValue> = { ...(prevItem.attributes || {}) };

            if (val === null) {
                delete newAttributes[key]; // Remove the key if val is null
            } else {
                // Find the attribute definition to get the display label
                const attribute = prevItem.item.attributes.find(attr => attr.key === key);
                const selectedOption = attribute?.options.find(option => option.value === val);
                const displayValue = selectedOption?.label || val; // Fallback to val if no label found
                
                // Update with a SingleValueAttribute instance including both values
                newAttributes[key] = { 
                    type: "string", 
                    value: val,
                    displayValue: displayValue
                } as SingleValueAttribute;
            }
            return { ...prevItem, attributes: newAttributes };
        });
    };


    const returnItem = () => {
        onSave(draftItem);
    }

    return (<>
            <Stack>
                {
                    formItem?.item.attributes.map(attribute => {
                        if (attribute.type === 'SINGLE_SELECT') {
                            return <Select
                                label={attribute.label}
                                required
                                size={'lg'}
                                value={draftItem?.attributes?.[attribute.key]?.value ?? ''}
                                onChange={(val) => handleAttributeSelect(attribute.key, val)}
                                data={attribute.options.map(o => ({
                                    value: o.value,
                                    label: o.label,
                                    disabled: !o.available
                                }))}
                            ></Select>
                        } else {
                            return <MultiSelect
                                label={attribute.label}
                                required
                                size={'lg'}
                                // value={[]}
                                data={attribute.options.map(o => ({
                                    value: o.value,
                                    label: o.label,
                                    disabled: !o.available
                                }))}
                            ></MultiSelect>
                        }
                    })
                }
                {
                    formItem?.item?.placeholder && <Text size={'xs'} c={'dimmed'} fw={600}>
                        Details are required for this item: <br/>{formItem?.item?.placeholder}
                    </Text>
                }
                <Textarea
                    size={'lg'}
                    label="Additional item note"
                    placeholder={"Alternatives, specifics, or other preferences"}
                    onChange={handleNoteChange}
                    value={draftItem?.notes}
                />

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
