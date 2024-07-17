export interface ColumnConfig {
    name: string;
    sortField?: string;
    views?: string[];
}

export const columns: ColumnConfig[] = [
    { name: 'Order #', sortField: 'id', views: ['default', 'admin'] },
    { name: 'Created', sortField: 'created', views: ['default', 'admin'] },
    { name: 'Updated', sortField: 'updated', views: ['default'] },
    { name: 'Updated', sortField: 'updatedDetail', views: ['admin'] },
    { name: 'Status', sortField: 'orderStatus', views: ['default', 'admin'] },
    { name: 'Customer', sortField: 'customer.name', views: ['default', 'admin'] },
];
