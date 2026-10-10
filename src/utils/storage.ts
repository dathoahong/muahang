import { PurchaseOrder, Supplier, ProductItem, DeliveryBatch } from '../types';
import { INITIAL_SUPPLIERS, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/initialData';

const STORAGE_KEYS = {
  SUPPLIERS: 'po_manager_suppliers_v1',
  PRODUCTS: 'po_manager_products_v1',
  ORDERS: 'po_manager_orders_v1',
  MANAGER_PIN: 'po_manager_pin_v1',
  AUTH_SESSION: 'po_manager_auth_session_v1',
};

const DEFAULT_PIN = '1234';

// PIN AUTH HELPERS
export function getStoredPin(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MANAGER_PIN);
    return saved || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function verifyPin(pin: string): boolean {
  const currentPin = getStoredPin();
  return pin.trim() === currentPin.trim();
}

export function updatePin(newPin: string): boolean {
  try {
    if (!newPin || newPin.length < 4) return false;
    localStorage.setItem(STORAGE_KEYS.MANAGER_PIN, newPin.trim());
    return true;
  } catch {
    return false;
  }
}

export function getIsManagerLoggedIn(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === 'true';
  } catch {
    return false;
  }
}

export function setManagerLoggedIn(loggedIn: boolean): void {
  try {
    if (loggedIn) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  } catch (e) {
    console.error('Storage error', e);
  }
}

// SUPPLIERS
export function getSuppliers(): Supplier[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (!data) {
      saveSuppliers(INITIAL_SUPPLIERS);
      return INITIAL_SUPPLIERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SUPPLIERS;
  }
}

export function saveSuppliers(suppliers: Supplier[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  } catch (e) {
    console.error('Save suppliers error', e);
  }
}

// PRODUCTS
export function getProducts(): ProductItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: ProductItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Save products error', e);
  }
}

// ORDERS
export function getOrders(): PurchaseOrder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      saveOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    const orders: PurchaseOrder[] = JSON.parse(data);
    return orders.map(recalculateOrder);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: PurchaseOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Save orders error', e);
  }
}

// Recalculates item fulfillment and order fulfillment strictly based on batch deliveries
export function recalculateOrder(order: PurchaseOrder): PurchaseOrder {
  const deliveries = order.deliveries || [];

  // Map received quantities for each item by orderItemId
  const receivedTotals: Record<string, number> = {};
  for (const del of deliveries) {
    for (const item of del.items) {
      receivedTotals[item.orderItemId] = (receivedTotals[item.orderItemId] || 0) + Number(item.quantityReceived || 0);
    }
  }

  const updatedItems = order.items.map((item) => {
    const received = receivedTotals[item.id] || 0;
    const remaining = Math.max(0, item.quantityOrdered - received);
    const rate = item.quantityOrdered > 0 ? (received / item.quantityOrdered) * 100 : 0;
    const roundedRate = Math.min(100, Math.round(rate * 10) / 10);
    const isCompleted = received >= item.quantityOrdered;

    return {
      ...item,
      receivedQuantity: received,
      remainingQuantity: remaining,
      fulfillmentRate: roundedRate,
      isCompleted,
    };
  });

  const totalOrdered = updatedItems.reduce((sum, it) => sum + it.quantityOrdered, 0);
  const totalReceived = updatedItems.reduce((sum, it) => sum + Math.min(it.quantityOrdered, it.receivedQuantity), 0);
  const totalAmount = updatedItems.reduce((sum, it) => sum + (it.unitPrice * it.quantityOrdered), 0);

  const overallRate = totalOrdered > 0 ? Math.min(100, Math.round((totalReceived / totalOrdered) * 1000) / 10) : 0;
  
  // Strict 100% check: All items must be at least 100% fulfilled
  const isFullyDelivered = updatedItems.length > 0 && updatedItems.every((it) => it.receivedQuantity >= it.quantityOrdered);

  let status: PurchaseOrder['status'] = 'pending';
  if (isFullyDelivered) {
    status = 'completed';
  } else if (totalReceived > 0) {
    status = 'delivering';
  } else {
    status = 'pending';
  }

  return {
    ...order,
    items: updatedItems,
    deliveries,
    totalOrderedQuantity: totalOrdered,
    totalReceivedQuantity: totalReceived,
    overallFulfillmentRate: overallRate,
    isFullyDelivered,
    totalOrderAmount: totalAmount,
    status,
  };
}

export function addDeliveryBatchToOrder(orderId: string, batchData: Omit<DeliveryBatch, 'id' | 'createdAt' | 'batchNumber'>): PurchaseOrder | null {
  const orders = getOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return null;

  const currentOrder = orders[orderIndex];
  const nextBatchNum = (currentOrder.deliveries?.length || 0) + 1;

  const newBatch: DeliveryBatch = {
    ...batchData,
    id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    batchNumber: nextBatchNum,
    createdAt: new Date().toISOString(),
  };

  const updatedOrder = recalculateOrder({
    ...currentOrder,
    deliveries: [...(currentOrder.deliveries || []), newBatch],
    updatedAt: new Date().toISOString(),
  });

  orders[orderIndex] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
}

export function resetToSampleData(): void {
  saveSuppliers(INITIAL_SUPPLIERS);
  saveProducts(INITIAL_PRODUCTS);
  saveOrders(INITIAL_ORDERS);
  localStorage.setItem(STORAGE_KEYS.MANAGER_PIN, DEFAULT_PIN);
}

// Formatting utilities
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTimeVN(isoStr: string): string {
  if (!isoStr) return '---';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoStr;
  }
}
