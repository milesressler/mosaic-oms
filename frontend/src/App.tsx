import './App.css'
import {
    Routes,
    Route
} from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.tsx";
import OrdersPage from "./pages/OrdersPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import {Auth0ProviderWithNavigate} from "./components/auth0/Auth0ProviderWithNavigate.tsx";
import NavigationBar from "./components/NavigationBar.tsx";
import {OrderContextProvider} from "./contexts/OrderContext";
import {AuthContextProvider} from "./contexts/AuthContext";
import AuthCallbackPage from "./pages/AuthCallback";
import {AuthenticationGuard} from "./components/auth0/AuthenticationGuard";
import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';


function App() {
  return (
    <><MantineProvider>
            <Auth0ProviderWithNavigate>
                <AuthContextProvider>
                    <OrderContextProvider>
                        <NavigationBar/>
                        <Routes>
                            <Route path="/" element={<LoginPage />} errorElement={<ErrorPage/>} />
                            <Route path="/orders" element={<AuthenticationGuard component={OrdersPage} />} />
                            <Route path="/callback" element={<AuthCallbackPage />} />
                        </Routes>
                    </OrderContextProvider>
                </AuthContextProvider>
            </Auth0ProviderWithNavigate>
    </MantineProvider>
    </>
  )
}

export default App
