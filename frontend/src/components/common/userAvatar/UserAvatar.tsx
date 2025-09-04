import { BasicUser } from "src/models/types.tsx";
import { Avatar, Text, Group, Box } from "@mantine/core";

interface props {
    user: { name: string; avatar?: string } | BasicUser;
}

export const    UserAvatar = ({ user }: props) => {
    return (
        <Box
            style={{
                display: 'inline-block',
                padding: '0px 5px 0px 0px',
                border: `2px solid #EEE`,
                borderRadius: '12px',
                textAlign: 'center',
                whiteSpace: 'nowrap', // Prevent line breaks
                cursor: "pointer",
            }}
        >
            <Group gap={5} wrap="nowrap">
                <Avatar size={18} src={user.avatar} />
                <Text fz="sm" fw={500} c={'#666'}>
                    {user.name ?? "Unknown"}
                </Text>
            </Group>
        </Box>
    );
};

export default UserAvatar;
