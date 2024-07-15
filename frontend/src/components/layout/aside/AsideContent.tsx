import {Divider, Group, Title} from "@mantine/core";
import ActivityFeed from "src/components/layout/aside/ActivityFeed.tsx";

export function AsideContent() {
    return(
    <div style={{padding: '7px'}}>
        <Group justify="space-between">
            <Title>Activity</Title>
        </Group>
        <Divider style={{marginTop: "5px", marginBottom: '5px'}}></Divider>
        <ActivityFeed/>
    </div>);
}
export default AsideContent;
