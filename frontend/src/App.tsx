import './App.css'
import {Auth0ProviderWithNavigate} from "src/components/auth0/Auth0ProviderWithNavigate.tsx";
import {AuthContextProvider, useAuthContext} from "src/contexts/AuthContext";
import '@mantine/core/styles.css';

import {MantineProvider} from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import {AppShellComponent} from "src/components/layout/AppShellComponent.tsx";
import { StompSessionProvider} from "react-stomp-hooks";
import { CookiesProvider, useCookies} from "react-cookie";
import {useAuth0} from "@auth0/auth0-react";
const SERVER_URL = import.meta.env.VITE_API_SERVER_URL;

function Interior({}) {
    const {token} = useAuthContext();
    const { isAuthenticated } = useAuth0();
    const [cookies] = useCookies(['cookie-name']);

    return <StompSessionProvider
        enabled={isAuthenticated}
        // url={`${SERVER_URL}/ws`}
        url={`${SERVER_URL.replace("http", "ws")}/ws`}
        connectHeaders={{
            Authorization: `${token}`,
            // 'X-CSRF-TOKEN': cookies["XSRF-TOKEN"],
            'X-XSRF-TOKEN': cookies["XSRF-TOKEN"],
        }}
        // debug={(str) => {
        //     console.log(str);
        // }}
    >
        <AppShellComponent/>
    </StompSessionProvider>
}

function App() {
  return (
    <><MantineProvider>
        <Notifications/>
            <CookiesProvider defaultSetOptions >
                <Auth0ProviderWithNavigate>
                        <AuthContextProvider>
                            <Interior/>
                        </AuthContextProvider>
                </Auth0ProviderWithNavigate>
            </CookiesProvider>
    </MantineProvider>
    </>
  )
}

export default App
