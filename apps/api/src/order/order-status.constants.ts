export enum OrderStatus {
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
}

export const PURCHASED_ORDER_STATUSES = [
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
] as const;
