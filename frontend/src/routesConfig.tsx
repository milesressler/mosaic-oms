import LandingPage from "src/pages/LandingPage.tsx";
import ErrorPage from "src/pages/ErrorPage.tsx";
import CustomerDashboard from "src/pages/dashboards/CustomerDashboard.tsx";
import {Navigate} from "react-router-dom";
import AuthCallbackPage from "src/pages/AuthCallback.tsx";
import {
    IconDashboard,
    IconHome,
    IconUser,
    IconReport,
    IconMovie,
    IconExclamationCircle,
    IconBasketSearch
} from "@tabler/icons-react";
import ItemsManagementPage from "src/pages/admin/ItemsManagementPage.tsx";
import OrderTakerDashboard from "src/pages/dashboards/OrderTakerDashboard.tsx";
import OrderFillerDashboard from "src/pages/dashboards/OrderFillerDashboard.tsx";
import AdminOrdersPage from "src/pages/admin/AdminOrdersPage.tsx";
import ReportPlaceholder from "src/pages/reports/ReportPlaceholder.tsx";
import ReportingPOC from "src/pages/ReportingPOC.tsx";
import ReportingPOC2 from "src/pages/ReportingPOC2.tsx";
import ReportingPOC3 from "src/pages/ReportingPOC3.tsx";
import ReportingPOC4 from "src/pages/ReportingPOC4.tsx";
import ReportingPOC5 from "src/pages/ReportingPOC5.tsx";
import ReportsNext from "src/pages/reports/ReportsNext.tsx";
import UserManagementPage from "src/pages/admin/UserManagementPage.tsx";
import PackingView from "src/components/fillers/PackingView.tsx";
import OrderItemListView from "src/components/fillers/OrderItemListView.tsx";
import {SelectedOrderProvider} from "src/context/SelectedOrderContext.tsx";
import RunnerDashboard from "src/pages/dashboards/RunnerDashboard.tsx";
import DistributorDashboard from "src/pages/dashboards/DistributorDashboard.tsx";
import AdminSettingsPage from "src/pages/admin/AdminSettingsPage.tsx";
import CustomerMgmtPage from "src/pages/admin/CustomerMgmtPage.tsx";
import DevicesPage from "src/pages/admin/DevicesPage.tsx";
import NoAccessPage from "src/pages/NoAccess.tsx";
import CustomerDetailPage from "src/pages/search/CustomerDetailPage.tsx";
import ShowersDashboard from "src/pages/dashboards/ShowersDashboard.tsx";
import OrderDetailsPageOld from "./pages/orders/OrderDetailsPageOld";
import SystemReports from "src/pages/reports/SystemReports.tsx";
import ItemAnalysis from "src/pages/reports/ItemAnalysis.tsx";


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
    },
    {
        key: 'missingPermissions',
        path: '/access',
        element: NoAccessPage,
        errorElement: ErrorPage,
        public: true,
        title: 'Access Denied',
        icon: IconExclamationCircle,
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
                key: 'taker-edit',
                path: '/dashboard/taker/:id',
                element: OrderTakerDashboard,
                errorElement: ErrorPage,
                title: 'Edit Order',
                showInNavBar: false,
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
            {
                key: 'showers-dashboard',
                path: '/dashboard/showers',
                element: () => <ShowersDashboard/>,
                errorElement: ErrorPage,
                showInNavBar: true ,
                title: 'Showers',
            },
            // Add other dashboard routes here
        ],
    },
    {
        key: 'search',
        icon: IconBasketSearch,
        group: 'Search',
        children: [
            {
                key: 'order-search',
                path: '/orders',
                element: AdminOrdersPage,
                title: 'Orders',
                showInNavBar: true,
            },
            {
                key: 'order-details',
                path: '/order/:id',
                element: OrderDetailsPageOld,
                title: 'Order Details',
                showInNavBar: false,
            },
            {
                key: 'customers',
                path: '/customers',
                element: CustomerMgmtPage,
                title: 'Customers',
                showInNavBar: true,
            },
            {
                key: 'customer-details',
                path: '/customer/:uuid',
                element: CustomerDetailPage,
                title: 'Customer Details',
                showInNavBar: false,
            },
        ],
    },
    {
        key: 'admin',
        icon: IconUser,
        group: 'Admin',
        requiredRole: 'admin',
        children: [
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
        icon: IconReport,
        group: 'Reports',
        children: [
            {
                key: 'reports-overview',
                path: '/reports/overview',
                element: SystemReports,
                title: 'Overview',
                showInNavBar: true,
            },
            {
                key: 'item-analysis',
                path: '/reports/items',
                element: ItemAnalysis,
                title: 'Item Analysis',
                showInNavBar: true,
            },
            {
                key: 'reports-old',
                path: '/reports/old',
                element: ReportPlaceholder,
                title: 'Reports [Old]',
                showInNavBar: true,
            },
         ]
    },
    {
        key: 'reports-next',
        path: '/reports-next',
        element: ReportsNext,
        public: false,
        showInNavBar: false,
        title: "Reports POC - All Versions",
        errorElement: ErrorPage,
    },
    {
        key: 'reports-poc',
        path: '/reports-poc',
        element: ReportingPOC,
        public: false,
        showInNavBar: false,
        title: "Reports POC",
        errorElement: ErrorPage,
    },
    {
        key: 'reports-poc2',
        path: '/reports-poc2',
        element: ReportingPOC2,
        public: false,
        showInNavBar: false,
        title: "Reports POC v2 - Datadog Style",
        errorElement: ErrorPage,
    },
    {
        key: 'reports-poc3',
        path: '/reports-poc3',
        element: ReportingPOC3,
        public: false,
        showInNavBar: false,
        title: "Reports POC v3 - Time Series",
        errorElement: ErrorPage,
    },
    {
        key: 'reports-poc4',
        path: '/reports-poc4',
        element: ReportingPOC4,
        public: false,
        showInNavBar: false,
        title: "Reports POC v4 - System Operations",
        errorElement: ErrorPage,
    },
    {
        key: 'reports-poc5',
        path: '/reports-poc5',
        element: ReportingPOC5,
        public: false,
        showInNavBar: false,
        title: "Reports POC v5 - Advanced Analytics",
        errorElement: ErrorPage,
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
