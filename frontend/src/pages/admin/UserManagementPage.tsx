import {
    Avatar, Box,
    Button,
    Grid,
    GridCol,
    Group,
    LoadingOverlay,
    Modal,
    Pagination,
    Table,
    Text,
    Tooltip,
} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import {MouseEvent, useEffect, useState} from "react";
import AdminUserApi from "src/services/adminUserApi.tsx";
import {DateTime} from "luxon";
import {IconCircleCheck} from "@tabler/icons-react";
import {User} from "src/models/types.tsx";
import EmailInputForm from "src/components/auth0/EmailInputForm.tsx";
import UserRoleManagement from "src/components/admin/user/UserRoleManagement.tsx";
import UserHistory from "src/components/admin/user/UserHistory.tsx";

export function UserManagementPage() {
    const PAGE_SIZE = 25;
    const getUsersApi = useApi(AdminUserApi.getUsers);
    const getUserDetailApi = useApi(AdminUserApi.getUser);
    const createUserApi = useApi(AdminUserApi.createUser);
    const resendInviteApi = useApi(AdminUserApi.resendInvite);
    const [activePage, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User|null>(null)
    const [inviteModal, setInviteModal] = useState(false);

    const refreshList = () => getUsersApi.request(activePage - 1, PAGE_SIZE);

    useEffect(() => {
        refreshList();
    }, [activePage]);

    useEffect(() => {
        selectedUser && getUserDetailApi.request(selectedUser.userId);
    }, [selectedUser]);

    useEffect(() => {
        if(createUserApi.data) {
            setInviteModal(false);
            refreshList();
        }
    }, [createUserApi.data]);

    const inviteUser = (email: string, name: string) => {
        createUserApi.request(email, name);
    }
    const resendInvite = (event: MouseEvent, user: User) => {
        event.stopPropagation();
        resendInviteApi.request(user.userId);
    }

    const rows = getUsersApi.data?.content?.map((user) => (
        <Table.Tr style={{cursor: 'pointer'}} bg={selectedUser?.userId === user.userId ? "#F4f4f4" : ''} key={user.userId} onClick={() => selectedUser?.userId === user.userId ? setSelectedUser(null) : setSelectedUser(user)}>
            <Table.Td> <Avatar src={user.picture} alt="Avatar" /></Table.Td>
            <Table.Td>{user.name}</Table.Td>
            <Table.Td>{DateTime.fromMillis(user.created).toLocaleString(DateTime.DATETIME_SHORT)}</Table.Td>
            <Table.Td><Text c='dimmed'>{user.lastLogin && DateTime.fromMillis(user.lastLogin).toRelative()}</Text></Table.Td>
            <Table.Td>
                <Group >
                { user.email }
                {user.emailVerified &&
                    <Tooltip label="Verified"><IconCircleCheck color={'green'} size={20}/></Tooltip>}
                { !user.emailVerified && <Button size={'xs'} variant={'outline'} loading={resendInviteApi.loading} onClick={(clickEvent) => resendInvite(clickEvent, user)} >Resend</Button> }
                </Group>
            </Table.Td>
            {/*<Table.Td><IconPencil color={'grey'} onClick={() => console.log("Edit")}/></Table.Td>*/}
        </Table.Tr>
    ));

    return (
        <>
            <Grid>
                <GridCol span={selectedUser ? 8 : 12 }>
                    <Table pos={'relative'}>
                        {/*<LoadingOverlay visible={createUserApi.loading} />*/}
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th></Table.Th>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Created</Table.Th>
                                <Table.Th>Last Logged In</Table.Th>
                                <Table.Th>Email</Table.Th>
                                {/*<Table.Th></Table.Th>*/}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows}

                            <Table.Tr span={5} >
                                <Table.Td
                                colSpan={6} >
                                    <Group justify={"flex-end"}>

                                    <Button onClick={() => setInviteModal(true)}>Invite User</Button>
                                </Group>

                                </Table.Td>

                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                { (getUsersApi.data?.totalPages ?? 0) > 1 && <Pagination value={activePage} onChange={setPage} total={getUsersApi.data?.totalPages ?? 0} /> }
                </GridCol>

                { selectedUser && <GridCol span={4}><Box pos={'relative'}>

                    <LoadingOverlay visible={getUserDetailApi.loading}/>
                    <UserRoleManagement selectedUser={getUserDetailApi.data} loading={getUserDetailApi.loading}></UserRoleManagement>
                    <UserHistory selectedUser={getUserDetailApi.data} loading={getUserDetailApi.loading}></UserHistory>
                </Box>
                </GridCol>}
            </Grid>
            <Modal opened={inviteModal} onClose={() => setInviteModal(false)}>
              <EmailInputForm loading={createUserApi.loading} onSubmit={inviteUser}/>
            </Modal>
            </>
    );
}

export default UserManagementPage;
