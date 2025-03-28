import { ActionIcon, Button, Group, Pill, PillsInput, Select, Stack, Switch, Text, TextInput } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
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

interface FormOrderItem {
    description: string;
    category: string;
    placeholder: string;
    managed: boolean;
    attributes: AttributeForm[];
}

interface Props {
    item?: AdminItem;
    onItemSave: (item: Item) => void;
}

// Sub-component for the options pills input
const OptionsPillsInput = ({ attributeIndex, form }: { attributeIndex: number; form: any; }) => {
    const optionsPath = `attributes.${attributeIndex}.options`;
    const options = form.values.attributes[attributeIndex].options;
    const [inputValue, setInputValue] = useState("");

    const addOption = () => {
        if (inputValue.trim() !== "") {
            form.insertListItem(optionsPath, inputValue.trim());
            setInputValue("");
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addOption();
        } else if (event.key === "Backspace" && inputValue === "" && options.length > 0) {
            // Remove the last option when backspace is pressed on an empty field
            form.removeListItem(optionsPath, options.length - 1);
        }
    };

    return (
        <PillsInput
            rightSection={
                <ActionIcon onClick={addOption} variant="transparent">
                    <IconPlus size={16} />
                </ActionIcon>
            }>
            <Pill.Group>
                {options.map((option: string, optIndex: number) => (
                    <Pill
                        key={optIndex}
                        withRemoveButton
                        onRemove={() => form.removeListItem(optionsPath, optIndex)}
                    >
                        {option}
                    </Pill>
                ))}
                <PillsInput.Field
                    placeholder="Add option"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                />
            </Pill.Group>
        </PillsInput>
    );
};

export function ItemForm({ onItemSave, item }: Props) {
    const createApi = useApi(itemsApi.createItem);
    const updateApi = useApi(itemsApi.updateAdminItem);

    const form = useForm<FormOrderItem>({
        initialValues: {
            description: item?.description || "",
            category: item?.category || "",
            placeholder: item?.placeholder || "",
            managed: item?.managed !== false,
            attributes: item?.attributes?.map(attr =>
                ({
                    label: attr.label,
                    required: attr.required,
                    options: attr.options.map(i => i.label)})) || [],
        },
        validate: {
            description: (value) => (value.trim() ? null : "Description is required"),
            category: (value) => (value ? null : "Category is required"),
        },
    });

    const handleSubmit = async (values: FormOrderItem) => {
        if (!item?.description) {
            createApi.request(values);
        } else {
            updateApi.request(item.id, values);
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
                {!item?.description && <TextInput
                    disabled={!!item?.description}
                    label="Description"
                    placeholder="Enter description"
                    {...form.getInputProps("description")}
                />}
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
                        <Button
                            variant="outline"
                            size="xs"
                            onClick={() =>
                                form.insertListItem("attributes", { label: "", options: [], required: false, multiSelect: false })
                            }
                        >
                            Add Attribute
                        </Button>
                    </Group>
                    {form.values.attributes.map((attr, index) => (
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
                            {/* Floating Remove Attribute Button */}
                            <ActionIcon
                                color="red"
                                onClick={() => form.removeListItem("attributes", index)}
                                title="Remove Attribute"
                                style={{ position: "absolute", top: -8, right: -8 }}
                            >
                                <IconX size={16} />
                            </ActionIcon>

                            {/* Attribute Header Row */}
                            <Group align="center">
                                <TextInput
                                    placeholder="Attribute label"
                                    {...form.getInputProps(`attributes.${index}.label`)}
                                    style={{ flex: 1 }}
                                />
                                <Switch
                                    label="Required"
                                    {...form.getInputProps(`attributes.${index}.required`, { type: "checkbox" })}
                                    ml="md"
                                />
                                {/* Uncomment if multiSelect is needed */}
                                {/*
                <Switch
                  label="Multi-select"
                  {...form.getInputProps(`attributes.${index}.multiSelect`, { type: "checkbox" })}
                  ml="md"
                />
                */}
                            </Group>

                            {/* Options PillsInput Section */}
                            <Stack gap="xs" mt="sm">
                                <Text size="sm" fw={500}>
                                    Options
                                </Text>
                                <OptionsPillsInput attributeIndex={index} form={form} />
                            </Stack>
                        </div>
                    ))}
                </Stack>

                <Button type="submit" loading={createApi.loading || updateApi.loading}>
                    {item ? "Update" : "Create"} Item
                </Button>
            </Stack>
        </form>
    );
}

export default ItemForm;
