import { ActionIcon, Button, Group, Pill, PillsInput, Select, Stack, Switch, Text, TextInput, Card, Divider, rem } from "@mantine/core";
import { IconPlus, IconX, IconFolder, IconGripVertical } from "@tabler/icons-react";
import useApi from "src/hooks/useApi.tsx";
import itemsApi from "src/services/itemsApi.tsx";
import { AdminItem, Category, categoryDisplayNames, Item } from "src/models/types.tsx";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";

interface AttributeForm {
    label: string;
    options: string[];
    required: boolean;
    attributeType: 'SINGLE_SELECT'|'MULTI_SELECT'|'NUMERIC_RANGE'|'TEXT';
}

interface AttributeGroup {
    id: string; // Temporary ID for form management
    name: string;
    attributes: AttributeForm[];
}

type AttributeOrGroup = 
    | { type: 'attribute'; attribute: AttributeForm }
    | { type: 'group'; group: AttributeGroup };

interface FormOrderItem {
    description: string;
    category: string;
    placeholder: string;
    managed: boolean;
    attributesAndGroups: AttributeOrGroup[];
}

interface Props {
    item?: AdminItem;
    onItemSave: (item: Item) => void;
}


export function ItemForm({ onItemSave, item }: Props) {
    const createApi = useApi(itemsApi.createItem);
    const updateApi = useApi(itemsApi.updateAdminItem);

    // Convert existing attributes to new format
    const convertExistingAttributes = (): AttributeOrGroup[] => {
        if (!item?.attributes) return [];
        
        // Group attributes by groupName
        const grouped = item.attributes.reduce((acc, attr) => {
            const groupName = attr.groupName || '__ungrouped__';
            if (!acc[groupName]) {
                acc[groupName] = [];
            }
            acc[groupName].push(attr);
            return acc;
        }, {} as Record<string, typeof item.attributes>);
        
        const result: AttributeOrGroup[] = [];
        
        Object.entries(grouped).forEach(([groupName, attrs]) => {
            if (groupName === '__ungrouped__') {
                // Add individual attributes
                attrs.forEach(attr => {
                    result.push({
                        type: 'attribute',
                        attribute: {
                            label: attr.label,
                            required: attr.required,
                            attributeType: attr.type,
                            options: attr.options.map(i => i.label)
                        }
                    });
                });
            } else {
                // Add as group
                result.push({
                    type: 'group',
                    group: {
                        id: `group-${groupName}`,
                        name: groupName,
                        attributes: attrs
                            .sort((a, b) => (a.groupOrder || 0) - (b.groupOrder || 0))
                            .map(attr => ({
                                label: attr.label,
                                required: attr.required,
                                attributeType: attr.type,
                                options: attr.options.map(i => i.label)
                            }))
                    }
                });
            }
        });
        
        return result;
    };

    const form = useForm<FormOrderItem>({
        initialValues: {
            description: item?.description || "",
            category: item?.category || "",
            placeholder: item?.placeholder || "",
            managed: item?.managed !== false,
            attributesAndGroups: convertExistingAttributes(),
        },
        validate: {
            description: (value) => ((value.trim() || item?.description) ? null : "Description is required"),
            category: (value) => (value ? null : "Category is required"),
        },
    });

    // Convert form data back to backend format
    const convertToBackendFormat = (values: FormOrderItem) => {
        const attributes: any[] = [];
        
        values.attributesAndGroups.forEach(item => {
            if (item.type === 'attribute') {
                // Individual attribute
                attributes.push({
                    label: item.attribute.label,
                    required: item.attribute.required,
                    attributeType: item.attribute.attributeType,
                    options: item.attribute.attributeType === 'TEXT' ? [] : item.attribute.options
                });
            } else {
                // Group - convert each attribute with groupName and groupOrder
                item.group.attributes.forEach((attr, index) => {
                    attributes.push({
                        label: attr.label,
                        required: attr.required,
                        attributeType: attr.attributeType,
                        options: attr.attributeType === 'TEXT' ? [] : attr.options,
                        groupName: item.group.name,
                        groupOrder: index + 1
                    });
                });
            }
        });
        
        return {
            ...values,
            attributes
        };
    };

    const handleSubmit = async (values: FormOrderItem) => {
        const backendData = convertToBackendFormat(values);
        
        if (!item?.description) {
            createApi.request(backendData);
        } else {
            updateApi.request(item.id, backendData);
        }
    };

    useEffect(() => {
        if (createApi.data) {
            onItemSave(createApi.data);
        }
    }, [createApi.data]);

    useEffect(() => {
        if (updateApi.data) {
            onItemSave(updateApi.data);
        }
    }, [updateApi.data]);

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
                <Stack gap={2}>
                    <TextInput
                        size={'lg'}
                        label="Description"
                        placeholder={item?.description ? item.description : "Enter description"}
                        {...form.getInputProps("description")}
                    />
                    {!!form.values.description.trim() && item?.description && form.values.description !== item.description  &&  (
                        <Text size="xs" c="red">
                            ⚠ Changing this description will also update it for all prior orders.
                        </Text>
                    )}
                </Stack>
                <Select
                    size={'lg'}
                    label="Category"
                    data={Object.values(Category).map((category) => ({
                        label: categoryDisplayNames[category],
                        value: category.toString(),
                    }))}
                    placeholder="Select a category"
                    {...form.getInputProps("category")}
                />
                <TextInput
                    size={'lg'}
                    label="Placeholder (Optional)"
                    placeholder="Enter placeholder"
                    {...form.getInputProps("placeholder")}
                />

                {/* Attributes Section */}
                <Stack gap="xs">
                    <Stack gap="xs">
                        <Text fw={500}>Attributes</Text>
                        <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                            <Button
                                variant="outline"
                                size="sm"
                                style={{ flex: '1 1 auto', minWidth: rem(120) }}
                                onClick={() =>
                                    form.insertListItem("attributesAndGroups", { 
                                        type: 'attribute', 
                                        attribute: { label: "", options: [], required: false, attributeType: 'SINGLE_SELECT' }
                                    })
                                }
                            >
                                Add Attribute
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                leftSection={<IconFolder size={16} />}
                                style={{ flex: '1 1 auto', minWidth: rem(150) }}
                                onClick={() =>
                                    form.insertListItem("attributesAndGroups", { 
                                        type: 'group', 
                                        group: { 
                                            id: `group-${Date.now()}`, 
                                            name: "", 
                                            attributes: [] 
                                        }
                                    })
                                }
                            >
                                Add Attribute Group
                            </Button>
                        </Group>
                    </Stack>
                    
                    {form.values.attributesAndGroups.map((item, index) => {
                        if (item.type === 'attribute') {
                            return (
                                <div
                                    key={index}
                                    style={{
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        padding: "16px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    {/* Attribute Fields */}
                                    <Stack gap="sm">
                                        <Group justify="space-between" align="center">
                                            <Text size="sm" fw={500} c="dimmed">Attribute</Text>
                                            <ActionIcon
                                                color="red"
                                                variant="light"
                                                size="sm"
                                                onClick={() => form.removeListItem("attributesAndGroups", index)}
                                                title="Remove Attribute"
                                            >
                                                <IconX size={14} />
                                            </ActionIcon>
                                        </Group>
                                        <TextInput
                                            size={'lg'}
                                            placeholder="Attribute label"
                                            {...form.getInputProps(`attributesAndGroups.${index}.attribute.label`)}
                                        />
                                        <Group grow>
                                            <Select
                                                size={'sm'}
                                                label="Attribute Type"
                                                data={[
                                                    { label: "Single Select", value: "SINGLE_SELECT" },
                                                    { label: "Multi Select", value: "MULTI_SELECT" },
                                                    { label: "Numeric Range", value: "NUMERIC_RANGE" },
                                                    { label: "Text", value: "TEXT" }
                                                ]}
                                                {...form.getInputProps(`attributesAndGroups.${index}.attribute.attributeType`)}
                                                onChange={(value) => {
                                                    form.setFieldValue(`attributesAndGroups.${index}.attribute.attributeType`, value);
                                                    // Clear options if switching to TEXT
                                                    if (value === 'TEXT') {
                                                        form.setFieldValue(`attributesAndGroups.${index}.attribute.options`, []);
                                                    }
                                                }}
                                            />
                                            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
                                                <Switch
                                                    label="Required"
                                                    {...form.getInputProps(`attributesAndGroups.${index}.attribute.required`, { type: "checkbox" })}
                                                />
                                            </div>
                                        </Group>
                                    </Stack>

                                    {/* Options Section - Only show for non-TEXT types */}
                                    {item.attribute.attributeType !== 'TEXT' && (
                                        <Stack gap="xs" mt="sm">
                                            <Group gap="xs" align="baseline">
                                                <Text size="sm" fw={500}>Options</Text>
                                                <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                                    Press Enter to add option
                                                </Text>
                                            </Group>
                                            <PillsInput size={'lg'}>
                                                <Pill.Group>
                                                    {item.attribute.options.map((option, optIndex) => (
                                                        <Pill
                                                            key={optIndex}
                                                            withRemoveButton
                                                            onRemove={() => form.removeListItem(`attributesAndGroups.${index}.attribute.options`, optIndex)}
                                                        >
                                                            {option}
                                                        </Pill>
                                                    ))}
                                                    <PillsInput.Field
                                                        placeholder="Type option and press Enter"
                                                        onKeyDown={(event) => {
                                                            if (event.key === "Enter") {
                                                                event.preventDefault();
                                                                const value = event.currentTarget.value.trim();
                                                                if (value) {
                                                                    form.insertListItem(`attributesAndGroups.${index}.attribute.options`, value);
                                                                    event.currentTarget.value = "";
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Pill.Group>
                                            </PillsInput>
                                        </Stack>
                                    )}
                                    
                                    {/* Text hint for TEXT type */}
                                    {item.attribute.attributeType === 'TEXT' && (
                                        <Text size="xs" c="dimmed" style={{ fontStyle: 'italic', marginTop: '8px' }}>
                                            Text attributes allow freeform input
                                        </Text>
                                    )}
                                </div>
                            );
                        } else {
                            // Group rendering
                            return (
                                <Card
                                    key={index}
                                    withBorder
                                    style={{
                                        marginBottom: "8px",
                                        backgroundColor: "#f8f9fa"
                                    }}
                                >
                                    {/* Group Header */}
                                    <Stack gap="sm" mb="md">
                                        <Group justify="space-between" align="center">
                                            <Group align="center">
                                                <IconFolder size={20} color="#6c757d" />
                                                <Text size="sm" fw={500} c="dimmed">Attribute Group</Text>
                                            </Group>
                                            <ActionIcon
                                                color="red"
                                                variant="light"
                                                size="sm"
                                                onClick={() => form.removeListItem("attributesAndGroups", index)}
                                                title="Remove Group"
                                            >
                                                <IconX size={14} />
                                            </ActionIcon>
                                        </Group>
                                        <TextInput
                                            size={'lg'}
                                            placeholder="Group name (e.g., Size)"
                                            {...form.getInputProps(`attributesAndGroups.${index}.group.name`)}
                                            styles={{ input: { fontWeight: 600 } }}
                                        />
                                    </Stack>

                                    <Divider mb="md" />

                                    {/* Group Attributes */}
                                    <Stack gap="sm">
                                        {item.group.attributes.map((attr, attrIndex) => (
                                            <div
                                                key={attrIndex}
                                                style={{
                                                    border: "1px solid #dee2e6",
                                                    borderRadius: "4px",
                                                    padding: "12px",
                                                    backgroundColor: "white"
                                                }}
                                            >
                                                <Stack gap="sm">
                                                    <Group justify="space-between" align="center">
                                                        <Text size="xs" fw={500} c="dimmed">Group Attribute</Text>
                                                        <ActionIcon
                                                            color="red"
                                                            variant="light"
                                                            size="xs"
                                                            onClick={() => form.removeListItem(`attributesAndGroups.${index}.group.attributes`, attrIndex)}
                                                            title="Remove Attribute"
                                                        >
                                                            <IconX size={12} />
                                                        </ActionIcon>
                                                    </Group>
                                                    <TextInput
                                                        size={'lg'}
                                                        placeholder="Attribute label"
                                                        {...form.getInputProps(`attributesAndGroups.${index}.group.attributes.${attrIndex}.label`)}
                                                    />
                                                    <Group grow>
                                                        <Select
                                                            size={'sm'}
                                                            label="Attribute Type"
                                                            data={[
                                                                { label: "Single Select", value: "SINGLE_SELECT" },
                                                                { label: "Multi Select", value: "MULTI_SELECT" },
                                                                { label: "Numeric Range", value: "NUMERIC_RANGE" },
                                                                { label: "Text", value: "TEXT" }
                                                            ]}
                                                            {...form.getInputProps(`attributesAndGroups.${index}.group.attributes.${attrIndex}.attributeType`)}
                                                            onChange={(value) => {
                                                                form.setFieldValue(`attributesAndGroups.${index}.group.attributes.${attrIndex}.attributeType`, value);
                                                                // Clear options if switching to TEXT
                                                                if (value === 'TEXT') {
                                                                    form.setFieldValue(`attributesAndGroups.${index}.group.attributes.${attrIndex}.options`, []);
                                                                }
                                                            }}
                                                        />
                                                        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
                                                            <Switch
                                                                label="Required"
                                                                {...form.getInputProps(`attributesAndGroups.${index}.group.attributes.${attrIndex}.required`, { type: "checkbox" })}
                                                            />
                                                        </div>
                                                    </Group>
                                                </Stack>

                                                {/* Options Section - Only show for non-TEXT types */}
                                                {attr.attributeType !== 'TEXT' && (
                                                    <Stack gap="xs">
                                                        <Group gap="xs" align="baseline">
                                                            <Text size="sm" fw={500}>Options</Text>
                                                            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                                                Press Enter to add option
                                                            </Text>
                                                        </Group>
                                                        <PillsInput size={'lg'}>
                                                            <Pill.Group>
                                                                {attr.options.map((option, optIndex) => (
                                                                    <Pill
                                                                        key={optIndex}
                                                                        withRemoveButton
                                                                        onRemove={() => form.removeListItem(`attributesAndGroups.${index}.group.attributes.${attrIndex}.options`, optIndex)}
                                                                    >
                                                                        {option}
                                                                    </Pill>
                                                                ))}
                                                                <PillsInput.Field
                                                                    placeholder="Type option and press Enter"
                                                                    onKeyDown={(event) => {
                                                                        if (event.key === "Enter") {
                                                                            event.preventDefault();
                                                                            const value = event.currentTarget.value.trim();
                                                                            if (value) {
                                                                                form.insertListItem(`attributesAndGroups.${index}.group.attributes.${attrIndex}.options`, value);
                                                                                event.currentTarget.value = "";
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            </Pill.Group>
                                                        </PillsInput>
                                                    </Stack>
                                                )}
                                                
                                                {/* Text hint for TEXT type */}
                                                {attr.attributeType === 'TEXT' && (
                                                    <Text size="xs" c="dimmed" style={{ fontStyle: 'italic', marginTop: '8px' }}>
                                                        Text attributes allow freeform input - no options needed
                                                    </Text>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add Attribute to Group Button */}
                                        <Button
                                            variant="light"
                                            size="sm"
                                            fullWidth
                                            onClick={() =>
                                                form.insertListItem(`attributesAndGroups.${index}.group.attributes`, {
                                                    label: "",
                                                    options: [],
                                                    required: false,
                                                    attributeType: 'SINGLE_SELECT'
                                                })
                                            }
                                        >
                                            + Add Attribute to Group
                                        </Button>
                                    </Stack>
                                </Card>
                            );
                        }
                    })}
                </Stack>

                <Button 
                    type="submit" 
                    loading={createApi.loading || updateApi.loading}
                    size="md"
                    fullWidth
                >
                    {item ? "Update" : "Create"} Item
                </Button>
            </Stack>
        </form>
    );
}

export default ItemForm;
