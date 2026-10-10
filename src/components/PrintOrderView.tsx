import React from 'react';
import { PurchaseOrder } from '../types';
import { formatVND, formatDateVN } from '../utils/storage';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface PrintOrderViewProps {
  order: PurchaseOrder | null;
  onClose: () => void;
}

export const PrintOrderView: React.FC<PrintOrderViewProps> = ({ order, onClose }) => {
  if (!order) return null;

  const is100Percent = order.isFullyDelivered || order.overallFulfillmentRate >= 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto text-slate-900">
      {/* Top action bar - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <span className="text-sm font-semibold">Xem bản in: {order.poNumber}</span>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>In tài liệu (Ctrl + P)</span>
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-4xl mx-auto p-8 sm:p-12 text-slate-900">
        {/* Company Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider">HỆ THỐNG QUẢN LÝ KHO & CUNG ỨNG VẬT TƯ</h1>
            <p className="text-xs text-slate-600 mt-1">Trụ sở: KCN Sài Đồng B, Long Biên, Hà Nội</p>
            <p className="text-xs text-slate-600">Hotline điều phối: 1900 6868 · Email: procurement@logistics.vn</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-extrabold font-mono text-indigo-900">{order.poNumber}</h2>
            <p className="text-xs text-slate-500 mt-1">Ngày lập: {formatDateVN(order.orderDate)}</p>
            {is100Percent && (
              <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded">
                ✓ ĐÃ NHẬN ĐỦ KHO 100%
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide">ĐƠN ĐẶT HÀNG & PHIẾU ĐỐI SOÁT GIAO NHẬN KHO</h2>
          <p className="text-xs text-slate-600 mt-1">
            (Kèm bảng kê chia đợt nhận hàng thực tế tại kho)
          </p>
        </div>

        {/* Supplier & Order Info Box */}
        <div className="grid grid-cols-2 gap-6 p-4 border border-slate-300 rounded-lg mb-6 text-xs">
          <div>
            <div className="font-bold text-slate-800 uppercase text-2xs tracking-wider mb-1">
              ĐƠN VỊ CUNG CẤP (NCC):
            </div>
            <div className="font-bold text-sm text-slate-900">{order.supplierName}</div>
            <div className="mt-1">Điện thoại liên hệ: {order.supplierPhone || '---'}</div>
            <div>Mã định danh NCC: {order.supplierId}</div>
          </div>
          <div>
            <div className="font-bold text-slate-800 uppercase text-2xs tracking-wider mb-1">
              THÔNG TIN ĐIỀU PHỐI:
            </div>
            <div>Hạn giao hàng dự kiến: <strong>{formatDateVN(order.expectedDeliveryDate)}</strong></div>
            <div>Người tạo đơn: <strong>{order.createdBy}</strong></div>
            <div>Tiến độ tổng thể: <strong>{order.overallFulfillmentRate}%</strong> (Đã nhận {order.totalReceivedQuantity}/{order.totalOrderedQuantity} SP)</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2">1. BẢNG KÊ MẶT HÀNG ĐẶT MUA</h3>
          <table className="w-full text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-700">
                <th className="p-2 border border-slate-300 text-center w-10">STT</th>
                <th className="p-2 border border-slate-300 text-left">Mã & Tên Mặt Hàng</th>
                <th className="p-2 border border-slate-300 text-center w-16">ĐVT</th>
                <th className="p-2 border border-slate-300 text-right w-20">SL Đặt</th>
                <th className="p-2 border border-slate-300 text-right w-20">Đã Nhận</th>
                <th className="p-2 border border-slate-300 text-right w-20">Còn Nợ</th>
                <th className="p-2 border border-slate-300 text-right w-28">Đơn Giá (VNĐ)</th>
                <th className="p-2 border border-slate-300 text-right w-32">Thành Tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.id} className={item.isCompleted ? 'bg-emerald-50/50' : ''}>
                  <td className="p-2 border border-slate-300 text-center">{index + 1}</td>
                  <td className="p-2 border border-slate-300">
                    <span className="font-bold">{item.productName}</span>
                    <span className="text-2xs text-slate-500 font-mono block">Mã: {item.productCode}</span>
                  </td>
                  <td className="p-2 border border-slate-300 text-center">{item.unit}</td>
                  <td className="p-2 border border-slate-300 text-right font-medium">{item.quantityOrdered}</td>
                  <td className="p-2 border border-slate-300 text-right font-bold text-slate-900">{item.receivedQuantity}</td>
                  <td className="p-2 border border-slate-300 text-right font-semibold text-amber-700">{item.remainingQuantity}</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">{formatVND(item.unitPrice)}</td>
                  <td className="p-2 border border-slate-300 text-right font-bold font-mono">{formatVND(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                <td colSpan={3} className="p-2 border border-slate-300 text-right">Tổng cộng:</td>
                <td className="p-2 border border-slate-300 text-right">{order.totalOrderedQuantity}</td>
                <td className="p-2 border border-slate-300 text-right text-emerald-800">{order.totalReceivedQuantity}</td>
                <td className="p-2 border border-slate-300 text-right">{order.totalOrderedQuantity - order.totalReceivedQuantity}</td>
                <td colSpan={2} className="p-2 border border-slate-300 text-right font-mono text-sm text-emerald-800">
                  {formatVND(order.totalOrderAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Deliveries History Table */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2">
            2. LỊCH SỬ CHIA ĐỢT GIAO HÀNG VỀ KHO THỰC TẾ ({order.deliveries?.length || 0} ĐỢT)
          </h3>
          {order.deliveries && order.deliveries.length > 0 ? (
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-700">
                  <th className="p-2 border border-slate-300 text-center w-12">Đợt</th>
                  <th className="p-2 border border-slate-300 text-center w-24">Ngày Nhận</th>
                  <th className="p-2 border border-slate-300 text-left w-36">Thủ Kho Nhận</th>
                  <th className="p-2 border border-slate-300 text-left w-28">Số Phiếu Giao</th>
                  <th className="p-2 border border-slate-300 text-left">Chi Tiết Hàng Nhận Đợt</th>
                  <th className="p-2 border border-slate-300 text-left w-48">Ghi Chú Đợt</th>
                </tr>
              </thead>
              <tbody>
                {order.deliveries.map((del) => (
                  <tr key={del.id}>
                    <td className="p-2 border border-slate-300 text-center font-bold">#{del.batchNumber}</td>
                    <td className="p-2 border border-slate-300 text-center">{formatDateVN(del.deliveryDate)}</td>
                    <td className="p-2 border border-slate-300">{del.receiverName}</td>
                    <td className="p-2 border border-slate-300 font-mono text-2xs">{del.deliveryDocCode || '---'}</td>
                    <td className="p-2 border border-slate-300">
                      <div className="space-y-0.5">
                        {del.items.map((it, idx) => (
                          <div key={idx} className="text-2xs">
                            • {it.productName}: <strong>+{it.quantityReceived} {it.unit}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-2 border border-slate-300 text-2xs italic text-slate-600">{del.note || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 border border-slate-200 rounded">
              Chưa phát sinh đợt giao nhận nào về kho.
            </p>
          )}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs mt-12 pt-6 border-t border-slate-200">
          <div>
            <div className="font-bold uppercase">ĐẠI DIỆN NHÀ CUNG CẤP</div>
            <div className="text-2xs text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
            <div className="h-20"></div>
          </div>
          <div>
            <div className="font-bold uppercase">THỦ KHO TIẾP NHẬN</div>
            <div className="text-2xs text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
            <div className="h-20"></div>
          </div>
          <div>
            <div className="font-bold uppercase">QUẢN LÝ PHÊ DUYỆT</div>
            <div className="text-2xs text-slate-500 italic mt-0.5">(Ký, đóng dấu)</div>
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
