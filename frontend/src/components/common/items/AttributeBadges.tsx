import { Box, Group, Text } from '@mantine/core';

type AttrObj   = Record<string, string | { value: string; displayValue: string }>;
type AttrArray = { name: string; value: string }[];

interface Props {
    attrs?: AttrObj | AttrArray;
}

const AttributeBadges = ({ attrs }: Props) => {
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

    return (
        <Group wrap="wrap" gap={6}>
            {pairs.map(({ name, value }, i) => (
                <Box
                    key={i}
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
                        {name}
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
                        {value}
                    </Box>
                </Box>
            ))}
        </Group>
    );
};

export default AttributeBadges;