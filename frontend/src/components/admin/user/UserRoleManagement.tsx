import { UserDetail } from "src/models/types.tsx";
import useApi from "src/hooks/useApi.tsx";
import AdminUserApi from "src/services/adminUserApi.tsx";
import { Box, Checkbox, Divider, Title, Text } from "@mantine/core";
import { ROLE_NAMES } from "src/models/constants.tsx";

interface UserRoleManagementProps {
    selectedUser: UserDetail | null;
    loading: boolean;
}

const UserRoleManagement = ({ selectedUser, loading }: UserRoleManagementProps) => {
    const updateUserApi = useApi(AdminUserApi.updateUser);

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (selectedUser?.userId) {
            updateUserApi.request(
                selectedUser.userId,
                checked ? [roleName] : [],
                !checked ? [roleName] : [],
            );
        }
    };

    const user =
        selectedUser?.userId &&
        updateUserApi?.data?.userId === selectedUser.userId
            ? updateUserApi.data
            : selectedUser;

    const checkboxes = ROLE_NAMES.map((value) => (
        <Checkbox
            indeterminate={loading}
            mt="xs"
            ml={33}
            label={value}
            key={value}
            checked={
                user?.roles?.map((i) => i.toLowerCase()).includes(value.toLowerCase()) ?? false
            }
            onChange={(event) => handleRoleChange(value, event.currentTarget.checked)}
        />
    ));

    return (
        <Box>
            <Title>Roles</Title>
            <Divider mb="sm" />

            {/* 🔍 DEBUG PANEL */}
            <Box
                p="sm"
                mb="sm"
                sx={(theme) => ({
                    backgroundColor: theme.colors.gray[1],
                    border: `1px solid ${theme.colors.gray[4]}`,
                    borderRadius: theme.radius.sm,
                    fontSize: 14,
                })}
            >
                <Text fw={500}>🔍 Debug Info</Text>
                <Text>loading: <b>{loading ? "true" : "false"}</b></Text>
                <Text>selectedUser: <b>{selectedUser ? "present ✅" : "null ❌"}</b></Text>
                <Text>user.userId: <b>{user?.userId ?? "N/A"}</b></Text>
                <Text>user.roles: <b>{user?.roles?.join(", ") || "none"}</b></Text>
                <Text>checkboxes count: <b>{checkboxes.length}</b></Text>
            </Box>

            {/* Only show checkboxes when data is ready */}
            {user && !loading ? (
                <Box>{checkboxes}</Box>
            ) : (
                <Text ml={33} mt="sm" c="dimmed">
                    {loading ? "Loading..." : "No user selected"}
                </Text>
            )}
        </Box>
    );
};

export default UserRoleManagement;
