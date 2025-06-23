import { UserDetail } from "src/models/types.tsx";
import useApi from "src/hooks/useApi.tsx";
import AdminUserApi from "src/services/adminUserApi.tsx";
import {
    Box,
    Checkbox,
    Divider,
    Title,
    Text,
    Stack,
    Loader,
    Center,
} from "@mantine/core";
import { ROLE_NAMES } from "src/models/constants.tsx";
import {IconExclamationCircle} from "@tabler/icons-react";

interface UserRoleManagementProps {
    selectedUser: UserDetail | null;
    loading: boolean;
    error: string;
}

const UserRoleManagement = ({ selectedUser, loading, error }: UserRoleManagementProps) => {
    const updateUserApi = useApi(AdminUserApi.updateUser);

    const isUpdating = updateUserApi.loading;
    const isLoading = loading;
    const user =
        selectedUser?.userId &&
        updateUserApi?.data?.userId === selectedUser.userId
            ? updateUserApi.data
            : selectedUser;

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (!selectedUser?.userId) return;

        updateUserApi.request(
            selectedUser.userId,
            checked ? [roleName] : [],
            !checked ? [roleName] : []
        );
    };

    return (
        <Box>
            <Title>Roles</Title>
            <Divider mb="sm" />

            {isLoading && (
                <Center mt="md">
                    <Loader size="sm" />
                    <Text ml="sm">Loading user roles...</Text>
                </Center>
            )}

            {!selectedUser && !error && !isLoading && (
                <Text ml={33} mt="sm" c="dimmed">
                    No user selected
                </Text>
            )}

            {error && !isLoading && (
                <Stack gap={0}>
                    <Center>
                        <IconExclamationCircle color={'red'}/>
                    </Center>
                    <Center>
                        <Text c="red">
                            {error}
                        </Text>
                    </Center>
                </Stack>
            )}

            {selectedUser && !user?.roles?.length && !isLoading && (
                <Text ml={33} mt="sm" c="dimmed">
                    No roles found for this user.
                </Text>
            )}

            {user && user.roles && !isLoading && (
                <Stack ml={33}>
                    {ROLE_NAMES.map((roleName) => (
                        <Checkbox
                            key={roleName}
                            label={roleName}
                            checked={
                                user.roles
                                    .map((r) => r.toLowerCase())
                                    .includes(roleName.toLowerCase())
                            }
                            onChange={(e) =>
                                handleRoleChange(roleName, e.currentTarget.checked)
                            }
                            disabled={isUpdating}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default UserRoleManagement;
