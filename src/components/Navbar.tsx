import React from 'react';
import { 
  Lock, 
  Unlock, 
  Plus, 
  Building2, 
  Package, 
  ShieldCheck, 
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { QVNLogo } from './QVNLogo';

interface NavbarProps {
  isManager: boolean;
  onOpenPinModal: () => void;
  onLogout: () => void;
  onOpenCreateOrder: () => void;
  onOpenSuppliers: () => void;
  onOpenProducts: () => void;
  onChangePin: () => void;
  onOpenImportExcel?: () => void;
  onExportExcel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isManager,
  onOpenPinModal,
  onLogout,
  onOpenCreateOrder,
  onOpenSuppliers,
  onOpenProducts,
  onChangePin,
  onOpenImportExcel,
  onExportExcel,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shadow-xs hover:scale-105 transition-transform">
              <QVNLogo className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                  Theo dõi mua hàng QVN
                </span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Kho & NCC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Quản lý đơn hàng NCC, tình trạng hàng hoá, thời gian giao hàng và số lượng.
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role Indicator Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors">
              {isManager ? (
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quyền Quản lý (Đã xác thực)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chế độ Xem (Chỉ xem trạng thái)</span>
                </div>
              )}
            </div>

            {/* Excel Import / Export Buttons */}
            <div className="hidden md:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
              {onOpenImportExcel && (
                <button
                  type="button"
                  onClick={onOpenImportExcel}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 rounded-lg border border-emerald-200 dark:border-emerald-800/80 transition-colors"
                  title="Nhập danh sách đơn hàng hàng loạt từ file Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Nhập Excel</span>
                </button>
              )}
              {onExportExcel && (
                <button
                  type="button"
                  onClick={onExportExcel}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Xuất danh sách đơn hàng và lịch sử giao kho ra file Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                  <span>Xuất Excel</span>
                </button>
              )}
            </div>

            {/* Quick Catalog Shortcuts */}
            <div className="hidden lg:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
              <button
                type="button"
                onClick={onOpenSuppliers}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Quản lý danh sách Nhà Cung Cấp"
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Nhà Cung Cấp</span>
              </button>
              <button
                type="button"
                onClick={onOpenProducts}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Quản lý danh mục Mặt Hàng"
              >
                <Package className="w-4 h-4 text-slate-500" />
                <span>Mặt Hàng</span>
              </button>
            </div>

            {/* Primary Action Button: Create Order */}
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đơn đặt hàng</span>
            </button>

            {/* PIN Login / Logout button */}
            {isManager ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onChangePin}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="Đổi mã PIN quản lý"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Đổi PIN</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors"
                  title="Đăng xuất chế độ Quản lý"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Thoát</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenPinModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Đăng nhập mã PIN</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
