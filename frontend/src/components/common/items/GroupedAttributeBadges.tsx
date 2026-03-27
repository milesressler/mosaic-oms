import { Box, Group, Text } from '@mantine/core';
import { ItemAttribute } from 'src/models/types';

type AttrObj   = Record<string, string | { value: string; displayValue: string }>;
type AttrArray = { name: string; value: string }[];

interface Props {
    attrs?: AttrObj | AttrArray;
    itemAttributes: ItemAttribute[];
}

const GroupedAttributeBadges = ({ attrs, itemAttributes }: Props) => {
    if (
        !attrs ||
        (Array.isArray(attrs) ? attrs.length === 0 : Object.keys(attrs).length === 0)
    ) {
        return <Text c="dimmed">‑</Text>;
    }

    const pairs: { name: string; value: string }[] = Array.isArray(attrs)
        ? attrs
        : Object.entries(attrs).map(([name, value]) => ({
            name,
            value: typeof value === 'string' ? value : value.displayValue || value.value
        }));

    // Build display list ordered by itemAttributes (which are pre-sorted by sortOrder from the backend)
    // This ensures the display order matches the order configured in item management
    type DisplayEntry = { name: string; value: string; label: string; groupName: string; groupOrder: number; sortOrder: number };
    const pairMap = pairs.reduce((acc, p) => { acc[p.name] = p.value; return acc; }, {} as Record<string, string>);

    const orderedEntries: DisplayEntry[] = itemAttributes
        .filter(def => pairMap[def.key] !== undefined)
        .map(def => ({
            name: def.key,
            value: pairMap[def.key],
            label: def.label,
            groupName: def.groupName || '__ungrouped__',
            groupOrder: def.groupOrder ?? 0,
            sortOrder: def.sortOrder ?? 0,
        }));

    // Group while preserving insertion order (which is already sorted by sortOrder)
    const grouped = orderedEntries.reduce((acc, entry) => {
        if (!acc[entry.groupName]) {
            acc[entry.groupName] = [];
        }
        acc[entry.groupName].push(entry);
        return acc;
    }, {} as Record<string, DisplayEntry[]>);

    // Within each group sort by groupOrder
    Object.values(grouped).forEach(group => {
        group.sort((a, b) => a.groupOrder - b.groupOrder);
    });

    return (
        <Group wrap="wrap" gap={6}>
            {Object.entries(grouped).map(([groupName, groupAttrs]) => {
                if (groupName === '__ungrouped__') {
                    // Render individual badges for ungrouped attributes
                    return groupAttrs.map((attr, i) => (
                        <Box
                            key={`${groupName}-${i}`}
                            style={{
                                display: 'flex',
                                overflow: 'hidden',
                                borderRadius: 9999,
                                fontSize: '0.85rem',
                                lineHeight: 1.3,
                            }}
                        >
                            <Box
                                px={4}
                                style={{
                                    background: '#d8eaff',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {attr.label}
                            </Box>
                            <Box
                                px={4}
                                style={{
                                    background: '#b3d5ff',
                                    display: 'flex',
                                    fontWeight: 600,
                                    alignItems: 'center',
                                    borderLeft: '1px solid #9bc5ff',
                                }}
                            >
                                {attr.value}
                            </Box>
                        </Box>
                    ));
                } else {
                    // Render grouped badge: "Size: W32 L34"
                    const groupValueString = groupAttrs
                        .map(attr => `${attr.label}${attr.value}`)
                        .join(' ');
                    
                    return (
                        <Box
                            key={groupName}
                            style={{
                                display: 'flex',
                                overflow: 'hidden',
                                borderRadius: 9999,
                                fontSize: '0.85rem',
                                lineHeight: 1.3,
                            }}
                        >
                            <Box
                                px={4}
                                style={{
                                    background: '#e8f5e8',   // light green for groups
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {groupName}
                            </Box>
                            <Box
                                px={4}
                                style={{
                                    background: '#c8e6c9',   // darker green for groups
                                    display: 'flex',
                                    fontWeight: 600,
                                    alignItems: 'center',
                                    borderLeft: '1px solid #a5d6a7',
                                }}
                            >
                                {groupValueString}
                            </Box>
                        </Box>
                    );
                }
            })}
        </Group>
    );
};

export default GroupedAttributeBadges;