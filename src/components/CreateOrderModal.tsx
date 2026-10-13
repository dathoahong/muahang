import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Building2, 
  Package, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  DollarSign
} from 'lucide-react';
import { Supplier, ProductItem, PurchaseOrder, OrderItem } from '../types';
import { formatVND } from '../utils/storage';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: ProductItem[];
  onSaveOrder: (newOrder: PurchaseOrder) => void;
  onQuickAddSupplier: (name: string, phone: string) => Supplier;
  onQuickAddProduct: (name: string, unit: string, defaultPrice: number, supplierId?: string) => ProductItem;
}

interface OrderFormLine {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  quantityOrdered: number;
  unitPrice: number;
  totalAmount: number;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  products,
  onSaveOrder,
  onQuickAddSupplier,
  onQuickAddProduct,
}) => {
  // Auto-generate PO number
  const today = new Date();
  const dateCode = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const defaultPoNumber = `PO-${dateCode}-${randomSuffix}`;
  const defaultDateStr = today.toISOString().split('T')[0];

  // Default expected date: 7 days later
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const defaultExpectedDateStr = nextWeek.toISOString().split('T')[0];

  const [poNumber, setPoNumber] = useState(defaultPoNumber);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [orderDate, setOrderDate] = useState(defaultDateStr);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(defaultExpectedDateStr);
  const [notes, setNotes] = useState('');
  const [createdBy, setCreatedBy] = useState('Quản lý Mua hàng');

  useEffect(() => {
    if (isOpen) {
      const curToday = new Date();
      const curDateCode = curToday.toISOString().slice(0, 10).replace(/-/g, '');
      const curRandomSuffix = Math.floor(100 + Math.random() * 900);
      setPoNumber(`PO-${curDateCode}-${curRandomSuffix}`);
      const supId = suppliers[0]?.id || '';
      setSelectedSupplierId(supId);
      setOrderDate(curToday.toISOString().split('T')[0]);
      const curNextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setExpectedDeliveryDate(curNextWeek.toISOString().split('T')[0]);
      setNotes('');
      setCreatedBy('Quản lý Mua hàng');
      setError(null);
      const initialProd = products.find((p) => p.supplierId === supId) || products[0];
      if (initialProd) {
        setLines([
          {
            id: `line-${Date.now()}`,
            productId: initialProd.id,
            productCode: initialProd.code,
            productName: initialProd.name,
            unit: initialProd.unit,
            quantityOrdered: 100,
            unitPrice: initialProd.defaultPrice,
            totalAmount: 100 * initialProd.defaultPrice,
          },
        ]);
      } else {
        setLines([]);
      }
    }
  }, [isOpen]);

  // Quick add supplier inline modal / state
  const [showQuickAddSupplier, setShowQuickAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');

  // Quick add product inline
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Cái');
  const [newProdPrice, setNewProdPrice] = useState(100000);

  // Items table state
  const [lines, setLines] = useState<OrderFormLine[]>(() => {
    // If we have products for the selected supplier, prefill 1 item
    const initialProd = products.find((p) => p.supplierId === selectedSupplierId) || products[0];
    if (initialProd) {
      return [
        {
          id: `line-${Date.now()}`,
          productId: initialProd.id,
          productCode: initialProd.code,
          productName: initialProd.name,
          unit: initialProd.unit,
          quantityOrdered: 100,
          unitPrice: initialProd.defaultPrice,
          totalAmount: 100 * initialProd.defaultPrice,
        },
      ];
    }
    return [];
  });

  const [error, setError] = useState<string | null>(null);

  // Filter products by selected supplier (or show all if none specifically assigned)
  const availableProductsForSupplier = products.filter(
    (p) => !p.supplierId || p.supplierId === selectedSupplierId
  );
  // Fallback to all products if empty
  const selectableProducts = availableProductsForSupplier.length > 0 ? availableProductsForSupplier : products;

  const handleProductSelect = (lineId: string, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        const total = line.quantityOrdered * prod.defaultPrice;
        return {
          ...line,
          productId: prod.id,
          productCode: prod.code,
          productName: prod.name,
          unit: prod.unit,
          unitPrice: prod.defaultPrice,
          totalAmount: total,
        };
      })
    );
  };

  const handleQuantityChange = (lineId: string, qtyStr: string) => {
    const qty = Math.max(1, parseInt(qtyStr, 10) || 0);
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        return {
          ...line,
          quantityOrdered: qty,
          totalAmount: qty * line.unitPrice,
        };
      })
    );
  };

  const handlePriceChange = (lineId: string, priceStr: string) => {
    const price = Math.max(0, parseInt(priceStr, 10) || 0);
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        return {
          ...line,
          unitPrice: price,
          totalAmount: line.quantityOrdered * price,
        };
      })
    );
  };

  const handleAddLine = () => {
    const defaultP = selectableProducts[0] || products[0];
    if (!defaultP) return;

    const newLine: OrderFormLine = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: defaultP.id,
      productCode: defaultP.code,
      productName: defaultP.name,
      unit: defaultP.unit,
      quantityOrdered: 50,
      unitPrice: defaultP.defaultPrice,
      totalAmount: 50 * defaultP.defaultPrice,
    };
    setLines((prev) => [...prev, newLine]);
  };

  const handleRemoveLine = (lineId: string) => {
    if (lines.length <= 1) {
      setError('Đơn hàng phải có ít nhất một mặt hàng.');
      return;
    }
    setError(null);
    setLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const handleQuickSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    const sup = onQuickAddSupplier(newSupplierName.trim(), newSupplierPhone.trim() || '---');
    setSelectedSupplierId(sup.id);
    setNewSupplierName('');
    setNewSupplierPhone('');
    setShowQuickAddSupplier(false);
  };

  const handleQuickSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    const prod = onQuickAddProduct(
      newProdName.trim(),
      newProdUnit.trim(),
      newProdPrice,
      selectedSupplierId
    );
    // Add this new product as a new line immediately
    const newLine: OrderFormLine = {
      id: `line-${Date.now()}`,
      productId: prod.id,
      productCode: prod.code,
      productName: prod.name,
      unit: prod.unit,
      quantityOrdered: 100,
      unitPrice: prod.defaultPrice,
      totalAmount: 100 * prod.defaultPrice,
    };
    setLines((prev) => [...prev, newLine]);
    setNewProdName('');
    setShowQuickAddProduct(false);
  };

  const totalQuantity = lines.reduce((sum, l) => sum + l.quantityOrdered, 0);
  const totalAmount = lines.reduce((sum, l) => sum + l.totalAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!poNumber.trim()) {
      setError('Vui lòng nhập Mã đơn hàng (PO)');
      return;
    }

    const selectedSup = suppliers.find((s) => s.id === selectedSupplierId);
    if (!selectedSup) {
      setError('Vui lòng chọn Nhà Cung Cấp từ droplist');
      return;
    }

    if (lines.length === 0) {
      setError('Vui lòng thêm ít nhất một mặt hàng');
      return;
    }

    const orderItems: OrderItem[] = lines.map((l) => ({
      id: `poi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: l.productId,
      productCode: l.productCode,
      productName: l.productName,
      unit: l.unit,
      quantityOrdered: l.quantityOrdered,
      unitPrice: l.unitPrice,
      totalAmount: l.totalAmount,
      receivedQuantity: 0,
      remainingQuantity: l.quantityOrdered,
      fulfillmentRate: 0,
      isCompleted: false,
    }));

    const newOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: poNumber.trim().toUpperCase(),
      supplierId: selectedSup.id,
      supplierName: selectedSup.name,
      supplierPhone: selectedSup.phone,
      orderDate,
      expectedDeliveryDate,
      status: 'pending',
      items: orderItems,
      deliveries: [],
      totalOrderedQuantity: totalQuantity,
      totalReceivedQuantity: 0,
      overallFulfillmentRate: 0,
      isFullyDelivered: false,
      totalOrderAmount: totalAmount,
      notes: notes.trim() || undefined,
      createdBy: createdBy.trim() || 'Quản lý Mua hàng',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveOrder(newOrder);
    onClose();
  };

  const selectedSupplierObj = suppliers.find((s) => s.id === selectedSupplierId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Tạo Đơn Đặt Hàng Mới Cho Nhà Cung Cấp (PO)</h3>
              <p className="text-xs text-slate-300">
                Lập đơn hàng, chọn NCC, danh sách mặt hàng và kế hoạch chia đợt giao kho
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1 leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Order Meta & Droplist NCC */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* PO Number */}
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Mã đơn hàng (PO Number) *
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="PO-20261010-001"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600 font-mono font-bold"
                required
              />
            </div>

            {/* Droplist NCC */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chọn Nhà Cung Cấp (Droplist NCC) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickAddSupplier(!showQuickAddSupplier)}
                  className="text-2xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Thêm NCC mới</span>
                </button>
              </div>

              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
                required
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name} - SĐT: {s.phone}
                  </option>
                ))}
              </select>

              {selectedSupplierObj && (
                <div className="mt-1 text-2xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>Địa chỉ: {selectedSupplierObj.address || 'Đang cập nhật'}</span>
                  <span>·</span>
                  <span>Lĩnh vực: {selectedSupplierObj.category || 'Vật tư'}</span>
                </div>
              )}
            </div>

            {/* Inline Quick Add Supplier */}
            {showQuickAddSupplier && (
              <div className="md:col-span-3 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 animate-in fade-in">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-2">
                  Thêm nhanh Nhà Cung Cấp mới vào danh mục
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder="Tên công ty / Nhà cung cấp mới..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <input
                    type="text"
                    value={newSupplierPhone}
                    onChange={(e) => setNewSupplierPhone(e.target.value)}
                    placeholder="Số điện thoại liên hệ"
                    className="w-full sm:w-44 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleQuickSaveSupplier}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg whitespace-nowrap"
                  >
                    Lưu & Chọn NCC
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddSupplier(false)}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {/* Date Picker Fields */}
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Ngày đặt hàng *
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Hạn giao hàng dự kiến *
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Người lập đơn
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="Trần Văn Minh"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Ghi chú điều khoản / yêu cầu giao hàng
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Giao chia làm nhiều đợt theo tiến độ công trình, kiểm tra hóa đơn VAT trước khi nhận..."
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Section 2: Items Table with Droplist Mặt Hàng */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Danh sách mặt hàng đặt mua ({lines.length} dòng):
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddProduct(!showQuickAddProduct)}
                  className="text-2xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Thêm mặt hàng mới vào kho</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm dòng hàng</span>
                </button>
              </div>
            </div>

            {/* Inline Quick Add Product */}
            {showQuickAddProduct && (
              <div className="mb-3 p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg border border-teal-200 dark:border-teal-800 animate-in fade-in">
                <div className="text-xs font-bold text-teal-900 dark:text-teal-200 mb-2">
                  Tạo nhanh mặt hàng mới vào danh mục
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Tên mặt hàng mới..."
                    className="sm:col-span-2 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="ĐVT (Thùng, Cái, Cuộn...)"
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseInt(e.target.value, 10) || 0)}
                    placeholder="Đơn giá (VND)"
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddProduct(false)}
                    className="px-2 py-1 text-2xs text-slate-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickSaveProduct}
                    className="px-3 py-1 text-2xs font-semibold bg-teal-700 text-white rounded-lg"
                  >
                    Lưu vào đơn
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3 min-w-[220px]">Chọn Mặt Hàng (Droplist)</th>
                      <th className="py-2.5 px-2 text-center w-20">ĐVT</th>
                      <th className="py-2.5 px-2 text-center w-28">Số lượng đặt</th>
                      <th className="py-2.5 px-2 text-right w-36">Đơn giá (VNĐ)</th>
                      <th className="py-2.5 px-3 text-right w-36">Thành tiền</th>
                      <th className="py-2.5 px-2 text-center w-12">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {lines.map((line, index) => (
                      <tr key={line.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-center">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={line.productId}
                            onChange={(e) => handleProductSelect(line.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.code}] {p.name} ({p.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-2 text-center font-medium text-slate-600 dark:text-slate-400">
                          {line.unit}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={line.quantityOrdered}
                            onChange={(e) => handleQuantityChange(line.id, e.target.value)}
                            className="w-20 text-center font-bold py-1.5 px-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={line.unitPrice}
                            onChange={(e) => handlePriceChange(line.id, e.target.value)}
                            className="w-28 text-right font-mono py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                          {formatVND(line.totalAmount)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3: Summary & Submit */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Tổng số lượng đặt hàng:
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {totalQuantity.toLocaleString()} sản phẩm ({lines.length} mặt hàng)
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Tổng giá trị đơn hàng (Chưa bao gồm VAT):
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatVND(totalAmount)}
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Hoàn tất & Lưu đơn hàng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
