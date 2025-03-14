import { useForm } from "@mantine/form";
import { Button, Select, TextInput, Stack } from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import itemsApi from "src/services/itemsApi.tsx";
import {AdminItem, Category, categoryDisplayNames, Item} from "src/models/types.tsx";
import {useEffect} from "react";

interface Props {
    item?: AdminItem;
    onItemCreate: (item: Item) => void;
}

export function ItemForm({ onItemCreate, item }: Props) {
    const createApi = useApi(itemsApi.createItem);

    const form = useForm({
        initialValues: {
            description: item?.description || "",
            category: item?.category || "",
            placeholder: item?.placeholder || "",
            suggestedItem: item?.suggestedItem != false
        },
        validate: {
            description: (value) => (value.trim() ? null : "Description is required"),
            category: (value) => (value ? null : "Category is required"),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        createApi.request(values);
    };

    useEffect(() => {
        if (createApi.data) {
            onItemCreate(createApi.data);
        }

    }, [createApi.data]);

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
                <TextInput
                    label="Description"
                    placeholder="Enter description"
                    {...form.getInputProps("description")}
                />
                <Select
                    label="Category"
                    data={Object.values(Category).map(category => {
                        return { label: categoryDisplayNames[category], value: category.toString() }
                    })}
                    placeholder="Select a category"
                    {...form.getInputProps("category")}
                />
                <TextInput
                    label="Placeholder (Optional)"
                    placeholder="Enter placeholder"
                    {...form.getInputProps("placeholder")}
                />
                <Button type="submit" loading={createApi.loading}>
                    Create Item
                </Button>
            </Stack>
        </form>
    );
}

export default ItemForm;
