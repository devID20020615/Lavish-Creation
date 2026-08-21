import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Language, DecorCategory, GalleryItem } from '../types';
import { getStoredGalleryItems, subscribeStorage } from '../utils/storage';
import { GamosaDivider } from './motifs/GamosaDivider';
import { JaapiMotif } from './motifs/JaapiMotif';
import { LazyImage } from './LazyImage';
import { Sparkles, Eye, X, Send, Tag, Layers, ChevronDown, ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, RotateCcw, MessageCircle, Move } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { openWhatsAppInquiry } from '../utils/whatsapp';
import { resolveDirectImageUrl, getOptimizedImageUrl } from '../utils/imageHelper';

interface GalleryProps {
  lang: Language;
  onSelectSetupForInquiry: (item: GalleryItem) => void;
}

const resolveImageUrl = (url: string) => resolveDirectImageUrl(url);

// Helper to interleave non-reception categories evenly
const getMixedItemsExceptReception = (items: GalleryItem[]): GalleryItem[] => {
  const nonReception = items.filter((item) => item.category !== 'reception');
  
  const grouped: Record<string, GalleryItem[]> = {};

  nonReception.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  const catKeys = Object.keys(grouped).filter(k => grouped[k].length > 0);
  const result: GalleryItem[] = [];
  let maxLen = 0;
  catKeys.forEach(k => {
    if (grouped[k].length > maxLen) maxLen = grouped[k].length;
  });

  for (let i = 0; i < maxLen; i++) {
    for (const key of catKeys) {
      if (grouped[key][i]) {
        result.push(grouped[key][i]);
      }
    }
  }

  return result;
};

export const GalleryShowcase: React.FC<GalleryProps> = ({
  lang,
  onSelectSetupForInquiry,
}) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => getStoredGalleryItems());
  const [activeCategory, setActiveCategory] = useState<DecorCategory>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [visibleLimit, setVisibleLimit] = useState<number>(9);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const isAssamese = lang === 'as';

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setGalleryItems(getStoredGalleryItems());
    });
    return unsubscribe;
  }, []);

  const gallerySectionRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gallerySectionRef,
    offset: ['start end', 'end start']
  });

  const yMotif1 = useTransform(scrollYProgress, [0, 1], ['-60px', '60px']);
  const yMotif2 = useTransform(scrollYProgress, [0, 1], ['60px', '-60px']);
  const rotateMotif = useTransform(scrollYProgress, [0, 1], [0, 30]);

  const categories: { key: DecorCategory; labelAs: string; labelEn: string }[] = [
    { key: 'all', labelAs: 'সকলো সজ্জা', labelEn: 'All Showcase' },
    { key: 'entrance', labelAs: 'আদৰণি দ্বাৰ', labelEn: 'Entrance Gates' },
    { key: 'mandap', labelAs: 'পবিত্ৰ মণ্ডপ', labelEn: 'Sacred Mandap' },
    { key: 'stage', labelAs: 'বিয়াৰ মঞ্চ', labelEn: 'Wedding Stage' },
    { key: 'sitting_area', labelAs: 'অতিথি বহা স্থান', labelEn: 'Sitting Area' },
    { key: 'reception', labelAs: 'প্ৰীতি ভোজ (শীঘ্ৰেই)', labelEn: 'Reception (Coming Soon)' },
  ];

  const handleCategoryChange = (cat: DecorCategory) => {
    setActiveCategory(cat);
    setVisibleLimit(9);
  };

  const enabledGalleryItems = useMemo(() => {
    return galleryItems.filter((item) => item.enabled !== false);
  }, [galleryItems]);

  const currentFilteredItems = useMemo(() => {
    if (activeCategory === 'all') {
      return getMixedItemsExceptReception(enabledGalleryItems);
    }
    if (activeCategory === 'reception') {
      return [];
    }
    return enabledGalleryItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, enabledGalleryItems]);

  const displayedItems = useMemo(() => {
    return currentFilteredItems.slice(0, visibleLimit);
  }, [currentFilteredItems, visibleLimit]);

  const hasMore = currentFilteredItems.length > visibleLimit;

  // Lightbox Navigation & Zoom Handlers
  const activeItemIndex = useMemo(() => {
    if (!activeItem) return -1;
    return currentFilteredItems.findIndex((item) => item.id === activeItem.id);
  }, [activeItem, currentFilteredItems]);

  const handlePrevItem = () => {
    if (activeItemIndex === -1 || currentFilteredItems.length === 0) return;
    const prevIdx = (activeItemIndex - 1 + currentFilteredItems.length) % currentFilteredItems.length;
    setActiveItem(currentFilteredItems[prevIdx]);
    setZoomLevel(1);
  };

  const handleNextItem = () => {
    if (activeItemIndex === -1 || currentFilteredItems.length === 0) return;
    const nextIdx = (activeItemIndex + 1) % currentFilteredItems.length;
    setActiveItem(currentFilteredItems[nextIdx]);
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);
  const toggleZoom = () => setZoomLevel((prev) => (prev > 1 ? 1 : 2.5));

  useEffect(() => {
    if (!activeItem) return;

    const canvas = imageCanvasRef.current;
    
    // Buttery smooth non-passive scroll wheel zoom handler
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = -e.deltaY * 0.0018;
      setZoomLevel((prev) => {
        const next = Math.min(Math.max(prev + zoomFactor, 1), 4);
        return Math.round(next * 100) / 100;
      });
    };

    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveItem(null);
        setZoomLevel(1);
        setIsFullScreen(false);
      } else if (e.key === 'ArrowRight') {
        handleNextItem();
      } else if (e.key === 'ArrowLeft') {
        handlePrevItem();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItem, activeItemIndex, currentFilteredItems]);

  return (
    <section ref={gallerySectionRef} id="gallery" className="pt-20 md:pt-28 pb-10 md:pb-14 bg-[#FAF8F5] relative overflow-hidden">
      {/* Decorative Parallax Background Elements */}
      <motion.div
        style={{ y: yMotif1, rotate: rotateMotif }}
        className="absolute -top-12 -left-12 opacity-[0.06] text-[#B68C4A] pointer-events-none select-none"
      >
        <JaapiMotif size={220} />
      </motion.div>

      <motion.div
        style={{ y: yMotif2 }}
        className="absolute top-1/2 -right-16 opacity-[0.05] text-[#8C1D18] pointer-events-none select-none"
      >
        <JaapiMotif size={260} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F7F2EA] border border-[#D8C2A3] text-xs font-semibold text-[#8C1D18] uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B68C4A]" />
            <span className={isAssamese ? 'font-assamese' : ''}>
              {isAssamese ? 'আমাৰ কাৰুকাৰ্য সমাহাৰ' : 'Curated Gallery'}
            </span>
          </div>

          <h2 className={`text-3xl md:text-5xl font-bold text-[#242424] font-serif-playfair leading-tight mb-4 ${
            isAssamese ? 'font-assamese' : ''
          }`}>
            {isAssamese ? 'সপোনৰ অনুষ্ঠান, নিখুঁত ছবি' : 'Assamese Wedding Decoration Showcase'}
          </h2>

          <p className={`text-base text-[#3A2F28]/80 max-w-2xl mx-auto ${
            isAssamese ? 'font-assamese text-lg' : ''
          }`}>
            {isAssamese
              ? 'আমাৰ দ্বাৰা সজোৱা কেতবোৰ বিশিষ্ট বিয়া, ৰিচেপশ্বন আৰু যোৰণ অনুষ্ঠানৰ প্ৰেক্ষাপট।'
              : 'Explore our portfolio of bespoke Assamese wedding stages, bamboo pavilions, and Xorai welcome gates.'}
          </p>
        </motion.div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 mb-8 sm:mb-12 no-scrollbar justify-start sm:justify-center px-1">
          {categories.map((cat) => (
            <motion.button
              key={cat.key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 border whitespace-nowrap shrink-0 min-h-[40px] relative ${
                activeCategory === cat.key
                  ? 'bg-[#8C1D18] text-[#FAF8F5] border-[#8C1D18] shadow-md'
                  : 'bg-[#F7F2EA] text-[#3A2F28] border-[#D8C2A3]/60 hover:bg-[#D8C2A3]/30'
              } ${isAssamese ? 'font-assamese font-semibold' : ''}`}
            >
              {isAssamese ? cat.labelAs : cat.labelEn}
            </motion.button>
          ))}
        </div>

        {/* Gallery Grid */}
        {displayedItems.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {displayedItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(idx * 0.04, 0.3),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group bg-[#F7F2EA] rounded-2xl overflow-hidden border border-[#D8C2A3]/60 shadow-xs hover:shadow-xl transition-shadow duration-500 flex flex-col"
                  >
                    {/* Image Thumbnail Container */}
                    <div
                      onClick={() => {
                        setActiveItem(item);
                        setZoomLevel(1);
                        setIsFullScreen(false);
                      }}
                      className="relative aspect-[4/3] overflow-hidden bg-[#242424] cursor-pointer group/img"
                    >
                      <LazyImage
                        src={item.image}
                        targetWidth={850}
                        alt={isAssamese ? item.titleAs : item.titleEn}
                        referrerPolicy="no-referrer"
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover object-center group-hover/img:scale-108 transition-transform duration-700 ease-out filter brightness-95"
                      />
                      
                      {/* Overlay Action Buttons */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#242424]/85 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-6 justify-between">
                        <span className="text-xs text-[#D4B16A] uppercase font-semibold tracking-wider font-mono">
                          {item.category.replace('_', ' ').toUpperCase()}
                        </span>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveItem(item);
                            setZoomLevel(1);
                            setIsFullScreen(false);
                          }}
                          className="p-3 rounded-full bg-[#FAF8F5] text-[#8C1D18] hover:bg-[#8C1D18] hover:text-[#FAF8F5] transition-colors shadow-lg cursor-pointer"
                          title="View Full Resolution"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className={`text-lg font-bold text-[#242424] mb-2 font-serif-playfair group-hover:text-[#8C1D18] transition-colors ${
                          isAssamese ? 'font-assamese text-xl' : ''
                        }`}>
                          {isAssamese ? item.titleAs : item.titleEn}
                        </h3>

                        <p className={`text-xs md:text-sm text-[#3A2F28]/80 mb-4 line-clamp-2 ${
                          isAssamese ? 'font-assamese' : ''
                        }`}>
                          {isAssamese ? item.descriptionAs : item.descriptionEn}
                        </p>
                      </div>

                      {/* Elements Badges & Inquiry CTA */}
                      <div className="pt-4 border-t border-[#D8C2A3]/40">
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {item.elements.slice(0, 3).map((elem, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[11px] font-medium text-[#B68C4A] border border-[#D8C2A3]/50"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {elem}
                            </span>
                          ))}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelectSetupForInquiry(item)}
                          className="w-full py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#8C1D18] text-[#8C1D18] hover:text-[#FAF8F5] border border-[#D8C2A3] text-xs font-semibold tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-[#B68C4A] group-hover/btn:text-[#D4B16A] transition-colors" />
                          <span className={isAssamese ? 'font-assamese font-semibold' : ''}>
                            {isAssamese ? 'এই সজ্জা বিচাৰক' : 'Inquire This Exact Setup'}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Show More Button - Small and Subtle */}
            {hasMore && (
              <div className="mt-10 text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVisibleLimit((prev) => prev + 9)}
                  className="inline-flex items-center gap-2 bg-[#F7F2EA] hover:bg-[#8C1D18] text-[#3A2F28] hover:text-[#FAF8F5] border border-[#D8C2A3] hover:border-[#8C1D18] px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-2xs hover:shadow-md transition-all duration-300 group cursor-pointer"
                >
                  <span className={isAssamese ? 'font-assamese font-semibold' : ''}>
                    {isAssamese ? 'আৰু সজ্জা চাওক' : 'Show More Setups'}
                  </span>
                  <span className="text-[11px] opacity-60 font-mono tracking-tight">
                    ({displayedItems.length}/{currentFilteredItems.length})
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#B68C4A] group-hover:text-[#D4B16A] group-hover:translate-y-0.5 transition-all" />
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-xl mx-auto my-8 p-8 sm:p-12 text-center bg-[#F7F2EA] rounded-3xl border-2 border-dashed border-[#D8C2A3] shadow-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FAF8F5] border border-[#D8C2A3] flex items-center justify-center text-[#8C1D18]">
              <Sparkles className="w-8 h-8 text-[#B68C4A]" />
            </div>
            <h3 className={`text-2xl font-bold text-[#242424] font-serif-playfair mb-2 ${isAssamese ? 'font-assamese' : ''}`}>
              {isAssamese ? 'প্ৰীতি ভোজৰ বিশেষ সজ্জা শীঘ্ৰেই আহি আছে' : 'Reception Showcase Coming Soon'}
            </h3>
            <p className={`text-sm text-[#3A2F28]/80 mb-6 ${isAssamese ? 'font-assamese' : ''}`}>
              {isAssamese
                ? 'আমাৰ নতুন প্ৰীতি ভোজ সংগ্ৰহ প্ৰস্তুত হৈ আছে। কাষ্টমাইজড্‌ প্ৰীতি ভোজ সজ্জাৰ বাবে পোনে পোনে আমাৰ সৈতে যোগাযোগ কৰক।'
                : 'Our latest bespoke Assamese reception & banquet decor gallery is being curated. Contact us directly for custom reception styling.'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal with Full-Screen High-Resolution Zoomable Experience */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 md:p-6 select-none">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`bg-[#242424] rounded-2xl md:rounded-3xl border border-[#D8C2A3]/30 shadow-2xl relative flex flex-col overflow-hidden w-full transition-all duration-300 ${
                isFullScreen
                  ? 'h-[96vh] max-w-[98vw]'
                  : 'max-w-5xl h-[92vh] max-h-[850px]'
              }`}
            >
              {/* Top Control Bar */}
              <div className="px-4 py-3 bg-[#1F1F1F] border-b border-[#D8C2A3]/20 flex items-center justify-between z-30 shrink-0">
                {/* Counter & Category */}
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5]/10 border border-[#D4B16A]/30 text-[11px] font-mono text-[#D4B16A]">
                    {activeItemIndex + 1} / {currentFilteredItems.length}
                  </span>
                  <span className="hidden sm:inline-block text-xs font-medium text-[#FAF8F5]/80 uppercase tracking-wider font-mono">
                    {activeItem.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Lightbox Control Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Zoom Out */}
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="p-2 rounded-lg bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 text-[#FAF8F5] disabled:opacity-40 disabled:hover:bg-[#FAF8F5]/10 transition-colors cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  {/* Zoom Indicator / Reset */}
                  <button
                    onClick={handleResetZoom}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 text-[#D4B16A] text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    title="Reset Zoom"
                  >
                    <span>{Math.round(zoomLevel * 100)}%</span>
                    {zoomLevel !== 1 && <RotateCcw className="w-3 h-3 ml-0.5" />}
                  </button>

                  {/* Zoom In */}
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="p-2 rounded-lg bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 text-[#FAF8F5] disabled:opacity-40 disabled:hover:bg-[#FAF8F5]/10 transition-colors cursor-pointer"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-[#FAF8F5]/20 mx-1" />

                  {/* Toggle Full Screen Image Mode */}
                  <button
                    onClick={() => setIsFullScreen((prev) => !prev)}
                    className="p-2 rounded-lg bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 text-[#D4B16A] transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 text-xs"
                    title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen Focus'}
                  >
                    {isFullScreen ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        <span className="hidden md:inline">Split View</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        <span className="hidden md:inline">Full Image</span>
                      </>
                    )}
                  </button>

                  {/* Close Modal */}
                  <button
                    onClick={() => {
                      setActiveItem(null);
                      setZoomLevel(1);
                      setIsFullScreen(false);
                    }}
                    className="p-2 rounded-lg bg-[#8C1D18] hover:bg-[#5A0F12] text-[#FAF8F5] transition-colors cursor-pointer ml-1"
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Main Content */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Image Viewing Canvas Area */}
                <div
                  ref={imageCanvasRef}
                  className={`relative bg-[#1A1A1A] flex items-center justify-center overflow-hidden transition-all duration-300 ${
                    isFullScreen ? 'w-full h-full' : 'md:w-3/5 lg:w-2/3 h-full min-h-[300px]'
                  }`}
                  onDoubleClick={toggleZoom}
                >
                  {/* Floating Prev / Next Arrow Navigation */}
                  <button
                    onClick={handlePrevItem}
                    className="absolute left-3 sm:left-5 z-20 p-2.5 sm:p-3 rounded-full bg-[#1A1A1A]/70 text-[#FAF8F5] hover:bg-[#8C1D18] border border-[#D8C2A3]/30 transition-all shadow-xl cursor-pointer hover:scale-105 active:scale-95"
                    title="Previous Image (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <button
                    onClick={handleNextItem}
                    className="absolute right-3 sm:right-5 z-20 p-2.5 sm:p-3 rounded-full bg-[#1A1A1A]/70 text-[#FAF8F5] hover:bg-[#8C1D18] border border-[#D8C2A3]/30 transition-all shadow-xl cursor-pointer hover:scale-105 active:scale-95"
                    title="Next Image (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  {/* Zoomable Image Container */}
                  <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden relative">
                    {zoomLevel > 1 && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-md border border-[#D4B16A]/40 text-[#D4B16A] px-3 py-1 rounded-full text-[11px] font-mono flex items-center gap-1.5 shadow-lg pointer-events-none">
                        <Move className="w-3.5 h-3.5" />
                        <span>Hand Tool Active: Drag to pan image</span>
                      </div>
                    )}
                    <motion.img
                      key={activeItem.id}
                      src={getOptimizedImageUrl(activeItem.image, { width: 1400, quality: 85 })}
                      alt={isAssamese ? activeItem.titleAs : activeItem.titleEn}
                      referrerPolicy="no-referrer"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80';
                      }}
                      animate={{ scale: zoomLevel }}
                      transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 30,
                        mass: 0.4
                      }}
                      drag={zoomLevel > 1}
                      dragConstraints={false}
                      dragElastic={0.02}
                      dragMomentum={false}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl touch-none select-none active:cursor-grabbing"
                      style={{
                        transformOrigin: 'center center',
                        cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
                      }}
                    />
                  </div>

                  {/* Bottom Image Caption Overlay (shown in FullScreen mode or mobile) */}
                  {isFullScreen && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[90%] bg-[#1A1A1A]/85 backdrop-blur-md border border-[#D8C2A3]/30 p-4 rounded-2xl text-center shadow-xl">
                      <h4 className={`text-base font-bold text-[#FAF8F5] ${isAssamese ? 'font-assamese' : 'font-serif-playfair'}`}>
                        {isAssamese ? activeItem.titleAs : activeItem.titleEn}
                      </h4>
                      <p className={`text-xs text-[#FAF8F5]/80 mt-1 line-clamp-2 ${isAssamese ? 'font-assamese' : ''}`}>
                        {isAssamese ? activeItem.descriptionAs : activeItem.descriptionEn}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Editorial Story & Details Panel (hidden if isFullScreen) */}
                {!isFullScreen && (
                  <div className="md:w-2/5 lg:w-1/3 bg-[#FAF8F5] p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-t md:border-t-0 md:border-l border-[#D8C2A3]/40">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#F7F2EA] border border-[#D8C2A3] text-xs font-mono font-semibold text-[#8C1D18] uppercase tracking-wider">
                          {activeItem.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-[#B68C4A] font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Assamese Heritage
                        </span>
                      </div>

                      <h3 className={`text-2xl font-bold text-[#242424] font-serif-playfair mb-3 ${
                        isAssamese ? 'font-assamese text-2xl' : ''
                      }`}>
                        {isAssamese ? activeItem.titleAs : activeItem.titleEn}
                      </h3>

                      <p className={`text-xs md:text-sm text-[#3A2F28]/85 mb-6 leading-relaxed ${
                        isAssamese ? 'font-assamese text-sm' : ''
                      }`}>
                        {isAssamese ? activeItem.descriptionAs : activeItem.descriptionEn}
                      </p>

                      <div className="space-y-3 mb-6 bg-[#F7F2EA]/70 p-4 rounded-xl border border-[#D8C2A3]/40">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#B68C4A] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          Key Elements Included
                        </h4>
                        <ul className="space-y-2">
                          {activeItem.elements.map((elem, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-[#242424]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8C1D18] shrink-0" />
                              <span>{elem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* WhatsApp Inquiry CTA */}
                    <div className="pt-4 border-t border-[#D8C2A3]/60">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const title = activeItem?.titleEn;
                          setActiveItem(null);
                          setZoomLevel(1);
                          setIsFullScreen(false);
                          openWhatsAppInquiry({ setupTitle: title });
                        }}
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4.5 h-4.5 fill-current" />
                        <span className={isAssamese ? 'font-assamese font-semibold' : ''}>
                          {isAssamese ? 'হোৱাটছএপত প্ৰস্তাৱ বিচাৰক' : 'Inquire Setup on WhatsApp'}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

