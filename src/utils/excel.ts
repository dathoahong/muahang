import * as XLSX from 'xlsx';
import { PurchaseOrder, OrderItem, Supplier, ProductItem } from '../types';
import { formatDateVN } from './storage';

/**
 * Xuất toàn bộ đơn hàng ra file Excel nhiều Sheet (.xlsx)
 */
export function exportOrdersToExcel(orders: PurchaseOrder[], fileNamePrefix = 'Don_Hang_QVN') {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Tổng hợp Đơn hàng
  const ordersSummaryData = orders.map((o, idx) => ({
    STT: idx + 1,
    'Mã Đơn Hàng (PO)': o.poNumber,
    'Nhà Cung Cấp': o.supplierName,
    'SĐT Liên Hệ': o.supplierPhone || '',
    'Ngày Đặt Hàng': formatDateVN(o.orderDate),
    'Hạn Giao Hàng': formatDateVN(o.expectedDeliveryDate),
    'Trạng Thái': o.isFullyDelivered
      ? 'Đã giao đủ 100% (Hoàn thành)'
      : o.overallFulfillmentRate > 0
      ? `Đang giao (${o.overallFulfillmentRate}%)`
      : 'Chờ giao hàng (0%)',
    'Tiến Độ (%)': `${o.overallFulfillmentRate}%`,
    'Số Đợt Giao': o.deliveries?.length || 0,
    'Tổng SL Đặt': o.totalOrderedQuantity,
    'Tổng SL Đã Nhận': o.totalReceivedQuantity,
    'Tổng Tiền (VNĐ)': o.totalOrderAmount,
    'Người Lập Đơn': o.createdBy,
    'Ghi Chú': o.notes || '',
  }));

  const wsOrders = XLSX.utils.json_to_sheet(ordersSummaryData);
  // Auto-width columns
  wsOrders['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 35 },
    { wch: 15 },
    { wch: 14 },
    { wch: 14 },
    { wch: 26 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Danh_Sach_Don_Hang');

  // 2. Sheet Chi tiết từng Mặt hàng trong đơn
  const itemsDetailData: any[] = [];
  let itemCounter = 1;
  orders.forEach((o) => {
    o.items.forEach((it) => {
      itemsDetailData.push({
        STT: itemCounter++,
        'Mã Đơn Hàng (PO)': o.poNumber,
        'Nhà Cung Cấp': o.supplierName,
        'Mã Sản Phẩm': it.productCode,
        'Tên Mặt Hàng': it.productName,
        'Đơn Vị Tính': it.unit,
        'Số Lượng Đặt': it.quantityOrdered,
        'Đã Nhận Kho': it.receivedQuantity,
        'Còn Thiếu': it.remainingQuantity,
        'Đạt 100%': it.isCompleted ? 'ĐỦ 100%' : 'Chưa đủ',
        'Đơn Giá (VNĐ)': it.unitPrice,
        'Thành Tiền (VNĐ)': it.totalAmount,
      });
    });
  });

  const wsItems = XLSX.utils.json_to_sheet(itemsDetailData);
  wsItems['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 35 },
    { wch: 15 },
    { wch: 35 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsItems, 'Chi_Tiet_Mat_Hang');

  // 3. Sheet Lịch sử các đợt giao kho
  const deliveriesData: any[] = [];
  let delCounter = 1;
  orders.forEach((o) => {
    (o.deliveries || []).forEach((del) => {
      const detailsStr = del.items
        .map((it) => `${it.productName}: +${it.quantityReceived} ${it.unit}`)
        .join('; ');

      deliveriesData.push({
        STT: delCounter++,
        'Mã Đơn Hàng (PO)': o.poNumber,
        'Nhà Cung Cấp': o.supplierName,
        'Đợt Số': `Đợt ${del.batchNumber}`,
        'Ngày Nhận Kho': formatDateVN(del.deliveryDate),
        'Thủ Kho Tiếp Nhận': del.receiverName,
        'Số Phiếu Xuất/Giao': del.deliveryDocCode || '',
        'Chi Tiết Hàng Nhận': detailsStr,
        'Ghi Chú Đợt': del.note || '',
      });
    });
  });

  if (deliveriesData.length > 0) {
    const wsDel = XLSX.utils.json_to_sheet(deliveriesData);
    wsDel['!cols'] = [
      { wch: 6 },
      { wch: 20 },
      { wch: 35 },
      { wch: 10 },
      { wch: 15 },
      { wch: 22 },
      { wch: 20 },
      { wch: 45 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDel, 'Lich_Su_Dot_Giao_Kho');
  }

  // Tên file theo ngày
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  XLSX.writeFile(wb, `${fileNamePrefix}_${dateStr}.xlsx`);
}

/**
 * Xuất 1 đơn hàng cụ thể ra file Excel
 */
export function exportSingleOrderToExcel(order: PurchaseOrder) {
  exportOrdersToExcel([order], `Don_Hang_${order.poNumber}`);
}

/**
 * Tải file mẫu Excel chuẩn để người dùng nhập dữ liệu vào
 */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  const templateData = [
    {
      'Mã Đơn Hàng (PO)': 'PO-20261015-001',
      'Tên Nhà Cung Cấp': 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)',
      'SĐT Nhà Cung Cấp': '028 5415 5555',
      'Ngày Đặt Hàng (YYYY-MM-DD)': '2026-10-15',
      'Hạn Giao Hàng (YYYY-MM-DD)': '2026-10-25',
      'Mã Sản Phẩm': 'VNM-001',
      'Tên Mặt Hàng': 'Sữa tươi tiệt trùng Vinamilk 100% Ít Đường 1L',
      'Đơn Vị Tính': 'Thùng',
      'Số Lượng Đặt': 100,
      'Đơn Giá (VNĐ)': 385000,
      'Ghi Chú Đơn Hàng': 'Đơn hàng tháng 10 giao về kho Tổng',
      'Người Lập Đơn': 'Quản lý Mua hàng',
    },
    {
      'Mã Đơn Hàng (PO)': 'PO-20261015-001',
      'Tên Nhà Cung Cấp': 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)',
      'SĐT Nhà Cung Cấp': '028 5415 5555',
      'Ngày Đặt Hàng (YYYY-MM-DD)': '2026-10-15',
      'Hạn Giao Hàng (YYYY-MM-DD)': '2026-10-25',
      'Mã Sản Phẩm': 'VNM-002',
      'Tên Mặt Hàng': 'Sữa đặc Ông Thọ đỏ lon 380g',
      'Đơn Vị Tính': 'Thùng',
      'Số Lượng Đặt': 50,
      'Đơn Giá (VNĐ)': 620000,
      'Ghi Chú Đơn Hàng': 'Đơn hàng tháng 10 giao về kho Tổng',
      'Người Lập Đơn': 'Quản lý Mua hàng',
    },
    {
      'Mã Đơn Hàng (PO)': 'PO-20261016-002',
      'Tên Nhà Cung Cấp': 'Tập đoàn Hòa Phát',
      'SĐT Nhà Cung Cấp': '024 6284 8666',
      'Ngày Đặt Hàng (YYYY-MM-DD)': '2026-10-16',
      'Hạn Giao Hàng (YYYY-MM-DD)': '2026-10-30',
      'Mã Sản Phẩm': 'HPG-001',
      'Tên Mặt Hàng': 'Thép cây vằn Hòa Phát phi 16 (D16)',
      'Đơn Vị Tính': 'Cây',
      'Số Lượng Đặt': 200,
      'Đơn Giá (VNĐ)': 265000,
      'Ghi Chú Đơn Hàng': 'Vật tư thi công xưởng 3',
      'Người Lập Đơn': 'Kỹ sư Trưởng',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 22 },
    { wch: 38 },
    { wch: 18 },
    { wch: 26 },
    { wch: 26 },
    { wch: 16 },
    { wch: 38 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 35 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Don_Hang');

  // Hướng dẫn
  const guideData = [
    { 'CỘT': 'Mã Đơn Hàng (PO)', 'MÔ TẢ': 'Mã đơn hàng duy nhất. Nếu nhiều dòng cùng mã PO thì sẽ được gộp vào chung 1 đơn.' },
    { 'CỘT': 'Tên Nhà Cung Cấp', 'MÔ TẢ': 'Bắt buộc. Tên đơn vị cung ứng hàng hóa.' },
    { 'CỘT': 'SĐT Nhà Cung Cấp', 'MÔ TẢ': 'Tùy chọn. Số điện thoại liên hệ nhà cung cấp.' },
    { 'CỘT': 'Ngày Đặt / Hạn Giao', 'MÔ TẢ': 'Định dạng YYYY-MM-DD (Ví dụ: 2026-10-15) hoặc DD/MM/YYYY.' },
    { 'CỘT': 'Mã Sản Phẩm', 'MÔ TẢ': 'Mã SKU hoặc mã định danh của mặt hàng (ví dụ: SP-01, VNM-001).' },
    { 'CỘT': 'Tên Mặt Hàng', 'MÔ TẢ': 'Bắt buộc. Tên chi tiết của sản phẩm.' },
    { 'CỘT': 'Đơn Vị Tính', 'MÔ TẢ': 'Bắt buộc. Thùng, Hộp, Cái, Cây, Cuộn, Kg, Ram, Bộ, Mét...' },
    { 'CỘT': 'Số Lượng Đặt', 'MÔ TẢ': 'Bắt buộc. Số lượng cần mua (phải lớn hơn 0).' },
    { 'CỘT': 'Đơn Giá (VNĐ)', 'MÔ TẢ': 'Đơn giá tương ứng trước VAT.' },
  ];
  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 24 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Huong_Dan');

  XLSX.writeFile(wb, 'Mau_Nhap_Don_Hang_QVN.xlsx');
}

export interface ParsedImportResult {
  orders: PurchaseOrder[];
  totalRows: number;
  errors: string[];
}

/**
 * Đọc và chuẩn hóa dữ liệu từ file Excel upload lên
 */
export async function parseExcelFile(
  file: File,
  existingSuppliers: Supplier[],
  existingProducts: ProductItem[]
): Promise<ParsedImportResult> {
  const errors: string[] = [];

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('File Excel không có sheet dữ liệu nào.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rows.length === 0) {
    throw new Error('File Excel rỗng, không tìm thấy dòng dữ liệu nào.');
  }

  // Nhóm các dòng theo Mã PO
  const orderGroups: Record<string, any[]> = {};
  let anonymousCounter = 1;

  rows.forEach((row, idx) => {
    const rowIdx = idx + 2; // Dòng 2 tính cả header
    let poNumber = String(
      row['Mã Đơn Hàng (PO)'] ||
      row['Mã Đơn Hàng'] ||
      row['Mã PO'] ||
      row['PO Number'] ||
      row['PO'] ||
      ''
    ).trim();

    if (!poNumber) {
      poNumber = `PO-IMP-${Date.now().toString().slice(-4)}-${anonymousCounter++}`;
    }

    const supplierName = String(
      row['Tên Nhà Cung Cấp'] ||
      row['Nhà Cung Cấp'] ||
      row['NCC'] ||
      row['Supplier'] ||
      ''
    ).trim();

    const productName = String(
      row['Tên Mặt Hàng'] ||
      row['Tên Sản Phẩm'] ||
      row['Mặt Hàng'] ||
      row['Product'] ||
      ''
    ).trim();

    if (!supplierName) {
      errors.push(`Dòng ${rowIdx}: Thiếu tên Nhà Cung Cấp.`);
      return;
    }

    if (!productName) {
      errors.push(`Dòng ${rowIdx}: Thiếu Tên Mặt Hàng.`);
      return;
    }

    const qty = Math.max(1, parseInt(row['Số Lượng Đặt'] || row['Số Lượng'] || row['Quantity'] || '1', 10) || 1);
    const unitPrice = Math.max(0, parseInt(row['Đơn Giá (VNĐ)'] || row['Đơn Giá'] || row['Price'] || '0', 10) || 0);
    const unit = String(row['Đơn Vị Tính'] || row['ĐVT'] || row['Unit'] || 'Cái').trim() || 'Cái';
    const productCode = String(row['Mã Sản Phẩm'] || row['Mã SP'] || row['SKU'] || '').trim() || `SP-${Date.now().toString().slice(-4)}`;

    if (!orderGroups[poNumber]) {
      orderGroups[poNumber] = [];
    }

    orderGroups[poNumber].push({
      rowIdx,
      poNumber,
      supplierName,
      supplierPhone: String(row['SĐT Nhà Cung Cấp'] || row['SĐT'] || row['Phone'] || '').trim(),
      orderDate: String(row['Ngày Đặt Hàng (YYYY-MM-DD)'] || row['Ngày Đặt'] || row['Order Date'] || '').trim(),
      expectedDeliveryDate: String(row['Hạn Giao Hàng (YYYY-MM-DD)'] || row['Hạn Giao'] || row['Expected Date'] || '').trim(),
      productCode,
      productName,
      unit,
      quantityOrdered: qty,
      unitPrice,
      notes: String(row['Ghi Chú Đơn Hàng'] || row['Ghi Chú'] || row['Notes'] || '').trim(),
      createdBy: String(row['Người Lập Đơn'] || row['Người Lập'] || 'Import Excel').trim() || 'Import Excel',
    });
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const parsedOrders: PurchaseOrder[] = [];

  for (const [poNumber, itemsInOrder] of Object.entries(orderGroups)) {
    const firstRow = itemsInOrder[0];
    const supplierName = firstRow.supplierName;

    // Tìm xem NCC đã có trong hệ thống chưa
    let matchedSup = existingSuppliers.find(
      (s) => s.name.toLowerCase() === supplierName.toLowerCase()
    );
    const supplierId = matchedSup ? matchedSup.id : `sup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Tạo các OrderItem
    const orderItems: OrderItem[] = itemsInOrder.map((it, idx) => {
      const lineTotal = it.quantityOrdered * it.unitPrice;
      return {
        id: `poi-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        productId: `prod-${Date.now()}-${idx}`,
        productCode: it.productCode,
        productName: it.productName,
        unit: it.unit,
        quantityOrdered: it.quantityOrdered,
        unitPrice: it.unitPrice,
        totalAmount: lineTotal,
        receivedQuantity: 0,
        remainingQuantity: it.quantityOrdered,
        fulfillmentRate: 0,
        isCompleted: false,
      };
    });

    const totalQty = orderItems.reduce((s, it) => s + it.quantityOrdered, 0);
    const totalAmount = orderItems.reduce((s, it) => s + it.totalAmount, 0);

    // Chuẩn hóa ngày đặt
    let orderDate = firstRow.orderDate || todayStr;
    if (orderDate.includes('/')) {
      const parts = orderDate.split('/');
      if (parts.length === 3) {
        orderDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    let expectedDate = firstRow.expectedDeliveryDate || nextWeekStr;
    if (expectedDate.includes('/')) {
      const parts = expectedDate.split('/');
      if (parts.length === 3) {
        expectedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    const newOrder: PurchaseOrder = {
      id: `po-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      poNumber: poNumber.toUpperCase(),
      supplierId,
      supplierName,
      supplierPhone: firstRow.supplierPhone || undefined,
      orderDate,
      expectedDeliveryDate: expectedDate,
      status: 'pending',
      items: orderItems,
      deliveries: [],
      totalOrderedQuantity: totalQty,
      totalReceivedQuantity: 0,
      overallFulfillmentRate: 0,
      isFullyDelivered: false,
      totalOrderAmount: totalAmount,
      notes: firstRow.notes || `Được nhập từ file Excel ${file.name}`,
      createdBy: firstRow.createdBy || 'Import Excel',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    parsedOrders.push(newOrder);
  }

  return {
    orders: parsedOrders,
    totalRows: rows.length,
    errors,
  };
}
