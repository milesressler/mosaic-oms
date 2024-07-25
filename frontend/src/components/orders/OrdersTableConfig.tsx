export interface ColumnConfig {
    label: string;
    id?: string
    sortField?: string;
    views?: string[];
}

export const columns: ColumnConfig[] = [
    { label: 'Assigned', id:'assigned', sortField: 'assignee.name', views: [ 'filler', 'admin'] },
    { label: 'Order #', sortField: 'id', views: ['default', 'admin', 'public', 'filler'] },
    { label: 'Created', sortField: 'created', views: ['default', 'admin', 'public', 'filler'] },
    { label: 'Updated', sortField: 'updated', views: ['default', 'admin', 'filler'] },
    { label: 'Status', sortField: 'orderStatus', views: ['default', 'admin', 'filler'] },
    { label: 'Status', id:'statusObfuscated', sortField: 'orderStatus', views: [ 'public'] },
    { label: 'Customer', sortField: 'customer.name', views: ['default', 'admin', 'public', 'filler'] },
];
