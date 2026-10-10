import React from 'react';
import { 
  CheckCircle2, 
  Truck, 
  Clock, 
  Calendar, 
  Building2, 
  Package, 
  ChevronRight, 
  PlusCircle, 
  Printer, 
  Trash2, 
  Edit3,
  Layers
} from 'lucide-react';
import { PurchaseOrder } from '../types';
import { formatVND, formatDateVN } from '../utils/storage';

interface OrderCardProps {
  order: PurchaseOrder;
  isManager: boolean;
  onViewDetails: (order: PurchaseOrder) => void;
  onReceiveBatch: (order: PurchaseOrder) => void;
  onEditOrder?: (order: PurchaseOrder) => void;
  onDeleteOrder?: (orderId: string) => void;
  onPrintOrder: (order: PurchaseOrder) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isManager,
  onViewDetails,
  onReceiveBatch,
  onEditOrder,
  onDeleteOrder,
  onPrintOrder,
}) => {
  const is100Percent = order.isFullyDelivered || order.overallFulfillmentRate >= 100;
  const deliveryCount = order.deliveries?.length || 0;

  return (
    <div
      className={`rounded-2xl transition-all duration-200 border overflow-hidden relative shadow-2xs hover:shadow-md ${
        is100Percent
          ? 'bg-emerald-50/75 dark:bg-emerald-950/25 border-emerald-400 dark:border-emerald-700/80 ring-1 ring-emerald-300 dark:ring-emerald-800'
          : order.status === 'delivering'
          ? 'bg-white dark:bg-slate-800/90 border-amber-200 dark:border-amber-900/60'
          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
      }`}
    >
      {/* Top Banner Stripe - Highlighted green when 100% */}
      {is100Percent && (
        <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between tracking-wide">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>✓ ĐÃ GIAO ĐỦ 100% KHO (HOÀN THÀNH TOÀN BỘ ĐƠN ĐẶT HÀNG)</span>
          </div>
          <span className="text-2xs font-normal opacity-90">
            {deliveryCount} đợt giao nhận
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Main Header info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {order.poNumber}
              </span>

              {/* Status Badge */}
              {is100Percent ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đủ 100%
                </span>
              ) : order.status === 'delivering' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  <Truck className="w-3.5 h-3.5" />
                  Đang giao ({deliveryCount} đợt)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                  <Clock className="w-3.5 h-3.5" />
                  Chờ giao hàng (0%)
                </span>
              )}
            </div>

            {/* Supplier Name */}
            <div className="flex items-center gap-2 mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                {order.supplierName}
              </span>
            </div>
          </div>

          {/* Value and Dates */}
          <div className="sm:text-right">
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {formatVND(order.totalOrderAmount)}
            </div>
            <div className="flex items-center sm:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Đặt: {formatDateVN(order.orderDate)}</span>
              <span>·</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Hẹn: {formatDateVN(order.expectedDeliveryDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress & Delivery Batches Section */}
        <div className="py-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Tiến độ nhận kho:</span>
              <span
                className={`font-bold ${
                  is100Percent
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : order.overallFulfillmentRate > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500'
                }`}
              >
                {order.overallFulfillmentRate}%
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              Đã nhận <strong className="text-slate-800 dark:text-slate-200">{order.totalReceivedQuantity}</strong> /{' '}
              {order.totalOrderedQuantity} đơn vị SP
            </div>
          </div>

          {/* Progress Bar - Vibrant Green for 100% */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-600">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                is100Percent
                  ? 'bg-emerald-500 shadow-xs shadow-emerald-400'
                  : order.overallFulfillmentRate > 0
                  ? 'bg-amber-500'
                  : 'bg-transparent'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, order.overallFulfillmentRate))}%` }}
            />
          </div>

          {/* Batches Pill / Info */}
          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {deliveryCount > 0 ? (
                    <>Đã chia <strong>{deliveryCount} đợt giao</strong> về kho</>
                  ) : (
                    'Chưa phát sinh đợt giao'
                  )}
                </span>
              </div>
              {order.deliveries && order.deliveries.length > 0 && (
                <span className="text-2xs text-slate-400">
                  (Đợt gần nhất: {formatDateVN(order.deliveries[order.deliveries.length - 1].deliveryDate)})
                </span>
              )}
            </div>

            {/* Total items count */}
            <span className="text-slate-500 dark:text-slate-400">
              {order.items.length} mặt hàng
            </span>
          </div>
        </div>

        {/* Quick Item List Preview (First 2-3 items) */}
        <div className="pt-2 pb-3 border-t border-slate-100 dark:border-slate-700/60">
          <div className="space-y-1.5">
            {order.items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className={`text-xs flex items-center justify-between p-1.5 rounded-lg ${
                  item.isCompleted
                    ? 'bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-mono text-2xs font-semibold px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    {item.productCode}
                  </span>
                  <span className="truncate">{item.productName}</span>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="font-medium">
                    {item.receivedQuantity}/{item.quantityOrdered} {item.unit}
                  </span>
                  {item.isCompleted ? (
                    <span className="text-2xs font-bold text-emerald-700 dark:text-emerald-300">
                      ✓ Đủ 100%
                    </span>
                  ) : (
                    <span className="text-2xs text-amber-600 dark:text-amber-400">
                      (Còn {item.remainingQuantity})
                    </span>
                  )}
                </div>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="text-2xs text-slate-500 text-center italic">
                + còn {order.items.length - 3} mặt hàng khác trong đơn
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
          {/* Left actions: View Details */}
          <button
            type="button"
            onClick={() => onViewDetails(order)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors"
          >
            <span>Chi tiết & Lịch sử đợt</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Right actions: Receive batch, Print, Manager options */}
          <div className="flex items-center gap-1.5">
            {/* Receive batch button */}
            {!is100Percent ? (
              <button
                type="button"
                onClick={() => onReceiveBatch(order)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                title={isManager ? "Ghi nhận đợt nhận hàng về kho" : "Yêu cầu mã PIN Quản lý để nhận hàng"}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nhận đợt hàng về kho</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReceiveBatch(order)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 rounded-xl transition-colors"
                title="Đã giao đủ 100%, bấm để xem hoặc nhập bổ sung"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã đủ 100%</span>
              </button>
            )}

            {/* Print PO */}
            <button
              type="button"
              onClick={() => onPrintOrder(order)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="In phiếu đơn hàng / Phiếu đối soát"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Manager only Delete */}
            {isManager && onDeleteOrder && (
              <button
                type="button"
                onClick={() => onDeleteOrder(order.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Xóa đơn hàng này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
