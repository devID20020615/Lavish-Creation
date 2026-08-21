export interface ImageAnalysisResult {
  titleEn: string;
  titleAs: string;
  category: 'entrance' | 'mandap' | 'stage' | 'sitting_area' | 'reception';
  descriptionEn: string;
  descriptionAs: string;
  elements: string[];
  badgeTagEn: string;
  badgeTagAs: string;
}

// Global mapping table for known short ImgBB viewer keys to direct image source URLs
export const IBB_MAP: Record<string, string> = {
  'ibb.co/yBpsNZxD': 'https://i.ibb.co/4g2NFX0c/Chat-GPT-Image-Jul-31-2026-02-06-43-PM.png',
  'ibb.co/DHnmWPRz': 'https://i.ibb.co/fz7ZFVxq/Chat-GPT-Image-Jul-31-2026-02-52-03-PM.png',
  'ibb.co/FL6kXsjw': 'https://i.ibb.co/Mxnyf83V/Chat-GPT-Image-Jul-31-2026-02-54-20-PM.png',
  'ibb.co/RprXQyPB': 'https://i.ibb.co/7JM3r4VR/Chat-GPT-Image-Jul-31-2026-02-55-50-PM.png',
  'ibb.co/n9NJtsj': 'https://i.ibb.co/PKvH0Zg/Chat-GPT-Image-Jul-31-2026-02-56-44-PM.png',
  'ibb.co/Q3QJZgdq': 'https://i.ibb.co/Vc9Ld1mh/Chat-GPT-Image-Jul-31-2026-02-57-21-PM.png',
  'ibb.co/Xfwf48xw': 'https://i.ibb.co/kVdVy12d/Chat-GPT-Image-Jul-31-2026-02-58-44-PM.png',
  'ibb.co/cch9RQLX': 'https://i.ibb.co/hRFNrVf1/Chat-GPT-Image-Jul-31-2026-02-59-14-PM.png',
  'ibb.co/B5rwGrqn': 'https://i.ibb.co/G4tF9tcH/Chat-GPT-Image-Jul-31-2026-03-03-58-PM.png',
  'ibb.co/JF5zZwrQ': 'https://i.ibb.co/R4zC8kQy/Chat-GPT-Image-Jul-31-2026-03-04-49-PM.png',
  'ibb.co/n847w8V5': 'https://i.ibb.co/BKvyfK7S/Chat-GPT-Image-Jul-31-2026-03-05-27-PM.png',
  'ibb.co/tMBvPH5Q': 'https://i.ibb.co/JRnGFcPm/Chat-GPT-Image-Jul-31-2026-03-06-26-PM.png'
};

/**
 * Normalizes protocol and trims whitespace.
 */
export function normalizeUrlProtocol(url: string): string {
  if (!url) return '';
  let str = url.trim();

  // Strip wrapping quotes or brackets if present
  str = str.replace(/^["'<\(]+|["'>\)]+$/g, '');

  if (str.startsWith('//')) {
    return 'https:' + str;
  }

  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    if (
      str.startsWith('ibb.co') ||
      str.startsWith('i.ibb.co') ||
      str.startsWith('imgbb.com') ||
      str.startsWith('www.ibb.co') ||
      str.startsWith('www.imgbb.com')
    ) {
      return 'https://' + str;
    }
  }
  return str;
}

/**
 * Synchronously extracts direct image URL from HTML embed codes, BBCode, Markdown, or direct links.
 */
export function clientExtractDirectUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // 1. Check known IBB_MAP table first
  for (const [shortKey, directUrl] of Object.entries(IBB_MAP)) {
    if (trimmed.includes(shortKey)) {
      return directUrl;
    }
  }

  // 2. HTML img tag: <img ... src="URL" ...>
  const htmlImgMatch = trimmed.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlImgMatch && htmlImgMatch[1]) {
    return normalizeUrlProtocol(htmlImgMatch[1]);
  }

  // 3. BBCode img tag: [img]URL[/img]
  const bbCodeMatch = trimmed.match(/\[img\](.*?)\[\/img\]/i);
  if (bbCodeMatch && bbCodeMatch[1]) {
    return normalizeUrlProtocol(bbCodeMatch[1].trim());
  }

  // 4. Markdown img: ![alt](URL)
  const mdImgMatch = trimmed.match(/!\[.*?\]\((.*?)\)/);
  if (mdImgMatch && mdImgMatch[1]) {
    return normalizeUrlProtocol(mdImgMatch[1].trim());
  }

  // 5. Direct i.ibb.co or i.ibb.co.com link inside text
  const ibbDirectMatch = trimmed.match(/https?:\/\/i\.ibb\.co(?:\.com)?\/[^\s"'<>\n]+/i);
  if (ibbDirectMatch && ibbDirectMatch[0]) {
    return ibbDirectMatch[0];
  }

  return normalizeUrlProtocol(trimmed);
}

/**
 * Checks if a URL is an ImgBB page viewer link (e.g., ibb.co/XYZ) rather than a direct CDN image (i.ibb.co/XYZ/img.jpg).
 */
export function isIbbViewerPageUrl(url: string): boolean {
  if (!url) return false;
  const normalized = normalizeUrlProtocol(url);

  // Direct CDN links start with i.ibb.co or i.ibb.co.com
  if (normalized.includes('i.ibb.co') || normalized.includes('i.ibb.co.com')) {
    return false;
  }

  // Standard viewer pages match ibb.co/ or imgbb.com/
  return normalized.includes('ibb.co/') || normalized.includes('imgbb.com/');
}

/**
 * Converts ImgBB thumbnail/preview URLs (.md.jpg, .th.jpg) to full high-resolution original images.
 */
export function getHighResImageUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\.(md|th|medium|small|thumb)\.(jpg|jpeg|png|webp|gif|avif)/i, '.$2');
  return cleaned;
}

/**
 * Converts any URL, short link, or embed snippet into a direct image source URL synchronously.
 * Safe for use in component renders.
 */
export function resolveDirectImageUrl(url: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80';

  const extracted = clientExtractDirectUrl(url);

  // Check map
  for (const [shortKey, directUrl] of Object.entries(IBB_MAP)) {
    if (extracted.includes(shortKey)) {
      return getHighResImageUrl(directUrl);
    }
  }

  return getHighResImageUrl(extracted);
}

/**
 * Fast Edge CDN Image Optimizer.
 * Dynamically resizes, compresses, and converts heavy PNGs/JPEGs into ultra-fast WebP images.
 */
export function getOptimizedImageUrl(
  url: string,
  options?: { width?: number; quality?: number }
): string {
  if (!url) return 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80';

  const direct = resolveDirectImageUrl(url);

  // Skip SVGs, base64, blob URLs
  if (!direct || direct.startsWith('data:') || direct.startsWith('blob:') || direct.endsWith('.svg')) {
    return direct;
  }

  // Unsplash native auto-format and sizing
  if (direct.includes('images.unsplash.com')) {
    const width = options?.width || 1000;
    const quality = options?.quality || 80;
    return `${direct.split('?')[0]}?auto=format&fit=crop&w=${width}&q=${quality}`;
  }

  const width = options?.width || 900;
  const quality = options?.quality || 80;

  // Route through Cloudflare-backed wsrv.nl image optimizer
  return `https://wsrv.nl/?url=${encodeURIComponent(direct)}&w=${width}&q=${quality}&output=webp`;
}

/**
 * Real-time ImgBB and Viewer URL Resolver via server backend.
 */
export async function resolveImageUrl(inputUrl: string): Promise<string> {
  const direct = clientExtractDirectUrl(inputUrl);
  if (!direct) return '';

  // Check map first
  for (const [shortKey, directUrl] of Object.entries(IBB_MAP)) {
    if (direct.includes(shortKey)) {
      return directUrl;
    }
  }

  // If already a direct image extension or direct i.ibb.co link
  if (
    direct.match(/\.(jpeg|jpg|gif|png|webp|svg|avif)($|\?)/i) ||
    direct.includes('i.ibb.co') ||
    !isIbbViewerPageUrl(direct)
  ) {
    return direct;
  }

  // Fetch server resolution endpoint
  try {
    const res = await fetch('/api/resolve-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: direct }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.directUrl) {
        return data.directUrl;
      }
    }
  } catch (err) {
    console.error('Error resolving image URL via server:', err);
  }

  return direct;
}

export function getSmartFallbackAnalysis(category?: string): ImageAnalysisResult {
  const cat = (category || 'entrance').toLowerCase();

  if (cat === 'entrance') {
    return {
      titleEn: 'Grand Floral Entrance Gate',
      titleAs: 'আকৰ্ষণীয় পুষ্পশোভিত প্ৰৱেশ দ্বাৰ',
      category: 'entrance',
      descriptionEn: 'A welcoming Assamese heritage entrance gate adorned with marigolds, Jaapi motifs, and traditional brass lamps.',
      descriptionAs: 'নৱ-দম্পতীক আদৰিবলৈ সুন্দৰ ফুল আৰু জাপিৰে সজোৱা সাংস্কৃতিক প্ৰৱেশ দ্বাৰ।',
      elements: ['Arch Flowers', 'Brass Xorai', 'Jaapi Accents', 'Welcome Arch'],
      badgeTagEn: 'Entrance Gate',
      badgeTagAs: 'প্ৰৱেশ দ্বাৰ'
    };
  }

  if (cat === 'sitting_area') {
    return {
      titleEn: 'Royal Sitting Lounge Setup',
      titleAs: 'ৰাজকীয় বহাৰ স্থান সাজসজ্জা',
      category: 'sitting_area',
      descriptionEn: 'Elegantly arranged sitting lounge featuring traditional Gamosa cushions, low seating tables, and ambient lighting.',
      descriptionAs: 'অতিথিসকলৰ বাবে আৰামদায়ক আৰু মনোৰম বহাৰ স্থানৰ সুন্দৰ সাজসজ্জা।',
      elements: ['Gamosa Cushions', 'Low Seating Tables', 'Ambient Lanterns', 'Royal Drapes'],
      badgeTagEn: 'Sitting Lounge',
      badgeTagAs: 'বহাৰ স্থান'
    };
  }

  if (cat === 'stage') {
    return {
      titleEn: 'Grand Wedding Reception Stage',
      titleAs: 'বিলাসী বিবাহ মঞ্চ সাজসজ্জা',
      category: 'stage',
      descriptionEn: 'Photogenic wedding stage featuring opulent floral backdrops, golden royal seating, and chandelier lighting.',
      descriptionAs: 'দৰা-কইনাক শুৱনি কৰা নান্দনিক আৰু বিলাসী বিবাহ মঞ্চৰ সজ্জা।',
      elements: ['Floral Backdrop Wall', 'Golden Royal Sofas', 'Warm Spotlights', 'Stage Canopy'],
      badgeTagEn: 'Wedding Stage',
      badgeTagAs: 'বিবাহ মঞ্চ'
    };
  }

  if (cat === 'reception') {
    return {
      titleEn: 'Royal Banquet Reception Setup',
      titleAs: 'ৰাজকীয় ৰিসেপশ্বন প্ৰেক্ষাগৃহ',
      category: 'reception',
      descriptionEn: 'Grand reception banquet decor with royal dining arrangements and lavish floral table centerpieces.',
      descriptionAs: 'অতিথিসকলৰ আপ্যায়নৰ বাবে সজোৱা মনোৰম আৰু বিলাসী ৰিসেপশ্বন প্ৰেক্ষাগৃহ।',
      elements: ['Floral Centerpieces', 'Banquet Drapes', 'Mood Lighting', 'Dining Layout'],
      badgeTagEn: 'Reception Banquet',
      badgeTagAs: 'ৰিসেপশ্বন'
    };
  }

  // Default / Mandap
  return {
    titleEn: 'Sacred Assamese Wedding Mandap',
    titleAs: 'পৱিত্ৰ অসমীয়া বিবাহ মণ্ডপ',
    category: 'mandap',
    descriptionEn: 'Traditional sacred wedding mandap decorated with fresh flowers, banana stems, and auspicious brass lamps.',
    descriptionAs: 'পৰম্পৰাগত বৈদিক নিয়ম আৰু মনোৰম পুষ্পশোভিত বিবাহ মণ্ডপ।',
    elements: ['Fresh Garland Arch', 'Sacred Fire Bedi', 'Banana Stems', 'Brass Chandelier'],
    badgeTagEn: 'Sacred Mandap',
    badgeTagAs: 'বিবাহ মণ্ডপ'
  };
}

/**
 * Hidden Gemini 3.1 Flash AI Model Image Analyzer.
 * Takes an image URL and optional category section, analyzes the visual contents, and generates simple, section-specific titles & tags.
 */
export async function analyzeImageWithGemini(imageUrl: string, category?: string): Promise<ImageAnalysisResult> {
  try {
    const res = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, category }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && data.analysis) {
        return data.analysis as ImageAnalysisResult;
      }
    }
  } catch (err) {
    console.warn('Gemini image analysis warning (using smart fallback):', err);
  }
  return getSmartFallbackAnalysis(category);
}

/**
 * Gemini Real-time Bidirectional Translation Helper.
 * Translates text between English and Assamese automatically.
 */
export async function translateText(text: string, from: 'en' | 'as', to: 'as' | 'en'): Promise<string> {
  if (!text || !text.trim()) return '';
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && typeof data.translatedText === 'string') {
        return data.translatedText;
      }
    }
  } catch (err) {
    console.error('Translation error:', err);
  }
  return '';
}
