import { useAuth0 } from "@auth0/auth0-react";
import {Button} from "@mantine/core";

const LoginButton = () => {
    const { loginWithRedirect } = useAuth0();

    const handleLogin = async () => {
        await loginWithRedirect({
            appState: {
                returnTo: "/dashboard/filler",
            },
        });
    };
    return <Button  variant={'outline'} onClick={handleLogin}>Log In</Button>;
};

export default LoginButton;
