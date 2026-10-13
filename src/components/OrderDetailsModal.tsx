import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Truck, 
  Layers, 
  Calendar, 
  User, 
  Building2, 
  Printer, 
  PlusCircle, 
  Clock, 
  PackageCheck,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { PurchaseOrder } from '../types';
import { formatVND, formatDateVN, formatDateTimeVN } from '../utils/storage';
import { exportSingleOrderToExcel } from '../utils/excel';

interface OrderDetailsModalProps {
  isOpen: boolean;
  order: PurchaseOrder | null;
  onClose: () => void;
  onReceiveBatch: (order: PurchaseOrder) => void;
  onPrint: (order: PurchaseOrder) => void;
  isManager: boolean;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  order,
  onClose,
  onReceiveBatch,
  onPrint,
  isManager,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'deliveries'>('items');

  if (!isOpen || !order) return null;

  const is100Percent = order.isFullyDelivered || order.overallFulfillmentRate >= 100;
  const deliveryCount = order.deliveries?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header - Vibrant Green if 100% */}
        <div
          className={`p-5 sm:p-6 text-white flex items-start justify-between ${
            is100Percent
              ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800'
              : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900'
          }`}
        >
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xl font-bold font-mono tracking-tight">{order.poNumber}</span>
              {is100Percent ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400 text-emerald-950 flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ĐÃ GIAO ĐỦ 100% (HOÀN THÀNH)
                </span>
              ) : order.overallFulfillmentRate > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-amber-950 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  Đang giao ({deliveryCount} đợt)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Chờ giao hàng (0%)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-200">
              <Building2 className="w-4 h-4 shrink-0 text-slate-300" />
              <span className="font-semibold">{order.supplierName}</span>
              {order.supplierPhone && (
                <span className="text-xs text-slate-300">({order.supplierPhone})</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportSingleOrderToExcel(order)}
              className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-1.5 transition-colors text-white"
              title="Xuất đơn hàng này ra file Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
            <button
              type="button"
              onClick={() => onPrint(order)}
              className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-1.5 transition-colors text-white"
              title="In phiếu đơn hàng và phiếu nhận kho"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In phiếu</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white text-xl p-1 leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Highlight notification bar when 100% */}
        {is100Percent && (
          <div className="bg-emerald-100 dark:bg-emerald-950/70 border-b border-emerald-300 dark:border-emerald-800 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">
                Tất cả các mặt hàng đã được giao nhận đủ 100% vào kho. Đơn hàng đạt điều kiện nghiệm thu và thanh toán.
              </span>
            </div>
            <span className="font-bold font-mono">100% HOÀN TẤT</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Ngày đặt / Hẹn giao
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">
                {formatDateVN(order.orderDate)} → {formatDateVN(order.expectedDeliveryDate)}
              </div>
            </div>

            <div>
              <div className="text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Tiến độ nhận kho
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-base font-extrabold ${is100Percent ? 'text-emerald-600' : 'text-indigo-600'}`}>
                  {order.overallFulfillmentRate}%
                </span>
                <span className="text-2xs text-slate-500">
                  ({order.totalReceivedQuantity}/{order.totalOrderedQuantity} SP)
                </span>
              </div>
            </div>

            <div>
              <div className="text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Số đợt giao kho
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{deliveryCount} đợt đã ghi nhận</span>
              </div>
            </div>

            <div>
              <div className="text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Tổng giá trị đơn hàng
              </div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {formatVND(order.totalOrderAmount)}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-600 dark:text-slate-400">Thanh tiến độ giao nhận tổng hợp:</span>
              <span className={`font-bold ${is100Percent ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                {order.overallFulfillmentRate}% (Đã nhận {order.totalReceivedQuantity} / {order.totalOrderedQuantity} đơn vị)
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-600">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  is100Percent ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, order.overallFulfillmentRate))}%` }}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('items')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative ${
                  activeTab === 'items'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Danh Sách Mặt Hàng & Tiến Độ ({order.items.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('deliveries')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative flex items-center gap-1.5 ${
                  activeTab === 'deliveries'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Lịch Sử Các Đợt Giao Kho</span>
                <span className="px-1.5 py-0.2 rounded-full text-2xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {deliveryCount}
                </span>
              </button>
            </div>

            {/* Quick Action to Receive Next Batch */}
            <button
              type="button"
              onClick={() => onReceiveBatch(order)}
              className="mb-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ghi nhận đợt nhận kho</span>
            </button>
          </div>

          {/* TAB 1: ITEMS BREAKDOWN */}
          {activeTab === 'items' && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Mặt hàng</th>
                      <th className="py-2.5 px-2 text-center">ĐVT</th>
                      <th className="py-2.5 px-2 text-right">SL Đặt</th>
                      <th className="py-2.5 px-2 text-right">Đã nhận</th>
                      <th className="py-2.5 px-2 text-right">Còn nợ</th>
                      <th className="py-2.5 px-2 text-right">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                      <th className="py-2.5 px-3 text-center">Tỷ lệ hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {order.items.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          item.isCompleted
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/25'
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
                        <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400 font-medium">
                          {item.unit}
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-slate-800 dark:text-slate-200">
                          {item.quantityOrdered}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white">
                          {item.receivedQuantity}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold">
                          {item.remainingQuantity > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">
                              {item.remainingQuantity}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-slate-600 dark:text-slate-400">
                          {formatVND(item.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold font-mono text-slate-900 dark:text-white">
                          {formatVND(item.totalAmount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              100% Đủ
                            </span>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-2xs font-semibold text-amber-600 dark:text-amber-400">
                                {item.fulfillmentRate}%
                              </span>
                              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${item.fulfillmentRate}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DELIVERIES HISTORY (CHIA ĐỢT GIAO HÀNG KHO) */}
          {activeTab === 'deliveries' && (
            <div className="space-y-4">
              {deliveryCount === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Chưa có đợt nhận hàng nào về kho
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Khi nhà cung cấp chở hàng đến kho, bấm nút bên dưới để ghi nhận Đợt 1
                  </p>
                  <button
                    type="button"
                    onClick={() => onReceiveBatch(order)}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                  >
                    + Nhận đợt hàng đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {order.deliveries.map((batch) => {
                    const batchTotalUnits = batch.items.reduce((s, it) => s + it.quantityReceived, 0);

                    return (
                      <div
                        key={batch.id}
                        className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:border-slate-300"
                      >
                        {/* Batch Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                              #{batch.batchNumber}
                            </span>
                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Giao nhận Đợt {batch.batchNumber}</span>
                                {batch.deliveryDocCode && (
                                  <span className="px-2 py-0.5 rounded text-2xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                    Số phiếu: {batch.deliveryDocCode}
                                  </span>
                                )}
                              </div>
                              <div className="text-2xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>Ngày nhập kho: <strong>{formatDateVN(batch.deliveryDate)}</strong></span>
                                <span>·</span>
                                <span>Người nhận: <strong>{batch.receiverName}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                              + Nhận {batchTotalUnits} đơn vị SP
                            </span>
                          </div>
                        </div>

                        {/* Batch Note */}
                        {batch.note && (
                          <div className="py-2 text-xs text-slate-600 dark:text-slate-300 italic">
                            💬 Ghi chú đợt: "{batch.note}"
                          </div>
                        )}

                        {/* Items received in this specific batch */}
                        <div className="pt-2">
                          <div className="text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Chi tiết hàng nhận trong đợt này:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {batch.items.map((it, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs"
                              >
                                <span className="truncate pr-2 font-medium text-slate-800 dark:text-slate-200">
                                  {it.productName}
                                </span>
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0 font-mono">
                                  +{it.quantityReceived} {it.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notes & Footer */}
          {order.notes && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300">Ghi chú đơn hàng:</span> {order.notes}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="text-2xs text-slate-400">
              Người lập: {order.createdBy} · Tạo lúc: {formatDateTimeVN(order.createdAt)}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
