import { Box, Group, Text } from '@mantine/core';

type AttrObj   = Record<string, string>;
type AttrArray = { name: string; value: string }[];

interface Props {
    attrs?: AttrObj | AttrArray;
}

const AttributeBadges = ({ attrs }: Props) => {
    // ── nothing to show ───────────────────────────────────
    if (
        !attrs ||
        (Array.isArray(attrs) ? attrs.length === 0 : Object.keys(attrs).length === 0)
    ) {
        return <Text c="dimmed">‑</Text>;
    }

    const pairs: { name: string; value: string }[] = Array.isArray(attrs)
        ? attrs
        : Object.entries(attrs).map(([name, value]) => ({ name, value }));

    return (
        <Group wrap="wrap" gap={6}>
            {pairs.map(({ name, value }, i) => (
                <Box
                    key={i}
                    style={{
                        display: 'flex',
                        overflow: 'hidden',
                        borderRadius: 9999, // pill
                        fontSize: '0.85rem', // slightly larger than xs
                        lineHeight: 1.3,
                    }}
                >
                    {/* left half (key) */}
                    <Box
                        px={4}
                        style={{
                            background: '#d8eaff',   // light blue
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {name}
                    </Box>

                    {/* right half (value) */}
                    <Box
                        px={4}
                        style={{
                            background: '#b3d5ff',   // darker blue
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
