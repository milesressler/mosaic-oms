import { useAuth0 } from "@auth0/auth0-react";
import {Button} from "@mantine/core";

export const LogoutButton = () => {
    const { logout } = useAuth0();


    const handleLogout = () => {
        logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
    };

    return (
        <Button variant={'outline'} onClick={handleLogout}>
            Log Out
        </Button>
    );
};
