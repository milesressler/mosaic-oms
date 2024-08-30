import {BasicUser, UserDetail} from "src/models/types.tsx";
import {Avatar, Text,Group, Badge, Box } from "@mantine/core";

interface props {
    user: BasicUser;
}

export const UserAvatar = ({user}: props) => {
    return (
        <Box
            style={{
                display: 'inline-block',
                padding: '0px 5px 0px 0px',
                border: `2px solid #EEE`,
                borderRadius: '12px', // Elliptical border radius
                textAlign: 'center',
                cursor: "pointer"
            }}
        >
        <Group gap={5}>
        <Avatar size={18} src={user.avatar} mr={0}/>
        <Text fz="sm" fw={500} ml={0} c={'#666'}>
            {user.name ?? "Unknown"}
        </Text>
    </Group>
        </Box>
    )
}

export default UserAvatar;
