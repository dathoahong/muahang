import pg from 'pg';
import { PurchaseOrder, Supplier, ProductItem, DeliveryBatch } from '../src/types';
import { INITIAL_SUPPLIERS, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../src/data/initialData';
import { recalculateOrder } from '../src/utils/storage';

const { Pool } = pg;

// Get connection string from environment variables
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

let pool: pg.Pool | null = null;
let isConnected = false;

// In-memory fallback in case DATABASE_URL is not set yet
let fallbackOrders: PurchaseOrder[] = [...INITIAL_ORDERS];
let fallbackSuppliers: Supplier[] = [...INITIAL_SUPPLIERS];
let fallbackProducts: ProductItem[] = [...INITIAL_PRODUCTS];
let fallbackPin = '1234';

export function isDbConnected(): boolean {
  return isConnected;
}

export function getConnectionStringSource(): string {
  if (process.env.DATABASE_URL) return 'DATABASE_URL';
  if (process.env.POSTGRES_URL) return 'POSTGRES_URL';
  return 'none';
}

export async function initDb(): Promise<boolean> {
  if (!connectionString) {
    console.log('[Database] Chưa cấu hình DATABASE_URL hoặc POSTGRES_URL. Đang dùng bộ nhớ tạm thời.');
    isConnected = false;
    return false;
  }

  try {
    if (!pool) {
      pool = new Pool({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }

    const client = await pool.connect();
    try {
      console.log('[Database] Kết nối Vercel Postgres thành công!');

      // Create Tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS suppliers (
          id VARCHAR(100) PRIMARY KEY,
          code VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          email VARCHAR(100),
          address TEXT,
          tax_id VARCHAR(50),
          category VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(100) PRIMARY KEY,
          code VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          default_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
          category VARCHAR(100),
          supplier_id VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS purchase_orders (
          id VARCHAR(100) PRIMARY KEY,
          po_number VARCHAR(100) NOT NULL UNIQUE,
          supplier_id VARCHAR(100) NOT NULL,
          supplier_name VARCHAR(255) NOT NULL,
          supplier_phone VARCHAR(50),
          order_date VARCHAR(50) NOT NULL,
          expected_delivery_date VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          items JSONB NOT NULL,
          deliveries JSONB NOT NULL DEFAULT '[]'::jsonb,
          total_ordered_quantity NUMERIC(15, 2) DEFAULT 0,
          total_received_quantity NUMERIC(15, 2) DEFAULT 0,
          overall_fulfillment_rate NUMERIC(5, 2) DEFAULT 0,
          is_fully_delivered BOOLEAN DEFAULT false,
          total_order_amount NUMERIC(15, 2) DEFAULT 0,
          notes TEXT,
          created_by VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed Default PIN if not exists
      const pinRes = await client.query(`SELECT value FROM app_settings WHERE key = 'manager_pin'`);
      if (pinRes.rows.length === 0) {
        await client.query(`INSERT INTO app_settings (key, value) VALUES ('manager_pin', '1234')`);
      }

      // Seed Suppliers if empty
      const supCount = await client.query(`SELECT COUNT(*) FROM suppliers`);
      if (parseInt(supCount.rows[0].count, 10) === 0) {
        for (const s of INITIAL_SUPPLIERS) {
          await client.query(
            `INSERT INTO suppliers (id, code, name, phone, email, address, tax_id, category)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING`,
            [s.id, s.code, s.name, s.phone, s.email || null, s.address || null, s.taxId || null, s.category || null]
          );
        }
      }

      // Seed Products if empty
      const prodCount = await client.query(`SELECT COUNT(*) FROM products`);
      if (parseInt(prodCount.rows[0].count, 10) === 0) {
        for (const p of INITIAL_PRODUCTS) {
          await client.query(
            `INSERT INTO products (id, code, name, unit, default_price, category, supplier_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO NOTHING`,
            [p.id, p.code, p.name, p.unit, p.defaultPrice, p.category || null, p.supplierId || null]
          );
        }
      }

      // Seed Orders if empty
      const orderCount = await client.query(`SELECT COUNT(*) FROM purchase_orders`);
      if (parseInt(orderCount.rows[0].count, 10) === 0) {
        for (const o of INITIAL_ORDERS) {
          await client.query(
            `INSERT INTO purchase_orders (
              id, po_number, supplier_id, supplier_name, supplier_phone,
              order_date, expected_delivery_date, status, items, deliveries,
              total_ordered_quantity, total_received_quantity, overall_fulfillment_rate,
              is_fully_delivered, total_order_amount, notes, created_by, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
            ) ON CONFLICT (id) DO NOTHING`,
            [
              o.id,
              o.poNumber,
              o.supplierId,
              o.supplierName,
              o.supplierPhone || null,
              o.orderDate,
              o.expectedDeliveryDate,
              o.status,
              JSON.stringify(o.items),
              JSON.stringify(o.deliveries),
              o.totalOrderedQuantity,
              o.totalReceivedQuantity,
              o.overallFulfillmentRate,
              o.isFullyDelivered,
              o.totalOrderAmount,
              o.notes || null,
              o.createdBy,
              o.createdAt,
              o.updatedAt,
            ]
          );
        }
      }

      isConnected = true;
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Database Error] Không thể kết nối Postgres:', err);
    isConnected = false;
    return false;
  }
}

// ORDERS OPERATIONS
export async function dbGetOrders(): Promise<PurchaseOrder[]> {
  if (pool && isConnected) {
    try {
      const res = await pool.query(
        `SELECT * FROM purchase_orders ORDER BY created_at DESC`
      );
      return res.rows.map((row) => ({
        id: row.id,
        poNumber: row.po_number,
        supplierId: row.supplier_id,
        supplierName: row.supplier_name,
        supplierPhone: row.supplier_phone,
        orderDate: row.order_date,
        expectedDeliveryDate: row.expected_delivery_date,
        status: row.status,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
        deliveries: typeof row.deliveries === 'string' ? JSON.parse(row.deliveries) : row.deliveries,
        totalOrderedQuantity: Number(row.total_ordered_quantity),
        totalReceivedQuantity: Number(row.total_received_quantity),
        overallFulfillmentRate: Number(row.overall_fulfillment_rate),
        isFullyDelivered: Boolean(row.is_fully_delivered),
        totalOrderAmount: Number(row.total_order_amount),
        notes: row.notes,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (e) {
      console.error('dbGetOrders error, using fallback:', e);
    }
  }
  return fallbackOrders;
}

export async function dbSaveOrder(order: PurchaseOrder): Promise<PurchaseOrder> {
  const recalculated = recalculateOrder(order);

  if (pool && isConnected) {
    try {
      await pool.query(
        `INSERT INTO purchase_orders (
          id, po_number, supplier_id, supplier_name, supplier_phone,
          order_date, expected_delivery_date, status, items, deliveries,
          total_ordered_quantity, total_received_quantity, overall_fulfillment_rate,
          is_fully_delivered, total_order_amount, notes, created_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) ON CONFLICT (id) DO UPDATE SET
          po_number = EXCLUDED.po_number,
          supplier_id = EXCLUDED.supplier_id,
          supplier_name = EXCLUDED.supplier_name,
          supplier_phone = EXCLUDED.supplier_phone,
          order_date = EXCLUDED.order_date,
          expected_delivery_date = EXCLUDED.expected_delivery_date,
          status = EXCLUDED.status,
          items = EXCLUDED.items,
          deliveries = EXCLUDED.deliveries,
          total_ordered_quantity = EXCLUDED.total_ordered_quantity,
          total_received_quantity = EXCLUDED.total_received_quantity,
          overall_fulfillment_rate = EXCLUDED.overall_fulfillment_rate,
          is_fully_delivered = EXCLUDED.is_fully_delivered,
          total_order_amount = EXCLUDED.total_order_amount,
          notes = EXCLUDED.notes,
          updated_at = NOW()`,
        [
          recalculated.id,
          recalculated.poNumber,
          recalculated.supplierId,
          recalculated.supplierName,
          recalculated.supplierPhone || null,
          recalculated.orderDate,
          recalculated.expectedDeliveryDate,
          recalculated.status,
          JSON.stringify(recalculated.items),
          JSON.stringify(recalculated.deliveries || []),
          recalculated.totalOrderedQuantity,
          recalculated.totalReceivedQuantity,
          recalculated.overallFulfillmentRate,
          recalculated.isFullyDelivered,
          recalculated.totalOrderAmount,
          recalculated.notes || null,
          recalculated.createdBy,
          recalculated.createdAt,
          recalculated.updatedAt,
        ]
      );
      return recalculated;
    } catch (e) {
      console.error('dbSaveOrder error, saving in fallback:', e);
    }
  }

  // Fallback
  const idx = fallbackOrders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    fallbackOrders[idx] = recalculated;
  } else {
    fallbackOrders.unshift(recalculated);
  }
  return recalculated;
}

export async function dbDeleteOrder(orderId: string): Promise<boolean> {
  if (pool && isConnected) {
    try {
      await pool.query(`DELETE FROM purchase_orders WHERE id = $1`, [orderId]);
      return true;
    } catch (e) {
      console.error('dbDeleteOrder error:', e);
    }
  }
  fallbackOrders = fallbackOrders.filter((o) => o.id !== orderId);
  return true;
}

export async function dbAddDeliveryBatch(
  orderId: string,
  batchData: Omit<DeliveryBatch, 'id' | 'createdAt' | 'batchNumber'>
): Promise<PurchaseOrder | null> {
  const orders = await dbGetOrders();
  const target = orders.find((o) => o.id === orderId);
  if (!target) return null;

  const nextBatchNum = (target.deliveries?.length || 0) + 1;
  const newBatch: DeliveryBatch = {
    ...batchData,
    id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    batchNumber: nextBatchNum,
    createdAt: new Date().toISOString(),
  };

  const updatedOrder = recalculateOrder({
    ...target,
    deliveries: [...(target.deliveries || []), newBatch],
    updatedAt: new Date().toISOString(),
  });

  await dbSaveOrder(updatedOrder);
  return updatedOrder;
}

// SUPPLIERS OPERATIONS
export async function dbGetSuppliers(): Promise<Supplier[]> {
  if (pool && isConnected) {
    try {
      const res = await pool.query(`SELECT * FROM suppliers ORDER BY name ASC`);
      return res.rows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        phone: r.phone || '',
        email: r.email,
        address: r.address,
        taxId: r.tax_id,
        category: r.category,
      }));
    } catch (e) {
      console.error('dbGetSuppliers error:', e);
    }
  }
  return fallbackSuppliers;
}

export async function dbSaveSuppliers(suppliers: Supplier[]): Promise<Supplier[]> {
  if (pool && isConnected) {
    try {
      for (const s of suppliers) {
        await pool.query(
          `INSERT INTO suppliers (id, code, name, phone, email, address, tax_id, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             code = EXCLUDED.code,
             name = EXCLUDED.name,
             phone = EXCLUDED.phone,
             email = EXCLUDED.email,
             address = EXCLUDED.address,
             tax_id = EXCLUDED.tax_id,
             category = EXCLUDED.category`,
          [s.id, s.code, s.name, s.phone, s.email || null, s.address || null, s.taxId || null, s.category || null]
        );
      }
      return suppliers;
    } catch (e) {
      console.error('dbSaveSuppliers error:', e);
    }
  }
  fallbackSuppliers = suppliers;
  return suppliers;
}

export async function dbDeleteSupplier(id: string): Promise<boolean> {
  if (pool && isConnected) {
    try {
      await pool.query(`DELETE FROM suppliers WHERE id = $1`, [id]);
      return true;
    } catch (e) {
      console.error('dbDeleteSupplier error:', e);
    }
  }
  fallbackSuppliers = fallbackSuppliers.filter((s) => s.id !== id);
  return true;
}

// PRODUCTS OPERATIONS
export async function dbGetProducts(): Promise<ProductItem[]> {
  if (pool && isConnected) {
    try {
      const res = await pool.query(`SELECT * FROM products ORDER BY name ASC`);
      return res.rows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        unit: r.unit,
        defaultPrice: Number(r.default_price),
        category: r.category,
        supplierId: r.supplier_id,
      }));
    } catch (e) {
      console.error('dbGetProducts error:', e);
    }
  }
  return fallbackProducts;
}

export async function dbSaveProducts(products: ProductItem[]): Promise<ProductItem[]> {
  if (pool && isConnected) {
    try {
      for (const p of products) {
        await pool.query(
          `INSERT INTO products (id, code, name, unit, default_price, category, supplier_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             code = EXCLUDED.code,
             name = EXCLUDED.name,
             unit = EXCLUDED.unit,
             default_price = EXCLUDED.default_price,
             category = EXCLUDED.category,
             supplier_id = EXCLUDED.supplier_id`,
          [p.id, p.code, p.name, p.unit, p.defaultPrice, p.category || null, p.supplierId || null]
        );
      }
      return products;
    } catch (e) {
      console.error('dbSaveProducts error:', e);
    }
  }
  fallbackProducts = products;
  return products;
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  if (pool && isConnected) {
    try {
      await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
      return true;
    } catch (e) {
      console.error('dbDeleteProduct error:', e);
    }
  }
  fallbackProducts = fallbackProducts.filter((p) => p.id !== id);
  return true;
}

// PIN MANAGEMENT OPERATIONS
export async function dbGetManagerPin(): Promise<string> {
  if (pool && isConnected) {
    try {
      const res = await pool.query(`SELECT value FROM app_settings WHERE key = 'manager_pin'`);
      if (res.rows.length > 0) return res.rows[0].value;
    } catch (e) {
      console.error('dbGetManagerPin error:', e);
    }
  }
  return fallbackPin;
}

export async function dbUpdateManagerPin(newPin: string): Promise<boolean> {
  if (!newPin || newPin.trim().length < 4) return false;
  const pin = newPin.trim();

  if (pool && isConnected) {
    try {
      await pool.query(
        `INSERT INTO app_settings (key, value) VALUES ('manager_pin', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [pin]
      );
      return true;
    } catch (e) {
      console.error('dbUpdateManagerPin error:', e);
    }
  }
  fallbackPin = pin;
  return true;
}

export async function dbResetSampleData(): Promise<void> {
  if (pool && isConnected) {
    try {
      await pool.query(`DELETE FROM purchase_orders`);
      await pool.query(`DELETE FROM products`);
      await pool.query(`DELETE FROM suppliers`);
      await pool.query(`UPDATE app_settings SET value = '1234' WHERE key = 'manager_pin'`);
      
      // Re-seed
      await initDb();
      return;
    } catch (e) {
      console.error('dbResetSampleData error:', e);
    }
  }
  fallbackOrders = [...INITIAL_ORDERS];
  fallbackSuppliers = [...INITIAL_SUPPLIERS];
  fallbackProducts = [...INITIAL_PRODUCTS];
  fallbackPin = '1234';
}
