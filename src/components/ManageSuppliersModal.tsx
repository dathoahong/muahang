import React, { useState } from 'react';
import { Building2, Plus, Trash2, Edit2, Check, Phone, Mail, MapPin } from 'lucide-react';
import { Supplier } from '../types';

interface ManageSuppliersModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  onSaveSuppliers: (suppliers: Supplier[]) => void;
  isManager: boolean;
}

export const ManageSuppliersModal: React.FC<ManageSuppliersModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  onSaveSuppliers,
  isManager,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      const updated = suppliers.map((s) =>
        s.id === editingId
          ? {
              ...s,
              code: code.trim().toUpperCase() || s.code,
              name: name.trim(),
              phone: phone.trim() || '---',
              email: email.trim() || undefined,
              address: address.trim() || undefined,
              category: category.trim() || undefined,
            }
          : s
      );
      onSaveSuppliers(updated);
      setEditingId(null);
    } else {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        code: code.trim().toUpperCase() || `NCC-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        phone: phone.trim() || '---',
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        category: category.trim() || undefined,
      };
      onSaveSuppliers([...suppliers, newSup]);
    }

    setCode('');
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCategory('');
  };

  const handleStartEdit = (s: Supplier) => {
    setEditingId(s.id);
    setCode(s.code);
    setName(s.name);
    setPhone(s.phone);
    setEmail(s.email || '');
    setAddress(s.address || '');
    setCategory(s.category || '');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa Nhà Cung Cấp này khỏi droplist?')) {
      onSaveSuppliers(suppliers.filter((s) => s.id !== id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold">Danh Mục Nhà Cung Cấp (Droplist NCC)</h3>
              <p className="text-xs text-slate-300">Quản lý danh bạ NCC xuất hiện trong droplist chọn đơn hàng</p>
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
                {editingId ? 'Chỉnh sửa Nhà Cung Cấp' : '+ Thêm Nhà Cung Cấp mới vào Droplist'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Mã NCC</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="NCC-VNM"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg uppercase font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Tên Công ty / NCC *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên doanh nghiệp..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="028 1234 5678"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@company.com"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 mb-1">Lĩnh vực hàng hóa</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Thực phẩm, Kim khí..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
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
                  {editingId ? 'Cập nhật NCC' : '+ Thêm vào danh mục'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500 italic">
              🔒 Đang ở chế độ xem. Để thêm/sửa NCC, vui lòng đăng nhập bằng mã PIN quản lý.
            </div>
          )}

          {/* List of suppliers */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Mã</th>
                    <th className="py-2.5 px-3">Tên Nhà Cung Cấp</th>
                    <th className="py-2.5 px-3">Điện thoại</th>
                    <th className="py-2.5 px-3">Lĩnh vực</th>
                    {isManager && <th className="py-2.5 px-3 text-center">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {s.code}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {s.name}
                        {s.address && (
                          <div className="text-2xs font-normal text-slate-400 truncate max-w-xs">
                            {s.address}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {s.phone}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {s.category || '---'}
                      </td>
                      {isManager && (
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(s)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(s.id)}
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
    </div>
  );
};
