import {UserDetail} from "src/models/types.tsx";
import {Box, Text, Divider, Stack, Title} from "@mantine/core";
import {DateTime} from "luxon";

interface UserHistoryProps {
    selectedUser: UserDetail|null;
    loading: boolean;
}


const UserHistory = ({ selectedUser}: UserHistoryProps) => {
    const history = selectedUser?.userActions?.map((action) => (
        <Stack gap={0} mb={10}>
            <Text>Updated order {action.orderId} status to {action.action}</Text>
            <Text c={'dimmed'} size={'sm'}>{DateTime.fromMillis(action.timestamp).toLocaleString(DateTime.DATETIME_MED)}</Text>
            <Divider/>
        </Stack>
    ));

    return (<Box>
        <Title>Activity</Title>
        <Divider/>
        {selectedUser && <>
            {history}
        </>}
    </Box>)
}

export default UserHistory;
