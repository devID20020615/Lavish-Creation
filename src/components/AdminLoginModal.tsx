import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User, Key, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { setCMSAuthenticated, getRememberedAdminId, isRememberAdminEnabled, saveRememberMeConfig } from '../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [adminId, setAdminId] = useState(() => getRememberedAdminId() || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => isRememberAdminEnabled());
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedId = getRememberedAdminId();
      if (savedId) {
        setAdminId(savedId);
      }
      setRememberMe(isRememberAdminEnabled());
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = adminId.trim();
    const cleanPass = password.trim();

    if (cleanId === 'Tanmoy_Admin' && cleanPass === 'Admin_BB') {
      setErrorMsg('');
      saveRememberMeConfig(rememberMe, rememberMe ? cleanId : '');
      setCMSAuthenticated(true);
      onLoginSuccess();
      onClose();
      // Keep adminId if remembered, otherwise clear
      if (!rememberMe) {
        setAdminId('');
      }
      setPassword('');
    } else {
      setErrorMsg('Invalid Admin ID or Password. Please check credentials.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#FAF8F5] border-2 border-[#D4B16A]/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Top Traditional Gamosa Bar */}
          <div className="gamosa-border absolute top-0 left-0 right-0 h-1.5" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#3A2F28]/10 hover:bg-[#8C1D18] hover:text-white flex items-center justify-center transition-colors text-[#3A2F28] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 pt-2">
            <div className="w-14 h-14 bg-[#8C1D18] text-[#D4B16A] rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md border border-[#D4B16A]/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold font-serif-playfair text-[#242424]">
              Admin Control Panel
            </h3>
            <p className="text-xs text-[#3A2F28]/70 mt-1">
              Secret CMS portal for BB Decoration (Lavish Creation)
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1.5">
                Admin User ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#B68C4A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Admin ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D18] text-[#242424] font-medium placeholder:text-[#3A2F28]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#B68C4A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Admin Password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D18] text-[#242424] font-medium placeholder:text-[#3A2F28]/40"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-md border transition-all duration-200 flex items-center justify-center ${
                      rememberMe
                        ? 'bg-[#8C1D18] border-[#8C1D18] text-[#FAF8F5] shadow-xs'
                        : 'bg-[#F7F2EA] border-[#D8C2A3] group-hover:border-[#8C1D18]'
                    }`}
                  >
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <span className="text-xs font-medium text-[#3A2F28] group-hover:text-[#8C1D18] transition-colors">
                  Remember me on this device
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#8C1D18] hover:bg-[#5A0F12] text-[#FAF8F5] py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#D4B16A]/40"
              >
                <Lock className="w-4 h-4 text-[#D4B16A]" />
                <span>Authenticate & Open Dashboard</span>
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-[11px] text-[#3A2F28]/50">
            Authorized Personnel Only • BB Decoration Secret CMS
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
