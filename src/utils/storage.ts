import { GalleryItem, MenuCategory } from '../types';
import { GALLERY_ITEMS } from '../data/mockData';
import { DEFAULT_BANQUET_MENU } from '../data/banquetMenuData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface TestimonialItem {
  id: string;
  nameAs: string;
  nameEn: string;
  locationAs: string;
  locationEn: string;
  storyAs: string;
  storyEn: string;
  eventAs: string;
  eventEn: string;
}

export interface HeroSlideItem {
  id: string;
  image: string;
  tagAs: string;
  tagEn: string;
  titleAs: string;
  titleEn: string;
  subAs: string;
  subEn: string;
  enabled?: boolean;
}

export interface HeroConfigSettings {
  bannerTextAs: string;
  bannerTextEn: string;
  locationsText: string;
  locationsTextAs?: string;
  ratingBadgeText: string;
  ratingBadgeTextAs?: string;
  showBanner?: boolean;
  showLocations?: boolean;
  showRatingBadge?: boolean;
}

export interface AdminContactSettings {
  adminWhatsApp: string;
  phoneDisplay: string;
  email: string;
  guwahatiAddress: string;
  goalparaAddress: string;
  logoUrl?: string;
  imgbbApiKey?: string;
}

export interface VideoItem {
  id: string;
  url: string;
  title?: string;
  enabled?: boolean;
}

const STORAGE_KEYS = {
  GALLERY: 'bb_cms_gallery_items_v1',
  TESTIMONIALS: 'bb_cms_testimonials_v1',
  SETTINGS: 'bb_cms_settings_v1',
  HERO_SLIDES: 'bb_cms_hero_slides_v1',
  HERO_CONFIG: 'bb_cms_hero_config_v1',
  VIDEOS: 'bb_cms_videos_v1',
  BANQUET_MENU: 'bb_cms_banquet_menu_v2',
  AUTH: 'bb_cms_auth_session_v1',
  REMEMBER_ADMIN: 'bb_cms_remember_admin_v1',
  REMEMBER_ID: 'bb_cms_remember_id_v1',
};

const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'hero-1',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=70',
    tagAs: 'অসমীয়া পৰম্পৰা, আধুনিক সৌন্দৰ্য',
    tagEn: 'Assamese Heritage, Modern Luxury',
    titleAs: 'সপোনৰ অনুষ্ঠান, নিখুঁত সজ্জা',
    titleEn: 'Crafting Timeless Assamese Wedding Memories',
    subAs: 'প্ৰতিটো বিয়াৰ মঞ্চত জাপি, শৰাই আৰু বগা ফুলৰ ৰাজকীয় প্ৰেক্ষাপট।',
    subEn: 'Handcrafted Jaapi, polished brass Xorai, and cascading orchids for your sacred day.',
    enabled: true
  },
  {
    id: 'hero-2',
    image: 'https://images.unsplash.com/photo-1545232979-fbf5963d13a2?auto=format&fit=crop&w=1200&q=70',
    tagAs: 'আপোনাৰ আনন্দ, আমাৰ সৃষ্টিশীলতা',
    tagEn: 'Your Joy, Our Sacred Craftsmanship',
    titleAs: 'প্ৰতিটো মুহূৰ্তক কৰি তোলোঁ বিশেষ',
    titleEn: 'Where Tradition Meets Editorial Perfection',
    subAs: 'প্ৰাকৃতিক বাঁহৰ সজ্জা, বন্তিৰ কোমল পোহৰ আৰু সুগন্ধি তগৰ ফুল।',
    subEn: 'Architectural bamboo, glowing brass diyas, and fragrant jasmine garlands.',
    enabled: true
  },
  {
    id: 'hero-3',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=70',
    tagAs: 'অসমীয়া পৰম্পৰাগত বিয়া',
    tagEn: 'Authentic Assamese Biya Curation',
    titleAs: 'আপোনাৰ অনুষ্ঠান, আমাৰ দায়িত্ব',
    titleEn: 'Your Sacred Wedding, Our Utmost Privilege',
    subAs: 'গুৱাহাটীৰ পৰা দিল্লী-এনচিআৰলৈ বিলাসী বিয়াৰ পূৰ্ণাঙ্গ সজ্জা সেৱা।',
    subEn: 'Bespoke Assamese wedding decoration services from Guwahati to PAN-India.',
    enabled: true
  }
];

const DEFAULT_HERO_CONFIG: HeroConfigSettings = {
  bannerTextAs: 'আপোনাৰ অনুষ্ঠান, আমাৰ দায়িত্ব',
  bannerTextEn: 'Your Event, Our Sacred Privilege',
  locationsText: 'Services Provided All Over Assam',
  locationsTextAs: 'সমগ্ৰ অসমজুৰি সেৱা আগবঢ়োৱা হয়',
  ratingBadgeText: 'Weddings & Events Curated',
  ratingBadgeTextAs: 'বিবাহ আৰু অনুষ্ঠান সম্পূৰ্ণ',
  showBanner: true,
  showLocations: true,
  showRatingBadge: true,
};

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    nameAs: 'ড° বৰুৱা আৰু পৰিয়াল',
    nameEn: 'Dr. Barooah Family',
    locationAs: 'গুৱাহাটী (খ্ৰীষ্টানবস্তি)',
    locationEn: 'Guwahati, Assam',
    storyAs: 'বি বি ডেকোৰেচন দলে আমাৰ জীয়ৰীৰ বিয়াখনত যিদৰে সৰ্থেবাৰীৰ শৰাই আৰু জাপিৰ সংমিশ্ৰণত সজ্জা কৰিলে, উপস্থিত সকলো অতিথি বিমুগ্ধ হ’ল। প্ৰতিটো দিশতেই আছিল নিৰ্ভাঁজ অসমীয়া স্পৰ্শ।',
    storyEn: 'BB Decoration (By Lavish Creation) transformed our daughter’s wedding stage with monumental bell-metal Xorai and hand-woven Jaapis. The attention to authentic Assamese heritage was praised by all our guests.',
    eventAs: 'ৰাজকীয় বিয়া আৰু প্ৰীতি ভোজ',
    eventEn: 'Royal Biya & Reception'
  },
  {
    id: 'test-2',
    nameAs: 'শইকীয়া ডাঙৰীয়া',
    nameEn: 'Mr. Saikia & Family',
    locationAs: 'যোৰহাট',
    locationEn: 'Jorhat, Assam',
    storyAs: 'নলবাৰীৰ জাপি আৰু বগা তগৰ ফুলৰে নিৰ্মিত বাঁহৰ মণ্ডপটো সঁচাকৈয়ে অপূৰ্ব আছিল। কোনো ধৰণৰ কৃত্রিমতা নোহোৱাকৈ ৰাজকীয় আৰু পবিত্ৰ অনুভৱ হ’ল।',
    storyEn: 'The bamboo pavilion woven with Nalbari Jaapis and fresh white tagar flowers was divine. Pure Assamese elegance without loud artificial glitter.',
    eventAs: 'পবিত্ৰ বিয়া মণ্ডপ',
    eventEn: 'Sacred Mandap Setup'
  },
  {
    id: 'test-3',
    nameAs: 'হাজৰিকা পৰিয়াল',
    nameEn: 'Hazarika Family',
    locationAs: 'দিল্লী-এনচিআৰ (গুৰুগ্ৰাম)',
    locationEn: 'Delhi NCR',
    storyAs: 'দিল্লীত থাকিও অসমৰ মাটিৰ গোন্ধ আৰু পৰম্পৰাক আমাৰ বিয়াত জীৱন্ত কৰি তোলাৰ বাবে বি বি ডেকোৰেচন টিমক অশেষ ধন্যবাদ। গামোচাৰ ট্ৰিম আৰু বন্তিৰ পোহৰ অদ্বিতীয় আছিল।',
    storyEn: 'Even in Delhi NCR, BB Decoration (By Lavish Creation) brought the warmth of Assamese soil and heritage to our venue. The Gamosa borders and brass diya pathways were unforgettable.',
    eventAs: 'আসামি হেৰিটেজ বিয়া',
    eventEn: 'Heritage Biya Curation'
  }
];

const DEFAULT_SETTINGS: AdminContactSettings = {
  adminWhatsApp: '916002483363',
  phoneDisplay: '+91 60024 83363',
  email: 'xyzabcpqr@gmail.com',
  guwahatiAddress: 'Swaraj Nagar, Hengrabari, Guwahati, Assam',
  goalparaAddress: 'Matia, Goalpara, Assam',
  logoUrl: 'https://i.ibb.co/ds07wJms/Chat-GPT-Image-Jul-28-2026-10-32-13-PM.png',
  imgbbApiKey: '',
};

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'video-1',
    url: 'https://ik.imagekit.io/1ca0lhuyg/BB%20Decoration/Todays%20venue.mp4?updatedAt=1785835959389',
    title: "Today's Venue Showcase",
    enabled: true
  }
];

// Event emitter to notify react state hooks when local storage updates
const LISTENERS = new Set<() => void>();
let syncChannel: BroadcastChannel | null = null;
let isLoadingCMS = true;
const LOADING_LISTENERS = new Set<(loading: boolean) => void>();

export function subscribeCMSLoading(callback: (loading: boolean) => void) {
  LOADING_LISTENERS.add(callback);
  callback(isLoadingCMS);
  return () => {
    LOADING_LISTENERS.delete(callback);
  };
}

export function setCMSLoadingState(loading: boolean) {
  isLoadingCMS = loading;
  LOADING_LISTENERS.forEach((cb) => cb(loading));
}

export function isCMSLoading(): boolean {
  return isLoadingCMS;
}

if (typeof window !== 'undefined') {
  try {
    syncChannel = new BroadcastChannel('bb_cms_sync_channel');
    syncChannel.onmessage = () => {
      notifyStorageChange();
    };
  } catch (e) {
    console.warn('BroadcastChannel not supported:', e);
  }

  window.addEventListener('storage', () => {
    notifyStorageChange();
  });

  // Fetch server backup on load to ensure latest state (including deletes)
  setCMSLoadingState(true);
  fetch('/api/cms/all')
    .then(res => res.json())
    .then(data => {
      if (data && data.status === 'ok' && data.data) {
        const { gallery, testimonials, settings, heroSlides, heroConfig, videos, banquetMenu } = data.data;
        if (gallery) localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
        if (testimonials) localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
        if (settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        if (heroSlides) localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(heroSlides));
        if (heroConfig) localStorage.setItem(STORAGE_KEYS.HERO_CONFIG, JSON.stringify(heroConfig));
        if (videos) localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
        if (banquetMenu) localStorage.setItem(STORAGE_KEYS.BANQUET_MENU, JSON.stringify(banquetMenu));
        notifyStorageChange();
      }
    })
    .catch(() => {})
    .finally(() => {
      setTimeout(() => {
        setCMSLoadingState(false);
      }, 400);
    });
}

export function subscribeStorage(callback: () => void) {
  LISTENERS.add(callback);
  return () => {
    LISTENERS.delete(callback);
  };
}

function notifyStorageChange() {
  LISTENERS.forEach((cb) => cb());
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type: 'CMS_UPDATED', time: Date.now() });
    } catch {
      // ignore
    }
  }
}

// Push all current storage state to Firestore Cloud Database and Express server backup
let isWritingToFirestore = false;

async function pushAllToBackend() {
  setCMSLoadingState(true);
  const payload = {
    gallery: getStoredGalleryItems(),
    testimonials: getStoredTestimonials(),
    settings: getStoredSettings(),
    heroSlides: getStoredHeroSlides(),
    heroConfig: getStoredHeroConfig(),
    videos: getStoredVideos(),
    banquetMenu: getStoredBanquetMenu(),
    updatedAt: Date.now()
  };

  // 1. Push to server endpoint as local filesystem backup
  try {
    fetch('/api/cms/all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (err) {
    // ignore server fetch errors
  }

  // 2. Push to Firebase Cloud Firestore for real-time publishing across all devices/clients
  try {
    isWritingToFirestore = true;
    const docRef = doc(db, 'cms_content', 'main');
    await setDoc(docRef, payload);
  } catch (err) {
    console.error('Error syncing to Firestore:', err);
    try {
      handleFirestoreError(err, OperationType.WRITE, 'cms_content/main');
    } catch {
      // prevent unhandled rejections
    }
  } finally {
    setTimeout(() => {
      isWritingToFirestore = false;
      setCMSLoadingState(false);
    }, 500);
  }
}

// Connect Real-Time Firebase Firestore listener
if (typeof window !== 'undefined') {
  try {
    const docRef = doc(db, 'cms_content', 'main');
    onSnapshot(
      docRef,
      (snapshot) => {
        if (isWritingToFirestore) return;

        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data) {
            const { gallery, testimonials, settings, heroSlides, heroConfig, videos, banquetMenu } = data;
            let updated = false;

            if (gallery && JSON.stringify(gallery) !== localStorage.getItem(STORAGE_KEYS.GALLERY)) {
              localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
              updated = true;
            }
            if (testimonials && JSON.stringify(testimonials) !== localStorage.getItem(STORAGE_KEYS.TESTIMONIALS)) {
              localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
              updated = true;
            }
            if (settings) {
              const current = getStoredSettings();
              const merged = {
                ...DEFAULT_SETTINGS,
                ...current,
                ...settings,
                logoUrl: settings.logoUrl || current.logoUrl || DEFAULT_SETTINGS.logoUrl,
                imgbbApiKey: settings.imgbbApiKey !== undefined ? settings.imgbbApiKey : (current.imgbbApiKey || ''),
              };
              if (JSON.stringify(merged) !== localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
                updated = true;
              }
            }
            if (heroSlides && JSON.stringify(heroSlides) !== localStorage.getItem(STORAGE_KEYS.HERO_SLIDES)) {
              localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(heroSlides));
              updated = true;
            }
            if (heroConfig && JSON.stringify(heroConfig) !== localStorage.getItem(STORAGE_KEYS.HERO_CONFIG)) {
              localStorage.setItem(STORAGE_KEYS.HERO_CONFIG, JSON.stringify(heroConfig));
              updated = true;
            }
            if (videos && JSON.stringify(videos) !== localStorage.getItem(STORAGE_KEYS.VIDEOS)) {
              localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
              updated = true;
            }
            if (banquetMenu && JSON.stringify(banquetMenu) !== localStorage.getItem(STORAGE_KEYS.BANQUET_MENU)) {
              localStorage.setItem(STORAGE_KEYS.BANQUET_MENU, JSON.stringify(banquetMenu));
              updated = true;
            }

            if (updated) {
              notifyStorageChange();
            }
          }
        } else {
          // If document doesn't exist in Firestore yet, initialize it
          pushAllToBackend();
        }
      },
      (err) => {
        console.warn('Firestore real-time subscription warning:', err);
        try {
          handleFirestoreError(err, OperationType.GET, 'cms_content/main');
        } catch {
          // fallback
        }
      }
    );
  } catch (e) {
    console.warn('Firestore initialization warning:', e);
  }
}

// ================= GALLERY CMS CRUD =================
export function getStoredGalleryItems(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(GALLERY_ITEMS));
      return GALLERY_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading gallery items:', err);
    return GALLERY_ITEMS;
  }
}

export function saveGalleryItems(items: GalleryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
    notifyStorageChange();
    pushAllToBackend();
  } catch (err) {
    console.error('Error saving gallery items:', err);
  }
}

export function addGalleryItem(item: Omit<GalleryItem, 'id'>) {
  const current = getStoredGalleryItems();
  const newItem: GalleryItem = {
    ...item,
    id: `custom-${Date.now()}`,
  };
  const updated = [newItem, ...current];
  saveGalleryItems(updated);
  return newItem;
}

export function updateGalleryItem(updatedItem: GalleryItem) {
  const current = getStoredGalleryItems();
  const updated = current.map((i) => (i.id === updatedItem.id ? updatedItem : i));
  saveGalleryItems(updated);
}

export function deleteGalleryItem(id: string) {
  const current = getStoredGalleryItems();
  const updated = current.filter((i) => i.id !== id);
  saveGalleryItems(updated);
}

export function toggleGalleryItemEnabled(id: string) {
  const current = getStoredGalleryItems();
  const updated = current.map((i) => (i.id === id ? { ...i, enabled: i.enabled === false ? true : false } : i));
  saveGalleryItems(updated);
}

// ================= TESTIMONIALS CMS CRUD =================
export function getStoredTestimonials(): TestimonialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(DEFAULT_TESTIMONIALS));
      return DEFAULT_TESTIMONIALS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading testimonials:', err);
    return DEFAULT_TESTIMONIALS;
  }
}

export function saveTestimonials(items: TestimonialItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(items));
    notifyStorageChange();
    pushAllToBackend();
  } catch (err) {
    console.error('Error saving testimonials:', err);
  }
}

export function addTestimonial(item: Omit<TestimonialItem, 'id'>) {
  const current = getStoredTestimonials();
  const newItem: TestimonialItem = {
    ...item,
    id: `test-${Date.now()}`,
  };
  const updated = [newItem, ...current];
  saveTestimonials(updated);
  return newItem;
}

export function updateTestimonial(updatedItem: TestimonialItem) {
  const current = getStoredTestimonials();
  const updated = current.map((t) => (t.id === updatedItem.id ? updatedItem : t));
  saveTestimonials(updated);
}

export function deleteTestimonial(id: string) {
  const current = getStoredTestimonials();
  const updated = current.filter((t) => t.id !== id);
  saveTestimonials(updated);
}

// ================= SETTINGS CMS CRUD =================
export function getStoredSettings(): AdminContactSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      logoUrl: parsed.logoUrl || DEFAULT_SETTINGS.logoUrl,
      imgbbApiKey: parsed.imgbbApiKey || '',
    };
  } catch (err) {
    console.error('Error loading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AdminContactSettings) {
  try {
    const cleanSettings: AdminContactSettings = {
      ...DEFAULT_SETTINGS,
      ...settings,
      logoUrl: settings.logoUrl || DEFAULT_SETTINGS.logoUrl,
      imgbbApiKey: (settings.imgbbApiKey || '').trim(),
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cleanSettings));
    notifyStorageChange();
    pushAllToBackend();
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

/**
 * Direct ImgBB Cloud Uploader Helper
 * Uploads an image file or base64 data to ImgBB and returns the direct CDN URL (https://i.ibb.co/...).
 */
export async function uploadImageToImgbb(
  imageDataOrBase64: string,
  customApiKey?: string,
  imageName?: string
): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    const settings = getStoredSettings();
    const apiKey = (customApiKey || settings.imgbbApiKey || '').trim();

    // 1. Try server proxy endpoint first
    try {
      const serverRes = await fetch('/api/upload-imgbb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataOrBase64,
          apiKey,
          name: imageName,
        }),
      });

      const json = await serverRes.json().catch(() => null);
      if (serverRes.ok && json?.success && json?.url) {
        return { success: true, url: json.url };
      } else if (json?.error && !apiKey) {
        return { success: false, url: '', error: json.error };
      }
    } catch {
      // Fall through to direct client fetch if server not reachable
    }

    // 2. Direct client-side upload to ImgBB API
    if (apiKey) {
      let cleanImage = imageDataOrBase64;
      if (cleanImage.startsWith('data:')) {
        const parts = cleanImage.split(',');
        if (parts.length > 1) {
          cleanImage = parts[1];
        }
      }

      const formData = new URLSearchParams();
      formData.append('image', cleanImage);
      if (imageName) formData.append('name', imageName);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        const direct = resData.data.url || resData.data.display_url;
        return { success: true, url: direct };
      } else {
        return {
          success: false,
          url: '',
          error: resData?.error?.message || 'ImgBB upload rejected the image or API key is invalid.',
        };
      }
    }

    return {
      success: false,
      url: '',
      error: 'Please enter your ImgBB API key in the Brand Logo & Settings tab.',
    };
  } catch (err: any) {
    return {
      success: false,
      url: '',
      error: err?.message || 'Network error connecting to ImgBB API.',
    };
  }
}

// ================= HERO SLIDES & CONFIG CMS CRUD =================
export function getStoredHeroSlides(): HeroSlideItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HERO_SLIDES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(DEFAULT_HERO_SLIDES));
      return DEFAULT_HERO_SLIDES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading hero slides:', err);
    return DEFAULT_HERO_SLIDES;
  }
}

export function saveHeroSlides(slides: HeroSlideItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
    notifyStorageChange();
    pushAllToBackend();
  } catch (err) {
    console.error('Error saving hero slides:', err);
  }
}

export function addHeroSlide(slide: Omit<HeroSlideItem, 'id'>) {
  const current = getStoredHeroSlides();
  const newSlide: HeroSlideItem = {
    ...slide,
    id: `hero-${Date.now()}`,
  };
  const updated = [...current, newSlide];
  saveHeroSlides(updated);
  return newSlide;
}

export function updateHeroSlide(updatedSlide: HeroSlideItem) {
  const current = getStoredHeroSlides();
  const updated = current.map((s) => (s.id === updatedSlide.id ? updatedSlide : s));
  saveHeroSlides(updated);
}

export function deleteHeroSlide(id: string) {
  const current = getStoredHeroSlides();
  const updated = current.filter((s) => s.id !== id);
  saveHeroSlides(updated);
}

export function toggleHeroSlideEnabled(id: string) {
  const current = getStoredHeroSlides();
  const updated = current.map((s) => (s.id === id ? { ...s, enabled: s.enabled === false ? true : false } : s));
  saveHeroSlides(updated);
}

export function getStoredHeroConfig(): HeroConfigSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HERO_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HERO_CONFIG, JSON.stringify(DEFAULT_HERO_CONFIG));
      return DEFAULT_HERO_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (parsed.locationsText?.includes('Guwahati • Jorhat') || !parsed.locationsText) {
      parsed.locationsText = DEFAULT_HERO_CONFIG.locationsText;
      parsed.locationsTextAs = DEFAULT_HERO_CONFIG.locationsTextAs;
    }
    if (parsed.ratingBadgeText?.includes('500+') || parsed.ratingBadgeText?.includes('Luxury') || parsed.ratingBadgeText?.includes('Assamese Weddings')) {
      parsed.ratingBadgeText = DEFAULT_HERO_CONFIG.ratingBadgeText;
      parsed.ratingBadgeTextAs = DEFAULT_HERO_CONFIG.ratingBadgeTextAs;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading hero config:', err);
    return DEFAULT_HERO_CONFIG;
  }
}

export function saveHeroConfig(config: HeroConfigSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.HERO_CONFIG, JSON.stringify(config));
    notifyStorageChange();
    pushAllToBackend();
  } catch (err) {
    console.error('Error saving hero config:', err);
  }
}

// ================= VENUE VIDEOS CMS CRUD =================
export function getStoredVideos(): VideoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(DEFAULT_VIDEOS));
      return DEFAULT_VIDEOS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading videos:', err);
    return DEFAULT_VIDEOS;
  }
}

export function saveVideos(items: VideoItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(items));
    notifyStorageChange();
    pushAllToBackend();
  } catch (err) {
    console.error('Error saving videos:', err);
  }
}

export function addVideoItem(url: string, title?: string) {
  const current = getStoredVideos();
  const newItem: VideoItem = {
    id: `video-${Date.now()}`,
    url: url.trim(),
    title: title?.trim() || 'Venue Showcase Video',
    enabled: true,
  };
  const updated = [newItem, ...current];
  saveVideos(updated);
  return newItem;
}

export function updateVideoItem(updatedVideo: VideoItem) {
  const current = getStoredVideos();
  const updated = current.map((v) => (v.id === updatedVideo.id ? updatedVideo : v));
  saveVideos(updated);
}

export function deleteVideoItem(id: string) {
  const current = getStoredVideos();
  const updated = current.filter((v) => v.id !== id);
  saveVideos(updated);
}

export function toggleVideoItemEnabled(id: string) {
  const current = getStoredVideos();
  const updated = current.map((v) => (v.id === id ? { ...v, enabled: v.enabled === false ? true : false } : v));
  saveVideos(updated);
}

// ================= BANQUET MENU CMS CRUD =================
export function getStoredBanquetMenu(): MenuCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BANQUET_MENU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BANQUET_MENU, JSON.stringify(DEFAULT_BANQUET_MENU));
      return DEFAULT_BANQUET_MENU;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading banquet menu:', err);
    return DEFAULT_BANQUET_MENU;
  }
}

export function saveBanquetMenu(categories: MenuCategory[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BANQUET_MENU, JSON.stringify(categories));
    notifyStorageChange();
    pushAllToBackend();
  } catch (err) {
    console.error('Error saving banquet menu:', err);
  }
}

// Reset all storage to original initial defaults
export function resetStorageToDefault() {
  localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(GALLERY_ITEMS));
  localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(DEFAULT_TESTIMONIALS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(DEFAULT_HERO_SLIDES));
  localStorage.setItem(STORAGE_KEYS.HERO_CONFIG, JSON.stringify(DEFAULT_HERO_CONFIG));
  localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(DEFAULT_VIDEOS));
  localStorage.setItem(STORAGE_KEYS.BANQUET_MENU, JSON.stringify(DEFAULT_BANQUET_MENU));
  notifyStorageChange();
  fetch('/api/cms/reset', { method: 'POST' }).then(() => pushAllToBackend()).catch(() => {});
}

// ================= AUTH SESSION =================
export function isCMSAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
}

export function setCMSAuthenticated(val: boolean) {
  if (val) {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
  notifyStorageChange();
}

export function isRememberAdminEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEYS.REMEMBER_ADMIN) !== 'false';
}

export function getRememberedAdminId(): string {
  return localStorage.getItem(STORAGE_KEYS.REMEMBER_ID) || '';
}

export function saveRememberMeConfig(remember: boolean, adminId: string) {
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ADMIN, 'true');
    if (adminId) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ID, adminId);
    }
  } else {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ADMIN, 'false');
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ID);
  }
}
