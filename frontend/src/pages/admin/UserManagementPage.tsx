import {
    Avatar, Box,
    Button,
    Group,
    Modal,
    Pagination, Stack,
    Table,
    Text,
    Tooltip
} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import {MouseEvent, useEffect, useState} from "react";
import AdminUserApi from "src/services/adminUserApi.tsx";
import {DateTime} from "luxon";
import {IconAt, IconBrandGoogleFilled, IconCircleCheck} from "@tabler/icons-react";
import {User} from "src/models/types.tsx";
import EmailInputForm from "src/components/auth0/EmailInputForm.tsx";
import UserRoleManagement from "src/components/admin/user/UserRoleManagement.tsx";
import UserHistory from "src/components/admin/user/UserHistory.tsx";

export function UserManagementPage() {
    const PAGE_SIZE = 75;
    const getUsersApi = useApi(AdminUserApi.getUsers);
    const getUserDetailApi = useApi(AdminUserApi.getUser);
    const createUserApi = useApi(AdminUserApi.createUser);
    const resendInviteApi = useApi(AdminUserApi.resendInvite);
    const [activePage, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [inviteModal, setInviteModal] = useState(false);
    const [roleModal, setRoleModal] = useState(false);

    const refreshList = () => getUsersApi.request(activePage - 1, PAGE_SIZE);

    useEffect(() => {
        refreshList();
    }, [activePage]);

    useEffect(() => {
        if (selectedUser) {
            getUserDetailApi.request(selectedUser.userId);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (createUserApi.data) {
            setInviteModal(false);
            refreshList();
        }
    }, [createUserApi.data]);

    const inviteUser = (email: string, name: string) => {
        createUserApi.request(email, name);
    };

    const resendInvite = (event: MouseEvent, user: User) => {
        event.stopPropagation();
        resendInviteApi.request(user.userId);
    };

    const rows = getUsersApi.data?.content?.map((user) => (
        <Table.Tr
            style={{ cursor: 'pointer' }}
            bg={selectedUser?.userId === user.userId ? "#F4F4F4" : ''}
            key={user.userId}
            onClick={() => {
                setSelectedUser(user);
                setRoleModal(true);
            }}
        >
            <Table.Td><Avatar size={'sm'} src={user.picture} alt="Avatar" /></Table.Td>
            <Table.Td>
                <Stack gap={0}>
                    <Text>
                {user.name}
                    </Text>
                    <Group gap={4}>
                        {user.emailVerified && <Tooltip label="Verified"><IconCircleCheck color={'green'} size={20} /></Tooltip>}
                        <Text size={'sm'} c={'dimmed'}>
                            {user.email}
                        </Text>
                        {!user.emailVerified && (
                            <Button size={'xs'} variant={'outline'} loading={resendInviteApi.loading} onClick={(e) => resendInvite(e, user)}>
                                Resend
                            </Button>
                        )}
                    </Group>
                </Stack>
            </Table.Td>
            <Table.Td>
                <Stack gap={0}>{user.sources?.map(source => source.toLowerCase() === "google" ?
                <Tooltip label="Google" withArrow><IconBrandGoogleFilled size={'18'}/></Tooltip> :
                <Tooltip label="Username/password" withArrow><IconAt size={18}/></Tooltip>)
            }
                </Stack>
            </Table.Td>
            <Table.Td>{DateTime.fromMillis(user.created).toLocaleString(DateTime.DATE_MED)}</Table.Td>
            <Table.Td><Text c='dimmed' size={'xs'}>{user.lastLogin && DateTime.fromMillis(user.lastLogin).toRelative()}</Text></Table.Td>

        </Table.Tr>
    ));

    return (
        <>
            <Box style={{ overflowX: 'auto' }}>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th></Table.Th>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Src</Table.Th>
                            <Table.Th>Created</Table.Th>
                            <Table.Th>Last Login</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows}
                        <Table.Tr>
                            <Table.Td colSpan={5}>
                                <Group justify="flex-end">
                                    <Button onClick={() => setInviteModal(true)}>Invite User</Button>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </Box>
            {(getUsersApi.data?.totalPages ?? 0) > 1 && <Pagination value={activePage} onChange={setPage} total={getUsersApi.data?.totalPages ?? 0} />}

            <Modal title="User Details" opened={roleModal} onClose={() => { setRoleModal(false); setSelectedUser(null); }}>
                {/*<LoadingOverlay visible={getUserDetailApi.loading} />*/}
                {/*<Box mb="sm" style={{ backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "5px" }}>*/}
                {/*    <Text size="sm" fw={500}>🔍 Parent Debug Info</Text>*/}
                {/*    <Text size="xs">selectedUser (from list): <b>{selectedUser?.userId || 'null'}</b></Text>*/}
                {/*    <Text size="xs">getUserDetailApi.loading: <b>{getUserDetailApi.loading.toString()}</b></Text>*/}
                {/*    <Text size="xs">getUserDetailApi.data: <b>{getUserDetailApi.data?.userId || 'null'}</b></Text>*/}
                {/*    <Text size="xs">getUserDetailApi.error: <b>{getUserDetailApi.error || 'null'}</b></Text>*/}
                {/*    <Text size="xs">getUserDetailApi.data.roles: <b>{getUserDetailApi.data?.roles?.join(', ') || 'none'}</b></Text>*/}
                {/*</Box>*/}
                {selectedUser && (
                    <>
                        <UserRoleManagement selectedUser={getUserDetailApi.data} loading={getUserDetailApi.loading} error={getUserDetailApi.error} />
                        <UserHistory selectedUser={getUserDetailApi.data} loading={getUserDetailApi.loading} />
                    </>
                )}
            </Modal>

            <Modal title={"Invite New User"} opened={inviteModal} onClose={() => setInviteModal(false)}>
                <EmailInputForm loading={createUserApi.loading} onSubmit={inviteUser} />
            </Modal>
        </>
    );
}

export default UserManagementPage;
