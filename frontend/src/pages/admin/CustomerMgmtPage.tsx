import {Center, LoadingOverlay, Pagination, Table} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import customersApi from "src/services/customersApi.tsx";
import {useEffect} from "react";
import { useSearchParams} from "react-router-dom";
import {Customer} from "src/models/types.tsx";
import {DateTime} from "luxon";

export function CustomerManagementPage() {

    const getCustomersApi = useApi(customersApi.getCustomers);
    const [searchParams, setSearchParams] = useSearchParams();

    // Get page from URL or default to 1
    const activePage = Number(searchParams.get("page")) || 1;

    useEffect(() => {
        getCustomersApi.request(activePage - 1, 10);
    }, [activePage]);

    const setPage = (page: number) => {
        setSearchParams({ page: page.toString() }, { replace: true });
    };


    const rows = getCustomersApi.data?.content?.map((customer: Customer) => (
        <>
            <LoadingOverlay visible={getCustomersApi.loading}/>
            <Table.Tr key={customer.uuid} pos={'relative'} >
                <Table.Td>{customer.name}</Table.Td>
                <Table.Td>{customer.created && DateTime.fromMillis(customer.created).toLocaleString(DateTime.DATETIME_SHORT)}</Table.Td>
                <Table.Td>{customer.showerWaiverCompleted && DateTime.fromMillis(customer.showerWaiverCompleted).toLocaleString(DateTime.DATETIME_SHORT)}</Table.Td>
            </Table.Tr>
        </>
    ));


    return (
        <>
            <Table pos={'relative'}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Shower Waiver Signed</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows}
                </Table.Tbody>
            </Table>


            {1 < (getCustomersApi.data?.totalPages || 0) && (
                <Center>
                    <Pagination value={activePage} onChange={setPage} total={getCustomersApi.data?.totalPages || 0} />
                </Center>
            )}

        </>
    );
}

export default CustomerManagementPage
