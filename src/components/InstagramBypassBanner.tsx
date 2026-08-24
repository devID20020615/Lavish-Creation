import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, X, Compass } from 'lucide-react';
import { detectInAppBrowser, openInDeviceBrowser, InAppBrowserInfo } from '../utils/browserBypass';
import { Language } from '../types';

interface InstagramBypassBannerProps {
  lang: Language;
  forceShowForTesting?: boolean;
}

export const InstagramBypassBanner: React.FC<InstagramBypassBannerProps> = ({
  lang,
  forceShowForTesting = false,
}) => {
  const [browserInfo, setBrowserInfo] = useState<InAppBrowserInfo>({
    isInApp: false,
    isInstagram: false,
    isFacebook: false,
    isTikTok: false,
    isLine: false,
    isTwitter: false,
    browserName: '',
    isAndroid: false,
    isiOS: false,
  });

  const [isDismissed, setIsDismissed] = useState(false);
  const isAssamese = lang === 'as';

  useEffect(() => {
    const info = detectInAppBrowser();
    setBrowserInfo(info);
    
    // Check if dismissed in this session
    try {
      const dismissed = sessionStorage.getItem('bb_instagram_bypass_dismissed');
      if (dismissed === 'true' && !forceShowForTesting) {
        setIsDismissed(true);
      }
    } catch {
      // ignore
    }
  }, [forceShowForTesting]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('bb_instagram_bypass_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleOpenBrowser = () => {
    openInDeviceBrowser();
  };

  const isVisible = (browserInfo.isInApp || forceShowForTesting) && !isDismissed;

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          id="instagram-bypass-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <motion.div
            id="instagram-bypass-center-card"
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-[340px] sm:max-w-[380px] bg-[#FAF8F5] text-[#242424] rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#D4B16A]/50 relative text-center"
          >
            {/* Clean, clearly visible close button without any white dot or box artifact */}
            <button
              id="btn-close-bypass-modal"
              onClick={handleDismiss}
              aria-label="Close modal"
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer border-0 outline-hidden"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>

            {/* Centered Luxury Icon */}
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#8C1D18] text-[#D4B16A] flex items-center justify-center shadow-md border border-[#D4B16A]/40">
              <Compass className="w-6 h-6" />
            </div>

            {/* Minimal Headline */}
            <h3 className="text-lg font-bold text-[#8C1D18] mb-1 font-serif">
              {isAssamese ? 'মূল ব্ৰাউজাৰত খোলক' : 'Open in Browser'}
            </h3>

            {/* Concise subtitle */}
            <p className="text-xs text-gray-600 mb-5 leading-relaxed px-1">
              {isAssamese
                ? 'হোৱাটছএপ বুকিং আৰু উচ্চমানৰ ফটোৰ সুচল অভিজ্ঞতাৰ বাবে মূল ব্ৰাউজাৰত খোলক।'
                : 'For fast WhatsApp booking and full HD gallery, open in your standard browser.'}
            </p>

            {/* Single Action Button (Auto-detects Android/iOS) */}
            <button
              id="btn-open-in-external-browser"
              onClick={handleOpenBrowser}
              className="w-full py-3 px-4 rounded-xl bg-[#8C1D18] hover:bg-[#731713] active:scale-[0.98] text-[#FAF8F5] font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#D4B16A]" />
              <span>
                {isAssamese ? 'ব্ৰাউজাৰত খোলক' : 'Open in Browser'}
              </span>
            </button>

            {/* Clean dismiss link */}
            <button
              onClick={handleDismiss}
              className="mt-3 text-xs text-gray-500 hover:text-gray-800 transition-colors cursor-pointer block w-full py-1"
            >
              {isAssamese ? 'এপতেই থাকিব বিচাৰোঁ' : 'Continue in app'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
