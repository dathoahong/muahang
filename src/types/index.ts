export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  taxId?: string;
  category?: string;
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  unit: string; // Thùng, Cuộn, Cái, Kg, Hộp, Bộ, Mét, v.v.
  defaultPrice: number;
  category?: string;
  supplierId?: string; // NCC chính
}

export interface OrderItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  quantityOrdered: number;
  unitPrice: number;
  totalAmount: number;
  receivedQuantity: number; // Lũy kế đã nhận
  remainingQuantity: number; // Còn thiếu
  fulfillmentRate: number; // 0 - 100%
  isCompleted: boolean; // >= 100%
  note?: string;
}

export interface DeliveryBatchItem {
  orderItemId: string;
  productId: string;
  productName: string;
  unit: string;
  quantityReceived: number;
}

export interface DeliveryBatch {
  id: string;
  batchNumber: number; // Đợt 1, Đợt 2, Đợt 3...
  deliveryDate: string; // YYYY-MM-DD
  receiverName: string; // Tên thủ kho / người nhận
  deliveryDocCode?: string; // Mã phiếu xuất kho / biên bản nhận
  note?: string;
  items: DeliveryBatchItem[];
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // Mã PO: ví dụ PO-20261010-001
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: 'pending' | 'delivering' | 'completed' | 'cancelled';
  items: OrderItem[];
  deliveries: DeliveryBatch[];
  totalOrderedQuantity: number;
  totalReceivedQuantity: number;
  overallFulfillmentRate: number; // 0 - 100%
  isFullyDelivered: boolean; // 100% hoàn thành -> Tô xanh
  totalOrderAmount: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderFilterStatus = 'all' | 'pending' | 'delivering' | 'completed';
