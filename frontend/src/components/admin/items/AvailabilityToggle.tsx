import {Switch, Text, Tooltip} from "@mantine/core";
import {IconCheck, IconX} from "@tabler/icons-react";
import {AdminItem, Item} from "src/models/types.tsx";

interface AvailabilityToggleProps {
    item: AdminItem;
    disabled: boolean;
    onToggle: (item: Item) => void;
}

export function AvailabilityToggle({item, disabled, onToggle}: AvailabilityToggleProps) {
    const availability = item.availability?.toLowerCase();
    const isAvailable = availability === 'available';
    const isDiscontinued = availability === 'discontinued';
    const label = isAvailable ? 'Available' : isDiscontinued ? 'Discontinued' : 'Unavailable';
    const tooltip = isAvailable
        ? `Mark "${item.description}" unavailable (out of stock)`
        : `Mark "${item.description}" available again`;

    return (
        <Tooltip label={tooltip} withArrow position={'top'} openDelay={250}>
            <Switch
                size={'md'}
                color={'green'}
                w={140}
                checked={isAvailable}
                disabled={disabled}
                onChange={() => onToggle(item)}
                aria-label={tooltip}
                thumbIcon={isAvailable
                    ? <IconCheck size={12} color={'var(--mantine-color-green-6)'} stroke={3}/>
                    : <IconX size={12} color={isDiscontinued ? 'var(--mantine-color-gray-6)' : 'var(--mantine-color-red-6)'} stroke={3}/>}
                label={
                    <Text size={'sm'} fw={500} c={isAvailable ? 'green.7' : isDiscontinued ? 'dimmed' : 'red.7'}>
                        {label}
                    </Text>
                }
                styles={{
                    body: {alignItems: 'center'},
                    track: {cursor: 'pointer'},
                    label: {cursor: 'pointer', paddingInlineStart: 'var(--mantine-spacing-xs)'},
                }}
            />
        </Tooltip>
    );
}

export default AvailabilityToggle;
