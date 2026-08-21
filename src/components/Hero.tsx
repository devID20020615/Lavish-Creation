import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Language } from '../types';
import { Sparkles, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  getStoredHeroSlides,
  getStoredHeroConfig,
  subscribeStorage,
  HeroSlideItem,
  HeroConfigSettings
} from '../utils/storage';
import { resolveDirectImageUrl, getOptimizedImageUrl } from '../utils/imageHelper';

interface HeroProps {
  lang: Language;
  onOpenGallery: () => void;
  onOpenConsultation: () => void;
}

const AnimatedCounter: React.FC<{ target?: number; duration?: number }> = ({ target = 60, duration = 1800 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return <span>{count}+</span>;
};

export const Hero: React.FC<HeroProps> = ({
  lang,
  onOpenGallery,
  onOpenConsultation,
}) => {
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(() => getStoredHeroSlides());
  const [heroConfig, setHeroConfig] = useState<HeroConfigSettings>(() => getStoredHeroConfig());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const isAssamese = lang === 'as';

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setHeroSlides(getStoredHeroSlides());
      setHeroConfig(getStoredHeroConfig());
    });
    return unsubscribe;
  }, []);

  const activeSlides = useMemo(() => {
    const filtered = heroSlides.filter((s) => s.enabled !== false);
    return filtered.length > 0 ? filtered : heroSlides;
  }, [heroSlides]);

  // Preload slide images in background for instant switching
  useEffect(() => {
    activeSlides.forEach((s) => {
      const img = new Image();
      img.src = getOptimizedImageUrl(s.image, { width: 1400, quality: 85 });
    });
  }, [activeSlides]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);
  const yContent = useTransform(scrollYProgress, [0, 1], ['0px', '-30px']);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const slide = activeSlides[currentSlide % Math.max(1, activeSlides.length)] || activeSlides[0];

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] sm:min-h-[88vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
      {/* Background Slideshow with Parallax Motion & Preloader */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id || currentSlide}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ y: yBg, scale: scaleBg }}
          className="absolute inset-0 bg-[#1A1A1A]"
        >
          {/* Skeleton blur background while loading */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-[#242424] animate-pulse flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#D4B16A]/30 animate-spin" />
            </div>
          )}
          <img
            src={getOptimizedImageUrl(slide.image, { width: 1400, quality: 85 })}
            alt="Assamese Luxury Wedding Stage"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.05] transition-opacity duration-500 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* Subtle Warm Amber Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#242424] via-[#242424]/40 to-transparent" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#5A0F12]/20 to-[#242424]/80" />
        </motion.div>
      </AnimatePresence>

      {/* Floating Gentle Flower Petals Animation Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-30">
        <div className="absolute top-1/4 left-6 sm:left-10 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#D4B16A] rounded-full blur-[1px] animate-float" />
        <div className="absolute top-1/3 right-8 sm:right-16 w-3 h-3 sm:w-4 sm:h-4 bg-[#8C1D18] rounded-full blur-[1px] animate-float [animation-delay:2s]" />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#D8C2A3] rounded-full blur-[0.5px] animate-float [animation-delay:4s]" />
      </div>

      {/* Hero Content Container with Subtle Parallax Float */}
      <motion.div
        style={{ opacity: opacityHero, y: yContent }}
        className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center text-[#FAF8F5] flex flex-col items-center"
      >
        {/* Eyebrow Tagline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.tagEn}-${lang}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#FAF8F5]/10 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full border border-[#D4B16A]/40 mb-3 sm:mb-4 shadow-sm"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4B16A]" />
            <span className={`text-[11px] sm:text-xs md:text-sm uppercase font-medium text-[#D4B16A] transition-all duration-300 ${
              isAssamese ? 'font-assamese font-semibold tracking-normal' : 'tracking-widest'
            }`}>
              {isAssamese ? slide.tagAs : slide.tagEn}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Main Headline */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={`${slide.titleEn}-${lang}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF8F5] leading-tight max-w-4xl mb-3 sm:mb-4 font-serif-playfair text-shadow-sm px-2 ${
              isAssamese ? 'font-assamese font-bold leading-normal' : ''
            }`}
          >
            {isAssamese ? slide.titleAs : slide.titleEn}
          </motion.h1>
        </AnimatePresence>

        {/* Emotional Subtitle */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`${slide.subEn}-${lang}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className={`text-sm sm:text-base md:text-lg text-[#FAF8F5]/90 max-w-2xl mb-6 sm:mb-8 leading-relaxed font-light px-2 ${
              isAssamese ? 'font-assamese' : ''
            }`}
          >
            {isAssamese ? slide.subAs : slide.subEn}
          </motion.p>
        </AnimatePresence>

        {/* Main Tagline Banner Highlight (Conditional Toggle) */}
        {heroConfig.showBanner !== false && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-lg bg-gradient-to-r from-transparent via-[#8C1D18]/85 to-transparent py-2 px-4 sm:px-6 rounded-md mb-6 sm:mb-8 border-y border-[#D4B16A]/50 shadow-sm"
          >
            <p className="text-xs sm:text-sm md:text-base font-assamese font-bold text-[#D4B16A] text-center">
              "{isAssamese ? heroConfig.bannerTextAs : heroConfig.bannerTextEn}"
            </p>
          </motion.div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none px-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenGallery}
            className="w-full sm:w-auto bg-[#8C1D18] hover:bg-[#5A0F12] text-[#FAF8F5] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-300 shadow-lg border border-[#D4B16A]/40 flex items-center justify-center gap-2 group min-h-[48px] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D4B16A] group-hover:rotate-45 transition-transform" />
            <span className={isAssamese ? 'font-assamese font-semibold text-sm sm:text-base' : ''}>
              {isAssamese ? 'সকলো সজ্জা চাওক' : 'Explore All Showcase'}
            </span>
            <ChevronRight className="w-4 h-4 text-[#D4B16A] group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenConsultation}
            className="w-full sm:w-auto bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 backdrop-blur-md text-[#FAF8F5] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-300 border border-[#FAF8F5]/30 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Calendar className="w-4 h-4 text-[#D4B16A]" />
            <span className={isAssamese ? 'font-assamese font-semibold text-sm sm:text-base' : ''}>
              {isAssamese ? 'পৰামৰ্শৰ বাবে বুক কৰক' : 'Book Consultation'}
            </span>
          </motion.button>
        </div>

        {/* Floating Quick Stats / Badges (Conditional Toggles) */}
        {(heroConfig.showLocations !== false || heroConfig.showRatingBadge !== false) && (
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-[11px] sm:text-xs text-[#FAF8F5]/90">
            {heroConfig.showLocations !== false && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4B16A] shrink-0" />
                <span className={isAssamese ? 'font-assamese font-medium' : 'font-medium'}>
                  {isAssamese
                    ? (heroConfig.locationsTextAs || heroConfig.locationsText || 'সমগ্ৰ অসমজুৰি সেৱা আগবঢ়োৱা হয়')
                    : (heroConfig.locationsText || 'Services Provided All Over Assam')}
                </span>
              </div>
            )}
            {heroConfig.showLocations !== false && heroConfig.showRatingBadge !== false && (
              <div className="h-3 w-px bg-[#FAF8F5]/20 hidden sm:block" />
            )}
            {heroConfig.showRatingBadge !== false && (
              <div className="flex items-center gap-1.5 text-[#D4B16A]">
                <span className="text-xs">★★★★★</span>
                <span className={`text-[#FAF8F5] font-semibold ${isAssamese ? 'font-assamese' : ''}`}>
                  <span className="text-[#E2C382] font-bold text-xs sm:text-sm mr-1">
                    <AnimatedCounter target={60} />
                  </span>
                  {isAssamese
                    ? (heroConfig.ratingBadgeTextAs || 'বিবাহ আৰু অনুষ্ঠান সম্পূৰ্ণ')
                    : (heroConfig.ratingBadgeText || 'Weddings & Events Curated')}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Slide Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-[#D4B16A]' : 'w-2 bg-[#FAF8F5]/40 hover:bg-[#FAF8F5]/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

