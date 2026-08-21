import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeCMSLoading } from '../utils/storage';
import { Sparkles } from 'lucide-react';

export const GlobalLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(15);
  const [initialBoot, setInitialBoot] = useState(true);

  useEffect(() => {
    const unsub = subscribeCMSLoading((loading) => {
      setIsLoading(loading);
    });
    return unsub;
  }, []);

  // Smooth progress animation when loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(25);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return 88;
          return prev + Math.floor(Math.random() * 8 + 3);
        });
      }, 120);
    } else {
      setProgress(100);
      const doneTimer = setTimeout(() => {
        setInitialBoot(false);
      }, 500);
      return () => clearTimeout(doneTimer);
    }

    return () => clearInterval(timer);
  }, [isLoading]);

  return (
    <>
      {/* Top Fixed Progress Bar */}
      <AnimatePresence>
        {(isLoading || progress < 100) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-[9999] h-[3.5px] bg-black/10 pointer-events-none overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#8C1D18] via-[#D4B16A] to-[#8C1D18] shadow-[0_0_10px_#D4B16A]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial Site Boot / Sync Overlay Card (Non-intrusive floating indicator) */}
      <AnimatePresence>
        {initialBoot && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed top-4 right-4 z-[9998] pointer-events-none"
          >
            <div className="bg-[#1A1412]/90 backdrop-blur-md text-[#FAF8F5] border border-[#D8C2A3]/30 px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold">
              <div className="relative flex items-center justify-center w-4 h-4">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#D4B16A] opacity-75 animate-ping" />
                <Sparkles className="relative w-3.5 h-3.5 text-[#D4B16A]" />
              </div>
              <span className="text-gray-200 font-sans tracking-wide">
                {progress < 100 ? 'Syncing Venue Showcase...' : 'Ready'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
