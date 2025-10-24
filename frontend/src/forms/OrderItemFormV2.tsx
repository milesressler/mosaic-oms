import {Button, Group, Stack, Textarea, Text, Select, MultiSelect, Box, Card} from "@mantine/core";
import React, {useState} from "react";
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

    // Group attributes by groupName and sort by groupOrder
    const groupedAttributes = React.useMemo(() => {
        const attributes = formItem?.item.attributes || [];
        
        // Group by groupName (null/undefined attributes go in 'ungrouped')
        const groups = attributes.reduce((acc, attribute) => {
            const groupKey = attribute.groupName || 'ungrouped';
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(attribute);
            return acc;
        }, {} as Record<string, typeof attributes>);
        
        // Sort each group by groupOrder, then by key as fallback
        Object.values(groups).forEach(group => {
            group.sort((a, b) => {
                if (a.groupOrder !== undefined && b.groupOrder !== undefined) {
                    return a.groupOrder - b.groupOrder;
                }
                return a.key.localeCompare(b.key);
            });
        });
        
        return groups;
    }, [formItem?.item.attributes]);

    const renderAttribute = (attribute: any) => {
        if (attribute.type === 'SINGLE_SELECT') {
            return <Select
                key={attribute.key}
                label={attribute.label}
                required={attribute.required}
                size={'lg'}
                value={draftItem?.attributes?.[attribute.key]?.value ?? ''}
                onChange={(val) => handleAttributeSelect(attribute.key, val)}
                data={attribute.options.map(o => ({
                    value: o.value,
                    label: o.label,
                    disabled: !o.available
                }))}
            />;
        } else {
            return <MultiSelect
                key={attribute.key}
                label={attribute.label}
                required={attribute.required}
                size={'lg'}
                // value={[]}
                data={attribute.options.map(o => ({
                    value: o.value,
                    label: o.label,
                    disabled: !o.available
                }))}
            />;
        }
    };

    return (<>
            <Stack>
                {Object.entries(groupedAttributes).map(([groupName, attributes]) => {
                    if (groupName === 'ungrouped') {
                        // Render ungrouped attributes normally
                        return attributes.map(renderAttribute);
                    } else {
                        // Render grouped attributes in a card
                        return (
                            <Card key={groupName} withBorder padding="md">
                                <Text fw={600} mb="sm">{groupName}</Text>
                                <Stack gap="sm">
                                    {attributes.map(renderAttribute)}
                                </Stack>
                            </Card>
                        );
                    }
                })}
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
