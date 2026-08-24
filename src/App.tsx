import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Language, GalleryItem } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GalleryShowcase } from './components/GalleryShowcase';
import { BanquetMenu } from './components/BanquetMenu';
import { VideoShowcase } from './components/VideoShowcase';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { InstagramBypassBanner } from './components/InstagramBypassBanner';
import { ScrollToTop } from './components/ScrollToTop';
import { GlobalLoader } from './components/GlobalLoader';
import { isCMSAuthenticated } from './utils/storage';
import { openWhatsAppInquiry } from './utils/whatsapp';

export default function App() {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('bb_decoration_lang');
      if (saved === 'as' || saved === 'en') return saved;
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('bb_decoration_lang', newLang);
    } catch {
      // fallback
    }
  };

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  const handleOpenConsultation = () => {
    openWhatsAppInquiry();
  };

  const handleSelectGalleryItem = (item: GalleryItem) => {
    openWhatsAppInquiry({ setupTitle: item.titleEn });
  };

  const handleOpenAdminTrigger = () => {
    if (isCMSAuthenticated()) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const scrollToGallery = () => {
    const el = document.getElementById('gallery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#242424] flex flex-col font-sans selection:bg-[#D4B16A]/30 selection:text-[#8C1D18]">
      {/* Global Top Progress & Status Loader */}
      <GlobalLoader />

      {/* In-App Browser (Instagram/Facebook/TikTok) Bypass Alert & Breakout Banner */}
      <InstagramBypassBanner lang={lang} />

      {/* Navigation Header */}
      <Navbar
        lang={lang}
        setLang={setLang}
        onOpenConsultation={handleOpenConsultation}
        onOpenAdmin={handleOpenAdminTrigger}
      />

      {/* Main Content Sections with Framer Motion Page Transitions */}
      <main className="flex-1">
        {/* Assamese Luxury Hero Experience */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Hero
            lang={lang}
            onOpenGallery={scrollToGallery}
            onOpenConsultation={handleOpenConsultation}
          />
        </motion.div>

        {/* Gallery & Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <GalleryShowcase
            lang={lang}
            onSelectSetupForInquiry={handleSelectGalleryItem}
          />
        </motion.div>

        {/* BB Events Reception Banquet Catering Menu Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <BanquetMenu lang={lang} />
        </motion.div>

        {/* Venue Showcase Video Section (Placed above Client Testimonials) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <VideoShowcase />
        </motion.div>

        {/* Client Stories & Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Testimonials lang={lang} />
        </motion.div>
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onOpenConsultation={handleOpenConsultation}
        onOpenAdmin={handleOpenAdminTrigger}
      />

      {/* Secret Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Secret Admin CMS Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      {/* Discreet Smooth Back to Top Scroll Button */}
      <ScrollToTop />
    </div>
  );
}


