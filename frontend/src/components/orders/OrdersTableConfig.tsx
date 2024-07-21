export interface ColumnConfig {
    label: string;
    id?: string
    sortField?: string;
    views?: string[];
}

export const columns: ColumnConfig[] = [
    { label: 'Order #', sortField: 'id', views: ['default', 'admin', 'public'] },
    { label: 'Created', sortField: 'created', views: ['default', 'admin', 'public'] },
    { label: 'Updated', sortField: 'updated', views: ['default'] },
    { label: 'Updated', id:'updatedDetail', sortField: 'updated', views: ['admin'] },
    { label: 'Status', sortField: 'orderStatus', views: ['default', 'admin'] },
    { label: 'Status', id:'statusObfuscated', sortField: 'orderStatus', views: [ 'public'] },
    { label: 'Customer', sortField: 'customer.name', views: ['default', 'admin', 'public'] },
];
