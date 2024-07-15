import LandingPage from "src/pages/LandingPage.tsx";
import ErrorPage from "src/pages/ErrorPage.tsx";
import CustomerDashboard from "src/pages/dashboards/CustomerDashboard.tsx";
import OrderDetailsPage from "src/pages/orders/OrderDetailsPage.tsx";
import DefaultDashboard from "src/pages/dashboards/DefaultDashboard.tsx";
import OrderFormPage from "src/pages/orders/OrderFormPage.tsx";
import {Navigate} from "react-router-dom";
import AuthCallbackPage from "src/pages/AuthCallback.tsx";
import {IconDashboard, IconHome, IconUser } from "@tabler/icons-react";
import OrderFormPageSample from "src/pages/orders/OrderFormPageSample.tsx";


const routes = [
    {
        key: 'landing',
        path: '/',
        element: LandingPage,
        errorElement: ErrorPage,
        navBarHidden: false,
        headerHidden: false,
        public: true,
        title: 'Home',
        icon: IconHome,
        showInNavBar: false,
    },
    {
        key: 'dashboards',
        icon: IconDashboard,
        group: 'Dashboards',
        initiallyOpened: true,
        children: [
            {
                key: 'public-dashboard',
                path: '/dashboard/public',
                element: CustomerDashboard,
                errorElement: ErrorPage,
                navBarHidden: true,
                headerHidden: true,
                asideHidden: true,
                public: true,
                title: 'Public Dashboard',
                showInNavBar: true,
            },
            {
                key: 'taker-dashboard',
                path: '/dashboard/taker',
                element: CustomerDashboard,
                errorElement: ErrorPage,
                navBarHidden: true,
                headerHidden: false,
                title: 'Taker Dashboard',
                showInNavBar: true,
            },
            // Add other dashboard routes here
        ],
    },
    {
        key: 'admin',
        icon: IconUser,
        group: 'Admin',
        requiredRole: 'admin',
        initiallyOpened: false,
        children: [
            {
                key: 'orders',
                path: '/orders',
                element: DefaultDashboard,
                title: 'Orders',
                showInNavBar: true,
            },
            {
                key: 'order-create-old',
                path: '/order/old',
                element: OrderFormPageSample,
                title: 'Create Order (Old)',
                showInNavBar: false,
            },
            {
                key: 'order-create',
                path: '/order/create',
                element: OrderFormPage,
                title: 'Create Order',
                showInNavBar: true,
            },
            {
                key: 'order-details',
                path: '/order/:id',
                element: OrderDetailsPage,
                title: 'Order Details',
                showInNavBar: false,
            },
        ],
    },
    {
        key: 'callback',
        path: '/callback',
        element: AuthCallbackPage,
        public: true,
        showInNavBar: false,
    },
    {
        key: 'not-found',
        path: '*',
        element: () => <Navigate to="/" replace />,
        showInNavBar: false,
    },
];

export default routes;
