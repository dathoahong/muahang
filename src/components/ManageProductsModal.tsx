import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, Search } from 'lucide-react';
import { ProductItem, Supplier } from '../types';
import { formatVND } from '../utils/storage';

interface ManageProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  suppliers: Supplier[];
  onSaveProducts: (products: ProductItem[]) => void;
  isManager: boolean;
}

export const ManageProductsModal: React.FC<ManageProductsModalProps> = ({
  isOpen,
  onClose,
  products,
  suppliers,
  onSaveProducts,
  isManager,
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Thùng');
  const [defaultPrice, setDefaultPrice] = useState(100000);
  const [supplierId, setSupplierId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      const updated = products.map((p) =>
        p.id === editingId
          ? {
              ...p,
              code: code.trim().toUpperCase() || p.code,
              name: name.trim(),
              unit: unit.trim() || 'Cái',
              defaultPrice: Math.max(0, defaultPrice),
              supplierId: supplierId || undefined,
            }
          : p
      );
      onSaveProducts(updated);
      setEditingId(null);
    } else {
      const newProd: ProductItem = {
        id: `prod-${Date.now()}`,
        code: code.trim().toUpperCase() || `SP-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        unit: unit.trim() || 'Cái',
        defaultPrice: Math.max(0, defaultPrice),
        supplierId: supplierId || undefined,
      };
      onSaveProducts([...products, newProd]);
    }

    setCode('');
    setName('');
    setUnit('Thùng');
    setDefaultPrice(100000);
    setSupplierId('');
  };

  const handleStartEdit = (p: ProductItem) => {
    setEditingId(p.id);
    setCode(p.code);
    setName(p.name);
    setUnit(p.unit);
    setDefaultPrice(p.defaultPrice);
    setSupplierId(p.supplierId || '');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa mặt hàng này khỏi danh mục droplist?')) {
      onSaveProducts(products.filter((p) => p.id !== id));
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold">Danh Mục Mặt Hàng (Droplist Mặt Hàng)</h3>
              <p className="text-xs text-slate-300">Quản lý các sản phẩm hiển thị trong droplist khi tạo đơn đặt hàng</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xl">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Form add/edit */}
          {isManager ? (
            <form onSubmit={handleAddOrUpdate} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                {editingId ? 'Chỉnh sửa mặt hàng' : '+ Thêm Mặt Hàng mới vào Droplist'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Mã SP</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VNM-005"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg uppercase font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Tên Mặt Hàng *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sữa tươi tiệt trùng..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Đơn vị tính (ĐVT)</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Thùng">Thùng</option>
                    <option value="Hộp">Hộp</option>
                    <option value="Cái">Cái</option>
                    <option value="Cây">Cây</option>
                    <option value="Cuộn">Cuộn</option>
                    <option value="Bộ">Bộ</option>
                    <option value="Kg">Kg</option>
                    <option value="Ram">Ram</option>
                    <option value="Mét">Mét</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Đơn giá tham khảo (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Nhà cung cấp thường đặt</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="">-- Dùng chung cho mọi NCC --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setCode('');
                      setName('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Hủy sửa
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  {editingId ? 'Cập nhật mặt hàng' : '+ Thêm vào danh mục'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500 italic">
              🔒 Đang ở chế độ xem. Để thêm/sửa mặt hàng, vui lòng đăng nhập bằng mã PIN quản lý.
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mặt hàng theo tên hoặc mã..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <span className="text-2xs text-slate-500">
              Có {filteredProducts.length} mặt hàng
            </span>
          </div>

          {/* Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Mã SP</th>
                  <th className="py-2.5 px-3">Tên Mặt Hàng</th>
                  <th className="py-2.5 px-2 text-center">ĐVT</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá tham khảo</th>
                  {isManager && <th className="py-2.5 px-3 text-center">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {p.code}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-400 font-medium">
                      {p.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatVND(p.defaultPrice)}
                    </td>
                    {isManager && (
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
