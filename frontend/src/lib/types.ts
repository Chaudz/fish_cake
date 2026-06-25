export type CustomerType = 'RETAIL' | 'WHOLESALE';
export type ProductType = 'RAW' | 'COOKED';
export type OrderStatus = 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'DEBT' | 'PARTIAL';
export type CustomerSource =
  | 'FACEBOOK'
  | 'TIKTOK'
  | 'ZALO'
  | 'WEBSITE'
  | 'REFERRAL'
  | 'OTHER';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  type: CustomerType;
  defaultRawPrice: number;
  defaultCookedPrice: number;
  note?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productType: ProductType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  code: string;
  customerId: string;
  customer?: Customer;
  status: OrderStatus;
  source: CustomerSource;
  shipperId?: string;
  shipper?: Shipper;
  shippingFee: number;
  subtotal: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  codAmount: number;
  codReconciled: boolean;
  note?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface Purchase {
  id: string;
  date: string;
  productType: ProductType;
  quantity: number;
  costPrice: number;
  totalAmount: number;
  note?: string;
}

export interface InventoryItem {
  productType: ProductType;
  productName: string;
  quantity: number;
  costPrice: number;
  value: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface Debt {
  id: string;
  customerId: string;
  customer?: Customer;
  orderId?: string;
  order?: Order;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  payments?: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  amount: number;
  note?: string;
  paymentDate: string;
}

export interface Shipper {
  id: string;
  name: string;
  phone: string;
}

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  RETAIL: 'Lẻ',
  WHOLESALE: 'Sỉ',
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  RAW: 'Chả sống',
  COOKED: 'Chả chín',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: 'Đã thanh toán',
  DEBT: 'Công nợ',
  PARTIAL: 'Thanh toán một phần',
};

export const SOURCE_LABELS: Record<CustomerSource, string> = {
  FACEBOOK: 'Facebook',
  TIKTOK: 'TikTok',
  ZALO: 'Zalo',
  WEBSITE: 'Website',
  REFERRAL: 'Người quen',
  OTHER: 'Khác',
};
