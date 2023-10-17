import './App.css'
import {
    Routes,
    Route
} from "react-router-dom";
import ErrorPage from "./pages/error-page.tsx";
import OrdersPage from "./pages/orders-page.tsx";
import LoginPage from "./pages/login-page.tsx";
import {Auth0ProviderWithNavigate} from "./components/auth0/Auth0ProviderWithNavigate.tsx";
import NavigationBar from "./components/navigation-bar.tsx";
import {OrderContextProvider} from "./contexts/OrderContext";


function App() {
  return (
    <>
            <Auth0ProviderWithNavigate>
                <OrderContextProvider>
                    <NavigationBar/>
                    <Routes>
                        <Route path="/" element={<LoginPage />} errorElement={<ErrorPage/>} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/callback" element={<><p>callback</p> </>} />
                    </Routes>
                </OrderContextProvider>
            </Auth0ProviderWithNavigate>
    </>
  )
}

export default App
