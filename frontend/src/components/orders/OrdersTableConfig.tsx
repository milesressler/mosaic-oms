export interface ColumnConfig {
    label: string;
    id?: string
    sortField?: string;
    views?: string[];
}

export enum OrdersView {
    FILLER = 'filler',
    ADMIN = 'admin',
    RUNNER = 'runner',
    DEFAULT = 'default',
    PUBLIC = 'public',
    ORDERTAKER = 'ordertaker',
    DISTRIBUTOR = 'distributor',
}

export const columns: ColumnConfig[] = [
    // { label: 'Select', id:'select', views: [OrdersView.RUNNER] },
    { label: 'Assigned', id:'assigned', sortField: 'assignee.name', views: [
        OrdersView.FILLER, OrdersView.ADMIN, OrdersView.RUNNER] },
    { label: 'Order #', sortField: 'id', views: [
        OrdersView.DEFAULT] },
    { label: 'Created', sortField: 'created', views: [
        OrdersView.DEFAULT, OrdersView.ADMIN, OrdersView.PUBLIC, OrdersView.FILLER, OrdersView.RUNNER, OrdersView.DISTRIBUTOR] },
    { label: 'Updated', sortField: 'updated', views: [] },
    { label: 'Status', sortField: 'orderStatus', views: [
        OrdersView.ADMIN, OrdersView.FILLER, OrdersView.RUNNER, OrdersView.DISTRIBUTOR] },
    { label: 'Status', id:'statusObfuscated', sortField: 'orderStatus', views: [
        OrdersView.PUBLIC] },
    { label: 'Cart', id: 'cart', sortField: 'cart', views: [
        OrdersView.RUNNER] },
    { label: 'Customer', sortField: 'customer.lastName', views:
        [OrdersView.DEFAULT, OrdersView.ADMIN, OrdersView.PUBLIC, OrdersView.FILLER, OrdersView.DISTRIBUTOR ]},
];

