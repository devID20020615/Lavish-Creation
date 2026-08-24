import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Plus, Trash2, Edit3, Save, RefreshCw, LogOut, Image, MessageSquare,
  PhoneCall, ShieldAlert, Check, Search, Filter, Sparkles, Layers, Tag, Layout, Eye, EyeOff,
  Wand2, Loader2, Link2, Instagram, Video, Play, ChevronDown, ChevronUp, Users, ChefHat, Utensils,
  Upload, RotateCcw, FileImage, ImagePlus, Key, CheckCircle2, AlertCircle, ExternalLink, CloudUpload
} from 'lucide-react';
import { ClientManagement } from './ClientManagement';
import { InstagramBypassHub } from './InstagramBypassHub';
import { GalleryItem, MenuCategory, MenuItem } from '../types';
import {
  subscribeStorage,
  getStoredGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemEnabled,
  getStoredTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getStoredSettings,
  saveSettings,
  uploadImageToImgbb,
  getStoredHeroSlides,
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideEnabled,
  getStoredHeroConfig,
  saveHeroConfig,
  getStoredVideos,
  addVideoItem,
  updateVideoItem,
  deleteVideoItem,

  toggleVideoItemEnabled,
  getStoredBanquetMenu,
  saveBanquetMenu,
  resetStorageToDefault,
  setCMSAuthenticated,
  TestimonialItem,
  AdminContactSettings,
  HeroSlideItem,
  HeroConfigSettings,
  VideoItem
} from '../utils/storage';
import { resolveImageUrl, clientExtractDirectUrl, analyzeImageWithGemini, translateText, isIbbViewerPageUrl, resolveDirectImageUrl, getSmartFallbackAnalysis } from '../utils/imageHelper';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'hero' | 'videos' | 'testimonials' | 'banquet' | 'settings' | 'clients' | 'instagram_bypass'>('gallery');
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
  const tabDropdownRef = React.useRef<HTMLDivElement>(null);

  // Lock background body scroll when Admin Dashboard is active
  useEffect(() => {
    if (isOpen) {
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

  // Close tab dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target as Node)) {
        setIsTabDropdownOpen(false);
      }
    };
    if (isTabDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTabDropdownOpen]);

  // AI & ImgBB Resolver State
  const [isResolvingImage, setIsResolvingImage] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');

  // Gemini Real-time Auto-Translation State & Ref
  const translationTimersRef = React.useRef<Record<string, any>>({});
  const [translatingFieldKey, setTranslatingFieldKey] = useState<string | null>(null);

  const triggerAutoTranslate = (
    fieldKey: string,
    text: string,
    fromLang: 'en' | 'as',
    toLang: 'as' | 'en',
    setter: (val: string) => void,
    delay = 500
  ) => {
    if (translationTimersRef.current[fieldKey]) {
      clearTimeout(translationTimersRef.current[fieldKey]);
    }

    if (!text || !text.trim()) {
      return;
    }

    setTranslatingFieldKey(fieldKey);

    translationTimersRef.current[fieldKey] = setTimeout(async () => {
      try {
        const translated = await translateText(text, fromLang, toLang);
        if (translated) {
          setter(translated);
        }
      } catch (err) {
        console.error(`Auto translation failed for ${fieldKey}:`, err);
      } finally {
        setTranslatingFieldKey((prev) => (prev === fieldKey ? null : prev));
      }
    }, delay);
  };

  // Gallery State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => getStoredGalleryItems());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State for Gallery Item
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleAs, setFormTitleAs] = useState('');
  const [formCategory, setFormCategory] = useState<GalleryItem['category']>('entrance');
  const [formImage, setFormImage] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formDescAs, setFormDescAs] = useState('');
  const [formElementsStr, setFormElementsStr] = useState('');

  // Extract multiple URLs from multiline text or pasted links
  const extractMultipleUrls = (text: string): string[] => {
    if (!text) return [];
    const parts = text.split(/[\n,]+/);
    return parts
      .map((p) => p.trim())
      .filter((p) => p.length > 5 && (p.startsWith('http://') || p.startsWith('https://') || p.includes('ibb.co') || p.includes('unsplash.com')));
  };

  const handleBulkGalleryImport = async (rawText: string) => {
    const urls = extractMultipleUrls(rawText);
    if (urls.length === 0) return;
    if (urls.length === 1) {
      handleGalleryImageUrlInput(urls[0], true);
      return;
    }

    setIsAnalyzingImage(true);
    let successCount = 0;

    for (let i = 0; i < urls.length; i++) {
      const rawUrl = urls[i];
      setAiStatusMessage(`✨ Gemini AI analyzing photo ${i + 1} of ${urls.length} & auto-generating names...`);
      let finalUrl = clientExtractDirectUrl(rawUrl);
      if (isIbbViewerPageUrl(finalUrl)) {
        try {
          finalUrl = await resolveImageUrl(finalUrl);
        } catch (e) {}
      }

      let category: GalleryItem['category'] = formCategory || (selectedCategoryFilter !== 'all' ? (selectedCategoryFilter as any) : 'entrance');
      const sectionDefaults = getSmartFallbackAnalysis(category);
      let titleEn = `${sectionDefaults.titleEn} ${i + 1}`;
      let titleAs = `${sectionDefaults.titleAs} ${i + 1}`;
      let descEn = sectionDefaults.descriptionEn;
      let descAs = sectionDefaults.descriptionAs;
      let elements = sectionDefaults.elements;

      try {
        const analysis = await analyzeImageWithGemini(finalUrl, category);
        if (analysis) {
          if (analysis.titleEn) titleEn = analysis.titleEn;
          if (analysis.titleAs) titleAs = analysis.titleAs;
          if (analysis.descriptionEn) descEn = analysis.descriptionEn;
          if (analysis.descriptionAs) descAs = analysis.descriptionAs;
          if (analysis.elements && analysis.elements.length > 0) {
            elements = analysis.elements;
          }
        }
      } catch (err) {
        console.error('Bulk Gemini analysis error:', err);
      }

      addGalleryItem({
        titleEn,
        titleAs,
        category,
        image: finalUrl || rawUrl,
        descriptionEn: descEn,
        descriptionAs: descAs,
        elements,
        enabled: true,
      });
      successCount++;
    }

    setIsAnalyzingImage(false);
    setAiStatusMessage(`✓ Successfully imported ${successCount} photos individually with Gemini AI!`);
    refreshAll();
    setTimeout(() => {
      setIsAddingNew(false);
      setAiStatusMessage('');
    }, 2000);
  };

  const handleBulkHeroImport = async (rawText: string) => {
    const urls = extractMultipleUrls(rawText);
    if (urls.length === 0) return;
    if (urls.length === 1) {
      handleHeroSlideImageUrlInput(urls[0], true);
      return;
    }

    setIsAnalyzingImage(true);
    let successCount = 0;

    for (let i = 0; i < urls.length; i++) {
      const rawUrl = urls[i];
      setAiStatusMessage(`✨ Gemini AI analyzing hero slide ${i + 1} of ${urls.length}...`);
      let finalUrl = clientExtractDirectUrl(rawUrl);
      if (isIbbViewerPageUrl(finalUrl)) {
        try {
          finalUrl = await resolveImageUrl(finalUrl);
        } catch (e) {}
      }

      let tagEn = 'Royal Assam Curation';
      let tagAs = 'ৰাজকীয় অসমীয়া সাজসজ্জা';
      let titleEn = `Grand Wedding Showcase ${i + 1}`;
      let titleAs = `বিলাসী বিবাহ প্ৰদৰ্শন ${i + 1}`;
      let subEn = 'Pioneering ultra-luxury Assamese heritage wedding décor.';
      let subAs = 'পৰম্পৰাগত অসমীয়া বিবাহ মণ্ডপৰ অনুপম শৈলী।';

      try {
        const analysis = await analyzeImageWithGemini(finalUrl);
        if (analysis) {
          if (analysis.badgeTagEn) tagEn = analysis.badgeTagEn;
          if (analysis.badgeTagAs) tagAs = analysis.badgeTagAs;
          if (analysis.titleEn) titleEn = analysis.titleEn;
          if (analysis.titleAs) titleAs = analysis.titleAs;
          if (analysis.descriptionEn) subEn = analysis.descriptionEn;
          if (analysis.descriptionAs) subAs = analysis.descriptionAs;
        }
      } catch (err) {}

      addHeroSlide({
        image: finalUrl || rawUrl,
        tagEn,
        tagAs,
        titleEn,
        titleAs,
        subEn,
        subAs,
        enabled: true,
      });
      successCount++;
    }

    setIsAnalyzingImage(false);
    setAiStatusMessage(`✓ Successfully imported ${successCount} hero slides with Gemini AI!`);
    refreshAll();
    setTimeout(() => {
      setIsAddingHeroSlide(false);
      setAiStatusMessage('');
    }, 2000);
  };

  // Handle Gallery Image URL input with real-time ImgBB resolution & Gemini auto-naming
  const handleGalleryImageUrlInput = async (rawValue: string, autoAnalyze = true) => {
    const extracted = clientExtractDirectUrl(rawValue);
    setFormImage(extracted);

    if (!extracted) return;

    let finalUrl = extracted;
    if (isIbbViewerPageUrl(extracted)) {
      setIsResolvingImage(true);
      setAiStatusMessage('⚡ Resolving ImgBB page URL to direct image source file...');
      finalUrl = await resolveImageUrl(extracted);
      setFormImage(finalUrl);
      setIsResolvingImage(false);
      setAiStatusMessage('✓ ImgBB link automatically resolved to direct image!');
      setTimeout(() => setAiStatusMessage(''), 3000);
    }

    if (autoAnalyze && finalUrl && (!formTitleEn || formTitleEn.trim() === '')) {
      await triggerGeminiGalleryAnalysis(finalUrl);
    }
  };

  const triggerGeminiGalleryAnalysis = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || formImage;
    if (!targetUrl) {
      setAiStatusMessage('Please enter or paste an image URL first.');
      setTimeout(() => setAiStatusMessage(''), 3000);
      return;
    }

    const targetCategory = formCategory || (selectedCategoryFilter !== 'all' ? selectedCategoryFilter : 'entrance');

    setIsAnalyzingImage(true);
    setAiStatusMessage(`✨ Gemini 3.1 Flash analyzing photo for ${targetCategory} section...`);
    try {
      const analysis = await analyzeImageWithGemini(targetUrl, targetCategory);
      if (analysis) {
        if (analysis.titleEn) setFormTitleEn(analysis.titleEn);
        if (analysis.titleAs) setFormTitleAs(analysis.titleAs);
        setFormCategory(targetCategory as any);
        if (analysis.descriptionEn) setFormDescEn(analysis.descriptionEn);
        if (analysis.descriptionAs) setFormDescAs(analysis.descriptionAs);
        if (analysis.elements && analysis.elements.length > 0) {
          setFormElementsStr(analysis.elements.join(', '));
        }
        setAiStatusMessage('✨ Gemini AI auto-generated titles & details specifically for this section!');
      }
    } catch (err: any) {
      console.error('Gemini auto-naming error:', err);
      setAiStatusMessage('Note: Enter titles manually or check Gemini API key.');
    } finally {
      setIsAnalyzingImage(false);
      setTimeout(() => setAiStatusMessage(''), 4000);
    }
  };

  // Handle Hero Slide Image URL input
  const handleHeroSlideImageUrlInput = async (rawValue: string, autoAnalyze = true) => {
    const extracted = clientExtractDirectUrl(rawValue);
    setSlideImage(extracted);

    if (!extracted) return;

    let finalUrl = extracted;
    if (isIbbViewerPageUrl(extracted)) {
      setIsResolvingImage(true);
      setAiStatusMessage('⚡ Resolving ImgBB viewer link to direct image...');
      finalUrl = await resolveImageUrl(extracted);
      setSlideImage(finalUrl);
      setIsResolvingImage(false);
      setAiStatusMessage('✓ ImgBB link resolved to direct image!');
      setTimeout(() => setAiStatusMessage(''), 3000);
    }

    if (autoAnalyze && finalUrl && (!slideTitleEn || slideTitleEn.trim() === '')) {
      await triggerGeminiHeroSlideAnalysis(finalUrl);
    }
  };



  const triggerGeminiHeroSlideAnalysis = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || slideImage;
    if (!targetUrl) {
      setAiStatusMessage('Please enter an image URL first.');
      setTimeout(() => setAiStatusMessage(''), 3000);
      return;
    }

    setIsAnalyzingImage(true);
    setAiStatusMessage('✨ Gemini 3.1 Flash analyzing photo for hero slide text...');
    try {
      const analysis = await analyzeImageWithGemini(targetUrl);
      if (analysis) {
        if (analysis.badgeTagEn) setSlideTagEn(analysis.badgeTagEn);
        if (analysis.badgeTagAs) setSlideTagAs(analysis.badgeTagAs);
        if (analysis.titleEn) setSlideTitleEn(analysis.titleEn);
        if (analysis.titleAs) setSlideTitleAs(analysis.titleAs);
        if (analysis.descriptionEn) setSlideSubEn(analysis.descriptionEn);
        if (analysis.descriptionAs) setSlideSubAs(analysis.descriptionAs);
        setAiStatusMessage('✨ Gemini AI generated hero slide headline and text!');
      }
    } catch (err: any) {
      console.error('Gemini hero slide auto-naming error:', err);
      setAiStatusMessage('Note: Enter slide details manually.');
    } finally {
      setIsAnalyzingImage(false);
      setTimeout(() => setAiStatusMessage(''), 4000);
    }
  };

  // Hero State
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(() => getStoredHeroSlides());
  const [heroConfig, setHeroConfig] = useState<HeroConfigSettings>(() => getStoredHeroConfig());
  const [editingHeroSlide, setEditingHeroSlide] = useState<HeroSlideItem | null>(null);
  const [isAddingHeroSlide, setIsAddingHeroSlide] = useState(false);
  const [heroSuccessMsg, setHeroSuccessMsg] = useState('');

  // Hero Slide Form State
  const [slideImage, setSlideImage] = useState('');
  const [slideTagEn, setSlideTagEn] = useState('');
  const [slideTagAs, setSlideTagAs] = useState('');
  const [slideTitleEn, setSlideTitleEn] = useState('');
  const [slideTitleAs, setSlideTitleAs] = useState('');
  const [slideSubEn, setSlideSubEn] = useState('');
  const [slideSubAs, setSlideSubAs] = useState('');

  // Dedicated Bulk Link Importer State
  const [isBulkImporterOpen, setIsBulkImporterOpen] = useState(false);
  const [bulkLinksInput, setBulkLinksInput] = useState('');
  const [bulkTarget, setBulkTarget] = useState<'gallery' | 'hero'>('gallery');
  const [bulkCategory, setBulkCategory] = useState<GalleryItem['category']>('entrance');

  const handleOpenBulkImporter = (target: 'gallery' | 'hero' = 'gallery') => {
    setBulkTarget(target);
    if (target === 'gallery' && selectedCategoryFilter !== 'all') {
      setBulkCategory(selectedCategoryFilter as any);
    }
    setBulkLinksInput('');
    setAiStatusMessage('');
    setIsBulkImporterOpen(true);
  };

  const handleRunDedicatedBulkImport = async () => {
    const urls = extractMultipleUrls(bulkLinksInput);
    if (urls.length === 0) {
      setAiStatusMessage('Please paste at least one valid image URL or ImgBB link.');
      setTimeout(() => setAiStatusMessage(''), 3000);
      return;
    }

    setIsAnalyzingImage(true);
    let successCount = 0;

    for (let i = 0; i < urls.length; i++) {
      const rawUrl = urls[i];
      setAiStatusMessage(`✨ Gemini AI analyzing photo ${i + 1} of ${urls.length}...`);

      let finalUrl = clientExtractDirectUrl(rawUrl);
      if (isIbbViewerPageUrl(finalUrl)) {
        try {
          finalUrl = await resolveImageUrl(finalUrl);
        } catch (e) {}
      }

      if (bulkTarget === 'gallery') {
        let category = bulkCategory;
        const catDefaults = getSmartFallbackAnalysis(category);
        let titleEn = `${catDefaults.titleEn} ${galleryItems.length + i + 1}`;
        let titleAs = `${catDefaults.titleAs} ${galleryItems.length + i + 1}`;
        let descEn = catDefaults.descriptionEn;
        let descAs = catDefaults.descriptionAs;
        let elements = catDefaults.elements;

        try {
          const analysis = await analyzeImageWithGemini(finalUrl, category);
          if (analysis) {
            if (analysis.titleEn) titleEn = analysis.titleEn;
            if (analysis.titleAs) titleAs = analysis.titleAs;
            if (analysis.descriptionEn) descEn = analysis.descriptionEn;
            if (analysis.descriptionAs) descAs = analysis.descriptionAs;
            if (analysis.elements && analysis.elements.length > 0) {
              elements = analysis.elements;
            }
          }
        } catch (err) {
          console.error('Bulk Gemini analysis error:', err);
        }

        addGalleryItem({
          titleEn,
          titleAs,
          category,
          image: finalUrl || rawUrl,
          descriptionEn: descEn,
          descriptionAs: descAs,
          elements,
          enabled: true,
        });
      } else {
        let tagEn = 'Royal Assam Curation';
        let tagAs = 'ৰাজকীয় অসমীয়া সাজসজ্জা';
        let titleEn = `Grand Wedding Showcase ${heroSlides.length + i + 1}`;
        let titleAs = `বিলাসী বিবাহ প্ৰদৰ্শন ${heroSlides.length + i + 1}`;
        let subEn = 'Pioneering ultra-luxury Assamese heritage wedding décor.';
        let subAs = 'পৰম্পৰাগত অসমীয়া বিবাহ মণ্ডপৰ অনুপম শৈলী।';

        try {
          const analysis = await analyzeImageWithGemini(finalUrl);
          if (analysis) {
            if (analysis.badgeTagEn) tagEn = analysis.badgeTagEn;
            if (analysis.badgeTagAs) tagAs = analysis.badgeTagAs;
            if (analysis.titleEn) titleEn = analysis.titleEn;
            if (analysis.titleAs) titleAs = analysis.titleAs;
            if (analysis.descriptionEn) subEn = analysis.descriptionEn;
            if (analysis.descriptionAs) subAs = analysis.descriptionAs;
          }
        } catch (err) {}

        addHeroSlide({
          image: finalUrl || rawUrl,
          tagEn,
          tagAs,
          titleEn,
          titleAs,
          subEn,
          subAs,
          enabled: true,
        });
      }
      successCount++;
    }

    setIsAnalyzingImage(false);
    setAiStatusMessage(`✓ Successfully imported ${successCount} items with Gemini AI!`);
    refreshAll();
    setTimeout(() => {
      setIsBulkImporterOpen(false);
      setBulkLinksInput('');
      setAiStatusMessage('');
    }, 2000);
  };

  // Testimonials State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => getStoredTestimonials());
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);

  // Testimonial Form State
  const [testNameEn, setTestNameEn] = useState('');
  const [testNameAs, setTestNameAs] = useState('');
  const [testLocEn, setTestLocEn] = useState('');
  const [testLocAs, setTestLocAs] = useState('');
  const [testStoryEn, setTestStoryEn] = useState('');
  const [testStoryAs, setTestStoryAs] = useState('');
  const [testEventEn, setTestEventEn] = useState('');
  const [testEventAs, setTestEventAs] = useState('');

  // Settings State
  const [settings, setSettings] = useState<AdminContactSettings>(() => getStoredSettings());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [logoSuccessMsg, setLogoSuccessMsg] = useState('');
  const [isResolvingLogoUrl, setIsResolvingLogoUrl] = useState(false);
  const [isUploadingLogoToImgbb, setIsUploadingLogoToImgbb] = useState(false);
  const [isTestingImgbbKey, setIsTestingImgbbKey] = useState(false);
  const [imgbbTestStatus, setImgbbTestStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({
    type: '',
    message: '',
  });
  const logoFileRef = React.useRef<HTMLInputElement>(null);
  const galleryImgbbFileRef = React.useRef<HTMLInputElement>(null);
  const heroSlideImgbbFileRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingGalleryImgbb, setIsUploadingGalleryImgbb] = useState(false);
  const [isUploadingHeroImgbb, setIsUploadingHeroImgbb] = useState(false);


  // Venue Videos State
  const [videos, setVideos] = useState<VideoItem[]>(() => getStoredVideos());
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoFormUrl, setVideoFormUrl] = useState('');
  const [videoFormTitle, setVideoFormTitle] = useState('');

  // Video Form Handlers
  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoFormUrl('');
    setVideoFormTitle('');
    setIsAddingVideo(true);
  };

  const handleOpenEditVideo = (v: VideoItem) => {
    setEditingVideo(v);
    setVideoFormUrl(v.url);
    setVideoFormTitle(v.title || '');
    setIsAddingVideo(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormUrl || !videoFormUrl.trim()) return;

    if (editingVideo) {
      updateVideoItem({
        ...editingVideo,
        url: videoFormUrl.trim(),
        title: videoFormTitle.trim() || 'Venue Showcase Video',
      });
    } else {
      addVideoItem(videoFormUrl.trim(), videoFormTitle.trim());
    }

    setIsAddingVideo(false);
    setEditingVideo(null);
    setVideoFormUrl('');
    setVideoFormTitle('');
    refreshAll();
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this venue video link?')) {
      deleteVideoItem(id);
      refreshAll();
    }
  };

  const handleToggleVideo = (id: string) => {
    toggleVideoItemEnabled(id);
    refreshAll();
  };

  // Banquet Menu State & Dish Modal
  const [banquetCategories, setBanquetCategories] = useState<MenuCategory[]>(() => getStoredBanquetMenu());
  const [editingDishTarget, setEditingDishTarget] = useState<{
    catId: string;
    subId: string;
    dish?: MenuItem;
  } | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [dishNameEn, setDishNameEn] = useState('');
  const [dishNameAs, setDishNameAs] = useState('');
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishPopular, setDishPopular] = useState(false);

  const handleOpenAddDish = (catId: string, subId: string) => {
    setEditingDishTarget({ catId, subId });
    setDishNameEn('');
    setDishNameAs('');
    setDishIsVeg(true);
    setDishPopular(false);
    setIsDishModalOpen(true);
  };

  const handleOpenEditDish = (catId: string, subId: string, dish: MenuItem) => {
    setEditingDishTarget({ catId, subId, dish });
    setDishNameEn(dish.nameEn);
    setDishNameAs(dish.nameAs);
    setDishIsVeg(dish.isVeg !== false);
    setDishPopular(!!dish.popular);
    setIsDishModalOpen(true);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDishTarget || !dishNameEn.trim()) return;

    const updatedCategories = banquetCategories.map((cat) => {
      if (cat.id !== editingDishTarget.catId) return cat;
      return {
        ...cat,
        subSections: cat.subSections.map((sub) => {
          if (sub.id !== editingDishTarget.subId) return sub;

          if (editingDishTarget.dish) {
            // Edit existing item
            return {
              ...sub,
              items: sub.items.map((item) =>
                item.id === editingDishTarget.dish!.id
                  ? {
                      ...item,
                      nameEn: dishNameEn.trim(),
                      nameAs: dishNameAs.trim() || dishNameEn.trim(),
                      isVeg: dishIsVeg,
                      popular: dishPopular,
                    }
                  : item
              ),
            };
          } else {
            // Add new item
            const newDish: MenuItem = {
              id: 'dish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              nameEn: dishNameEn.trim(),
              nameAs: dishNameAs.trim() || dishNameEn.trim(),
              isVeg: dishIsVeg,
              popular: dishPopular,
            };
            return {
              ...sub,
              items: [...sub.items, newDish],
            };
          }
        }),
      };
    });

    saveBanquetMenu(updatedCategories);
    setBanquetCategories(updatedCategories);
    setIsDishModalOpen(false);
    setEditingDishTarget(null);
  };

  const handleDeleteDish = (catId: string, subId: string, dishId: string) => {
    const updatedCategories = banquetCategories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subSections: cat.subSections.map((sub) => {
          if (sub.id !== subId) return sub;
          return {
            ...sub,
            items: sub.items.filter((item) => item.id !== dishId),
          };
        }),
      };
    });

    saveBanquetMenu(updatedCategories);
    setBanquetCategories(updatedCategories);
  };

  const handleToggleDishVeg = (catId: string, subId: string, dishId: string) => {
    const updatedCategories = banquetCategories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subSections: cat.subSections.map((sub) => {
          if (sub.id !== subId) return sub;
          return {
            ...sub,
            items: sub.items.map((item) =>
              item.id === dishId ? { ...item, isVeg: !item.isVeg } : item
            ),
          };
        }),
      };
    });

    saveBanquetMenu(updatedCategories);
    setBanquetCategories(updatedCategories);
  };

  const handleToggleDishPopular = (catId: string, subId: string, dishId: string) => {
    const updatedCategories = banquetCategories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subSections: cat.subSections.map((sub) => {
          if (sub.id !== subId) return sub;
          return {
            ...sub,
            items: sub.items.map((item) =>
              item.id === dishId ? { ...item, popular: !item.popular } : item
            ),
          };
        }),
      };
    });

    saveBanquetMenu(updatedCategories);
    setBanquetCategories(updatedCategories);
  };

  // Refresh items from storage
  const refreshAll = () => {
    setGalleryItems(getStoredGalleryItems());
    setTestimonials(getStoredTestimonials());
    setSettings(getStoredSettings());
    setHeroSlides(getStoredHeroSlides());
    setHeroConfig(getStoredHeroConfig());
    setVideos(getStoredVideos());
    setBanquetCategories(getStoredBanquetMenu());
  };

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      refreshAll();
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  // Open Gallery Add Form
  const handleOpenAddGallery = () => {
    setEditingItem(null);
    setFormTitleEn('');
    setFormTitleAs('');
    setFormCategory('entrance');
    setFormImage('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80');
    setFormDescEn('');
    setFormDescAs('');
    setFormElementsStr('Jaapi Art, Brass Xorai, White Jasmine, Ambient Lighting');
    setIsAddingNew(true);
  };

  // Open Gallery Edit Form
  const handleOpenEditGallery = (item: GalleryItem) => {
    setEditingItem(item);
    setFormTitleEn(item.titleEn);
    setFormTitleAs(item.titleAs);
    setFormCategory(item.category);
    setFormImage(item.image);
    setFormDescEn(item.descriptionEn);
    setFormDescAs(item.descriptionAs);
    setFormElementsStr(item.elements.join(', '));
    setIsAddingNew(true);
  };

  // Save Gallery Item (Add or Edit)
  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    const elementsArray = formElementsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      titleEn: formTitleEn,
      titleAs: formTitleAs,
      category: formCategory,
      image: formImage,
      descriptionEn: formDescEn,
      descriptionAs: formDescAs,
      elements: elementsArray.length > 0 ? elementsArray : ['Custom Decor Element'],
    };

    if (editingItem) {
      updateGalleryItem({ ...payload, id: editingItem.id });
    } else {
      addGalleryItem(payload);
    }

    refreshAll();
    setIsAddingNew(false);
    setEditingItem(null);
  };

  // Delete Gallery Item
  const handleDeleteGallery = (id: string) => {
    deleteGalleryItem(id);
    refreshAll();
  };

  // Testimonial Save
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nameEn: testNameEn,
      nameAs: testNameAs,
      locationEn: testLocEn,
      locationAs: testLocAs,
      storyEn: testStoryEn,
      storyAs: testStoryAs,
      eventEn: testEventEn,
      eventAs: testEventAs,
    };

    if (editingTestimonial) {
      updateTestimonial({ ...payload, id: editingTestimonial.id });
    } else {
      addTestimonial(payload);
    }

    refreshAll();
    setIsAddingTestimonial(false);
    setEditingTestimonial(null);
  };

  const handleOpenAddTestimonial = () => {
    setEditingTestimonial(null);
    setTestNameEn('');
    setTestNameAs('');
    setTestLocEn('');
    setTestLocAs('');
    setTestStoryEn('');
    setTestStoryAs('');
    setTestEventEn('');
    setTestEventAs('');
    setIsAddingTestimonial(true);
  };

  const handleOpenEditTestimonial = (item: TestimonialItem) => {
    setEditingTestimonial(item);
    setTestNameEn(item.nameEn);
    setTestNameAs(item.nameAs);
    setTestLocEn(item.locationEn);
    setTestLocAs(item.locationAs);
    setTestStoryEn(item.storyEn);
    setTestStoryAs(item.storyAs);
    setTestEventEn(item.eventEn);
    setTestEventAs(item.eventAs);
    setIsAddingTestimonial(true);
  };

  const handleDeleteTestimonialItem = (id: string) => {
    deleteTestimonial(id);
    refreshAll();
  };

  // Hero Slide & Config Handlers
  const handleOpenAddHeroSlide = () => {
    setEditingHeroSlide(null);
    setSlideImage('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80');
    setSlideTagEn('Assamese Heritage, Modern Luxury');
    setSlideTagAs('অসমীয়া পৰম্পৰা, আধুনিক সৌন্দৰ্য');
    setSlideTitleEn('Crafting Timeless Assamese Wedding Memories');
    setSlideTitleAs('সপোনৰ অনুষ্ঠান, নিখুঁত সজ্জা');
    setSlideSubEn('Handcrafted Jaapi, polished brass Xorai, and cascading orchids for your sacred day.');
    setSlideSubAs('প্ৰতিটো বিয়াৰ মঞ্চত জাপি, শৰাই আৰু বগা ফুলৰ ৰাজকীয় প্ৰেক্ষাপট।');
    setIsAddingHeroSlide(true);
  };

  const handleOpenEditHeroSlide = (slide: HeroSlideItem) => {
    setEditingHeroSlide(slide);
    setSlideImage(slide.image);
    setSlideTagEn(slide.tagEn);
    setSlideTagAs(slide.tagAs);
    setSlideTitleEn(slide.titleEn);
    setSlideTitleAs(slide.titleAs);
    setSlideSubEn(slide.subEn);
    setSlideSubAs(slide.subAs);
    setIsAddingHeroSlide(true);
  };

  const handleSaveHeroSlide = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      image: slideImage,
      tagEn: slideTagEn,
      tagAs: slideTagAs,
      titleEn: slideTitleEn,
      titleAs: slideTitleAs,
      subEn: slideSubEn,
      subAs: slideSubAs,
    };

    if (editingHeroSlide) {
      updateHeroSlide({ ...payload, id: editingHeroSlide.id });
    } else {
      addHeroSlide(payload);
    }

    refreshAll();
    setIsAddingHeroSlide(false);
    setEditingHeroSlide(null);
  };

  const handleDeleteHeroSlideItem = (id: string) => {
    if (heroSlides.length <= 1) {
      alert('You must keep at least 1 hero slide!');
      return;
    }
    deleteHeroSlide(id);
    refreshAll();
  };

  const handleSaveHeroConfigForm = (e: React.FormEvent) => {
    e.preventDefault();
    saveHeroConfig(heroConfig);
    setHeroSuccessMsg('Hero global texts & banner updated successfully!');
    setTimeout(() => setHeroSuccessMsg(''), 3000);
    refreshAll();
  };

  const DEFAULT_BRAND_LOGO = 'https://i.ibb.co/ds07wJms/Chat-GPT-Image-Jul-28-2026-10-32-13-PM.png';

  const handleLogoUrlChange = (val: string) => {
    const clean = clientExtractDirectUrl(val.trim());
    setSettings((prev) => ({ ...prev, logoUrl: clean }));
  };

  const handleResolveLogoUrl = async () => {
    const currentUrl = settings.logoUrl || '';
    if (!currentUrl) return;
    if (isIbbViewerPageUrl(currentUrl)) {
      setIsResolvingLogoUrl(true);
      try {
        const resolved = await resolveImageUrl(currentUrl);
        if (resolved) {
          setSettings((prev) => ({ ...prev, logoUrl: resolved }));
        }
      } catch (err) {
        console.warn('Error resolving logo url:', err);
      } finally {
        setIsResolvingLogoUrl(false);
      }
    }
  };

  const handleTestImgbbKey = async () => {
    const key = (settings.imgbbApiKey || '').trim();
    if (!key) {
      setImgbbTestStatus({
        type: 'error',
        message: 'Please enter an ImgBB API key first.',
      });
      return;
    }

    setIsTestingImgbbKey(true);
    setImgbbTestStatus({ type: '', message: '' });

    try {
      // Create a valid 10x10 PNG image via standard HTML canvas to test ImgBB API
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#8C1D18';
        ctx.fillRect(0, 0, 10, 10);
      }
      const testImageData = canvas.toDataURL('image/png');

      const result = await uploadImageToImgbb(testImageData, key, 'bb_decoration_connection_test');
      if (result.success && result.url) {
        setImgbbTestStatus({
          type: 'success',
          message: '✓ ImgBB API Key verified & connected successfully! Direct cloud uploads are ready.',
        });
        // Auto-save the valid settings
        saveSettings(settings);
      } else {
        setImgbbTestStatus({
          type: 'error',
          message: result.error || 'Failed to verify key. Please check your ImgBB API key.',
        });
      }
    } catch (err: any) {
      setImgbbTestStatus({
        type: 'error',
        message: err?.message || 'Error communicating with ImgBB API.',
      });
    } finally {
      setIsTestingImgbbKey(false);
    }
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('The chosen image file is too large. Please select a logo file under 10MB.');
      return;
    }

    setIsUploadingLogoToImgbb(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        // Try uploading to ImgBB first if key exists
        const key = (settings.imgbbApiKey || '').trim();
        if (key) {
          try {
            const uploadResult = await uploadImageToImgbb(dataUrl, key, 'bb_decoration_logo_' + Date.now());
            if (uploadResult.success && uploadResult.url) {
              const updated = { ...settings, logoUrl: uploadResult.url };
              setSettings(updated);
              saveSettings(updated);
              setLogoSuccessMsg('✓ Logo uploaded directly to ImgBB CDN and updated live across the website!');
              setTimeout(() => setLogoSuccessMsg(''), 4000);
              refreshAll();
              setIsUploadingLogoToImgbb(false);
              return;
            }
          } catch (err) {
            console.warn('ImgBB upload fallback to direct dataUrl:', err);
          }
        }

        // Fallback: save as direct dataUrl
        const updated = { ...settings, logoUrl: dataUrl };
        setSettings(updated);
        saveSettings(updated);
        setLogoSuccessMsg('✓ Logo updated and applied live across the website!');
        setTimeout(() => setLogoSuccessMsg(''), 3500);
        refreshAll();
        setIsUploadingLogoToImgbb(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    if (window.confirm('Reset main logo to the original BB Decoration logo?')) {
      const updated = { ...settings, logoUrl: DEFAULT_BRAND_LOGO };
      setSettings(updated);
      saveSettings(updated);
      setLogoSuccessMsg('✓ Logo reset to default successfully!');
      setTimeout(() => setLogoSuccessMsg(''), 3000);
      refreshAll();
    }
  };

  const handleSaveLogoDirectly = () => {
    saveSettings(settings);
    setLogoSuccessMsg('✓ Main logo updated & applied across the website!');
    setTimeout(() => setLogoSuccessMsg(''), 3000);
    refreshAll();
  };

  // Direct Gallery Upload to ImgBB
  const handleGalleryImgbbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGalleryImgbb(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const key = (settings.imgbbApiKey || '').trim();
        const uploadResult = await uploadImageToImgbb(dataUrl, key, 'gallery_item_' + Date.now());
        if (uploadResult.success && uploadResult.url) {
          handleGalleryImageUrlInput(uploadResult.url, false);
          setAiStatusMessage('✓ Photo uploaded directly to ImgBB! Analyzing with Gemini AI...');
          // Trigger AI auto-naming
          triggerGeminiGalleryAnalysis(uploadResult.url);
        } else {
          alert('ImgBB upload error: ' + (uploadResult.error || 'Please check your ImgBB API key.'));
        }
      }
      setIsUploadingGalleryImgbb(false);
    };
    reader.readAsDataURL(file);
  };

  // Direct Hero Slide Upload to ImgBB
  const handleHeroImgbbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHeroImgbb(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const key = (settings.imgbbApiKey || '').trim();
        const uploadResult = await uploadImageToImgbb(dataUrl, key, 'hero_slide_' + Date.now());
        if (uploadResult.success && uploadResult.url) {
          handleHeroSlideImageUrlInput(uploadResult.url, false);
          setAiStatusMessage('✓ Hero photo uploaded directly to ImgBB! Generating headlines...');
          // Trigger AI auto-generation
          triggerGeminiHeroSlideAnalysis(uploadResult.url);
        } else {
          alert('ImgBB upload error: ' + (uploadResult.error || 'Please check your ImgBB API key.'));
        }
      }
      setIsUploadingHeroImgbb(false);
    };
    reader.readAsDataURL(file);
  };

  // Settings Save
  const handleSaveSettingsForm = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setSaveSuccessMsg('Settings updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
    refreshAll();
  };



  // Reset to Default
  const handleReset = () => {
    if (window.confirm('WARNING: Reset all showcase data back to default initial items?')) {
      resetStorageToDefault();
      refreshAll();
      alert('Showcase data reset to default successfully!');
    }
  };

  // Filtered Gallery Items
  const filteredGallery = galleryItems.filter((item) => {
    const matchesCat = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const matchesSearch =
      item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleAs.includes(searchQuery) ||
      item.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden overscroll-contain"
      onWheel={(e) => {
        // Prevent background wheel propagation
        e.stopPropagation();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FAF8F5] w-full max-w-6xl h-full sm:h-[92dvh] max-h-[100dvh] sm:max-h-[92dvh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col border-0 sm:border-2 border-[#D4B16A]/60 overflow-hidden relative min-w-0 overscroll-contain"
      >
        {/* Top Accent */}
        <div className="gamosa-border shrink-0" />

        {/* Header Bar */}
        <div className="bg-[#242424] text-[#FAF8F5] px-3.5 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between gap-2 border-b border-[#D4B16A]/30 shrink-0 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#8C1D18] flex items-center justify-center text-[#D4B16A] shadow-md border border-[#D4B16A]/40 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif-playfair text-sm sm:text-xl font-bold tracking-wide truncate sm:whitespace-normal">
                BB Decoration CMS Portal
              </h2>
              <span className="text-[10px] sm:text-[11px] text-[#D4B16A] uppercase font-mono font-semibold tracking-wider block truncate">
                Logged in as: Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4B16A]/20 hover:bg-[#D4B16A]/30 text-[#D4B16A] border border-[#D4B16A]/40 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              title="View live website preview with updated changes"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Website Preview</span>
            </button>

            <button
              onClick={handleReset}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/50 text-xs font-semibold cursor-pointer transition-colors"
              title="Reset data to default"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={() => {
                setCMSAuthenticated(false);
                onClose();
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#FAF8F5]/10 hover:bg-[#8C1D18] text-[#FAF8F5] text-xs font-semibold cursor-pointer transition-colors shrink-0 min-h-[36px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0"
              aria-label="Close CMS Portal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar / Dropdown Selector */}
        {(() => {
          const navTabs = [
            {
              id: 'gallery' as const,
              label: 'Gallery Setups',
              count: galleryItems.length,
              icon: Image,
              subtitle: 'Portals, mandaps, biya naam & stage decors'
            },
            {
              id: 'hero' as const,
              label: 'Hero & Slides',
              count: heroSlides.length,
              icon: Layout,
              subtitle: 'Homepage visual slides & headlines'
            },
            {
              id: 'videos' as const,
              label: 'Venue Videos',
              count: videos.length,
              icon: Video,
              subtitle: 'YouTube, Vimeo & direct MP4 showcase'
            },
            {
              id: 'testimonials' as const,
              label: 'Client Reviews',
              count: testimonials.length,
              icon: MessageSquare,
              subtitle: 'Client stories & feedback'
            },
            {
              id: 'banquet' as const,
              label: 'Banquet Catering Menu',
              count: banquetCategories.reduce((acc, c) => acc + c.subSections.reduce((sAcc, s) => sAcc + s.items.length, 0), 0),
              icon: ChefHat,
              subtitle: 'Starters, main course, non-veg, breads & Assamese items'
            },
            {
              id: 'settings' as const,
              label: 'Brand Logo & Settings',
              icon: PhoneCall,
              subtitle: 'Change main logo, WhatsApp, address & contact'
            },
            {
              id: 'clients' as const,
              label: 'Clients',
              icon: Users,
              subtitle: 'Client CRM, billing, payments & project tracking'
            },
            {
              id: 'instagram_bypass' as const,
              label: 'Instagram & In-App Bypass',
              icon: Instagram,
              subtitle: 'Direct download trigger, deep links & bio generator'
            }
          ];

          const currentTab = navTabs.find(t => t.id === activeTab) || navTabs[0];
          const CurrentIcon = currentTab.icon;

          return (
            <div className="bg-[#F7F2EA] px-3 sm:px-5 py-2.5 border-b border-[#D8C2A3] shrink-0 relative z-30" ref={tabDropdownRef}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 max-w-full">
                
                {/* Dropdown Trigger Button */}
                <div className="relative flex-1 sm:max-w-md">
                  <button
                    type="button"
                    onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
                    className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2 sm:py-2.5 bg-[#FAF8F5] hover:bg-white text-[#242424] border-2 border-[#D4B16A] rounded-xl shadow-xs transition-all cursor-pointer group min-h-[42px]"
                    aria-expanded={isTabDropdownOpen}
                    aria-label="Select CMS Section Dropdown"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#8C1D18] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CurrentIcon className="w-4 h-4 text-[#FAF8F5]" />
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs sm:text-sm font-bold font-serif-playfair text-[#242424] truncate">
                          {currentTab.label}
                        </span>
                        {typeof currentTab.count === 'number' && (
                          <span className="px-2 py-0.5 rounded-full bg-[#8C1D18] text-white text-[11px] font-bold shrink-0">
                            {currentTab.count}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[#8C1D18] text-xs font-semibold shrink-0 pl-1">
                      <span className="text-[11px] text-[#7A6A5C]">Select Section</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isTabDropdownOpen ? 'rotate-180 text-[#8C1D18]' : 'text-[#7A6A5C] group-hover:text-[#8C1D18]'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Dropdown Menu Overlay */}
                  <AnimatePresence>
                    {isTabDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 right-0 top-full mt-1.5 bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 divide-y divide-[#D8C2A3]/30 min-w-[280px]"
                      >
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7A6A5C]">
                          CMS Dashboard Sections
                        </div>
                        <div className="py-1 space-y-1">
                          {navTabs.map((tab) => {
                            const TabIcon = tab.icon;
                            const isSelected = activeTab === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab(tab.id);
                                  setIsTabDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#8C1D18] text-white shadow-xs'
                                    : 'hover:bg-[#F7F2EA] text-[#3A2F28]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? 'bg-white/20 text-[#FAF8F5]'
                                        : 'bg-[#F7F2EA] text-[#8C1D18] border border-[#D8C2A3]'
                                    }`}
                                  >
                                    <TabIcon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs sm:text-sm font-bold truncate">
                                        {tab.label}
                                      </span>
                                      {typeof tab.count === 'number' && (
                                        <span
                                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            isSelected
                                              ? 'bg-white text-[#8C1D18]'
                                              : 'bg-[#8C1D18]/10 text-[#8C1D18]'
                                          }`}
                                        >
                                          {tab.count}
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className={`text-[11px] truncate ${
                                        isSelected ? 'text-white/80' : 'text-[#7A6A5C]'
                                      }`}
                                    >
                                      {tab.subtitle}
                                    </p>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-white text-[#8C1D18] flex items-center justify-center shrink-0 ml-1">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active Section Info Badge */}
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#7A6A5C]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Currently editing: <strong className="text-[#8C1D18] font-bold">{currentTab.label}</strong></span>
                </div>

              </div>
            </div>
          );
        })()}

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 bg-[#FAF8F5] min-w-0">
          {/* ================= TAB 1: GALLERY MANAGER ================= */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-[#F7F2EA] p-3 sm:p-4 rounded-2xl border border-[#D8C2A3] min-w-0">
                <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
                    <Search className="w-4 h-4 text-[#B68C4A] absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search setups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-white border border-[#D8C2A3] rounded-xl text-xs text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#8C1D18] min-w-0"
                    />
                  </div>

                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 sm:py-1.5 bg-white border border-[#D8C2A3] rounded-xl text-xs text-[#242424] focus:outline-none font-medium min-w-0"
                  >
                    <option value="all">All Categories</option>
                    <option value="entrance">Entrance Gates</option>
                    <option value="mandap">Sacred Mandap</option>
                    <option value="stage">Wedding Stage</option>
                    <option value="sitting_area">Sitting Lounge</option>
                    <option value="reception">Reception Banquet</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenBulkImporter('gallery')}
                    className="w-full sm:w-auto bg-[#242424] hover:bg-black text-[#D4B16A] px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-[#D4B16A]/40 transition-all min-h-[40px] text-center shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4B16A] shrink-0" />
                    <span className="truncate sm:whitespace-normal">✨ Bulk Paste Links to Gallery</span>
                  </button>

                  <button
                    onClick={handleOpenAddGallery}
                    className="w-full sm:w-auto bg-[#8C1D18] hover:bg-[#5A0F12] text-[#FAF8F5] px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors min-h-[40px] text-center shrink-0"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Add New Decor Setup</span>
                  </button>
                </div>
              </div>

              {/* Gallery List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 min-w-0">
                {filteredGallery.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#D8C2A3] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-w-0 max-w-full"
                  >
                    <div className="relative h-44 bg-[#1A1A1A] overflow-hidden w-full">
                      <img
                        src={resolveDirectImageUrl(item.image)}
                        alt={item.titleEn}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-[#242424]/80 text-[#D4B16A] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs max-w-[calc(100%-1rem)] truncate">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[#242424] font-serif-playfair line-clamp-1 break-words">
                          {item.titleEn}
                        </h4>
                        <span className="font-assamese text-xs text-[#8C1D18] font-semibold block mb-2 truncate">
                          {item.titleAs}
                        </span>
                        <p className="text-[11px] text-[#3A2F28]/70 line-clamp-2 mb-3 break-words">
                          {item.descriptionEn}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#F7F2EA] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            toggleGalleryItemEnabled(item.id);
                            setGalleryItems(getStoredGalleryItems());
                          }}
                          className={`flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors min-h-[36px] ${
                            item.enabled !== false
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                          title={item.enabled !== false ? 'Click to hide from Decoration Showcase' : 'Click to show on Decoration Showcase'}
                        >
                          {item.enabled !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>ON (Visible)</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>OFF (Hidden)</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5 flex-1 sm:flex-none justify-end">
                          <button
                            onClick={() => handleOpenEditGallery(item)}
                            className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#D8C2A3]/50 text-[#3A2F28] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors min-h-[36px]"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#8C1D18] shrink-0" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors min-h-[36px]"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: HERO PAGE & SLIDES MANAGER ================= */}
          {activeTab === 'hero' && (
            <div className="space-y-6 sm:space-y-8 min-w-0">
              {/* Card 1: Hero Global Banner & Texts */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#D8C2A3] shadow-sm min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#F7F2EA] pb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-serif-playfair text-[#242424]">
                      Hero Global Banner & Subheadings
                    </h3>
                    <p className="text-xs text-[#3A2F28]/70">
                      Customize the highlight tagline banner, locations line, and rating badge on the main hero landing section.
                    </p>
                  </div>
                </div>

                {heroSuccessMsg && (
                  <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{heroSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveHeroConfigForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="text-xs font-bold uppercase text-[#3A2F28]">
                          Highlighted Banner Tagline (Assamese)
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-[#8C1D18] font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={heroConfig.showBanner !== false}
                            onChange={(e) => setHeroConfig({ ...heroConfig, showBanner: e.target.checked })}
                            className="rounded accent-[#8C1D18] cursor-pointer"
                          />
                          <span>Show Banner</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={heroConfig.bannerTextAs}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHeroConfig((prev) => ({ ...prev, bannerTextAs: val }));
                          triggerAutoTranslate('bannerTagline', val, 'as', 'en', (translated) => {
                            setHeroConfig((prev) => ({ ...prev, bannerTextEn: translated }));
                          });
                        }}
                        className="w-full px-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese font-semibold text-[#8C1D18] min-w-0"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                          Highlighted Banner Tagline (English)
                        </label>
                        {translatingFieldKey === 'bannerTagline' && (
                          <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={heroConfig.bannerTextEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHeroConfig((prev) => ({ ...prev, bannerTextEn: val }));
                          triggerAutoTranslate('bannerTagline', val, 'en', 'as', (translated) => {
                            setHeroConfig((prev) => ({ ...prev, bannerTextAs: translated }));
                          });
                        }}
                        className="w-full px-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium text-[#242424] min-w-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="text-xs font-bold uppercase text-[#3A2F28]">
                          Served Cities / Locations Line
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-[#8C1D18] font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={heroConfig.showLocations !== false}
                            onChange={(e) => setHeroConfig({ ...heroConfig, showLocations: e.target.checked })}
                            className="rounded accent-[#8C1D18] cursor-pointer"
                          />
                          <span>Show Locations</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={heroConfig.locationsText}
                        onChange={(e) => setHeroConfig({ ...heroConfig, locationsText: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="text-xs font-bold uppercase text-[#3A2F28]">
                          Rating Badge Text
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-[#8C1D18] font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={heroConfig.showRatingBadge !== false}
                            onChange={(e) => setHeroConfig({ ...heroConfig, showRatingBadge: e.target.checked })}
                            className="rounded accent-[#8C1D18] cursor-pointer"
                          />
                          <span>Show Badge</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={heroConfig.ratingBadgeText}
                        onChange={(e) => setHeroConfig({ ...heroConfig, ratingBadgeText: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-[#8C1D18] hover:bg-[#5A0F12] text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 min-h-[42px]"
                    >
                      <Save className="w-4 h-4 text-[#D4B16A] shrink-0" />
                      <span>Save Hero Global Config</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Hero Slideshow Pictures & Headings */}
              <div className="space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F7F2EA] p-3 sm:p-4 rounded-2xl border border-[#D8C2A3] min-w-0">
                  <div className="min-w-0">
                    <h3 className="font-serif-playfair text-base sm:text-lg font-bold text-[#242424]">
                      Hero Background Pictures & Slide Content
                    </h3>
                    <p className="text-xs text-[#3A2F28]/70">
                      Manage background images, Assamese & English titles, subtitles, and tags for the top hero banner slider.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenBulkImporter('hero')}
                      className="w-full sm:w-auto bg-[#242424] hover:bg-black text-[#D4B16A] px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-[#D4B16A]/40 transition-all min-h-[40px] text-center shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-[#D4B16A] shrink-0" />
                      <span className="truncate sm:whitespace-normal">✨ Bulk Paste Links to Hero</span>
                    </button>

                    <button
                      onClick={handleOpenAddHeroSlide}
                      className="w-full sm:w-auto bg-[#8C1D18] hover:bg-[#5A0F12] text-[#FAF8F5] px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[40px] text-center shrink-0"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>Add New Hero Slide</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 min-w-0">
                  {heroSlides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className="bg-white rounded-2xl border border-[#D8C2A3] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-w-0 max-w-full"
                    >
                      <div className="relative h-48 bg-[#1A1A1A] w-full">
                        <img
                          src={resolveDirectImageUrl(slide.image)}
                          alt={slide.titleEn}
                          className="w-full h-full object-cover filter brightness-[0.7]"
                        />
                        <span className="absolute top-2 left-2 bg-[#8C1D18] text-[#FAF8F5] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm max-w-[calc(100%-1rem)] truncate">
                          Slide #{idx + 1}
                        </span>
                      </div>

                      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-2 mb-3 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4B16A] bg-[#242424] px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                            {slide.tagEn}
                          </span>
                          <h4 className="font-bold text-sm text-[#242424] font-serif-playfair line-clamp-1 break-words">
                            {slide.titleEn}
                          </h4>
                          <span className="font-assamese text-xs text-[#8C1D18] font-bold block truncate">
                            {slide.titleAs}
                          </span>
                          <p className="text-[11px] text-[#3A2F28]/70 line-clamp-2 italic break-words">
                            "{slide.subEn}"
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#F7F2EA] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              toggleHeroSlideEnabled(slide.id);
                              setHeroSlides(getStoredHeroSlides());
                            }}
                            className={`flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors min-h-[36px] ${
                              slide.enabled !== false
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                            title={slide.enabled !== false ? 'Click to hide from Hero section' : 'Click to show on Hero section'}
                          >
                            {slide.enabled !== false ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1.5 flex-1 sm:flex-none justify-end">
                            <button
                              onClick={() => handleOpenEditHeroSlide(slide)}
                              className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#D8C2A3]/50 text-[#3A2F28] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors min-h-[36px]"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#8C1D18] shrink-0" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteHeroSlideItem(slide.id)}
                              className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors min-h-[36px]"
                            >
                              <Trash2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: VENUE VIDEOS MANAGER ================= */}
          {activeTab === 'videos' && (
            <div className="space-y-4 sm:space-y-6 min-w-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-[#F7F2EA] p-3 sm:p-4 rounded-2xl border border-[#D8C2A3] min-w-0">
                <div className="min-w-0">
                  <h3 className="font-serif-playfair text-base sm:text-lg font-bold text-[#242424] flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#8C1D18] shrink-0" />
                    <span>Venue Videos & ImageKit.io Links</span>
                  </h3>
                  <p className="text-xs text-[#3A2F28]/70">
                    Add or update venue showcase videos (ImageKit.io MP4 links, YouTube, Vimeo, direct MP4s). Rendered directly above Client Testimonials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddVideo}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#8C1D18] hover:bg-[#5A0F12] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer transition-all min-h-[40px]"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add Video Link</span>
                </button>
              </div>

              {/* Video Add / Edit Modal */}
              {isAddingVideo && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-xs overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#FAF8F5] border-2 border-[#D8C2A3] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] min-h-0 min-w-0"
                  >
                    <div className="bg-[#1A1412] p-3.5 sm:p-4 text-[#FAF8F5] flex items-center justify-between border-b border-[#D8C2A3]/30 min-w-0">
                      <h4 className="font-bold text-sm text-[#D4B16A] flex items-center gap-2">
                        <Video className="w-4 h-4 shrink-0" />
                        <span>{editingVideo ? 'Edit Venue Video Link' : 'Add New Venue Video Link'}</span>
                      </h4>
                      <button
                        onClick={() => setIsAddingVideo(false)}
                        className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveVideo} className="p-4 sm:p-5 overflow-y-auto space-y-4 min-w-0">
                      <div>
                        <label className="block text-xs font-bold uppercase text-[#3A2F28] mb-1">
                          Video Title / Reference Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={videoFormTitle}
                          onChange={(e) => setVideoFormTitle(e.target.value)}
                          placeholder="e.g. Today's Venue Showcase"
                          className="w-full px-3.5 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-xs font-medium text-[#242424] outline-none focus:ring-2 focus:ring-[#8C1D18] min-w-0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-[#3A2F28] mb-1">
                          Video URL Link (ImageKit.io, MP4, WebM, YouTube, Vimeo) *
                        </label>
                        <input
                          type="url"
                          required
                          value={videoFormUrl}
                          onChange={(e) => setVideoFormUrl(e.target.value)}
                          placeholder="https://ik.imagekit.io/1ca0lhuyg/BB%20Decoration/Todays%20venue.mp4?updatedAt=1785835959389"
                          className="w-full px-3.5 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-xs font-mono text-[#8C1D18] font-bold outline-none focus:ring-2 focus:ring-[#8C1D18] min-w-0"
                        />
                        <p className="text-[11px] text-gray-500 mt-1 break-words">
                          Paste your ImageKit.io direct video URL or MP4 link here. Example: <code className="bg-[#EFE7DC] px-1 py-0.5 rounded text-[10px] break-all">https://ik.imagekit.io/1ca0lhuyg/BB%20Decoration/Todays%20venue.mp4</code>
                        </p>
                      </div>

                      {/* Live Preview player inside modal */}
                      {videoFormUrl && videoFormUrl.trim().length > 5 && (
                        <div className="space-y-1 min-w-0">
                          <label className="block text-[11px] font-bold uppercase text-[#8C1D18]">
                            Live Video Preview:
                          </label>
                          <div className="rounded-xl overflow-hidden border border-[#D8C2A3] bg-black max-h-[220px] w-full">
                            <video
                              src={videoFormUrl.trim()}
                              controls
                              muted
                              className="w-full h-auto max-h-[220px] object-contain mx-auto"
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-[#D8C2A3]">
                        <button
                          type="button"
                          onClick={() => setIsAddingVideo(false)}
                          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-[#3A2F28] bg-gray-200 hover:bg-gray-300 cursor-pointer min-h-[40px] text-center"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-[#8C1D18] hover:bg-[#5A0F12] shadow-md cursor-pointer min-h-[40px] text-center"
                        >
                          {editingVideo ? 'Update Video' : 'Save Video Link'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Video Items List */}
              {videos.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#D8C2A3] p-6">
                  <Video className="w-12 h-12 text-[#D8C2A3] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#3A2F28]">No venue videos added yet.</p>
                  <p className="text-xs text-gray-500 mt-1 mb-4">Click "Add Video Link" above to attach an ImageKit.io video URL.</p>
                  <button
                    onClick={handleOpenAddVideo}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#8C1D18] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    + Add First Video
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 min-w-0">
                  {videos.map((v) => (
                    <div
                      key={v.id}
                      className={`w-full max-w-sm sm:max-w-none sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.3333%-1rem)] lg:max-w-[390px] flex-shrink-0 bg-white rounded-2xl border ${
                        v.enabled === false ? 'border-gray-200 opacity-60' : 'border-[#D8C2A3] shadow-sm'
                      } overflow-hidden flex flex-col min-w-0`}
                    >
                      {/* Video Player in 9:16 Ratio */}
                      <div className="relative aspect-[9/16] bg-black overflow-hidden w-full">
                        <video
                          src={v.url}
                          controls
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                          <button
                            type="button"
                            onClick={() => handleToggleVideo(v.id)}
                            title={v.enabled === false ? 'Video Hidden (Click to Show)' : 'Video Visible (Click to Hide)'}
                            className={`p-1.5 rounded-lg text-xs font-bold shadow-md cursor-pointer transition-colors ${
                              v.enabled === false ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700' : 'bg-emerald-700 text-white hover:bg-emerald-800'
                            }`}
                          >
                            {v.enabled === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Video Info & Controls */}
                      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3 min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-sm text-[#242424] truncate">
                              {v.title || 'Venue Showcase Video'}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                v.enabled === false ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {v.enabled === false ? 'Hidden' : 'Live on Website'}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-[#8C1D18] truncate break-all bg-[#F7F2EA] p-2 rounded-lg border border-[#D8C2A3]/50 max-w-full">
                            {v.url}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditVideo(v)}
                            className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-[#F7F2EA] hover:bg-[#D8C2A3]/50 text-[#3A2F28] text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer min-h-[36px]"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#8C1D18] shrink-0" />
                            <span>Edit URL</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(v.id)}
                            className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer min-h-[36px]"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: TESTIMONIALS MANAGER ================= */}
          {activeTab === 'testimonials' && (
            <div className="space-y-4 sm:space-y-6 min-w-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F7F2EA] p-3 sm:p-4 rounded-2xl border border-[#D8C2A3] min-w-0">
                <div className="min-w-0">
                  <h3 className="font-serif-playfair text-base sm:text-lg font-bold text-[#242424]">
                    Client Stories & Reviews
                  </h3>
                  <p className="text-xs text-[#3A2F28]/70">
                    Add or update client testimonials displayed on the homepage
                  </p>
                </div>
                <button
                  onClick={handleOpenAddTestimonial}
                  className="w-full sm:w-auto bg-[#8C1D18] hover:bg-[#5A0F12] text-[#FAF8F5] px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[40px] shrink-0"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add New Review</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D8C2A3] shadow-xs flex flex-col justify-between min-w-0 max-w-full"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                        <h4 className="font-bold text-sm text-[#242424] truncate">{t.nameEn}</h4>
                        <span className="text-xs text-[#8C1D18] font-semibold truncate shrink-0">{t.eventEn}</span>
                      </div>
                      <p className="text-xs text-[#3A2F28]/80 italic mb-4 break-words">"{t.storyEn}"</p>
                    </div>

                    <div className="pt-3 border-t border-[#F7F2EA] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#3A2F28]/60 truncate">{t.locationEn}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditTestimonial(t)}
                          className="px-3 py-1.5 rounded-lg bg-[#F7F2EA] text-xs font-semibold text-[#3A2F28] cursor-pointer min-h-[34px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonialItem(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-xs font-semibold text-red-600 cursor-pointer min-h-[34px]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: BRAND LOGO & SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6 min-w-0">
              {/* CARD 1: MAIN BRAND LOGO & VISUAL IDENTITY */}
              <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#D8C2A3] shadow-sm min-w-0 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE1] pb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-serif-playfair text-[#242424] flex items-center gap-2">
                      <ImagePlus className="w-5 h-5 text-[#8C1D18]" />
                      <span>Main Brand Logo & Visual Identity</span>
                    </h3>
                    <p className="text-xs text-[#5A4F43] mt-0.5">
                      Upload or enter a link to change the official logo displayed on the Header Navbar, Mobile Drawer, and Footer in real-time.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#D4B16A]/20 text-[#8C1D18] border border-[#D4B16A]/40 w-fit shrink-0">
                    Live System Logo
                  </span>
                </div>

                {logoSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{logoSuccessMsg}</span>
                  </div>
                )}

                {/* Dual Live Preview Display */}
                <div>
                  <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-2.5">
                    Real-time Logo Preview (Navbar Header & Footer Centered View)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Light Header Mockup */}
                    <div className="bg-[#FAF8F5] border border-[#D8C2A3] rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
                      <div className="w-12 h-12 rounded-xl border border-[#D8C2A3]/80 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden relative bg-[#5A0F12]">
                        <img
                          key={`light-${settings.logoUrl}`}
                          src={settings.logoUrl || DEFAULT_BRAND_LOGO}
                          alt="Logo Preview Light"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_BRAND_LOGO;
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-xs font-bold text-[#8C1D18] uppercase tracking-wider text-[10px]">
                          Header Preview (Light)
                        </span>
                        <span className="text-sm font-bold text-[#242424] truncate">
                          BB Decoration
                        </span>
                        <span className="text-[10px] text-[#8C1D18] font-semibold uppercase">
                          By Lavish Creation
                        </span>
                      </div>
                    </div>

                    {/* Dark Footer Mockup */}
                    <div className="bg-[#242424] border border-[#D4B16A]/40 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
                      <div className="w-12 h-12 rounded-xl border border-[#D4B16A]/60 flex items-center justify-center overflow-hidden shrink-0 shadow-md bg-[#5A0F12]">
                        <img
                          key={`dark-${settings.logoUrl}`}
                          src={settings.logoUrl || DEFAULT_BRAND_LOGO}
                          alt="Logo Preview Dark"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_BRAND_LOGO;
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-xs font-bold text-[#D4B16A] uppercase tracking-wider text-[10px]">
                          Footer Preview (Dark)
                        </span>
                        <span className="text-sm font-bold text-[#FAF8F5] truncate">
                          BB Decoration
                        </span>
                        <span className="text-[10px] text-[#D4B16A] font-semibold uppercase">
                          By Lavish Creation
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload & URL Input Controls */}
                <div className="space-y-4 pt-2">
                  {/* File Upload Button (Hidden File Input) */}
                  <div>
                    <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1.5">
                      Option A: Direct Logo Upload (Auto-Uploads to ImgBB CDN)
                    </label>
                    <input
                      type="file"
                      ref={logoFileRef}
                      onChange={handleLogoFileUpload}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isUploadingLogoToImgbb}
                        onClick={() => logoFileRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-[#8C1D18] hover:bg-[#5A0F12] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors disabled:opacity-60"
                      >
                        {isUploadingLogoToImgbb ? (
                          <Loader2 className="w-4 h-4 text-[#D4B16A] animate-spin" />
                        ) : (
                          <CloudUpload className="w-4 h-4 text-[#D4B16A]" />
                        )}
                        <span>{isUploadingLogoToImgbb ? 'Uploading to ImgBB...' : 'Upload New Logo File'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="px-3.5 py-2.5 rounded-xl bg-[#F7F2EA] hover:bg-[#EAE1D2] text-[#3A2F28] text-xs sm:text-sm font-semibold flex items-center gap-1.5 border border-[#D8C2A3] cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#8C1D18]" />
                        <span>Reset to Default Logo</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#7A6A5C] mt-1.5">
                      {settings.imgbbApiKey ? (
                        <span className="text-emerald-700 font-semibold">✓ Connected to your ImgBB account. Logo files upload directly to ImgBB CDN.</span>
                      ) : (
                        <span>Tip: Connect your free ImgBB API key below for instant direct CDN hosting, or upload standard PNG/SVG.</span>
                      )}
                    </p>
                  </div>

                  {/* Direct Image URL Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1.5">
                      Option B: Paste Direct Logo URL (ImgBB, Cloudinary, CDN)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Link2 className="w-4 h-4 text-[#B68C4A] absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
                        <input
                          type="text"
                          value={settings.logoUrl || ''}
                          onChange={(e) => handleLogoUrlChange(e.target.value)}
                          placeholder="https://i.ibb.co/... or https://..."
                          className="w-full pl-9 pr-4 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-xs sm:text-sm font-mono text-[#242424] min-w-0"
                        />
                      </div>

                      {isIbbViewerPageUrl(settings.logoUrl || '') && (
                        <button
                          type="button"
                          onClick={handleResolveLogoUrl}
                          disabled={isResolvingLogoUrl}
                          className="px-3 py-2 bg-[#D4B16A]/20 hover:bg-[#D4B16A]/30 text-[#8C1D18] border border-[#D4B16A]/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          {isResolvingLogoUrl ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                          <span>Resolve ImgBB</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSaveLogoDirectly}
                        className="px-4 py-2 bg-[#8C1D18] hover:bg-[#5A0F12] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-[#D4B16A]" />
                        <span>Apply & Save Logo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: IMGBB CLOUD API KEY INTEGRATION */}
              <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border-2 border-[#D4B16A]/60 shadow-sm min-w-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2ECE1] pb-3.5">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-serif-playfair text-[#242424] flex items-center gap-2">
                      <Key className="w-5 h-5 text-[#8C1D18]" />
                      <span>ImgBB Direct Cloud Upload Integration</span>
                    </h3>
                    <p className="text-xs text-[#5A4F43] mt-0.5">
                      Connect your ImgBB API key to upload brand logos, hero slides, and gallery photos directly to ImgBB CDN from this CMS.
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border w-fit shrink-0 ${
                    settings.imgbbApiKey
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {settings.imgbbApiKey ? '✓ ImgBB Connected' : 'API Key Optional'}
                  </span>
                </div>

                {imgbbTestStatus.message && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs ${
                    imgbbTestStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    {imgbbTestStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{imgbbTestStatus.message}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1.5">
                      Your ImgBB API Key (From api.imgbb.com)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Key className="w-4 h-4 text-[#B68C4A] absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
                        <input
                          type="text"
                          value={settings.imgbbApiKey || ''}
                          onChange={(e) => setSettings({ ...settings, imgbbApiKey: e.target.value.trim() })}
                          placeholder="Paste your 32-character ImgBB API Key here..."
                          className="w-full pl-9 pr-4 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-xs sm:text-sm font-mono text-[#242424] min-w-0"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleTestImgbbKey}
                        disabled={isTestingImgbbKey}
                        className="px-4 py-2 bg-[#8C1D18] hover:bg-[#5A0F12] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isTestingImgbbKey ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#D4B16A]" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#D4B16A]" />
                        )}
                        <span>{isTestingImgbbKey ? 'Testing Connection...' : 'Test & Save Key'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#FAF8F5] border border-[#D8C2A3] rounded-xl text-xs text-[#5A4F43]">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-[#8C1D18] shrink-0" />
                      <span>Don't have an ImgBB key? It is 100% free with unlimited image hosting.</span>
                    </div>
                    <a
                      href="https://api.imgbb.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8C1D18] font-bold hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Get Free API Key on ImgBB.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* CARD 3: WHATSAPP & CONTACT SETTINGS */}
              <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#D8C2A3] shadow-sm min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2ECE1] pb-4 mb-5">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-serif-playfair text-[#242424] flex items-center gap-2">
                      <PhoneCall className="w-5 h-5 text-[#8C1D18]" />
                      <span>WhatsApp & Direct Contact Settings</span>
                    </h3>
                    <p className="text-xs text-[#3A2F28]/70 mt-0.5">
                      Update the target admin WhatsApp phone number, display phone, email, and branch addresses.
                    </p>
                  </div>
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettingsForm} className="space-y-4 min-w-0">
                  <div>
                    <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1">
                      Target Admin WhatsApp Number (Numeric string with country code)
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.adminWhatsApp}
                      onChange={(e) => setSettings({ ...settings, adminWhatsApp: e.target.value })}
                      placeholder="e.g. 916002483363"
                      className="w-full px-4 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-mono font-bold text-[#8C1D18] min-w-0"
                    />
                    <span className="text-[11px] text-[#3A2F28]/60 mt-1 block">
                      All "Inquire Now" and setup inquiry clicks will automatically open WhatsApp with this phone number.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1">
                      Display Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.phoneDisplay}
                      onChange={(e) => setSettings({ ...settings, phoneDisplay: e.target.value })}
                      className="w-full px-4 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1">
                      Contact Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-4 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1">
                      Guwahati Office Address
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.guwahatiAddress}
                      onChange={(e) => setSettings({ ...settings, guwahatiAddress: e.target.value })}
                      className="w-full px-4 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3A2F28] uppercase tracking-wider mb-1">
                      Goalpara Office Address
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.goalparaAddress}
                      onChange={(e) => setSettings({ ...settings, goalparaAddress: e.target.value })}
                      className="w-full px-4 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full bg-[#8C1D18] hover:bg-[#5A0F12] text-white py-3 rounded-xl font-semibold text-sm shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Save className="w-4 h-4 text-[#D4B16A] shrink-0" />
                      <span>Save All Contact & WhatsApp Settings</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= TAB: BANQUET CATERING MENU CMS ================= */}
          {activeTab === 'banquet' && (
            <div className="space-y-6 min-w-0">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F7F2EA] p-4 rounded-2xl border border-[#D8C2A3]">
                <div>
                  <h3 className="font-serif-playfair text-lg sm:text-xl font-bold text-[#242424] flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-[#8C1D18]" />
                    <span>Banquet Catering Menu Items</span>
                  </h3>
                  <p className="text-xs text-[#5A4F43] mt-0.5">
                    Add, edit or organize dishes across Starters, Main Course, Non-Veg, Breads and Assamese Classics.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#8C1D18] bg-white px-3.5 py-2 rounded-xl border border-[#D8C2A3] shrink-0">
                  <Utensils className="w-4 h-4 text-[#D4B16A]" />
                  <span>
                    {banquetCategories.reduce((acc, c) => acc + c.subSections.reduce((sAcc, s) => sAcc + s.items.length, 0), 0)} Total Dishes Listed
                  </span>
                </div>
              </div>

              {/* Categories Accordion / List */}
              <div className="space-y-6">
                {banquetCategories.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-2xl border border-[#D8C2A3] p-4 sm:p-6 shadow-xs space-y-4">
                    {/* Category Title */}
                    <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-[#8C1D18]" />
                        <h4 className="font-bold text-base sm:text-lg text-[#242424]">{cat.titleEn}</h4>
                        <span className="text-xs text-[#8C7A6B] font-serif">({cat.titleAs})</span>
                      </div>
                      {cat.badgeEn && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4B16A]/20 text-[#8C1D18] border border-[#D4B16A]/40 shrink-0">
                          {cat.badgeEn}
                        </span>
                      )}
                    </div>

                    {/* Subsections under Category */}
                    <div className="space-y-5">
                      {cat.subSections.map((sub) => (
                        <div key={sub.id} className="bg-[#FAF8F5] rounded-xl border border-[#E6DCCE] p-3.5 sm:p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs sm:text-sm font-extrabold uppercase text-[#8C1D18] tracking-tight flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4B16A]" />
                              <span>{sub.titleEn}</span>
                              <span className="text-gray-400 font-normal">({sub.titleAs})</span>
                            </h5>

                            <button
                              type="button"
                              onClick={() => handleOpenAddDish(cat.id, sub.id)}
                              className="px-3 py-1 bg-[#8C1D18] hover:bg-[#5A0F12] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Dish</span>
                            </button>
                          </div>

                          {/* Dishes Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {sub.items.map((item) => (
                              <div
                                key={item.id}
                                className="bg-white p-2.5 rounded-lg border border-[#E6DCCE] flex items-center justify-between text-xs gap-2 group hover:border-[#8C1D18]/40 shadow-2xs transition-all"
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-1">
                                  {/* Veg/NonVeg Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDishVeg(cat.id, sub.id, item.id)}
                                    className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 p-0.5 cursor-pointer ${
                                      item.isVeg === false
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-emerald-600 bg-emerald-50'
                                    }`}
                                    title="Click to toggle Veg / Non-Veg"
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        item.isVeg === false ? 'bg-red-600' : 'bg-emerald-600'
                                      }`}
                                    />
                                  </button>

                                  <div className="min-w-0">
                                    <p className="font-semibold text-[#242424] truncate">{item.nameEn}</p>
                                    <p className="text-[10px] text-[#8C7A6B] font-assamese truncate">{item.nameAs}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Popular Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDishPopular(cat.id, sub.id, item.id)}
                                    className={`p-1 rounded cursor-pointer transition-colors ${
                                      item.popular
                                        ? 'bg-amber-100 text-amber-700 font-bold'
                                        : 'text-gray-300 hover:text-amber-500'
                                    }`}
                                    title={item.popular ? 'Marked Popular' : 'Click to mark as Popular'}
                                  >
                                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                                  </button>

                                  {/* Edit Dish */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDish(cat.id, sub.id, item)}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-[#8C1D18] cursor-pointer"
                                    title="Edit dish item"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Dish */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDish(cat.id, sub.id, item.id)}
                                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                                    title="Delete dish"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: CLIENTS CRM & GOOGLE VERIFICATION ================= */}
          {activeTab === 'clients' && (
            <ClientManagement />
          )}

          {/* ================= TAB: INSTAGRAM & IN-APP BROWSER BYPASS ================= */}
          {activeTab === 'instagram_bypass' && (
            <InstagramBypassHub />
          )}

        </div>

        {/* MODAL: ADD / EDIT BANQUET DISH ITEM */}
        <AnimatePresence>
          {isDishModalOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative my-auto flex flex-col min-h-0"
              >
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#3A2F28]/10 hover:bg-[#8C1D18] hover:text-white flex items-center justify-center text-[#3A2F28] cursor-pointer z-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="p-5 sm:p-6 space-y-4">
                  <h3 className="text-base sm:text-lg font-bold font-serif-playfair text-[#242424] pr-8">
                    {editingDishTarget?.dish ? 'Edit Banquet Dish' : 'Add New Banquet Dish'}
                  </h3>

                  <form onSubmit={handleSaveDish} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                          Dish Name (English) *
                        </label>
                        {translatingFieldKey === 'dishName' && (
                          <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={dishNameEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDishNameEn(val);
                          triggerAutoTranslate('dishName', val, 'en', 'as', setDishNameAs);
                        }}
                        placeholder="e.g. Chilli Paneer, Fish Sorshe..."
                        className="w-full px-3.5 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#8C1D18] outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                          Dish Name (Assamese) *
                        </label>
                        {translatingFieldKey === 'dishName' && (
                          <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={dishNameAs}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDishNameAs(val);
                          triggerAutoTranslate('dishName', val, 'as', 'en', setDishNameEn);
                        }}
                        placeholder="অসমীয়া নাম..."
                        className="w-full px-3.5 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese focus:ring-2 focus:ring-[#8C1D18] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-[#F7F2EA] p-3 rounded-xl border border-[#D8C2A3]">
                        <label className="block text-[11px] font-bold uppercase text-[#3A2F28] mb-1.5">
                          Dietary Type
                        </label>
                        <button
                          type="button"
                          onClick={() => setDishIsVeg(!dishIsVeg)}
                          className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            dishIsVeg
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : 'bg-red-700 text-white shadow-2xs'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${dishIsVeg ? 'bg-emerald-300' : 'bg-red-300'}`} />
                          <span>{dishIsVeg ? 'Pure Veg' : 'Non-Veg'}</span>
                        </button>
                      </div>

                      <div className="bg-[#F7F2EA] p-3 rounded-xl border border-[#D8C2A3] flex flex-col justify-between">
                        <label className="block text-[11px] font-bold uppercase text-[#3A2F28] mb-1">
                          Special Badge
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={dishPopular}
                            onChange={(e) => setDishPopular(e.target.checked)}
                            className="w-4 h-4 accent-[#8C1D18] rounded cursor-pointer"
                          />
                          <span className="text-xs font-bold text-[#8C1D18] flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 fill-current text-amber-500" />
                            <span>Popular</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#D8C2A3]">
                      <button
                        type="button"
                        onClick={() => setIsDishModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-[#3A2F28] bg-gray-200 hover:bg-gray-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#8C1D18] hover:bg-[#5A0F12] shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5 text-[#D4B16A]" />
                        <span>Save Dish</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL / OVERLAY FOR ADDING & EDITING GALLERY ITEM */}
        <AnimatePresence>
          {isAddingNew && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-2.5 sm:p-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] overflow-hidden shadow-2xl relative my-auto flex flex-col min-h-0 box-border min-w-0"
              >
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#3A2F28]/10 hover:bg-[#8C1D18] hover:text-white flex items-center justify-center text-[#3A2F28] cursor-pointer z-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="overflow-y-auto flex-1 p-4 sm:p-7 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold font-serif-playfair text-[#242424] mb-4 pr-8">
                  {editingItem ? 'Edit Decor Setup' : 'Add New Decor Setup'}
                </h3>

                <form onSubmit={handleSaveGalleryItem} className="space-y-4 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                      <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                        Title (English) *
                      </label>
                      {translatingFieldKey === 'galleryTitle' && (
                        <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Gemini translating to Assamese...</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={formTitleEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormTitleEn(val);
                        triggerAutoTranslate('galleryTitle', val, 'en', 'as', setFormTitleAs);
                      }}
                      placeholder="e.g. Royal Muga & Jasmine Portal"
                      className="w-full px-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                      <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                        Title (Assamese) *
                      </label>
                      {translatingFieldKey === 'galleryTitle' && (
                        <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Gemini translating to English...</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={formTitleAs}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormTitleAs(val);
                        triggerAutoTranslate('galleryTitle', val, 'as', 'en', setFormTitleEn);
                      }}
                      placeholder="e.g. ৰাজকীয় মুগা ও শেৱালি আদৰণি"
                      className="w-full px-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese font-semibold min-w-0"
                    />
                  </div>

                  {/* Image URL with ImgBB Direct Upload & Auto-Resolver & Gemini 3.1 Flash Auto-Namer */}
                  <div className="min-w-0">
                    <input
                      type="file"
                      ref={galleryImgbbFileRef}
                      onChange={handleGalleryImgbbUpload}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                        Image URL / ImgBB Link *
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => galleryImgbbFileRef.current?.click()}
                          disabled={isUploadingGalleryImgbb}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#8C1D18] border border-[#D8C2A3] text-[11px] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                          title="Upload image directly to ImgBB and generate URL"
                        >
                          {isUploadingGalleryImgbb ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C1D18]" />
                          ) : (
                            <CloudUpload className="w-3.5 h-3.5 text-[#8C1D18]" />
                          )}
                          <span>{isUploadingGalleryImgbb ? 'Uploading...' : 'Upload Image (ImgBB)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerGeminiGalleryAnalysis()}
                          disabled={isAnalyzingImage || !formImage}
                          className="px-2.5 py-1.5 rounded-lg bg-[#8C1D18] hover:bg-[#5A0F12] text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                          title="Analyze photo with Gemini 3.1 Flash AI to auto-generate names & details"
                        >
                          {isAnalyzingImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4B16A]" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5 text-[#D4B16A]" />
                          )}
                          <span>✨ Auto-Name with AI</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative min-w-0">
                      <textarea
                        rows={2}
                        required
                        value={formImage}
                        onChange={(e) => handleGalleryImageUrlInput(e.target.value, false)}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData('text');
                          handleGalleryImageUrlInput(pasted, true);
                        }}
                        placeholder="Paste single link or multiple photo links (one per line) for Gemini AI bulk import..."
                        className="w-full pl-8 pr-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#8C1D18] outline-none min-w-0"
                      />
                      <Link2 className="w-4 h-4 text-[#B68C4A] absolute left-2.5 top-3" />
                    </div>

                    {extractMultipleUrls(formImage).length > 1 && (
                      <div className="mt-2.5 p-3 bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles className="w-5 h-5 text-[#8C1D18] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#3A2F28] truncate">
                              Detected {extractMultipleUrls(formImage).length} Photo Links!
                            </p>
                            <p className="text-[11px] text-[#7A6A5C]">
                              Gemini AI will automatically analyze each photo and create individual setups with names & details.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBulkGalleryImport(formImage)}
                          disabled={isAnalyzingImage}
                          className="w-full sm:w-auto px-4 py-2.5 bg-[#8C1D18] hover:bg-[#5A0F12] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 min-h-[40px]"
                        >
                          {isAnalyzingImage ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Wand2 className="w-4 h-4 text-[#D4B16A] shrink-0" />}
                          <span>✨ Bulk AI Import All</span>
                        </button>
                      </div>
                    )}

                    {/* AI / ImgBB Status Message */}
                    {aiStatusMessage && (
                      <div className="mt-1.5 text-[11px] font-semibold text-[#8C1D18] flex items-center gap-1 bg-[#F7F2EA] px-2.5 py-1 rounded-lg border border-[#D8C2A3] min-w-0">
                        <Sparkles className="w-3 h-3 text-[#D4B16A] shrink-0" />
                        <span className="truncate">{aiStatusMessage}</span>
                      </div>
                    )}

                    {formImage && (
                      <div className="mt-2.5 h-32 rounded-xl overflow-hidden border border-[#D8C2A3] relative bg-black/5 w-full">
                        <img
                          src={resolveDirectImageUrl(formImage)}
                          alt="Decor Setup Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                        <div className="absolute bottom-1.5 right-1.5 bg-black/75 text-[#D4B16A] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 border border-[#D4B16A]/30">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{formImage.includes('i.ibb.co') ? 'ImgBB Direct Source' : 'Image Linked'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#3A2F28] mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as GalleryItem['category'])}
                      className="w-full px-3.5 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                    >
                      <option value="entrance">Entrance Gates</option>
                      <option value="mandap">Sacred Mandap</option>
                      <option value="stage">Wedding Stage</option>
                      <option value="sitting_area">Sitting Lounge</option>
                      <option value="reception">Reception Banquet</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                        Description (English)
                      </label>
                      {translatingFieldKey === 'galleryDesc' && (
                        <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Translating to Assamese...</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={formDescEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormDescEn(val);
                        triggerAutoTranslate('galleryDesc', val, 'en', 'as', setFormDescAs);
                      }}
                      placeholder="High-level curation description..."
                      className="w-full px-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                        Description (Assamese)
                      </label>
                      {translatingFieldKey === 'galleryDesc' && (
                        <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Translating to English...</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={formDescAs}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormDescAs(val);
                        triggerAutoTranslate('galleryDesc', val, 'as', 'en', setFormDescEn);
                      }}
                      placeholder="অসমীয়া বিৱৰণ..."
                      className="w-full px-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese min-w-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#3A2F28] mb-1">
                      Key Curation Elements (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formElementsStr}
                      onChange={(e) => setFormElementsStr(e.target.value)}
                      placeholder="Jaapi Art, Brass Xorai, White Jasmine, Ambient Lighting"
                      className="w-full px-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                    />
                  </div>

                  <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-[#D8C2A3]">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-[#3A2F28] bg-gray-200 hover:bg-gray-300 cursor-pointer min-h-[40px] text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-[#8C1D18] hover:bg-[#5A0F12] shadow-md cursor-pointer min-h-[40px] text-center"
                    >
                      {editingItem ? 'Update Setup' : 'Create Setup'}
                    </button>
                  </div>
                </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL / OVERLAY FOR TESTIMONIAL FORM */}
        <AnimatePresence>
          {isAddingTestimonial && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-2.5 sm:p-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] overflow-hidden shadow-2xl relative my-auto flex flex-col min-h-0 box-border min-w-0"
              >
                <button
                  type="button"
                  onClick={() => setIsAddingTestimonial(false)}
                  className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#3A2F28]/10 hover:bg-[#8C1D18] hover:text-white flex items-center justify-center text-[#3A2F28] cursor-pointer z-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="overflow-y-auto flex-1 p-4 sm:p-7 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold font-serif-playfair text-[#242424] mb-4 pr-8">
                    {editingTestimonial ? 'Edit Client Story' : 'Add Client Story'}
                  </h3>

                <form onSubmit={handleSaveTestimonial} className="space-y-4 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Name (English)</label>
                        {translatingFieldKey === 'reviewName' && (
                          <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={testNameEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTestNameEn(val);
                          triggerAutoTranslate('reviewName', val, 'en', 'as', setTestNameAs);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm min-w-0"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Name (Assamese)</label>
                        {translatingFieldKey === 'reviewName' && (
                          <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={testNameAs}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTestNameAs(val);
                          triggerAutoTranslate('reviewName', val, 'as', 'en', setTestNameEn);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese min-w-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Location (English)</label>
                        {translatingFieldKey === 'reviewLoc' && (
                          <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={testLocEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTestLocEn(val);
                          triggerAutoTranslate('reviewLoc', val, 'en', 'as', setTestLocAs);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm min-w-0"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Location (Assamese)</label>
                        {translatingFieldKey === 'reviewLoc' && (
                          <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={testLocAs}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTestLocAs(val);
                          triggerAutoTranslate('reviewLoc', val, 'as', 'en', setTestLocEn);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese min-w-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Event Type (English)</label>
                        {translatingFieldKey === 'reviewEvent' && (
                          <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={testEventEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTestEventEn(val);
                          triggerAutoTranslate('reviewEvent', val, 'en', 'as', setTestEventAs);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm min-w-0"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Event Type (Assamese)</label>
                        {translatingFieldKey === 'reviewEvent' && (
                          <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={testEventAs}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTestEventAs(val);
                          triggerAutoTranslate('reviewEvent', val, 'as', 'en', setTestEventEn);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese min-w-0"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <label className="block text-xs font-bold uppercase">Story / Review (English)</label>
                      {translatingFieldKey === 'reviewStory' && (
                        <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>✨ Gemini translating to Assamese...</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={testStoryEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTestStoryEn(val);
                        triggerAutoTranslate('reviewStory', val, 'en', 'as', setTestStoryAs);
                      }}
                      className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm min-w-0"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <label className="block text-xs font-bold uppercase">Story / Review (Assamese)</label>
                      {translatingFieldKey === 'reviewStory' && (
                        <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>✨ Gemini translating to English...</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={testStoryAs}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTestStoryAs(val);
                        triggerAutoTranslate('reviewStory', val, 'as', 'en', setTestStoryEn);
                      }}
                      className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese min-w-0"
                    />
                  </div>

                  <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-[#D8C2A3]">
                    <button
                      type="button"
                      onClick={() => setIsAddingTestimonial(false)}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-[#3A2F28] bg-gray-200 hover:bg-gray-300 cursor-pointer min-h-[40px] text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-[#8C1D18] hover:bg-[#5A0F12] shadow-md cursor-pointer min-h-[40px] text-center"
                    >
                      Save Review
                    </button>
                  </div>
                </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL / OVERLAY FOR HERO SLIDE FORM */}
        <AnimatePresence>
          {isAddingHeroSlide && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-2.5 sm:p-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] overflow-hidden shadow-2xl relative my-auto flex flex-col min-h-0 box-border min-w-0"
              >
                <button
                  type="button"
                  onClick={() => setIsAddingHeroSlide(false)}
                  className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#3A2F28]/10 hover:bg-[#8C1D18] hover:text-white flex items-center justify-center text-[#3A2F28] cursor-pointer z-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="overflow-y-auto flex-1 p-4 sm:p-7 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold font-serif-playfair text-[#242424] mb-4 pr-8">
                    {editingHeroSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                  </h3>

                <form onSubmit={handleSaveHeroSlide} className="space-y-4 min-w-0">
                  {/* Hero Slide Picture URL with ImgBB Direct Upload & Auto-Resolver & Gemini 3.1 Flash */}
                  <div className="min-w-0">
                    <input
                      type="file"
                      ref={heroSlideImgbbFileRef}
                      onChange={handleHeroImgbbUpload}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                        Hero Slide Picture URL / ImgBB Link *
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => heroSlideImgbbFileRef.current?.click()}
                          disabled={isUploadingHeroImgbb}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#8C1D18] border border-[#D8C2A3] text-[11px] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                          title="Upload hero picture directly to ImgBB and generate URL"
                        >
                          {isUploadingHeroImgbb ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C1D18]" />
                          ) : (
                            <CloudUpload className="w-3.5 h-3.5 text-[#8C1D18]" />
                          )}
                          <span>{isUploadingHeroImgbb ? 'Uploading...' : 'Upload Hero Photo (ImgBB)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerGeminiHeroSlideAnalysis()}
                          disabled={isAnalyzingImage || !slideImage}
                          className="px-2.5 py-1.5 rounded-lg bg-[#8C1D18] hover:bg-[#5A0F12] text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                          title="Analyze photo with Gemini 3.1 Flash AI to auto-generate slide headlines"
                        >
                          {isAnalyzingImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4B16A]" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5 text-[#D4B16A]" />
                          )}
                          <span>✨ Auto-Generate Slide Text</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative min-w-0">
                      <textarea
                        rows={2}
                        required
                        value={slideImage}
                        onChange={(e) => handleHeroSlideImageUrlInput(e.target.value, false)}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData('text');
                          handleHeroSlideImageUrlInput(pasted, true);
                        }}
                        placeholder="Paste single link or multiple photo links (one per line) for Gemini AI bulk hero import..."
                        className="w-full pl-8 pr-3.5 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#8C1D18] outline-none min-w-0"
                      />
                      <Link2 className="w-4 h-4 text-[#B68C4A] absolute left-2.5 top-3" />
                    </div>

                    {extractMultipleUrls(slideImage).length > 1 && (
                      <div className="mt-2.5 p-3 bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles className="w-5 h-5 text-[#8C1D18] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#3A2F28] truncate">
                              Detected {extractMultipleUrls(slideImage).length} Hero Photo Links!
                            </p>
                            <p className="text-[11px] text-[#7A6A5C]">
                              Gemini AI will automatically analyze each photo and create individual hero slides with headlines.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBulkHeroImport(slideImage)}
                          disabled={isAnalyzingImage}
                          className="w-full sm:w-auto px-4 py-2.5 bg-[#8C1D18] hover:bg-[#5A0F12] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 min-h-[40px]"
                        >
                          {isAnalyzingImage ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Wand2 className="w-4 h-4 text-[#D4B16A] shrink-0" />}
                          <span>✨ Bulk AI Hero Import All</span>
                        </button>
                      </div>
                    )}

                    {/* AI / ImgBB Status Message */}
                    {aiStatusMessage && (
                      <div className="mt-1.5 text-[11px] font-semibold text-[#8C1D18] flex items-center gap-1 bg-[#F7F2EA] px-2.5 py-1 rounded-lg border border-[#D8C2A3] min-w-0">
                        <Sparkles className="w-3 h-3 text-[#D4B16A] shrink-0" />
                        <span className="truncate">{aiStatusMessage}</span>
                      </div>
                    )}

                    {slideImage && (
                      <div className="mt-2.5 h-32 rounded-xl overflow-hidden border border-[#D8C2A3] relative bg-black/5 w-full">
                        <img
                          src={resolveDirectImageUrl(slideImage)}
                          alt="Slide Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                        <div className="absolute bottom-1.5 right-1.5 bg-black/75 text-[#D4B16A] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 border border-[#D4B16A]/30">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{slideImage.includes('i.ibb.co') ? 'ImgBB Direct Source' : 'Image Linked'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Badge Tag (English) *</label>
                        {translatingFieldKey === 'heroTag' && <Loader2 className="w-3 h-3 animate-spin text-[#8C1D18]" />}
                      </div>
                      <input
                        type="text"
                        required
                        value={slideTagEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSlideTagEn(val);
                          triggerAutoTranslate('heroTag', val, 'en', 'as', setSlideTagAs);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm min-w-0"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Badge Tag (Assamese) *</label>
                        {translatingFieldKey === 'heroTag' && <Loader2 className="w-3 h-3 animate-spin text-[#8C1D18]" />}
                      </div>
                      <input
                        type="text"
                        required
                        value={slideTagAs}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSlideTagAs(val);
                          triggerAutoTranslate('heroTag', val, 'as', 'en', setSlideTagEn);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese min-w-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Headline (English) *</label>
                        {translatingFieldKey === 'heroTitle' && <Loader2 className="w-3 h-3 animate-spin text-[#8C1D18]" />}
                      </div>
                      <input
                        type="text"
                        required
                        value={slideTitleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSlideTitleEn(val);
                          triggerAutoTranslate('heroTitle', val, 'en', 'as', setSlideTitleAs);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-medium min-w-0"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <label className="block text-xs font-bold uppercase">Headline (Assamese) *</label>
                        {translatingFieldKey === 'heroTitle' && <Loader2 className="w-3 h-3 animate-spin text-[#8C1D18]" />}
                      </div>
                      <input
                        type="text"
                        required
                        value={slideTitleAs}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSlideTitleAs(val);
                          triggerAutoTranslate('heroTitle', val, 'as', 'en', setSlideTitleEn);
                        }}
                        className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese font-semibold min-w-0"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase">Subtitle (English) *</label>
                      {translatingFieldKey === 'heroSub' && (
                        <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Translating...</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={slideSubEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSlideSubEn(val);
                        triggerAutoTranslate('heroSub', val, 'en', 'as', setSlideSubAs);
                      }}
                      className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm min-w-0"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase">Subtitle (Assamese) *</label>
                      {translatingFieldKey === 'heroSub' && (
                        <span className="text-[10px] text-[#8C1D18] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Translating...</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={slideSubAs}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSlideSubAs(val);
                        triggerAutoTranslate('heroSub', val, 'as', 'en', setSlideSubEn);
                      }}
                      className="w-full px-3 py-2 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-sm font-assamese min-w-0"
                    />
                  </div>

                  <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-[#D8C2A3]">
                    <button
                      type="button"
                      onClick={() => setIsAddingHeroSlide(false)}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-[#3A2F28] bg-gray-200 hover:bg-gray-300 cursor-pointer min-h-[40px] text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-[#8C1D18] hover:bg-[#5A0F12] shadow-md cursor-pointer min-h-[40px] text-center"
                    >
                      {editingHeroSlide ? 'Update Hero Slide' : 'Create Hero Slide'}
                    </button>
                  </div>
                </form>
                </div>
              </motion.div>
            </div>
          )}

          {/* ================= MODAL: DEDICATED BULK LINK IMPORTER ================= */}
          {isBulkImporterOpen && (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-xs overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#FAF8F5] border-2 border-[#D4B16A] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92dvh] min-h-0 min-w-0"
              >
                {/* Header */}
                <div className="bg-[#1A1A1A] p-3.5 sm:p-4 text-[#FAF8F5] flex items-center justify-between border-b border-[#D4B16A]/30 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#8C1D18] flex items-center justify-center text-[#D4B16A] font-bold shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif-playfair text-sm sm:text-base font-bold text-[#D4B16A] truncate">
                        ✨ Bulk Link Importer & Gemini AI Auto-Namer
                      </h3>
                      <p className="text-[11px] text-gray-300 truncate">
                        Paste 1 or multiple photo links. Gemini AI auto-detects each setup and creates single entries!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBulkImporterOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer shrink-0 ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 min-w-0">
                  {/* Section Target Selection */}
                  <div className="space-y-1.5 min-w-0">
                    <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                      Destination Section (Select Where Photos Will Be Uploaded) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-1.5 bg-[#F7F2EA] rounded-xl border border-[#D8C2A3] min-w-0">
                      <button
                        type="button"
                        onClick={() => setBulkTarget('gallery')}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[40px] ${
                          bulkTarget === 'gallery'
                            ? 'bg-[#8C1D18] text-white shadow-sm ring-2 ring-[#D4B16A]'
                            : 'text-[#3A2F28] hover:bg-[#D8C2A3]/30'
                        }`}
                      >
                        <Image className="w-4 h-4 shrink-0" />
                        <span className="truncate">1. Gallery Decor Setups ONLY</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkTarget('hero')}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[40px] ${
                          bulkTarget === 'hero'
                            ? 'bg-[#8C1D18] text-white shadow-sm ring-2 ring-[#D4B16A]'
                            : 'text-[#3A2F28] hover:bg-[#D8C2A3]/30'
                        }`}
                      >
                        <Layout className="w-4 h-4 shrink-0" />
                        <span className="truncate">2. Hero Slideshow Pictures ONLY</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-semibold text-[#8C1D18] flex items-start gap-1.5 bg-[#FAF8F5] p-2 rounded-lg border border-[#D8C2A3]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Pictures will be uploaded <strong>ONLY</strong> to{' '}
                        <u className="underline underline-offset-2">
                          {bulkTarget === 'gallery' ? 'Gallery Decor Setups' : 'Hero Slideshow Pictures'}
                        </u>
                        . No other section will be modified.
                      </span>
                    </p>
                  </div>

                  {/* Category Picker for Gallery */}
                  {bulkTarget === 'gallery' && (
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#D8C2A3] space-y-1.5 min-w-0">
                      <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                        Target Gallery Section Category *
                      </label>
                      <select
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-xs font-bold text-[#242424] outline-none focus:ring-2 focus:ring-[#8C1D18] min-w-0"
                      >
                        <option value="sitting_area">Sitting Lounge / Bahar Sthan (বহাৰ স্থান)</option>
                        <option value="entrance">Entrance Gates (প্ৰৱেশ দ্বাৰ)</option>
                        <option value="mandap">Sacred Mandap (বিবাহ মণ্ডপ)</option>
                        <option value="stage">Wedding Stage (মঞ্চ)</option>
                        <option value="reception">Reception Banquet (ৰিসেপশ্বন)</option>
                      </select>
                      <p className="text-[11px] font-semibold text-[#8C1D18] flex items-center gap-1">
                        🔒 Guaranteed: All photos uploaded in this batch will be saved STRICTLY into{' '}
                        <u className="font-bold underline decoration-[#8C1D18] underline-offset-2">
                          {bulkCategory === 'sitting_area' ? 'Sitting Lounge' : bulkCategory === 'entrance' ? 'Entrance Gates' : bulkCategory === 'mandap' ? 'Sacred Mandap' : bulkCategory === 'stage' ? 'Wedding Stage' : 'Reception Banquet'}
                        </u>
                        .
                      </p>
                    </div>
                  )}

                  {/* Large Text Area for Pasting Links */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                      <label className="block text-xs font-bold uppercase text-[#3A2F28]">
                        Paste Image Links (One Per Line or Comma Separated) *
                      </label>
                      {extractMultipleUrls(bulkLinksInput).length > 0 && (
                        <span className="text-xs font-bold text-[#8C1D18] bg-[#F7F2EA] px-2.5 py-0.5 rounded-full border border-[#D8C2A3] flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{extractMultipleUrls(bulkLinksInput).length} Valid Links Detected</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={5}
                      value={bulkLinksInput}
                      onChange={(e) => setBulkLinksInput(e.target.value)}
                      placeholder={"Paste your image links here...\n\nExample:\nhttps://ibb.co/6y40F2p\nhttps://ibb.co/7z91G3q\nhttps://images.unsplash.com/photo-1519741497674-611481863552"}
                      className="w-full p-3 bg-[#F7F2EA] border border-[#D8C2A3] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#8C1D18] outline-none shadow-inner min-w-0"
                    />
                    <p className="mt-1 text-[11px] text-[#7A6A5C] flex items-center gap-1">
                      <Wand2 className="w-3.5 h-3.5 text-[#B68C4A] shrink-0" />
                      <span>Supports direct image URLs and ImgBB viewer links (e.g. ibb.co). Gemini 3.1 Flash AI automatically generates names, bilingual translations & descriptions for every single photo!</span>
                    </p>
                  </div>

                  {/* Live Thumbnail Preview Grid */}
                  {extractMultipleUrls(bulkLinksInput).length > 0 && (
                    <div className="min-w-0">
                      <span className="block text-xs font-bold uppercase text-[#3A2F28] mb-1.5">
                        Detected Photo Previews ({extractMultipleUrls(bulkLinksInput).length})
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2 bg-[#F7F2EA] rounded-xl border border-[#D8C2A3] max-h-36 overflow-y-auto min-w-0">
                        {extractMultipleUrls(bulkLinksInput).map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#D8C2A3] bg-black/10 group">
                            <img
                              src={clientExtractDirectUrl(url)}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80';
                              }}
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-[#D4B16A] text-center py-0.5 font-mono truncate px-1">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Status Message */}
                  {aiStatusMessage && (
                    <div className="p-3 bg-[#F7F2EA] border border-[#D4B16A] rounded-xl text-xs font-bold text-[#8C1D18] flex items-center gap-2 min-w-0">
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4B16A] shrink-0" />
                      <span className="truncate">{aiStatusMessage}</span>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="p-3 sm:p-4 bg-[#F7F2EA] border-t border-[#D8C2A3] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setBulkLinksInput('')}
                    disabled={isAnalyzingImage || !bulkLinksInput}
                    className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-30 cursor-pointer text-center"
                  >
                    Clear Box
                  </button>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => setIsBulkImporterOpen(false)}
                      disabled={isAnalyzingImage}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-[#3A2F28] bg-gray-200 hover:bg-gray-300 disabled:opacity-50 cursor-pointer min-h-[40px] text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRunDedicatedBulkImport}
                      disabled={isAnalyzingImage || extractMultipleUrls(bulkLinksInput).length === 0}
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-[#8C1D18] hover:bg-[#5A0F12] shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer min-h-[40px] text-center"
                    >
                      {isAnalyzingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#D4B16A] shrink-0" />
                          <span>Processing AI Auto-Import...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 text-[#D4B16A] shrink-0" />
                          <span className="truncate">✨ Import {extractMultipleUrls(bulkLinksInput).length > 0 ? extractMultipleUrls(bulkLinksInput).length : ''} Photos to {bulkTarget === 'gallery' ? 'Gallery' : 'Hero'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
};
