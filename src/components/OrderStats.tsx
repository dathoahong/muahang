import React from 'react';
import { CheckCircle2, Clock, Truck, FileText, TrendingUp } from 'lucide-react';
import { PurchaseOrder } from '../types';
import { formatVND } from '../utils/storage';

interface OrderStatsProps {
  orders: PurchaseOrder[];
  activeFilter: string;
  onSelectFilter: (filter: 'all' | 'completed' | 'delivering' | 'pending') => void;
}

export const OrderStats: React.FC<OrderStatsProps> = ({
  orders,
  activeFilter,
  onSelectFilter,
}) => {
  const totalCount = orders.length;
  const completedOrders = orders.filter((o) => o.isFullyDelivered || o.overallFulfillmentRate >= 100);
  const deliveringOrders = orders.filter((o) => !o.isFullyDelivered && o.deliveries && o.deliveries.length > 0 && o.overallFulfillmentRate < 100);
  const pendingOrders = orders.filter((o) => (!o.deliveries || o.deliveries.length === 0) && !o.isFullyDelivered);

  const totalAmount = orders.reduce((sum, o) => sum + (o.totalOrderAmount || 0), 0);
  const totalItemsOrdered = orders.reduce((sum, o) => sum + (o.totalOrderedQuantity || 0), 0);
  const totalItemsReceived = orders.reduce((sum, o) => sum + (o.totalReceivedQuantity || 0), 0);
  const overallAvgRate = totalItemsOrdered > 0 ? Math.round((totalItemsReceived / totalItemsOrdered) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Tổng đơn hàng */}
      <button
        type="button"
        onClick={() => onSelectFilter('all')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeFilter === 'all'
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-800'
            : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            Tổng đơn hàng NCC
          </span>
          <FileText className={`w-4 h-4 ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight">{totalCount}</div>
        <div className={`text-2xs mt-1 truncate ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
          {formatVND(totalAmount)}
        </div>
      </button>

      {/* 2. ĐÃ GIAO ĐỦ 100% (TÔ XANH NỔI BẬT THEO YÊU CẦU) */}
      <button
        type="button"
        onClick={() => onSelectFilter('completed')}
        className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
          activeFilter === 'completed'
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500'
            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${activeFilter === 'completed' ? 'text-emerald-100' : 'text-emerald-800 dark:text-emerald-300'}`}>
            Đã giao đủ 100%
          </span>
          <CheckCircle2 className={`w-4 h-4 ${activeFilter === 'completed' ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
            {completedOrders.length}
          </span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            activeFilter === 'completed' 
              ? 'bg-emerald-500/80 text-white' 
              : 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
          }`}>
            Tô xanh 100%
          </span>
        </div>
        <div className={`text-2xs mt-1 truncate ${activeFilter === 'completed' ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}`}>
          Hoàn thành nhận kho
        </div>
      </button>

      {/* 3. Đang giao dở dang (Có đợt giao) */}
      <button
        type="button"
        onClick={() => onSelectFilter('delivering')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeFilter === 'delivering'
            ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500'
            : 'bg-amber-50/60 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100 border-amber-200 dark:border-amber-800/60 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${activeFilter === 'delivering' ? 'text-amber-100' : 'text-amber-800 dark:text-amber-300'}`}>
            Đang giao đợt lẻ
          </span>
          <Truck className={`w-4 h-4 ${activeFilter === 'delivering' ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-300">
          {deliveringOrders.length}
        </div>
        <div className={`text-2xs mt-1 truncate ${activeFilter === 'delivering' ? 'text-amber-100' : 'text-amber-700 dark:text-amber-400'}`}>
          Đã nhận từng phần
        </div>
      </button>

      {/* 4. Chờ giao hàng */}
      <button
        type="button"
        onClick={() => onSelectFilter('pending')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeFilter === 'pending'
            ? 'bg-slate-700 text-white border-slate-700 shadow-md ring-2 ring-slate-600'
            : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${activeFilter === 'pending' ? 'text-slate-300' : 'text-slate-500'}`}>
            Chờ giao (0%)
          </span>
          <Clock className={`w-4 h-4 ${activeFilter === 'pending' ? 'text-slate-300' : 'text-slate-400'}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight">{pendingOrders.length}</div>
        <div className={`text-2xs mt-1 truncate ${activeFilter === 'pending' ? 'text-slate-300' : 'text-slate-500'}`}>
          Tỷ lệ kho: {overallAvgRate}%
        </div>
      </button>
    </div>
  );
};
