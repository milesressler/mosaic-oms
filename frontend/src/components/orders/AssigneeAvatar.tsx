import { useDisclosure } from '@mantine/hooks';
import { Group, Avatar, Popover, Text } from '@mantine/core';

interface Props {
    assigned?: { name?: string; avatar?: string };
}

export const AssigneeAvatar = ({ assigned }: Props) => {
    const [opened, { toggle, close }] = useDisclosure(false);

    return (
        <Group justify="flex-start" gap={5} wrap="nowrap">
            <Popover
                opened={opened}
                onChange={toggle}
                position="bottom-start"
                withArrow
                shadow="md"
                withinPortal
            >
                <Popover.Target>
                    <Avatar
                        src={assigned?.avatar}
                        color={assigned && !assigned.avatar ? 'indigo' : ''}
                        size="sm"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();   // ← don’t trigger the row’s onClick
                            toggle();
                        }}
                        onTouchStart={(e) => {
                            e.stopPropagation();
                            toggle();               // same for mobile tap
                        }}
                    />
                </Popover.Target>

                <Popover.Dropdown
                    p="xs"
                    onClick={close}             // close when user taps inside card
                >
                    <Text size="sm">
                        {assigned?.name ?? 'Unassigned'}
                    </Text>
                </Popover.Dropdown>
            </Popover>
        </Group>
    );
};
