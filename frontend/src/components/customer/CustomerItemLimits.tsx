import {Badge, Box, Button, Card, Divider, Group, Skeleton, Stack, Text, Tooltip, useMantineTheme} from "@mantine/core";
import {IconArrowRight, IconCheck, IconClock, IconPlus, IconRepeat} from "@tabler/icons-react";
import {useEffect} from "react";
import {useDisclosure} from "@mantine/hooks";
import {useNavigate} from "react-router-dom";
import useApi from "src/hooks/useApi.tsx";
import CustomersApi from "src/services/customersApi.tsx";
import {CustomerItemLimit} from "src/models/types.tsx";
import RecordPickupModal from "src/components/customer/RecordPickupModal.tsx";
import {
    formatLastReceived,
    formatLimitRule,
    formatLimitWindow,
    formatNextEligible,
    formatReceivedInPeriod
} from "src/utils/ItemLimitUtils.tsx";

interface Props {
    customerUuid: string;
}

// Only items that affect what the customer can get right now; the rest are summarized in one line
const isRelevant = (limit: CustomerItemLimit) =>
    limit.status.remaining === 0 || limit.status.receivedInPeriod > 0;

/**
 * Where a customer stands on limited items, for walk-up questions like "can I get a coat today?".
 * Full detail lives on the item history page.
 */
export function CustomerItemLimits({customerUuid}: Props) {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const itemLimitsRequest = useApi(CustomersApi.getItemLimits);
    const [recordOpened, {open: openRecord, close: closeRecord}] = useDisclosure(false);

    useEffect(() => {
        itemLimitsRequest.request(customerUuid);
    }, [customerUuid]);

    const allLimits = itemLimitsRequest.data ?? [];
    // Not eligible first
    const relevant = allLimits.filter(isRelevant)
        .sort((a, b) => a.status.remaining - b.status.remaining || a.description.localeCompare(b.description));
    const otherCount = allLimits.length - relevant.length;

    // Nothing to show until an admin limits at least one item
    if (!itemLimitsRequest.loading && allLimits.length === 0) {
        return null;
    }

    return (
        <>
            <Divider
                label={
                    <Group gap={4}>
                        <IconRepeat size={16}/>
                        <Text fw={600} size="sm" c={theme.black}>
                            Limited Items
                        </Text>
                    </Group>
                }
                labelPosition="center"
            />
            <RecordPickupModal
                customerUuid={customerUuid}
                opened={recordOpened}
                onClose={closeRecord}
                onSaved={() => itemLimitsRequest.request(customerUuid, {silent: true})}
            />
            <Card withBorder shadow="sm" padding="lg" radius="md" style={{backgroundColor: '#f9f9fb'}}>
                {itemLimitsRequest.loading ? (
                    <Stack gap="sm">
                        {[...Array(2)].map((_, idx) => (
                            <Skeleton height={30} radius="sm" key={idx}/>
                        ))}
                    </Stack>
                ) : (
                    <Stack gap="sm">
                        {relevant.map((limit) => {
                            const {status} = limit;
                            const eligible = status.remaining > 0;
                            return (
                                <Box
                                    key={limit.itemId}
                                    p="sm"
                                    style={{border: '1px solid #eee', borderRadius: 8, backgroundColor: 'white'}}
                                >
                                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                                        <Stack gap={2} style={{flex: 1}}>
                                            <Group gap="xs">
                                                <Text fw={500} c={theme.black}>{limit.description}</Text>
                                                <Tooltip label={formatLimitWindow(status.rule)} withArrow>
                                                    <Badge size="sm" variant="light" color="gray">
                                                        {formatLimitRule(status.rule)}
                                                    </Badge>
                                                </Tooltip>
                                            </Group>
                                            <Text size="xs" c="dimmed">
                                                {formatLastReceived(status, false)} · {formatReceivedInPeriod(status)}
                                            </Text>
                                        </Stack>
                                        {eligible ? (
                                            <Badge color="green" variant="light" leftSection={<IconCheck size={10}/>}>
                                                {status.remaining} more allowed
                                            </Badge>
                                        ) : (
                                            <Badge color="orange" variant="light" leftSection={<IconClock size={10}/>}>
                                                {formatNextEligible(status) ?? 'Not eligible'}
                                            </Badge>
                                        )}
                                    </Group>
                                </Box>
                            );
                        })}
                        {otherCount > 0 && (
                            <Text size="sm" c="dimmed">
                                {relevant.length === 0
                                    ? `Eligible for all ${otherCount} limited item${otherCount === 1 ? '' : 's'}.`
                                    : `Plus ${otherCount} other limited item${otherCount === 1 ? '' : 's'} they're eligible for.`}
                            </Text>
                        )}
                    </Stack>
                )}
                <Group justify="space-between" mt="sm">
                    <Button size="xs" variant="subtle" leftSection={<IconPlus size={14}/>} onClick={openRecord}>
                        Record past pickup
                    </Button>
                    <Button size="xs" variant="default" rightSection={<IconArrowRight size={14}/>}
                            onClick={() => navigate(`/customer/${customerUuid}/items?limited=true`)}>
                        Limited item history
                    </Button>
                </Group>
            </Card>
        </>
    );
}

export default CustomerItemLimits;
