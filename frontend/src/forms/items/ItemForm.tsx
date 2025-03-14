import { useForm } from "@mantine/form";
import { Button, Select, TextInput, Stack } from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import itemsApi from "src/services/itemsApi.tsx";
import { Item } from "src/models/types.tsx";
import {useEffect} from "react";

interface Props {
    categories: string[];
    onItemCreate: (item: Item) => void;
}

export function ItemForm({ categories, onItemCreate }: Props) {
    const createApi = useApi(itemsApi.createItem);

    const form = useForm({
        initialValues: {
            description: "",
            category: "",
            placeholder: "",
            suggestedItem: true
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
                    data={categories}
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
