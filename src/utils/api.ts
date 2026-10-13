import { PurchaseOrder, Supplier, ProductItem, DeliveryBatch } from '../types';

export interface DbHealthStatus {
  status: string;
  database: string;
  connected: boolean;
  envSource: string;
  ordersCount: number;
}

export async function fetchDbHealth(): Promise<DbHealthStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('API Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      database: 'Offline / Local',
      connected: false,
      envSource: 'none',
      ordersCount: 0,
    };
  }
}

// ORDERS
export async function apiFetchOrders(): Promise<PurchaseOrder[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error('Không thể tải đơn hàng từ server');
  return await res.json();
}

export async function apiSaveOrder(order: PurchaseOrder): Promise<PurchaseOrder> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error('Không thể lưu đơn hàng lên server');
  return await res.json();
}

export async function apiDeleteOrder(orderId: string): Promise<boolean> {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function apiAddDeliveryBatch(
  orderId: string,
  batchData: Omit<DeliveryBatch, 'id' | 'createdAt' | 'batchNumber'>
): Promise<PurchaseOrder> {
  const res = await fetch(`/api/orders/${orderId}/deliveries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchData),
  });
  if (!res.ok) throw new Error('Không thể ghi nhận đợt nhận hàng lên server');
  return await res.json();
}

// SUPPLIERS
export async function apiFetchSuppliers(): Promise<Supplier[]> {
  const res = await fetch('/api/suppliers');
  if (!res.ok) throw new Error('Không thể tải nhà cung cấp từ server');
  return await res.json();
}

export async function apiSaveSuppliers(suppliers: Supplier[]): Promise<Supplier[]> {
  const res = await fetch('/api/suppliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(suppliers),
  });
  if (!res.ok) throw new Error('Không thể lưu nhà cung cấp lên server');
  return await res.json();
}

// PRODUCTS
export async function apiFetchProducts(): Promise<ProductItem[]> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Không thể tải mặt hàng từ server');
  return await res.json();
}

export async function apiSaveProducts(products: ProductItem[]): Promise<ProductItem[]> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(products),
  });
  if (!res.ok) throw new Error('Không thể lưu mặt hàng lên server');
  return await res.json();
}

// PIN AUTH
export async function apiVerifyPin(pin: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.valid);
  } catch {
    return false;
  }
}

export async function apiUpdatePin(oldPin: string, newPin: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/update-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPin, newPin }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// RESET SAMPLE DATA
export async function apiResetSampleData(): Promise<boolean> {
  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
