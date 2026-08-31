import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User, Key, ShieldCheck, AlertCircle, Check, Loader2 } from 'lucide-react';
import { setAdminAuthToken, getRememberedAdminId, isRememberAdminEnabled, saveRememberMeConfig } from '../utils/storage';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedId = getRememberedAdminId();
      if (savedId) setAdminId(savedId);
      setRememberMe(isRememberAdminEnabled());
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = adminId.trim();
    const cleanPass = password.trim();
    if (!cleanId || !cleanPass) { setErrorMsg('Please enter both Admin ID and Password.'); return; }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      // SECURITY: credentials are verified on the server, never hardcoded in the client bundle.
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanId, password: cleanPass }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.status === 'ok' && data?.token) {
        saveRememberMeConfig(rememberMe, rememberMe ? cleanId : '');
        setAdminAuthToken(data.token);
        onLoginSuccess();
        if (!rememberMe) setAdminId('');
        setPassword('');
      } else {
        setErrorMsg(data?.error || 'Invalid Admin ID or Password. Please check credentials.');
      }
    } catch (err) {
      setErrorMsg('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overscroll-contain overflow-hidden" onWheel={(e) => e.stopPropagation()}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#FAF8F5] border-2 border-[#D4B16A]/60 rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[92dvh] shadow-2xl relative overflow-y-auto overscroll-contain">
          <div className="gamosa-border absolute top-0 left-0 right-0 h-1.5" />
          <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#3A2F28]/10 hover:bg-[#8C1D18] hover:text-white flex items-center justify-center transition-colors text-[#3A2F28] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
          <div className="text-center mb-6 pt-2">
            <div className="w-14 h-14 bg-[#8C1D18] text-[#D4B16A] rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md border border-[#D4B16A]/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold font-serif-playfair text-[#242424]">Admin Control Panel</h3>
            <p className="text-xs text-[#3A2F28]/70 mt-1">Secret CMS portal for BB Decoration (Lavish Creation)</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1.5">Admin User ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#B68C4A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" required value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Enter Admin ID" className="w-full pl-10 pr-4 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D18] text-[#242424] font-medium placeholder:text-[#3A2F28]/40" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1.5">Admin Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#B68C4A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Admin Password" className="w-full pl-10 pr-4 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D18] text-[#242424] font-medium placeholder:text-[#3A2F28]/40" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only" />
                  <div className={`w-4 h-4 rounded-md border transition-all duration-200 flex items-center justify-center ${rememberMe ? 'bg-[#8C1D18] border-[#8C1D18] text-[#FAF8F5] shadow-xs' : 'bg-[#F7F2EA] border-[#D8C2A3] group-hover:border-[#8C1D18]'}`}>
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <span className="text-xs font-medium text-[#3A2F28] group-hover:text-[#8C1D18] transition-colors">Remember me on this device</span>
              </label>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#8C1D18] hover:bg-[#5A0F12] text-[#FAF8F5] py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#D4B16A]/40 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="w-4 h-4 text-[#D4B16A] animate-spin" /> : <Lock className="w-4 h-4 text-[#D4B16A]" />}
                <span>{isSubmitting ? 'Authenticating...' : 'Authenticate & Open Dashboard'}</span>
              </button>
            </div>
          </form>
          <div className="mt-5 text-center text-[11px] text-[#3A2F28]/50">Authorized Personnel Only • BB Decoration Secret CMS</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
