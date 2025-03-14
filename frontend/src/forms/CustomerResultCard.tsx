import { Text, Paper } from "@mantine/core";

interface props {
    key: string,
    useAlternateStyle?: boolean,
    text: string,
    onClick: (customerUuid: string) => void
}

export const CustomerResultCard = ({onClick, key, text, useAlternateStyle }: props) => {
    return (
        <Paper
            key={key}
            withBorder
            p="xs"
            radius="md"
            style={(theme) => ({
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                backgroundColor: useAlternateStyle ? theme.colors.gray[0] : 'transparent',
                border: useAlternateStyle ? `1px solid ${theme.colors.blue[5]}` : '1px solid transparent',
                '&:hover': {
                    backgroundColor: useAlternateStyle ? theme.colors.blue[1] : theme.colors.gray[1]
                },
                textAlign: useAlternateStyle ? 'center' : 'left',
            })}
            onClick={() => onClick(key)}
            shadow="xs"
        >
            <Text size="sm" fw={useAlternateStyle ? 500 : 400}>{text}</Text>
        </Paper>
    )
}

export default CustomerResultCard;
