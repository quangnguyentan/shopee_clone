export enum ShopStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUND_PENDING = 'refund_pending',
  REFUNDED = 'refunded',
}

export enum OrderPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum ShopOrderShippingStatus {
  UNFULFILLED = 'unfulfilled',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export enum ShopOrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUND_PENDING = 'refund_pending',
  REFUNDED = 'refunded',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum VoucherScope {
  PLATFORM = 'platform',
  SHOP = 'shop',
  SHIPPING = 'shipping',
}

export enum InventoryReservationStatus {
  HOLDING = 'holding',
  CONFIRMED = 'confirmed',
  RELEASED = 'released',
  EXPIRED = 'expired',
}
