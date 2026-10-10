import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { OrderStats } from './components/OrderStats';
import { OrderFilters } from './components/OrderFilters';
import { OrderCard } from './components/OrderCard';
import { PinModal } from './components/PinModal';
import { CreateOrderModal } from './components/CreateOrderModal';
import { ReceiveBatchModal } from './components/ReceiveBatchModal';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { ManageSuppliersModal } from './components/ManageSuppliersModal';
import { ManageProductsModal } from './components/ManageProductsModal';
import { PrintOrderView } from './components/PrintOrderView';
import { PurchaseOrder, Supplier, ProductItem } from './types';
import {
  getOrders,
  saveOrders,
  getSuppliers,
  saveSuppliers,
  getProducts,
  saveProducts,
  getIsManagerLoggedIn,
  setManagerLoggedIn,
  addDeliveryBatchToOrder,
  resetToSampleData,
} from './utils/storage';
import { 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Plus, 
  Building2, 
  Inbox,
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  // Global State
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isManager, setIsManager] = useState<boolean>(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'delivering' | 'pending'>('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Modals
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'login' | 'change'>('login');
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);
  const [receiveBatchModalOpen, setReceiveBatchModalOpen] = useState(false);
  const [activeOrderForBatch, setActiveOrderForBatch] = useState<PurchaseOrder | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeOrderForDetails, setActiveOrderForDetails] = useState<PurchaseOrder | null>(null);
  const [suppliersModalOpen, setSuppliersModalOpen] = useState(false);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState<PurchaseOrder | null>(null);

  // Celebration Toast when an order reaches 100%
  const [celebrationToast, setCelebrationToast] = useState<{
    show: boolean;
    poNumber: string;
    supplierName: string;
  } | null>(null);

  // Load from storage on mount
  useEffect(() => {
    setOrders(getOrders());
    setSuppliers(getSuppliers());
    setProducts(getProducts());
    setIsManager(getIsManagerLoggedIn());
  }, []);

  // Manager Auth Handlers
  const handleLoginSuccess = () => {
    setIsManager(true);
    setManagerLoggedIn(true);
  };

  const handleLogout = () => {
    setIsManager(false);
    setManagerLoggedIn(false);
  };

  // Guard for actions requiring Manager PIN
  const requireManagerAuth = (action: () => void) => {
    if (isManager) {
      action();
    } else {
      setPinModalMode('login');
      setPinModalOpen(true);
    }
  };

  // Order Handlers
  const handleSaveNewOrder = (newOrder: PurchaseOrder) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveOrders(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Bạn có chắc muốn xóa đơn đặt hàng này không?')) {
      const updated = orders.filter((o) => o.id !== orderId);
      setOrders(updated);
      saveOrders(updated);
    }
  };

  // Add Delivery Batch to Order (Chia đợt giao kho)
  const handleSubmitBatch = (
    orderId: string,
    batchData: {
      deliveryDate: string;
      receiverName: string;
      deliveryDocCode?: string;
      note?: string;
      items: any[];
    }
  ) => {
    const updatedOrder = addDeliveryBatchToOrder(orderId, batchData);
    if (updatedOrder) {
      const freshOrders = getOrders();
      setOrders(freshOrders);

      // Trigger Celebration Toast if order hit 100%
      if (updatedOrder.isFullyDelivered || updatedOrder.overallFulfillmentRate >= 100) {
        setCelebrationToast({
          show: true,
          poNumber: updatedOrder.poNumber,
          supplierName: updatedOrder.supplierName,
        });
        setTimeout(() => {
          setCelebrationToast(null);
        }, 5000);
      }

      // If details modal is open with this order, update it
      if (activeOrderForDetails?.id === orderId) {
        setActiveOrderForDetails(updatedOrder);
      }
    }
  };

  // Quick Add Helpers for Droplists
  const handleQuickAddSupplier = (name: string, phone: string): Supplier => {
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      code: `NCC-${Date.now().toString().slice(-4)}`,
      name,
      phone: phone || '---',
      category: 'Tổng hợp',
    };
    const updated = [...suppliers, newSup];
    setSuppliers(updated);
    saveSuppliers(updated);
    return newSup;
  };

  const handleQuickAddProduct = (
    name: string,
    unit: string,
    defaultPrice: number,
    supplierId?: string
  ): ProductItem => {
    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      code: `SP-${Date.now().toString().slice(-4)}`,
      name,
      unit: unit || 'Cái',
      defaultPrice,
      supplierId,
    };
    const updated = [...products, newProd];
    setProducts(updated);
    saveProducts(updated);
    return newProd;
  };

  const handleResetData = () => {
    if (confirm('Khôi phục toàn bộ danh sách đơn hàng, nhà cung cấp và mặt hàng mẫu ban đầu?')) {
      resetToSampleData();
      setOrders(getOrders());
      setSuppliers(getSuppliers());
      setProducts(getProducts());
      setStatusFilter('all');
      setSearchTerm('');
      setSelectedSupplierId('');
    }
  };

  // Filter and Sort Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Search term (PO, supplier name, item names)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchPo = order.poNumber.toLowerCase().includes(q);
          const matchSup = order.supplierName.toLowerCase().includes(q);
          const matchItems = order.items.some(
            (it) => it.productName.toLowerCase().includes(q) || it.productCode.toLowerCase().includes(q)
          );
          if (!matchPo && !matchSup && !matchItems) return false;
        }

        // Supplier filter
        if (selectedSupplierId && order.supplierId !== selectedSupplierId) {
          return false;
        }

        // Status filter
        if (statusFilter === 'completed') {
          return order.isFullyDelivered || order.overallFulfillmentRate >= 100;
        }
        if (statusFilter === 'delivering') {
          return !order.isFullyDelivered && order.deliveries && order.deliveries.length > 0 && order.overallFulfillmentRate < 100;
        }
        if (statusFilter === 'pending') {
          return (!order.deliveries || order.deliveries.length === 0) && !order.isFullyDelivered;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
        }
        if (sortBy === 'progress-desc') {
          return b.overallFulfillmentRate - a.overallFulfillmentRate;
        }
        if (sortBy === 'progress-asc') {
          return a.overallFulfillmentRate - b.overallFulfillmentRate;
        }
        if (sortBy === 'amount-desc') {
          return b.totalOrderAmount - a.totalOrderAmount;
        }
        return 0;
      });
  }, [orders, searchTerm, selectedSupplierId, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      {/* Navbar */}
      <Navbar
        isManager={isManager}
        onOpenPinModal={() => {
          setPinModalMode('login');
          setPinModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenCreateOrder={() => requireManagerAuth(() => setCreateOrderModalOpen(true))}
        onOpenSuppliers={() => setSuppliersModalOpen(true)}
        onOpenProducts={() => setProductsModalOpen(true)}
        onResetData={handleResetData}
        onChangePin={() => {
          setPinModalMode('change');
          setPinModalOpen(true);
        }}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Role Banner Notification (for Viewers) */}
        {!isManager && (
          <div className="mb-5 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-blue-900 dark:text-blue-200">
                  Bạn đang ở Chế độ Xem (Nhân viên / Khách):
                </span>{' '}
                <span className="text-blue-700 dark:text-blue-300">
                  Có thể tra cứu tình trạng đơn hàng, theo dõi các đợt giao kho và in phiếu.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPinModalMode('login');
                setPinModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl whitespace-nowrap shadow-2xs transition-colors"
            >
              Đăng nhập Quản lý (Mã PIN: 1234)
            </button>
          </div>
        )}

        {/* Celebration Toast (Order Hit 100% Highlighted Green) */}
        {celebrationToast && (
          <div className="mb-6 p-4 bg-emerald-600 text-white rounded-2xl shadow-lg border border-emerald-500 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <span>✓ Đơn hàng {celebrationToast.poNumber} đã giao đủ 100%!</span>
                </div>
                <div className="text-xs text-emerald-100">
                  Nhà cung cấp {celebrationToast.supplierName} đã hoàn tất toàn bộ số lượng. Đơn hàng chuyển sang trạng thái <strong>TÔ XANH 100%</strong>.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCelebrationToast(null)}
              className="text-emerald-200 hover:text-white p-1 text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* Summary Metric Stats Cards */}
        <OrderStats
          orders={orders}
          activeFilter={statusFilter}
          onSelectFilter={(f) => setStatusFilter(f)}
        />

        {/* Search, Supplier Droplist, Status Tabs & Sorting */}
        <OrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSupplierId={selectedSupplierId}
          onSupplierChange={setSelectedSupplierId}
          suppliers={suppliers}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {/* Active Filter Indicator */}
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị <strong>{filteredOrders.length}</strong> / {orders.length} đơn hàng</span>
            {statusFilter === 'completed' && (
              <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
                ✓ Lọc đơn đã giao đủ 100% (Tô xanh)
              </span>
            )}
            {selectedSupplierId && (
              <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                NCC: {suppliers.find((s) => s.id === selectedSupplierId)?.name}
              </span>
            )}
          </div>

          {(searchTerm || selectedSupplierId || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedSupplierId('');
                setStatusFilter('all');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Order Cards Grid */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isManager={isManager}
                onViewDetails={(ord) => {
                  setActiveOrderForDetails(ord);
                  setDetailsModalOpen(true);
                }}
                onReceiveBatch={(ord) => {
                  requireManagerAuth(() => {
                    setActiveOrderForBatch(ord);
                    setReceiveBatchModalOpen(true);
                  });
                }}
                onEditOrder={() => {}}
                onDeleteOrder={isManager ? handleDeleteOrder : undefined}
                onPrintOrder={(ord) => setPrintOrder(ord)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-8">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Không tìm thấy đơn hàng nào phù hợp
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Thử thay đổi từ khóa tìm kiếm, chọn lại nhà cung cấp hoặc bấm nút Tạo đơn hàng mới bên dưới.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSupplierId('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200"
              >
                Xem tất cả đơn
              </button>
              <button
                type="button"
                onClick={() => requireManagerAuth(() => setCreateOrderModalOpen(true))}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tạo đơn hàng mới</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Theo dõi mua hàng QVN · Quản lý đơn hàng NCC, tình trạng hàng hoá, thời gian giao hàng và số lượng © 2026</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Tự động tô xanh khi nhận đủ 100%</span>
            <span>·</span>
            <span>Bảo mật phân quyền mã PIN</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={handleLoginSuccess}
        mode={pinModalMode}
      />

      <CreateOrderModal
        isOpen={createOrderModalOpen}
        onClose={() => setCreateOrderModalOpen(false)}
        suppliers={suppliers}
        products={products}
        onSaveOrder={handleSaveNewOrder}
        onQuickAddSupplier={handleQuickAddSupplier}
        onQuickAddProduct={handleQuickAddProduct}
      />

      <ReceiveBatchModal
        isOpen={receiveBatchModalOpen}
        order={activeOrderForBatch}
        onClose={() => {
          setReceiveBatchModalOpen(false);
          setActiveOrderForBatch(null);
        }}
        onSubmit={handleSubmitBatch}
      />

      <OrderDetailsModal
        isOpen={detailsModalOpen}
        order={activeOrderForDetails}
        onClose={() => {
          setDetailsModalOpen(false);
          setActiveOrderForDetails(null);
        }}
        onReceiveBatch={(ord) => {
          requireManagerAuth(() => {
            setActiveOrderForBatch(ord);
            setReceiveBatchModalOpen(true);
          });
        }}
        onPrint={(ord) => setPrintOrder(ord)}
        isManager={isManager}
      />

      <ManageSuppliersModal
        isOpen={suppliersModalOpen}
        onClose={() => setSuppliersModalOpen(false)}
        suppliers={suppliers}
        onSaveSuppliers={(updated) => {
          setSuppliers(updated);
          saveSuppliers(updated);
        }}
        isManager={isManager}
      />

      <ManageProductsModal
        isOpen={productsModalOpen}
        onClose={() => setProductsModalOpen(false)}
        products={products}
        suppliers={suppliers}
        onSaveProducts={(updated) => {
          setProducts(updated);
          saveProducts(updated);
        }}
        isManager={isManager}
      />

      {/* Printable Sheet View */}
      {printOrder && (
        <PrintOrderView
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
}
