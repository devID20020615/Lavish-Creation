import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { JaapiMotif } from './motifs/JaapiMotif';
import { Menu, X, Phone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  onOpenConsultation: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  onOpenConsultation,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastTapRef = useRef(0);
  const isAssamese = lang === 'as';

  const handleLogoTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350 && now - lastTapRef.current > 0) {
      e.preventDefault();
      onOpenAdmin();
    }
    lastTapRef.current = now;
  };

  const navLinks = [
    { href: '#gallery', labelAs: 'গ্যালৰী', labelEn: 'Gallery' },
    { href: '#stories', labelAs: 'গল্প', labelEn: 'Testimonials' },
    { href: '#footer', labelAs: 'যোগাযোগ', labelEn: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#D8C2A3]/50 shadow-2xs transition-all duration-300">
      {/* Top Subtle Gamosa Accent Line */}
      <div className="gamosa-border" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo with Hidden Double-Click / Double-Tap CMS Handler */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onDoubleClick={onOpenAdmin}
            onTouchEnd={handleLogoTouchEnd}
            title="BB Decoration Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F7F2EA] border border-[#D8C2A3]/70 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden relative cursor-pointer select-none"
          >
            <img
              src="https://i.ibb.co/ds07wJms/Chat-GPT-Image-Jul-28-2026-10-32-13-PM.png"
              alt="BB Decoration Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-125 translate-y-[2px]"
            />
          </div>
          <div className="flex flex-col justify-center -space-y-0.5">
            <a href="#" className="flex items-center">
              <span className={`text-base sm:text-lg md:text-xl font-bold text-[#242424] tracking-tight leading-snug hover:text-[#8C1D18] transition-colors ${
                isAssamese ? 'font-assamese' : ''
              }`}>
                {isAssamese ? 'বি বি ডেকোৰেচন' : 'BB Decoration'}
              </span>
            </a>
            <span className="text-[10px] sm:text-[11px] tracking-wider font-semibold text-[#8C1D18] uppercase">
              By Lavish Creation
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#8C1D18] relative py-1.5 group ${
                isAssamese ? 'font-assamese font-semibold text-base text-[#3A2F28]' : 'text-[#3A2F28]'
              }`}
            >
              {isAssamese ? link.labelAs : link.labelEn}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#8C1D18] rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Actions: Bilingual Toggle & Consultation Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Segmented Language Switcher */}
          <div className="flex items-center bg-[#F2ECE1] p-0.5 rounded-full border border-[#D8C2A3]/70">
            <button
              onClick={() => setLang('as')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 font-assamese cursor-pointer ${
                lang === 'as'
                  ? 'bg-[#8C1D18] text-white shadow-2xs'
                  : 'text-[#3A2F28] hover:text-[#8C1D18]'
              }`}
            >
              অসমীয়া
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#8C1D18] text-white shadow-2xs'
                  : 'text-[#3A2F28] hover:text-[#8C1D18]'
              }`}
            >
              EN
            </button>
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={onOpenConsultation}
            className="hidden sm:inline-flex items-center gap-2 bg-[#8C1D18] hover:bg-[#701511] active:scale-97 text-[#FAF8F5] px-4 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E2C382] group-hover:rotate-12 transition-transform" />
            <span className={isAssamese ? 'font-assamese font-semibold' : ''}>
              {isAssamese ? 'প্ৰস্তাৱ বিচাৰক' : 'Inquire Now'}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#3A2F28] hover:bg-[#F7F2EA] focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with Smooth Motion Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-[#FAF8F5] border-b border-[#D8C2A3] px-6 py-6 space-y-4 overflow-hidden shadow-lg"
          >
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium text-[#3A2F28] hover:text-[#8C1D18] py-2 border-b border-[#F7F2EA] flex items-center justify-between ${
                    isAssamese ? 'font-assamese font-medium text-lg' : ''
                  }`}
                >
                  <span>{isAssamese ? link.labelAs : link.labelEn}</span>
                  <span className="text-xs text-[#B68C4A]">→</span>
                </a>
              ))}
            </nav>
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#8C1D18] hover:bg-[#5A0F12] active:scale-98 text-[#FAF8F5] py-3.5 rounded-full text-sm font-semibold shadow-md min-h-[48px]"
              >
                <Phone className="w-4 h-4 text-[#D4B16A]" />
                <span className={isAssamese ? 'font-assamese font-semibold text-base' : ''}>
                  {isAssamese ? 'প্ৰস্তাৱ বিচাৰক' : 'Request Consultation'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

