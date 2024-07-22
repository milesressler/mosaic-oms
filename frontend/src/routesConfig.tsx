import LandingPage from "src/pages/LandingPage.tsx";
import ErrorPage from "src/pages/ErrorPage.tsx";
import CustomerDashboard from "src/pages/dashboards/CustomerDashboard.tsx";
import OrderDetailsPage from "src/pages/orders/OrderDetailsPage.tsx";
import OrderFormPage from "src/pages/orders/OrderFormPage.tsx";
import {Navigate} from "react-router-dom";
import AuthCallbackPage from "src/pages/AuthCallback.tsx";
import {IconDashboard, IconHome, IconUser, IconReport } from "@tabler/icons-react";
import ItemsManagementPage from "src/pages/admin/ItemsManagementPage.tsx";
import OrderTakerDashboard from "src/pages/dashboards/OrderTakerDashboard.tsx";
import OrderFillerDashboard from "src/pages/dashboards/OrderFillerDashboard.tsx";
import AdminOrdersPage from "src/pages/admin/AdminOrdersPage.tsx";
import ReportPlaceholder from "src/pages/reports/ReportPlaceholder.tsx";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";
import UserManagementPage from "src/pages/admin/UserManagementPage.tsx";


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
                headerHidden: false,
                minimalHeader: true,
                asideHidden: true,
                public: true,
                title: 'Customer Monitor',
                showInNavBar: true,
            },
            {
                key: 'taker-dashboard',
                path: '/dashboard/taker',
                element: OrderTakerDashboard,
                errorElement: ErrorPage,
                navBarHidden: true,
                headerHidden: false,
                title: 'Order Taker',
                showInNavBar: true,
            },
            {
                key: 'filler-dashboard',
                path: '/dashboard/filler',
                element: OrderFillerDashboard,
                errorElement: ErrorPage,
                navBarHidden: true,
                headerHidden: false,
                showInNavBar: true,
                title: 'Order Filler',
                children: [
                    {
                        key: 'filler-dashboard-view',
                        path: 'order/:id',
                        element: OrderDetailSection
                    },
                    {
                        key: 'filler-dashboard-fill',
                        path: 'fill/:id',
                        element: OrderFormPage
                    }
                ]
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
                element: AdminOrdersPage,
                title: 'Orders',
                showInNavBar: true,
            },
            {
                key: 'items',
                path: '/admin/items',
                element: ItemsManagementPage,
                title: 'Items',
                showInNavBar: true,
            },
            {
                key: 'users',
                path: '/admin/users',
                element: UserManagementPage,
                title: 'Users',
                showInNavBar: true,
            },
            {
                key: 'order-create',
                path: '/order/create',
                element: OrderFormPage,
                title: 'Create Order',
                showInNavBar: true,
            },
            {
                key: 'audit',
                path: '/audit',
                element: OrderFormPage,
                title: 'Audit Log',
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
        key: 'reports',
        path: '/reports',
        element: ReportPlaceholder,
        public: false,
        showInNavBar: true,
        title: "Reports",
        errorElement: ErrorPage,
        icon: IconReport,
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
