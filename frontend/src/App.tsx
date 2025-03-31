import './App.css'
import {Auth0ProviderWithNavigate} from "src/components/auth0/Auth0ProviderWithNavigate.tsx";
import {AuthContextProvider, useAuthContext} from "src/contexts/AuthContext";
import '@mantine/core/styles.css';

import {createTheme, MantineProvider} from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import {AppShellComponent} from "src/components/layout/AppShellComponent.tsx";
import { StompSessionProvider} from "react-stomp-hooks";
import { CookiesProvider, useCookies} from "react-cookie";
import {useAuth0} from "@auth0/auth0-react";
import {PreferencesProvider} from "src/contexts/PreferencesContext.tsx";
import {FeaturesProvider} from "src/contexts/FeaturesContext.tsx";
const WS_URL = import.meta.env.VITE_API_WEBSOCKET_URL;


const theme = createTheme({
    components: {
        Table: {
            styles: {
                th: {
                    backgroundColor: '#f1f3f5', // soft gray for table header
                    color: '#555', // default black text color
                    fontWeight: 'bold', // make the header text bold
                },
            },
        },
        Modal: {
            styles: {
                header: {
                    backgroundColor: '#f1f3f5', // soft gray from Mantine's palette
                    color: '#1a1b1e', // default black text
                    padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
                    borderBottom: '1px solid #dee2e6',
                },
            },
        },
    },
});

function Interior({}) {
    const {token} = useAuthContext();
    const { isAuthenticated } = useAuth0();
    const [cookies] = useCookies(['cookie-name']);

    return <StompSessionProvider
        enabled={isAuthenticated}
        // url={`${SERVER_URL}/ws`}
        url={WS_URL}
        connectHeaders={{
            Authorization: `${token}`,
            'X-XSRF-TOKEN': cookies["XSRF-TOKEN"],
        }}
        // debug={(str) => {
        //     console.log(str);
        // }}
    >
        <FeaturesProvider>
        <AppShellComponent/>
        </FeaturesProvider>
    </StompSessionProvider>
}

function App() {
  return (
    <><MantineProvider theme={theme}>
        <PreferencesProvider>
            <Notifications/>
                <CookiesProvider defaultSetOptions >
                    <Auth0ProviderWithNavigate>
                            <AuthContextProvider>
                                    <Interior/>
                            </AuthContextProvider>
                    </Auth0ProviderWithNavigate>
                </CookiesProvider>
        </PreferencesProvider>
    </MantineProvider>
    </>
  )
}

export default App
