import { BasicUser } from "src/models/types.tsx";
import { Avatar, Text, Group, Box } from "@mantine/core";

interface props {
    user: { name: string; avatar?: string } | BasicUser;
    lastInitial?: boolean;
}

const formatNameWithLastInitial = (name: string): string => {
    if (!name || name === "Unknown") return name;
    
    const parts = name.trim().split(/\s+/);
    
    if (parts.length === 1) {
        // Only one name part, return as is
        return parts[0];
    } else if (parts.length === 2) {
        // First and last name
        return `${parts[0]} ${parts[1].charAt(0)}.`;
    } else {
        // 3+ parts: take first name and last part's initial
        return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
};

export const    UserAvatar = ({ user, lastInitial }: props) => {
    const displayName = lastInitial 
        ? formatNameWithLastInitial(user.name ?? "Unknown")
        : (user.name ?? "Unknown");

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
                    {displayName}
                </Text>
            </Group>
        </Box>
    );
};

export default UserAvatar;
