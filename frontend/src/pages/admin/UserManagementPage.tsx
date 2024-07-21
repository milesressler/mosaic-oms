import {Avatar, Grid, GridCol, LoadingOverlay, Pagination, Table} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import {useEffect, useState} from "react";
import AdminUserApi from "src/services/adminUserApi.tsx";
import {DateTime} from "luxon";
import {IconCheck, IconPencil, IconSquareX} from "@tabler/icons-react";
import {User} from "src/models/types.tsx";

export function UserManagementPage() {
    const PAGE_SIZE = 25;
    const getUsersApi = useApi(AdminUserApi.getUsers);
    const getUserDetailApi = useApi(AdminUserApi.getUser);
    const createUserApi = useApi(AdminUserApi.createUser);
    const [activePage, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User|null>(null)

    useEffect(() => {
        getUsersApi.request(activePage - 1, PAGE_SIZE);
    }, [activePage]);

    useEffect(() => {
        selectedUser && getUserDetailApi.request(selectedUser.userId);
    }, [selectedUser]);

    const rows = getUsersApi.data?.content?.map((user) => (
        <Table.Tr style={{cursor: 'pointer'}} bg={selectedUser?.userId === user.userId ? "#F4f4f4" : ''} key={user.userId} onClick={() => selectedUser?.userId === user.userId ? setSelectedUser(null) : setSelectedUser(user)}>
            <Table.Td> <Avatar src={user.picture} alt="Avatar" /></Table.Td>
            <Table.Td>{user.name}</Table.Td>
            <Table.Td>{DateTime.fromMillis(user.created).toLocaleString(DateTime.DATETIME_SHORT)}</Table.Td>
            <Table.Td>{user.emailVerified && <IconCheck color={'green'} size={20}/>}</Table.Td>
            <Table.Td><IconPencil color={'grey'} onClick={() => console.log("Edit")}/></Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Grid>
                <GridCol span={selectedUser ? 8 : 12 }>
                    <Table pos={'relative'}>
                        <LoadingOverlay visible={createUserApi.loading} />
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th></Table.Th>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Created</Table.Th>
                                <Table.Th>Email Verified</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows}
                        </Table.Tbody>
                    </Table>
                { (getUsersApi.data?.totalPages ?? 0) > 1 && <Pagination value={activePage} onChange={setPage} total={getUsersApi.data?.totalPages ?? 0} /> }
                </GridCol>

                { selectedUser && <GridCol span={4}>
                    Roles: { getUserDetailApi?.data?.roles }
                    History: {getUserDetailApi?.data?.history }
                </GridCol>}
            </Grid>
            </>
    );
}

export default UserManagementPage;
