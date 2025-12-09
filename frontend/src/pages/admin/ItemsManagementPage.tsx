import {
    Badge, Button,
    Group,
    LoadingOverlay,
    Modal,
    Pagination, Pill,
    Select, Switch,
    Table,
    Text,
    TextInput
} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import ItemsApi from "src/services/itemsApi.tsx";
import {useEffect, useState} from "react";
import {AdminItem, Category, categoryDisplayNames, Item} from "src/models/types.tsx";
import {IconPencil, IconSearch, IconTableImport, IconX} from "@tabler/icons-react";
import ItemForm from "src/forms/items/ItemForm.tsx";

export function ItemsManagementPage() {
    const PAGE_SIZE = 250;
    const [activePage, setPage] = useState(1);

    // API CALLS
    const adminItemsApi = useApi(ItemsApi.getAdminItemsPageSort);
    const deleteItemApi = useApi(ItemsApi.deleteAdminItem);
    const updateItemApi = useApi(ItemsApi.updateAdminItem);

    const [deletingId, setDeleting] = useState<number|null>(null);
    const [updatingId, setUpdatingId] = useState<number|null>(null);
    const [editingItem, setEditingItem] = useState<AdminItem|null>(null);

    // Copy of response
    const [pageContent, setPageContent] = useState<AdminItem[]|null>(null);

    // Filters
    const [searchCategory, setSearchCatagory] = useState<null|Category>(null);
    const [searchDescription, setSearchDescription] = useState<string>('');
    const [showAll, setShowAll] = useState<boolean>(false);

    useEffect(() => {
        if(adminItemsApi.data) {
            setPageContent(adminItemsApi.data.content ?? []);
        }
    }, [adminItemsApi.data]);

    useEffect(() => {
        refreshData();
    }, [searchCategory, showAll]);

    const refreshData = () =>
        adminItemsApi.request(activePage - 1, PAGE_SIZE, {column: 'description', direction: 'asc'}, showAll, searchCategory ? searchCategory : null);

    useEffect(() => {
        refreshData();
    }, [activePage]);

    const handleDelete = (item: Item) => {
        if (!deleteItemApi.loading) {
            deleteItemApi.request(item.id)
            setDeleting(item.id)
        }
    }

    const makeItemManaged = (item: Item) => {
        if (!updateItemApi.loading) {
            updateItemApi.request(item.id, {managed: true})
            setUpdatingId(item.id);
        }
    }

    const toggleAvailability = (item: Item) => {
        if (!updateItemApi.loading) {
            const newAvailability = item.availability.toLowerCase() === 'available' ? 'unavailable' : 'available';
            updateItemApi.request(item.id, {availability: newAvailability})
            setUpdatingId(item.id);
        }
    }



    const handleItemSave = (item: Item) => {
        setEditingItem(null);
        refreshData();
    }

    useEffect(() => {
        if (!deleteItemApi.loading && deletingId) {
            setDeleting(null);
            refreshData()
        }
    }, [deletingId, deleteItemApi.loading]);

    useEffect(() => {
        if (!updateItemApi.loading && updatingId) {
            setUpdatingId(null);
            refreshData()
        }
    }, [updatingId, updateItemApi.loading]);

    const rows = pageContent?.filter((item: AdminItem) =>
        item.description?.toLowerCase().includes(searchDescription.toLowerCase())
    ).map((item) => (
        <>
        <Table.Tr key={item.id} pos={'relative'} style={{cursor: 'pointer'}}  onClick={() => setEditingItem(item)}>
            <LoadingOverlay visible={item.id === deletingId || item.id === updatingId}/>

            <Table.Td>{item.description}</Table.Td>
            <Table.Td>
                {item.category && <Pill>{categoryDisplayNames[ item.category]}</Pill>}
            </Table.Td>
            <Table.Td>
                <Text size={'xs'}>
                {item.placeholder}</Text>
            </Table.Td>
            <Table.Td>
                {item?.attributes?.map(a => <Pill>{a.label}</Pill>)}
            </Table.Td>
            <Table.Td>
                <Badge variant={'dot'}
                       color={item.availability.toLowerCase() === 'available' ? 'green' : 'red'}
                       onClick={(e) => { e.stopPropagation(); toggleAvailability(item);}}
                       size={'xs'}>{item.availability}</Badge>
            </Table.Td>
            {/*<Table.Td>*/}
            {/*    {item.totalFilled} / {item.totalOrdered ?? 0}*/}
            {/*</Table.Td>*/}
            <Table.Td>
                <IconPencil color={'gray'} onClick={(e) => { e.stopPropagation(); setEditingItem(item)}}></IconPencil>
                { item.managed && <IconX color={'red'}  onClick={(e) => { e.stopPropagation(); handleDelete(item)}}></IconX> }
                { !item.managed && <IconTableImport color={'gray'}  onClick={(e) => { e.stopPropagation(); makeItemManaged(item)}}></IconTableImport> }
            </Table.Td>
        </Table.Tr>
        </>
    ));

    return (
        <>
            <Modal title={editingItem?.description} opened={!!editingItem} onClose={() => setEditingItem(null)}>
                {  <ItemForm item={editingItem!} onItemSave={handleItemSave}></ItemForm> }
            </Modal>
            <Group m="xs" align="end" justify="space-between" wrap="wrap">
                <Group gap="sm">
                    <TextInput
                        size={'lg'}
                        label={"Description"}
                        placeholder="Search by description"
                        leftSection={<IconSearch size={16} stroke={1.5} />}
                        value={searchDescription}
                        onChange={(e) => setSearchDescription(e.currentTarget.value)}
                    />
                    <Select
                        size={'lg'}
                        label="Category"
                        data={Object.values(Category).map(category => {
                            return { label: categoryDisplayNames[category], value: category.toString() }
                        })}
                        placeholder="Filter by category"
                        value={searchCategory}
                        onChange={(val: string|null) => (setSearchCatagory(val))}
                    />
                    <Switch
                        label={'Show Unmanaged Items'}
                        checked={showAll}
                        onChange={(e) => setShowAll(e.currentTarget.checked)}
                        />
                </Group>
                <Button onClick={() => setEditingItem({managed: true} as AdminItem)}>New Item</Button>
            </Group>
            <Table pos={'relative'}>
                    <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Category</Table.Th>
                        <Table.Th>Placeholder</Table.Th>
                        <Table.Th>Attributes</Table.Th>
                        <Table.Th>Availability</Table.Th>
                        {/*<Table.Th>Filled / Ordered</Table.Th>*/}
                        <Table.Th></Table.Th>
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
