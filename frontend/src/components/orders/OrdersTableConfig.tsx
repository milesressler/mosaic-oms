export interface ColumnConfig {
    label: string;
    id?: string
    sortField?: string;
    views?: string[];
}

enum OrdersView {
    FILLER = 'filler',
    ADMIN = 'admin',
    RUNNER = 'runner',
    DEFAULT = 'default',
    PUBLIC = 'public',
}

export const columns: ColumnConfig[] = [
    { label: 'Assigned', id:'assigned', sortField: 'assignee.name', views: [OrdersView.FILLER, OrdersView.ADMIN, OrdersView.RUNNER] },
    { label: 'Order #', sortField: 'id', views: [OrdersView.DEFAULT, OrdersView.ADMIN, OrdersView.PUBLIC, OrdersView.FILLER, OrdersView.RUNNER] },
    { label: 'Created', sortField: 'created', views: [OrdersView.DEFAULT, OrdersView.ADMIN, OrdersView.PUBLIC, OrdersView.FILLER, OrdersView.RUNNER] },
    { label: 'Updated', sortField: 'updated', views: [] },
    { label: 'Status', sortField: 'orderStatus', views: [OrdersView.DEFAULT, OrdersView.ADMIN, OrdersView.FILLER, OrdersView.RUNNER] },
    { label: 'Status', id:'statusObfuscated', sortField: 'orderStatus', views: [ OrdersView.PUBLIC] },
    { label: 'Cart', id: 'cart', sortField: 'cart', views: [ OrdersView.RUNNER] },
    { label: 'Customer', sortField: 'customer.name', views: [OrdersView.DEFAULT, OrdersView.ADMIN, OrdersView.PUBLIC, OrdersView.FILLER ]},
];
