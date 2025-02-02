import {ActionIcon, Checkbox, Group, LoadingOverlay, Pagination, Table, Text, TextInput} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import ItemsApi from "src/services/itemsApi.tsx";
import {useEffect, useRef, useState} from "react";
import {AdminItem, Item} from "src/models/types.tsx";
import {IconCheck, IconX} from "@tabler/icons-react";

const EditableCell = ({ initialValue, onSave, onCancel, isEditing, onEdit }: any) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<any|null>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef?.current?.focus();
            setValue(initialValue); // Reset value when editing starts
        } else {
            setValue(initialValue);
        }
    }, [isEditing, initialValue]);

    const handleSave = () => {
        onSave(value);
    };

    const handleCancel = () => {
        onCancel();
        setValue(initialValue); // Reset value when editing is cancelled
    };
    return isEditing ? (
        <Group gap="5">
            <TextInput
                // variant="unstyled"
                placeholder="Add placeholder"
                ref={inputRef}
                value={value}
                // onBeforeInput={handleCancel}
                rightSection={
                    <Group>
                    <ActionIcon onClick={handleSave} variant="subtle" color="blue">
                        <IconCheck size={16} onClick={handleSave} />
                    </ActionIcon>
                    </Group>
                }
                onChange={(event) => setValue(event.currentTarget.value)}
            />
            {/*<ActionIcon onClick={handleSave} variant="outline" color="blue">*/}
            {/*    <IconCheck size={16} onClick={handleSave} />*/}
            {/*</ActionIcon>*/}
            <ActionIcon onClick={handleCancel} variant="outline" color="red">
                <IconX size={16} />
            </ActionIcon>
        </Group>
    ) : (
        <div onClick={onEdit} style={{cursor: 'pointer'}}>
            <Text size={!initialValue ? 'xs' : 'sm'} fs={!initialValue ? 'italic' : ''} span c={!initialValue ? 'dimmed' : ''}>
                {initialValue ?? 'Add text'}
            </Text>
        </div>);
};
export function ItemsManagementPage() {
    const PAGE_SIZE = 25;
    const adminItemsApi = useApi(ItemsApi.getAdminItemsPage);
    const updateItemApi = useApi(ItemsApi.updateAdminItem);
    const [activePage, setPage] = useState(1);
    const [editingId, setEditingId] = useState<number|null>(null);
    const [pageContent, setPageContent] = useState<AdminItem[]|null>(null);

    useEffect(() => {
        if(adminItemsApi.data) {
            setPageContent(adminItemsApi.data.content ?? []);
        }
    }, [adminItemsApi.data]);

    useEffect(() => {
        adminItemsApi.request(activePage - 1, PAGE_SIZE);
    }, [activePage]);

    useEffect(() => {
        if (updateItemApi.data) {
            const updatedId = updateItemApi.data.id;

            if (pageContent) {
                setPageContent((prev: any) =>
                    prev?.map((item: AdminItem) =>
                        item.id === updatedId ? updateItemApi.data : item
                    )
                );
            }

            setEditingId(null);
        }

    }, [updateItemApi.data]);


    const toggleSuggested = (item: Item, event: any) => {
            updateItemApi.request(item.id, {suggestedItem: event.currentTarget.checked});
    }


    const handleSavePlaceholder = (id: number, newValue: string) => {
        updateItemApi.request(id, {placeholder: newValue});
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleEdit = (id: number) => {
        if (!updateItemApi.loading) {
            setEditingId(id);
        }
    };

    const rows = pageContent?.map((item) => (
        <>
        <Table.Tr key={item.id} pos={'relative'}>
            <Table.Td>{item.description}</Table.Td>
            <Table.Td>{ item.category}</Table.Td>
            <Table.Td><><EditableCell initialValue={item.placeholder}
                                    onSave={(newValue: string) => handleSavePlaceholder(item.id, newValue)}
                                    onCancel={handleCancel}
                                    isEditing={editingId === item.id}
                                    onEdit={() => handleEdit(item.id)}

                />

                <LoadingOverlay visible={item.id === editingId && updateItemApi.loading}/>
                </>
            </Table.Td>
            <Table.Td><Checkbox checked={item.suggestedItem}
                                onChange={(val) => toggleSuggested(item, val)}
            ></Checkbox></Table.Td>
            <Table.Td>
                {item.totalFilled} / {item.totalOrdered ?? 0}
            </Table.Td>
        </Table.Tr>
        </>
    ));

    return (
        <>
        <Table pos={'relative'}>
                <Table.Thead>
                <Table.Tr>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Placeholder</Table.Th>
                    <Table.Th>Suggested</Table.Th>
                    <Table.Th>Filled / Ordered</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {rows}
            </Table.Tbody>
        </Table>
        { (adminItemsApi.data?.totalPages ?? 0) > 1 && <Pagination value={activePage} onChange={setPage} total={adminItemsApi.data?.totalPages ?? 0} /> }


        </>
    );
}

export default ItemsManagementPage;
