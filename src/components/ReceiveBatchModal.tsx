import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  FileText, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PurchaseOrder, DeliveryBatchItem } from '../types';
import { formatDateVN } from '../utils/storage';

interface ReceiveBatchModalProps {
  isOpen: boolean;
  order: PurchaseOrder | null;
  onClose: () => void;
  onSubmit: (orderId: string, batchData: {
    deliveryDate: string;
    receiverName: string;
    deliveryDocCode?: string;
    note?: string;
    items: DeliveryBatchItem[];
  }) => void;
}

export const ReceiveBatchModal: React.FC<ReceiveBatchModalProps> = ({
  isOpen,
  order,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !order) return null;

  const nextBatchNumber = (order.deliveries?.length || 0) + 1;
  const todayStr = new Date().toISOString().split('T')[0];

  const [deliveryDate, setDeliveryDate] = useState(todayStr);
  const [receiverName, setReceiverName] = useState('Thủ kho trực ban');
  const [deliveryDocCode, setDeliveryDocCode] = useState('');
  const [note, setNote] = useState('');
  
  // State for quantities received in this batch
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>(() => {
    const initMap: Record<string, number> = {};
    order.items.forEach((it) => {
      // Default to 0 or remaining quantity if only 1 item
      initMap[it.id] = 0;
    });
    return initMap;
  });

  const [error, setError] = useState<string | null>(null);

  const handleQtyChange = (itemId: string, value: string) => {
    setError(null);
    const num = Math.max(0, parseInt(value, 10) || 0);
    setReceivedQtyMap((prev) => ({
      ...prev,
      [itemId]: num,
    }));
  };

  const handleFillRemaining = (itemId: string, remaining: number) => {
    setError(null);
    setReceivedQtyMap((prev) => ({
      ...prev,
      [itemId]: remaining,
    }));
  };

  const handleFillAllRemaining = () => {
    setError(null);
    const updated: Record<string, number> = {};
    order.items.forEach((it) => {
      updated[it.id] = Math.max(0, it.remainingQuantity);
    });
    setReceivedQtyMap(updated);
  };

  const handleClearAll = () => {
    const updated: Record<string, number> = {};
    order.items.forEach((it) => {
      updated[it.id] = 0;
    });
    setReceivedQtyMap(updated);
  };

  // Calculate totals for this incoming batch
  const totalIncomingUnits = Object.values(receivedQtyMap).reduce((sum, v) => sum + v, 0);

  // Projected fulfillment after this batch
  const projectedTotalReceived = order.items.reduce((sum, it) => {
    const batchQty = receivedQtyMap[it.id] || 0;
    return sum + Math.min(it.quantityOrdered, it.receivedQuantity + batchQty);
  }, 0);

  const projectedRate = order.totalOrderedQuantity > 0
    ? Math.min(100, Math.round((projectedTotalReceived / order.totalOrderedQuantity) * 1000) / 10)
    : 0;

  const willBe100Percent = order.items.every((it) => {
    const batchQty = receivedQtyMap[it.id] || 0;
    return (it.receivedQuantity + batchQty) >= it.quantityOrdered;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (totalIncomingUnits <= 0) {
      setError('Vui lòng nhập số lượng nhận cho ít nhất một mặt hàng (lớn hơn 0).');
      return;
    }

    if (!receiverName.trim()) {
      setError('Vui lòng điền tên người nhận / thủ kho.');
      return;
    }

    const items: DeliveryBatchItem[] = [];
    for (const it of order.items) {
      const qty = receivedQtyMap[it.id] || 0;
      if (qty > 0) {
        items.push({
          orderItemId: it.id,
          productId: it.productId,
          productName: it.productName,
          unit: it.unit,
          quantityReceived: qty,
        });
      }
    }

    onSubmit(order.id, {
      deliveryDate,
      receiverName: receiverName.trim(),
      deliveryDocCode: deliveryDocCode.trim() || undefined,
      note: note.trim() || undefined,
      items,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  Ghi Nhận Hàng Về Kho: Đợt {nextBatchNumber}
                </h3>
                <span className="px-2 py-0.5 text-2xs font-mono font-bold rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {order.poNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Nhà cung cấp: <strong className="text-white">{order.supplierName}</strong>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Batch Info Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Ngày nhận hàng vào kho *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Người nhận / Thủ kho *
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Hùng - Kho A"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Số phiếu xuất / Biên bản NCC
              </label>
              <input
                type="text"
                value={deliveryDocCode}
                onChange={(e) => setDeliveryDocCode(e.target.value)}
                placeholder="Ví dụ: PXK-9901"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
              />
            </div>

            <div className="sm:col-span-3 mt-1">
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Ghi chú đợt giao này (tùy chọn)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Giao đợt 2 bằng xe tải 29H-1234, hàng bọc nilon nguyên vẹn..."
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Quick Action Bar for Items */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Chi tiết số lượng nhận theo từng mặt hàng:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFillAllRemaining}
                className="px-2.5 py-1 text-2xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 rounded-lg border border-emerald-300 dark:border-emerald-800 transition-colors"
                title="Tự động điền nhận hết tất cả số lượng còn thiếu"
              >
                + Điền nhận hết số còn lại
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-1 text-2xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Đặt về 0
              </button>
            </div>
          </div>

          {/* Table of items to receive */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Mặt hàng</th>
                    <th className="py-2.5 px-2 text-center">ĐVT</th>
                    <th className="py-2.5 px-2 text-right">SL Đặt</th>
                    <th className="py-2.5 px-2 text-right">Đã nhận</th>
                    <th className="py-2.5 px-2 text-right">Còn thiếu</th>
                    <th className="py-2.5 px-3 text-center w-36">Nhận đợt {nextBatchNumber}</th>
                    <th className="py-2.5 px-2 text-center">Tiến độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items.map((item) => {
                    const currentBatchVal = receivedQtyMap[item.id] || 0;
                    const newTotal = item.receivedQuantity + currentBatchVal;
                    const isNowDone = newTotal >= item.quantityOrdered;
                    const newRate = item.quantityOrdered > 0 ? Math.min(100, Math.round((newTotal / item.quantityOrdered) * 100)) : 0;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isNowDone
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.productName}
                          </div>
                          <div className="font-mono text-2xs text-slate-400">
                            {item.productCode}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400">
                          {item.unit}
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-slate-700 dark:text-slate-300">
                          {item.quantityOrdered}
                        </td>
                        <td className="py-3 px-2 text-right text-slate-500">
                          {item.receivedQuantity}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-amber-600 dark:text-amber-400">
                          {item.remainingQuantity}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            <input
                              type="number"
                              min="0"
                              value={currentBatchVal === 0 ? '' : currentBatchVal}
                              onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              placeholder="0"
                              className="w-20 text-center font-bold py-1.5 px-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white"
                            />
                            {item.remainingQuantity > 0 && (
                              <button
                                type="button"
                                onClick={() => handleFillRemaining(item.id, item.remainingQuantity)}
                                className="px-1.5 py-1 text-2xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
                                title="Điền đủ số còn thiếu"
                              >
                                Đủ
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {isNowDone ? (
                            <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              100%
                            </span>
                          ) : (
                            <span className="text-2xs font-medium text-slate-600 dark:text-slate-400">
                              {newRate}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forecast Box: Will this batch make the order 100%? */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              willBe100Percent
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {willBe100Percent ? (
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold">
                    {willBe100Percent
                      ? '🎉 Đợt này sẽ hoàn tất 100% đơn hàng!'
                      : `Dự kiến tiến độ sau Đợt ${nextBatchNumber}:`}
                  </div>
                  <div className="text-2xs text-slate-500 dark:text-slate-400">
                    {willBe100Percent
                      ? 'Tất cả các mặt hàng sẽ nhận đủ. Đơn hàng sẽ được TÔ XANH 100% trên hệ thống.'
                      : `Đợt này nhận thêm ${totalIncomingUnits} đơn vị hàng. Lũy kế đạt ${projectedRate}%.`}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xl font-extrabold ${willBe100Percent ? 'text-emerald-600' : 'text-indigo-600'}`}>
                  {projectedRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={totalIncomingUnits <= 0}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white shadow-sm flex items-center gap-2 transition-all ${
                totalIncomingUnits > 0
                  ? willBe100Percent
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                  : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận nhập kho Đợt {nextBatchNumber}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
