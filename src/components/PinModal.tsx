import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { verifyPin, updatePin, getStoredPin } from '../utils/storage';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'login' | 'change';
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'login',
}) => {
  const [pin, setPin] = useState('');
  const [currentMode, setCurrentMode] = useState<'login' | 'change'>(mode);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    setError(null);
    if (currentMode === 'login') {
      if (pin.length < 6) {
        const nextPin = pin + digit;
        setPin(nextPin);
      }
    }
  };

  const handleDeleteDigit = () => {
    setError(null);
    if (currentMode === 'login') {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setError(null);
    setPin('');
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Vui lòng nhập mã PIN quản lý');
      return;
    }

    if (verifyPin(pin)) {
      setError(null);
      setSuccessMsg('Đăng nhập thành công!');
      setTimeout(() => {
        setPin('');
        setSuccessMsg(null);
        onSuccess();
        onClose();
      }, 400);
    } else {
      setError('Mã PIN không chính xác! Hãy thử lại (Mặc định: 1234)');
      setPin('');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verifyPin(oldPin)) {
      setError('Mã PIN hiện tại không chính xác');
      return;
    }

    if (!newPin || newPin.length < 4) {
      setError('Mã PIN mới phải có ít nhất 4 ký tự');
      return;
    }

    if (newPin !== confirmNewPin) {
      setError('Mã PIN xác nhận không khớp');
      return;
    }

    if (updatePin(newPin)) {
      setSuccessMsg('Đổi mã PIN thành công!');
      setTimeout(() => {
        setOldPin('');
        setNewPin('');
        setConfirmNewPin('');
        setSuccessMsg(null);
        setCurrentMode('login');
        onClose();
      }, 1000);
    } else {
      setError('Không thể cập nhật mã PIN, vui lòng thử lại');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl p-1 leading-none"
            title="Đóng"
          >
            ✕
          </button>
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-3 text-indigo-300">
            {currentMode === 'login' ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            {currentMode === 'login' ? 'Đăng Nhập Quản Lý' : 'Đổi Mã PIN Quản Lý'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {currentMode === 'login'
              ? 'Xác thực để tạo đơn hàng, nhập kho từng đợt và quản lý dữ liệu'
              : 'Thiết lập mã bảo mật mới cho quyền quản lý'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentMode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              {/* PIN Display */}
              <div className="flex flex-col items-center mb-5">
                <div className="relative w-full">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setError(null);
                      setPin(e.target.value.replace(/\D/g, '').slice(0, 8));
                    }}
                    placeholder="Nhập mã PIN..."
                    autoFocus
                    className="w-full text-center text-2xl tracking-widest font-mono font-bold py-3 px-10 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showPin ? 'Ẩn PIN' : 'Hiện PIN'}
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Mã PIN mặc định: <strong className="font-mono text-slate-700 dark:text-slate-300">1234</strong></span>
                </div>
              </div>

              {/* Number keypad */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeyPress(num.toString())}
                    className="h-12 flex items-center justify-center text-lg font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl active:scale-95 transition-all shadow-2xs"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-12 flex items-center justify-center text-xs font-medium text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Xóa hết
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyPress('0')}
                  className="h-12 flex items-center justify-center text-lg font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl active:scale-95 transition-all shadow-2xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDigit}
                  className="h-12 flex items-center justify-center text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
                  title="Xóa ký tự cuối"
                >
                  ⌫
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Xác nhận Đăng nhập</span>
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCurrentMode('change');
                    }}
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                  >
                    Đổi mã PIN mới?
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Xem chế độ khách
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Change PIN form */
            <form onSubmit={handleChangePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mã PIN hiện tại
                </label>
                <input
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Mặc định: 1234"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mã PIN mới (ít nhất 4 số)
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ví dụ: 8888"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Xác nhận mã PIN mới
                </label>
                <input
                  type="password"
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập lại mã PIN mới"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors"
                >
                  Lưu mã PIN mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCurrentMode('login');
                  }}
                  className="w-full py-2 text-xs text-slate-600 dark:text-slate-400 hover:underline text-center"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
