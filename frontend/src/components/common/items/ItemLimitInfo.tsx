import {Badge, Group, Stack, Text, Tooltip} from "@mantine/core";
import {IconAlertTriangle, IconRepeat} from "@tabler/icons-react";
import {ItemLimitRule, ItemLimitStatus} from "src/models/types.tsx";
import {
    formatLastReceived,
    formatLimitRule,
    formatLimitWindow,
    formatNextEligible,
    formatReceivedInPeriod,
    isOverLimit
} from "src/utils/ItemLimitUtils.tsx";

interface Props {
    rule: ItemLimitRule;
    status?: ItemLimitStatus | null;
    /** Units being ordered; used to work out over-limit for live statuses */
    requested?: number;
    /** The status is an order snapshot, so describe it relative to when the order was taken */
    snapshot?: boolean;
    /** One line, for item picker cards */
    compact?: boolean;
}

export function ItemLimitInfo({rule, status, requested, snapshot = false, compact = false}: Props) {
    const overLimit = status
        ? (snapshot ? !!status.overLimit : isOverLimit(status, requested ?? 0))
        : false;
    // Shown in the picker before anything is added: at limit means one more would be over
    const atLimit = !!status && status.remaining === 0;
    const warn = overLimit || (!snapshot && requested === undefined && atLimit);
    const nextEligible = status ? formatNextEligible(status) : null;

    if (compact) {
        return (
            <Group gap={4} wrap="nowrap">
                {warn
                    ? <IconAlertTriangle size={12} color="var(--mantine-color-orange-7)" style={{flexShrink: 0}}/>
                    : <IconRepeat size={12} color="var(--mantine-color-gray-6)" style={{flexShrink: 0}}/>}
                <Text size="xs" c={warn ? 'orange.8' : 'dimmed'} lh={1.2}>
                    {warn && nextEligible ? nextEligible : formatLimitRule(rule)}
                </Text>
            </Group>
        );
    }

    return (
        <Stack gap={2}>
            <Group gap={4} wrap="wrap">
                <Tooltip label={`Limited item: ${formatLimitRule(rule)}, ${formatLimitWindow(rule)}`} withArrow>
                    <Badge size="sm" variant="light" color={overLimit ? 'orange' : 'gray'}
                           leftSection={<IconRepeat size={10}/>}>
                        {formatLimitRule(rule)}
                    </Badge>
                </Tooltip>
                {overLimit && (
                    <Badge size="sm" variant="filled" color="orange" leftSection={<IconAlertTriangle size={10}/>}>
                        Over limit
                    </Badge>
                )}
            </Group>
            {status && (
                <>
                    <Text size="xs" c="dimmed">
                        {formatLastReceived(status, snapshot)} · {formatReceivedInPeriod(status)}
                    </Text>
                    {(overLimit || atLimit) && nextEligible && (
                        <Text size="xs" c="orange.8" fw={500}>{nextEligible}</Text>
                    )}
                </>
            )}
        </Stack>
    );
}

export default ItemLimitInfo;
