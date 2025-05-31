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
    { label: '', id:'assigned', sortField: 'assignee.name', views: [
        OrdersView.FILLER, OrdersView.RUNNER] },
    { label: 'Order #', sortField: 'id', views: [
        OrdersView.DEFAULT] },
    { label: 'Customer', sortField: 'customer.lastName', views:
            [OrdersView.DEFAULT, OrdersView.FILLER, OrdersView.DISTRIBUTOR ]},
    { label: 'Created', sortField: 'created', views: [
        OrdersView.DEFAULT, OrdersView.FILLER, OrdersView.RUNNER, OrdersView.DISTRIBUTOR] },
    { label: 'Updated', sortField: 'updated', views: [] },
    { label: 'Status', sortField: 'orderStatus', views: [
        OrdersView.ADMIN, OrdersView.FILLER, OrdersView.DISTRIBUTOR] },
    { label: 'Filler', id: 'filler', views: [
            OrdersView.RUNNER] },
];

