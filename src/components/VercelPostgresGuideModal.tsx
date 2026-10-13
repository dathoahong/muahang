import React from 'react';
import { Database, CheckCircle2, ExternalLink, Key, Server, Copy, Check, Info } from 'lucide-react';

interface VercelPostgresGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
}

export const VercelPostgresGuideModal: React.FC<VercelPostgresGuideModalProps> = ({
  isOpen,
  onClose,
  isConnected,
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Hướng Dẫn Kết Nối Vercel Postgres</h3>
                {isConnected ? (
                  <span className="px-2 py-0.5 text-2xs font-bold rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã kết nối
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-2xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Chờ liên kết trên Vercel
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Các bước thiết lập cơ sở dữ liệu để không bao giờ bị mất tài khoản và đơn hàng khi deploy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1 leading-none"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Status summary */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 shrink-0" />
              <div>
                <div className="font-bold">
                  {isConnected
                    ? '🎉 Web đã kết nối trực tiếp vào Vercel Postgres!'
                    : 'Trang web hiện đang chạy cơ chế bộ nhớ dự phòng'}
                </div>
                <div className="text-2xs opacity-90">
                  {isConnected
                    ? 'Tất cả đơn hàng, mặt hàng, nhà cung cấp và mã PIN đã được ghi vĩnh viễn vào database.'
                    : 'Hãy làm theo 4 bước dưới đây trên Vercel để dữ liệu lưu vĩnh viễn.'}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Steps */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Các bước thực hiện trên giao diện Vercel (chỉ cần làm 1 lần duy nhất):</span>
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  Đăng nhập Vercel và mở dự án của bạn
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Truy cập <strong>vercel.com</strong> &rarr; chọn Project của trang web này &rarr; chuyển sang tab <strong>Storage</strong> ở thanh menu trên cùng.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  Tạo cơ sở dữ liệu Vercel Postgres
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Tại tab Storage, bấm nút <strong>Create Database</strong> &rarr; chọn <strong>Postgres</strong> (Neon) &rarr; bấm <strong>Continue</strong>.
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Đặt tên Database (ví dụ: <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">qvn-postgres</code>), chọn Region gần Việt Nam (như <strong>Singapore - sin1</strong>) &rarr; bấm <strong>Create</strong>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white">
                  Liên kết Database vào Project (Connect Project)
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Ngay sau khi tạo, Vercel sẽ hiện hộp thoại hoặc nút <strong>Connect Project</strong>. Chọn Project web của bạn và bấm <strong>Connect</strong>.
                </p>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-2xs">
                  ✨ <strong>Tuyệt vời:</strong> Khi bấm Connect, Vercel sẽ <em>TỰ ĐỘNG ĐIỀN</em> các biến môi trường:
                  <div className="font-mono mt-1 font-bold space-y-0.5">
                    <div>• POSTGRES_URL</div>
                    <div>• POSTGRES_PRISMA_URL</div>
                    <div>• DATABASE_URL</div>
                  </div>
                  Bạn không cần phải copy gõ tay bất kỳ mật khẩu nào vào code!
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  Redeploy lại dự án để nhận biến môi trường
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Chuyển sang tab <strong>Deployments</strong> trên Vercel &rarr; tại lần deploy mới nhất, bấm vào menu dấu 3 chấm <strong>(...)</strong> &rarr; chọn <strong>Redeploy</strong>.
                </p>
                <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                  ✓ Kể từ đây, mỗi lần bạn push code từ Google AI Studio lên GitHub, dữ liệu trên Vercel Postgres sẽ được giữ nguyên 100% vĩnh viễn!
                </p>
              </div>
            </div>
          </div>

          {/* Fallback Note */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-2xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
            <div>
              <strong>Lưu ý bảo mật:</strong> Mã nguồn đã được cấu hình chuẩn đọc biến môi trường bảo mật qua <code className="font-mono">process.env.DATABASE_URL</code> và <code className="font-mono">process.env.POSTGRES_URL</code> ở backend, tuyệt đối không lộ mật khẩu ra client. Các bảng <code className="font-mono">purchase_orders</code>, <code className="font-mono">suppliers</code>, <code className="font-mono">products</code> và <code className="font-mono">app_settings</code> sẽ tự động khởi tạo khi kết nối lần đầu.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-2xs text-slate-500">
            Hỗ trợ Vercel Postgres · Neon · Supabase
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
          >
            Đã hiểu, đóng hướng dẫn
          </button>
        </div>
      </div>
    </div>
  );
};
