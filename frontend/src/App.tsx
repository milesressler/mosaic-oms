import './App.css'
import {Auth0ProviderWithNavigate} from "src/components/auth0/Auth0ProviderWithNavigate.tsx";
import {AuthContextProvider} from "src/contexts/AuthContext";
import '@mantine/core/styles.css';

import {MantineProvider} from '@mantine/core';
import {ItemProvider} from "src/contexts/ItemContext.tsx";
import {AppShellComponent} from "src/components/layout/AppShellComponent.tsx";


function App() {
  return (
    <><MantineProvider>
            <Auth0ProviderWithNavigate>
                <AuthContextProvider>
                    <ItemProvider>
                        <AppShellComponent/>
                    </ItemProvider>
                </AuthContextProvider>
            </Auth0ProviderWithNavigate>
    </MantineProvider>
    </>
  )
}

export default App
