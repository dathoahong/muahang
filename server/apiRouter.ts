import express from 'express';
import {
  isDbConnected,
  getConnectionStringSource,
  dbGetOrders,
  dbSaveOrder,
  dbDeleteOrder,
  dbAddDeliveryBatch,
  dbGetSuppliers,
  dbSaveSuppliers,
  dbDeleteSupplier,
  dbGetProducts,
  dbSaveProducts,
  dbDeleteProduct,
  dbGetManagerPin,
  dbUpdateManagerPin,
  dbResetSampleData,
} from './db';

const router = express.Router();

router.use(express.json());

// Health & Database Connection status
router.get('/health', async (_req, res) => {
  try {
    const orders = await dbGetOrders();
    res.json({
      status: 'ok',
      database: isDbConnected() ? 'Vercel Postgres (Connected)' : 'Fallback / Memory',
      connected: isDbConnected(),
      envSource: getConnectionStringSource(),
      ordersCount: orders.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ORDERS
router.get('/orders', async (_req, res) => {
  try {
    const orders = await dbGetOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng' });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData || !orderData.poNumber) {
      return res.status(400).json({ error: 'Dữ liệu đơn hàng không hợp lệ' });
    }
    const saved = await dbSaveOrder(orderData);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lưu đơn hàng' });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbDeleteOrder(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa đơn hàng' });
  }
});

// CHIA ĐỢT GIAO HÀNG KHO
router.post('/orders/:id/deliveries', async (req, res) => {
  try {
    const { id } = req.params;
    const batchData = req.body;
    if (!batchData || !batchData.items || batchData.items.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu đợt nhận hàng không hợp lệ' });
    }

    const updated = await dbAddDeliveryBatch(id, batchData);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi ghi nhận đợt nhận hàng' });
  }
});

// SUPPLIERS
router.get('/suppliers', async (_req, res) => {
  try {
    const suppliers = await dbGetSuppliers();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh sách NCC' });
  }
});

router.post('/suppliers', async (req, res) => {
  try {
    const data = req.body;
    const list = Array.isArray(data) ? data : [data];
    const saved = await dbSaveSuppliers(list);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lưu NCC' });
  }
});

router.delete('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbDeleteSupplier(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa NCC' });
  }
});

// PRODUCTS
router.get('/products', async (_req, res) => {
  try {
    const products = await dbGetProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh mục mặt hàng' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const data = req.body;
    const list = Array.isArray(data) ? data : [data];
    const saved = await dbSaveProducts(list);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lưu mặt hàng' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbDeleteProduct(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa mặt hàng' });
  }
});

// AUTH PIN
router.post('/auth/verify-pin', async (req, res) => {
  try {
    const { pin } = req.body;
    const currentPin = await dbGetManagerPin();
    const isValid = String(pin || '').trim() === String(currentPin).trim();
    res.json({ valid: isValid });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xác thực PIN' });
  }
});

router.post('/auth/update-pin', async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    const currentPin = await dbGetManagerPin();
    if (String(oldPin || '').trim() !== String(currentPin).trim()) {
      return res.status(400).json({ error: 'Mã PIN hiện tại không chính xác' });
    }
    const success = await dbUpdateManagerPin(newPin);
    if (!success) {
      return res.status(400).json({ error: 'Mã PIN mới không hợp lệ (ít nhất 4 số)' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật PIN' });
  }
});

// RESET SAMPLE DATA (Đã tắt theo yêu cầu bảo toàn dữ liệu)
router.post('/reset', async (_req, res) => {
  res.status(403).json({ 
    error: 'Chức năng khôi phục dữ liệu ban đầu đã bị vô hiệu hóa để bảo đảm an toàn dữ liệu.' 
  });
});

export default router;
