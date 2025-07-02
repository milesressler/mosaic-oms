import {Text, Paper, Group} from "@mantine/core";
import {IconFlag} from "@tabler/icons-react";

interface props {
    key: string,
    useAlternateStyle?: boolean,
    text: string,
    flagged?: boolean,
    onClick: (customerUuid: string) => void
}

export const CustomerResultCard = ({onClick, key, text, useAlternateStyle, flagged }: props) => {
    return (
        <Paper
            key={key}
            withBorder
            p="xs"
            radius="md"
            style={(theme) => ({
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                backgroundColor: flagged ? theme.colors.red[0] : useAlternateStyle ? theme.colors.gray[0] : 'transparent',
                border: useAlternateStyle ? `1px solid ${theme.colors.blue[5]}` : '1px solid transparent',
                '&:hover': {
                    backgroundColor: useAlternateStyle ? theme.colors.blue[1] : theme.colors.gray[1]
                },
                textAlign: useAlternateStyle ? 'center' : 'left',
            })}
            onClick={() => onClick(key)}
            shadow="xs"
            className={'customerResultCard'}
        >
            <Group justify={'space-between'}>
                <Text size="sm" fw={useAlternateStyle ? 500 : 400}>{text}</Text>
                {flagged && <IconFlag color={'red'}/>}
            </Group>
        </Paper>
    )
}

export default CustomerResultCard;
