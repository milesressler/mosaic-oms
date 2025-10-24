import { ActionIcon, Button, Group, Pill, PillsInput, Select, Stack, Switch, Text, TextInput, Card, Divider } from "@mantine/core";
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
    multiSelect: boolean;
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
                            multiSelect: false,
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
                                multiSelect: false,
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
                    options: item.attribute.options
                });
            } else {
                // Group - convert each attribute with groupName and groupOrder
                item.group.attributes.forEach((attr, index) => {
                    attributes.push({
                        label: attr.label,
                        required: attr.required,
                        options: attr.options,
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
                    label="Category"
                    data={Object.values(Category).map((category) => ({
                        label: categoryDisplayNames[category],
                        value: category.toString(),
                    }))}
                    placeholder="Select a category"
                    {...form.getInputProps("category")}
                />
                <TextInput
                    label="Placeholder (Optional)"
                    placeholder="Enter placeholder"
                    {...form.getInputProps("placeholder")}
                />

                {/* Attributes Section */}
                <Stack gap="xs">
                    <Group pos="apart" align="center">
                        <Text fw={500}>Attributes</Text>
                        <Group gap="xs">
                            <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                    form.insertListItem("attributesAndGroups", { 
                                        type: 'attribute', 
                                        attribute: { label: "", options: [], required: false, multiSelect: false }
                                    })
                                }
                            >
                                Add Attribute
                            </Button>
                            <Button
                                variant="outline"
                                size="xs"
                                leftSection={<IconFolder size={16} />}
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
                    </Group>
                    
                    {form.values.attributesAndGroups.map((item, index) => {
                        if (item.type === 'attribute') {
                            return (
                                <div
                                    key={index}
                                    style={{
                                        position: "relative",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        padding: "16px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    {/* Floating Remove Button */}
                                    <ActionIcon
                                        color="red"
                                        onClick={() => form.removeListItem("attributesAndGroups", index)}
                                        title="Remove Attribute"
                                        style={{ position: "absolute", top: -8, right: -8 }}
                                    >
                                        <IconX size={16} />
                                    </ActionIcon>

                                    {/* Attribute Fields */}
                                    <Group align="center">
                                        <TextInput
                                            placeholder="Attribute label"
                                            {...form.getInputProps(`attributesAndGroups.${index}.attribute.label`)}
                                            style={{ flex: 1 }}
                                        />
                                        <Switch
                                            label="Required"
                                            {...form.getInputProps(`attributesAndGroups.${index}.attribute.required`, { type: "checkbox" })}
                                            ml="md"
                                        />
                                    </Group>

                                    {/* Options Section */}
                                    <Stack gap="xs" mt="sm">
                                        <Text size="sm" fw={500}>Options</Text>
                                        <PillsInput>
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
                                                    placeholder="Add option"
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
                                </div>
                            );
                        } else {
                            // Group rendering
                            return (
                                <Card
                                    key={index}
                                    withBorder
                                    style={{
                                        position: "relative",
                                        marginBottom: "8px",
                                        backgroundColor: "#f8f9fa"
                                    }}
                                >
                                    {/* Remove Group Button */}
                                    <ActionIcon
                                        color="red"
                                        onClick={() => form.removeListItem("attributesAndGroups", index)}
                                        title="Remove Group"
                                        style={{ position: "absolute", top: -8, right: -8, zIndex: 10 }}
                                    >
                                        <IconX size={16} />
                                    </ActionIcon>

                                    {/* Group Header */}
                                    <Group align="center" mb="md">
                                        <IconFolder size={20} color="#6c757d" />
                                        <TextInput
                                            placeholder="Group name (e.g., Size)"
                                            {...form.getInputProps(`attributesAndGroups.${index}.group.name`)}
                                            style={{ flex: 1 }}
                                            styles={{ input: { fontWeight: 600 } }}
                                        />
                                    </Group>

                                    <Divider mb="md" />

                                    {/* Group Attributes */}
                                    <Stack gap="sm">
                                        {item.group.attributes.map((attr, attrIndex) => (
                                            <div
                                                key={attrIndex}
                                                style={{
                                                    position: "relative",
                                                    border: "1px solid #dee2e6",
                                                    borderRadius: "4px",
                                                    padding: "12px",
                                                    backgroundColor: "white"
                                                }}
                                            >
                                                <ActionIcon
                                                    color="red"
                                                    size="sm"
                                                    onClick={() => form.removeListItem(`attributesAndGroups.${index}.group.attributes`, attrIndex)}
                                                    title="Remove Attribute"
                                                    style={{ position: "absolute", top: -6, right: -6 }}
                                                >
                                                    <IconX size={12} />
                                                </ActionIcon>

                                                <Group align="center" mb="sm">
                                                    <TextInput
                                                        placeholder="Attribute label"
                                                        {...form.getInputProps(`attributesAndGroups.${index}.group.attributes.${attrIndex}.label`)}
                                                        style={{ flex: 1 }}
                                                    />
                                                    <Switch
                                                        label="Required"
                                                        {...form.getInputProps(`attributesAndGroups.${index}.group.attributes.${attrIndex}.required`, { type: "checkbox" })}
                                                    />
                                                </Group>

                                                <Stack gap="xs">
                                                    <Text size="sm" fw={500}>Options</Text>
                                                    <PillsInput>
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
                                                                placeholder="Add option"
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
                                            </div>
                                        ))}

                                        {/* Add Attribute to Group Button */}
                                        <Button
                                            variant="light"
                                            size="sm"
                                            onClick={() =>
                                                form.insertListItem(`attributesAndGroups.${index}.group.attributes`, {
                                                    label: "",
                                                    options: [],
                                                    required: false,
                                                    multiSelect: false
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

                <Button type="submit" loading={createApi.loading || updateApi.loading}>
                    {item ? "Update" : "Create"} Item
                </Button>
            </Stack>
        </form>
    );
}

export default ItemForm;
