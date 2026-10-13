import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  X, 
  Layers, 
  Building2,
  Package,
  Calendar
} from 'lucide-react';
import { PurchaseOrder, Supplier, ProductItem } from '../types';
import { downloadExcelTemplate, parseExcelFile, ParsedImportResult } from '../utils/excel';
import { formatVND, formatDateVN } from '../utils/storage';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: ProductItem[];
  onImportSuccess: (importedOrders: PurchaseOrder[]) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  products,
  onImportSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setParsedResult(null);
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Định dạng file không hợp lệ! Vui lòng chọn file Excel (.xlsx hoặc .xls).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedFile(file);

    try {
      const result = await parseExcelFile(file, suppliers, products);
      if (result.orders.length === 0) {
        setError('Không tìm thấy đơn hàng hợp lệ nào trong file.');
        setParsedResult(null);
      } else {
        setParsedResult(result);
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi đọc file Excel. Vui lòng kiểm tra lại cấu trúc file.');
      setParsedResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedResult || parsedResult.orders.length === 0) return;
    onImportSuccess(parsedResult.orders);
    handleReset();
    onClose();
  };

  const totalItemsCount = parsedResult?.orders.reduce((sum, o) => sum + o.items.length, 0) || 0;
  const totalAmountSum = parsedResult?.orders.reduce((sum, o) => sum + o.totalOrderAmount, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Nhập Đơn Đặt Hàng Từ File Excel</h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Nhập danh sách đơn hàng và mặt hàng hàng loạt từ bảng tính Excel (.xlsx, .xls)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-slate-300 hover:text-white text-xl p-1 leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Download Template Bar */}
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
              <Download className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Chưa có file mẫu? Tải file Excel mẫu chuẩn hóa có sẵn dữ liệu mẫu và hướng dẫn:
              </span>
            </div>
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="px-3.5 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải File Mẫu (.xlsx)</span>
            </button>
          </div>

          {/* Upload Area */}
          {!parsedResult ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7 text-emerald-600" />
              </div>

              <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Kéo thả file Excel vào đây hoặc <span className="text-emerald-600 hover:underline">bấm để chọn file</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hỗ trợ định dạng: .xlsx, .xls (Dung lượng tối đa 15MB)
              </p>
            </div>
          ) : (
            /* File selected & Parsed Result Preview */
            <div className="space-y-4 animate-in fade-in">
              {/* File Info Bar */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>File đã chọn: <strong>{selectedFile?.name}</strong></span>
                  <span className="text-slate-400 text-2xs">
                    ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-2xs text-rose-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Chọn file khác</span>
                </button>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <div className="text-2xs text-slate-500 uppercase tracking-wider font-semibold">
                    Số đơn hàng tìm thấy
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {parsedResult.orders.length} đơn hàng
                  </div>
                </div>
                <div>
                  <div className="text-2xs text-slate-500 uppercase tracking-wider font-semibold">
                    Tổng số mặt hàng
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {totalItemsCount} mặt hàng ({parsedResult.totalRows} dòng)
                  </div>
                </div>
                <div>
                  <div className="text-2xs text-slate-500 uppercase tracking-wider font-semibold">
                    Tổng giá trị ước tính
                  </div>
                  <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {formatVND(totalAmountSum)}
                  </div>
                </div>
              </div>

              {/* Warnings / Errors if any */}
              {parsedResult.errors.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Có một số dòng bị bỏ qua do thiếu thông tin:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-2xs">
                    {parsedResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parsedResult.errors.length > 5 && (
                      <li>...và {parsedResult.errors.length - 5} dòng khác</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Orders Preview List */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Mã PO</th>
                      <th className="py-2.5 px-3">Nhà Cung Cấp</th>
                      <th className="py-2.5 px-2 text-center">Số Mặt Hàng</th>
                      <th className="py-2.5 px-2 text-center">Hạn Giao</th>
                      <th className="py-2.5 px-3 text-right">Tổng Tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedResult.orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-100">
                          {ord.poNumber}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {ord.supplierName}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-400">
                          {ord.items.length} món ({ord.totalOrderedQuantity} SP)
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-500">
                          {formatDateVN(ord.expectedDeliveryDate)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatVND(ord.totalOrderAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Đang phân tích cấu trúc file Excel...</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-2xs text-slate-500">
              Dữ liệu sau khi nhập sẽ tự động lưu vào hệ thống và Postgres.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!parsedResult || parsedResult.orders.length === 0}
                onClick={handleConfirmImport}
                className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white shadow-xs flex items-center gap-2 transition-all ${
                  parsedResult && parsedResult.orders.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 cursor-pointer'
                    : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Xác nhận Nhập {parsedResult?.orders.length || 0} Đơn Hàng
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
