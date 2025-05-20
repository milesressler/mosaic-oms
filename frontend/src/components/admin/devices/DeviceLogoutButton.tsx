// DeviceLogoutButton.tsx
import { Button } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import useApi from "src/hooks/useApi.tsx";
import devicesApi from "src/services/devicesApi.tsx";
import {useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";

export const DeviceLogoutButton = () => {
    const deviceLogoutApi = useApi(devicesApi.logoutKiosk); // logoutDevice should call /api/device/logout
    const deviceTest = useApi(devicesApi.whoAmI);

    const [ isLoggedin, setIsLoggedIn ] = useState(false);

    const { isAuthenticated, isLoading } = useAuth0();


    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            deviceTest.request();
        }
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        setIsLoggedIn((deviceTest.data === 'connected'));
    }, [deviceTest.data]);

    const handleLogout = async () => {
        deviceLogoutApi.request().then(() => setIsLoggedIn(false));
    };

    return isLoggedin ? (
        <Button
            variant="outline"
            color="gray"
            leftSection={<IconLogout size={16} />}
            onClick={handleLogout}
        >
            Device Deregister
        </Button>
    ) : <></>;
};
