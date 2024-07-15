import {AppShell, Divider, Stack, Text} from "@mantine/core";

export function ActivityFeed() {
    return (
        <Stack>
            <div>
                <Text >Bill created an order for Jim</Text>
                <Text c="dimmed" size="sm">3 minutes ago</Text>
                <AppShell.Section/>
            </div>
            <Divider my="md" />
            <div>
                <Text >Bill created an order for Jim</Text>
                <Text c="dimmed" size="sm">3 minutes ago</Text>
                <AppShell.Section c={"dimmed"}/>
            </div>
        </Stack>);
}

export default ActivityFeed;
