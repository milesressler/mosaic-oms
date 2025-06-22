export const ROLE_NAMES = ['Admin', 'Distributor', 'Order Filler', 'Order Taker', 'Runner'] as const;
export type RoleName = typeof ROLE_NAMES[number];