import React from 'react';
import { Search, Filter, CheckCircle2, Truck, Clock, ArrowUpDown } from 'lucide-react';
import { Supplier } from '../types';

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedSupplierId: string;
  onSupplierChange: (id: string) => void;
  suppliers: Supplier[];
  statusFilter: 'all' | 'completed' | 'delivering' | 'pending';
  onStatusFilterChange: (status: 'all' | 'completed' | 'delivering' | 'pending') => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedSupplierId,
  onSupplierChange,
  suppliers,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xs mb-6 space-y-3">
      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo Mã PO, Nhà cung cấp, Tên mặt hàng..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Droplist NCC Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedSupplierId}
            onChange={(e) => onSupplierChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">Tất cả Nhà Cung Cấp ({suppliers.length})</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div className="w-full md:w-52 flex items-center gap-1.5">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="date-desc">Ngày đặt: Mới nhất</option>
            <option value="date-asc">Ngày đặt: Cũ nhất</option>
            <option value="progress-desc">% Giao: Cao xuống thấp</option>
            <option value="progress-asc">% Giao: Thấp lên cao</option>
            <option value="amount-desc">Giá trị đơn: Lớn nhất</option>
          </select>
        </div>
      </div>

      {/* Status Segmented Control Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => onStatusFilterChange('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          Tất cả đơn
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange('completed')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
            statusFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-500'
              : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>✓ Đã giao đủ 100% (Tô xanh)</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange('delivering')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
            statusFilter === 'delivering'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Đang giao đợt dở dang</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange('pending')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
            statusFilter === 'pending'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Chờ giao (0%)</span>
        </button>
      </div>
    </div>
  );
};
