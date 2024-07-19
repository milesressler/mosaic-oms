import {Checkbox, LoadingOverlay, Pagination, Table} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import ItemsApi from "src/services/itemsApi.tsx";
import {useEffect, useState} from "react";
import {Item} from "src/models/types.tsx";

export function ItemsManagementPage() {
    const PAGE_SIZE = 25;
    const adminItemsApi = useApi(ItemsApi.getAdminItemsPage);
    const updateItemApi = useApi(ItemsApi.updateAdminItem);
    const [activePage, setPage] = useState(1);
    useEffect(() => {
        adminItemsApi.request(activePage - 1, PAGE_SIZE);
    }, [activePage]);


    useEffect(() => {
        adminItemsApi.request(activePage - 1, PAGE_SIZE);
    }, [updateItemApi.data]);
    const toggleSuggested = (item: Item, event: any) => {
            updateItemApi.request(item.id, {suggestedItem: event.currentTarget.checked});
    }



    const rows = adminItemsApi.data?.content?.map((item) => (
        <Table.Tr key={item.id}>
            {/*<Table.Td>{item.id}</Table.Td>*/}
            <Table.Td>{item.description}</Table.Td>
            <Table.Td>{item.placeholder}</Table.Td>
            <Table.Td><Checkbox checked={item.suggestedItem}
                                onChange={(val) => toggleSuggested(item, val)}
            ></Checkbox></Table.Td>
            <Table.Td>
                {item.totalFilled} / {item.totalOrdered ?? 0}
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
        <Table pos={'relative'}>

            <LoadingOverlay visible={updateItemApi.loading} />
                <Table.Thead>
                <Table.Tr>
                    {/*<Table.Th>ID</Table.Th>*/}
                    <Table.Th>Description</Table.Th>
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
