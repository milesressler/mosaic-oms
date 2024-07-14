import './App.css'
import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import ErrorPage from "src/pages/ErrorPage.tsx";
import LandingPage from "src/pages/LandingPage.tsx";
import {Auth0ProviderWithNavigate} from "src/components/auth0/Auth0ProviderWithNavigate.tsx";
import NavigationBar from "src/components/NavigationBar.tsx";
import {OrderContextProvider} from "src/contexts/OrderContext";
import {AuthContextProvider} from "src/contexts/AuthContext";
import AuthCallbackPage from "src/pages/AuthCallback";
import {AuthenticationGuard} from "src/components/auth0/AuthenticationGuard";
import '@mantine/core/styles.css';

import {Card, MantineProvider} from '@mantine/core';
import OrderFormPageSample from "src/pages/OrderFormPageSample.tsx";
import Dashboard from "src/pages/dashboards/DefaultDashboard.tsx";
import OrderDetailsPage from "src/pages/OrderDetailsPage";
import OrderFormPage from "src/pages/OrderFormPage.tsx";
import CustomerDashboard from "src/pages/dashboards/CustomerDashboard.tsx";
import {ItemProvider} from "src/contexts/ItemContext.tsx";


function App() {
    const contentContainerProps = {
        w: '900px',
        mt: '56px'
    };
  return (
    <><MantineProvider>
            <Auth0ProviderWithNavigate>
                <AuthContextProvider>
                    <OrderContextProvider>
                        <ItemProvider>
                            <Card  {...contentContainerProps} shadow="xs" padding="md" radius="md" id={"content"}>
                                <Routes>
                                    <Route path="/" element={<LandingPage />} errorElement={<ErrorPage/>} />
                                    <Route path="/dashboard/public" element={<CustomerDashboard />} errorElement={<ErrorPage/>} />
                                    <Route path="/dashboard/taker" element={<CustomerDashboard />} errorElement={<ErrorPage/>} />
                                    <Route path="/dashboard/filler" element={<CustomerDashboard />} errorElement={<ErrorPage/>} />
                                    <Route path="/dashboard/runner" element={<CustomerDashboard />} errorElement={<ErrorPage/>} />
                                    <Route path="/dashboard/distributor" element={<CustomerDashboard />} errorElement={<ErrorPage/>} />

                                    {/*<Route path="/dashboard" element={<AuthenticationGuard component={DefaultDashboard} />} />*/}
                                    <Route path="/orders" element={<AuthenticationGuard component={Dashboard} />} />
                                    <Route path="/order/:id" element={<AuthenticationGuard component={OrderDetailsPage} />} />
                                    <Route path="/order/create" element={<AuthenticationGuard component={OrderFormPage} />} />
                                    <Route path="/order/create/old" element={<AuthenticationGuard component={OrderFormPageSample} />} />
                                    <Route path="/callback" element={<AuthCallbackPage />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Card>
                            <NavigationBar/>
                        </ItemProvider>
                    </OrderContextProvider>
                </AuthContextProvider>
            </Auth0ProviderWithNavigate>
    </MantineProvider>
    </>
  )
}

export default App
