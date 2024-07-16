import {Avatar, Group, Text, UnstyledButton} from "@mantine/core";
import classes from "./css/HeaderSearch.module.css";
import {useAuth0} from "@auth0/auth0-react";

export function UserCard() {
    const { user } = useAuth0();

    return (<><UnstyledButton className={classes.user}>
        <Group>
            <Avatar
                imageProps={{ referrerPolicy: "no-referrer" }}
                src={user?.picture}
                // src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
                radius="xl"
            />

            <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                    {user?.name}
                </Text>

                <Text c="dimmed" size="xs">
                    {user?.email}
                </Text>
            </div>
        </Group>
    </UnstyledButton></>
    );
}
export default UserCard;

