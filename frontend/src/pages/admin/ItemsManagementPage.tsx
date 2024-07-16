import {Checkbox, Pagination, Table} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import ItemsApi from "src/services/itemsApi.tsx";
import {useEffect, useState} from "react";

export function ItemsManagementPage() {
    const PAGE_SIZE = 25;
    const adminItemsApi = useApi(ItemsApi.getAdminItemsPage);
    const [activePage, setPage] = useState(1);
    useEffect(() => {
        adminItemsApi.request(activePage - 1, PAGE_SIZE);
    }, [activePage]);


    const rows = adminItemsApi.data?.content?.map((item) => (
        <Table.Tr key={item.id}>
            {/*<Table.Td>{item.id}</Table.Td>*/}
            <Table.Td>{item.description}</Table.Td>
            <Table.Td>{item.placeholder}</Table.Td>
            <Table.Td><Checkbox checked={item.suggestedItem}
                                onChange={(event) =>
                                    console.log(event.currentTarget.checked)}
            ></Checkbox></Table.Td>
            <Table.Td></Table.Td>
        </Table.Tr>
    ));

    return (
        <>
        <Table>
            <Table.Thead>
                <Table.Tr>
                    {/*<Table.Th>ID</Table.Th>*/}
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Placeholder</Table.Th>
                    <Table.Th>Suggested</Table.Th>
                    <Table.Th>Total Ordered</Table.Th>
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
