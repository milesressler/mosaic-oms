import LandingPage from "src/pages/LandingPage.tsx";
import ErrorPage from "src/pages/ErrorPage.tsx";
import CustomerDashboard from "src/pages/dashboards/CustomerDashboard.tsx";
import OrderDetailsPage from "src/pages/orders/OrderDetailsPage.tsx";
import OrderFormPage from "src/pages/orders/OrderFormPage.tsx";
import {Navigate} from "react-router-dom";
import AuthCallbackPage from "src/pages/AuthCallback.tsx";
import {IconDashboard, IconHome, IconUser, IconReport, IconMovie} from "@tabler/icons-react";
import ItemsManagementPage from "src/pages/admin/ItemsManagementPage.tsx";
import OrderTakerDashboard from "src/pages/dashboards/OrderTakerDashboard.tsx";
import OrderFillerDashboard from "src/pages/dashboards/OrderFillerDashboard.tsx";
import AdminOrdersPage from "src/pages/admin/AdminOrdersPage.tsx";
import ReportPlaceholder from "src/pages/reports/ReportPlaceholder.tsx";
import UserManagementPage from "src/pages/admin/UserManagementPage.tsx";
import PackingView from "src/components/fillers/PackingView.tsx";
import OrderItemListView from "src/components/fillers/OrderItemListView.tsx";
import {SelectedOrderProvider} from "src/contexts/SelectedOrderContext.tsx";
import RunnerDashboard from "src/pages/dashboards/RunnerDashboard.tsx";
import DistributorDashboard from "src/pages/dashboards/DistributorDashboard.tsx";
import AdminSettingsPage from "src/pages/admin/AdminSettingsPage.tsx";
import CustomerMgmtPage from "src/pages/admin/CustomerMgmtPage.tsx";
import DevicesPage from "src/pages/admin/DevicesPage.tsx";


const routes = [
    {
        key: 'landing',
        path: '/',
        element: LandingPage,
        errorElement: ErrorPage,
        public: true,
        title: 'Home',
        icon: IconHome,
        showInNavBar: false,
    },{
        key: 'kiosk',
        path: '/kiosk',
        element: CustomerDashboard,
        errorElement: ErrorPage,
        public: true,
        title: 'Kiosk',
        icon: IconMovie,
        showInNavBar: false,
        isMonitor: true,
        hideNotifications: true,
    },
    {
        key: 'dashboards',
        icon: IconDashboard,
        group: 'Dashboards',
        children: [
            {
                key: 'public-dashboard',
                path: '/dashboard/public',
                element: CustomerDashboard,
                errorElement: ErrorPage,
                isMonitor: true,
                title: 'Customer Monitor',
                showInNavBar: true,
                hideNotifications: true,
            },
            {
                key: 'taker-dashboard',
                path: '/dashboard/taker',
                element: OrderTakerDashboard,
                errorElement: ErrorPage,
                title: 'Order Taker',
                showInNavBar: true,
            },
            {
                key: 'filler-dashboard',
                path: '/dashboard/filler',
                element: () => <SelectedOrderProvider><OrderFillerDashboard/></SelectedOrderProvider>,
                errorElement: ErrorPage,
                showInNavBar: true,
                title: 'Order Filler',
                children: [
                    {
                        key: 'filler-dashboard-view',
                        path: 'order/:id',
                        element: PackingView
                    }
                ]
            },
            {
                key: 'runner-dashboard',
                path: '/dashboard/runner',
                element: () => <SelectedOrderProvider><RunnerDashboard/></SelectedOrderProvider>,
                errorElement: ErrorPage,
                showInNavBar: true,
                title: 'Runner',
                children: [
                    {
                        key: 'runner-dashboard-view',
                        path: 'order/:id',
                        element: OrderItemListView
                    }
                ]
            },
            {
                key: 'distributor-dashboard',
                path: '/dashboard/distributor',
                element: () => <SelectedOrderProvider><DistributorDashboard/></SelectedOrderProvider>,
                errorElement: ErrorPage,
                showInNavBar: true,
                title: 'Distributor',
                children: [
                    {
                        key: 'distributor-dashboard-view',
                        path: 'order/:id',
                        element: OrderItemListView
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
        children: [
            {
                key: 'orders',
                path: '/orders',
                element: AdminOrdersPage,
                title: 'Orders',
                showInNavBar: true,
            },
            {
                key: 'customers',
                path: '/customers',
                element: CustomerMgmtPage,
                title: 'Customers',
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
                key: 'audit',
                path: '/audit',
                element: OrderFormPage,
                title: 'Audit Log',
                showInNavBar: false,
            },
            {
                key: 'order-details',
                path: '/order/:id',
                element: OrderDetailsPage,
                title: 'Order Details',
                showInNavBar: false,
            },
            {
                key: 'devices',
                path: '/devices',
                element: DevicesPage,
                title: 'Devices',
                showInNavBar: true,
            },
            {
                key: 'settings',
                path: '/settings',
                element: AdminSettingsPage,
                title: 'System Settings',
                showInNavBar: true,
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
