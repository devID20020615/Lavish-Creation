import express from 'express';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const CMS_FILE = path.join(DATA_DIR, 'cms_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const IBB_MAP_SERVER: Record<string, string> = {
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
 * Converts ImgBB thumbnail/preview URLs (.md.jpg, .th.jpg) to full high-resolution original images.
 */
function getHighResImageUrlServer(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\.(md|th|medium|small|thumb)\.(jpg|jpeg|png|webp|gif|avif)/i, '.$2');
  return cleaned;
}

/**
 * Automated ImgBB Viewer URL Resolver
 * Resolves ImgBB viewer pages (e.g., https://ibb.co/xyz) to direct image source files (https://i.ibb.co/xyz/image.jpg).
 */
async function resolveImgbbUrl(inputUrl: string): Promise<string> {
  if (!inputUrl) return '';
  let url = inputUrl.trim();

  // Strip wrapping quotes or brackets if present
  url = url.replace(/^["'<\(]+|["'>\)]+$/g, '');

  // Check known map first
  for (const [shortKey, directUrl] of Object.entries(IBB_MAP_SERVER)) {
    if (url.includes(shortKey)) return getHighResImageUrlServer(directUrl);
  }

  // Prepend protocol if missing
  if (url.startsWith('//')) {
    url = 'https:' + url;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (
      url.startsWith('ibb.co') ||
      url.startsWith('i.ibb.co') ||
      url.startsWith('imgbb.com') ||
      url.startsWith('www.ibb.co') ||
      url.startsWith('www.imgbb.com')
    ) {
      url = 'https://' + url;
    }
  }

  // Extract from HTML img tag, BBCode, or Markdown if present
  const htmlMatch = url.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch && htmlMatch[1]) url = htmlMatch[1];

  const bbMatch = url.match(/\[img\](.*?)\[\/img\]/i);
  if (bbMatch && bbMatch[1]) url = bbMatch[1].trim();

  const mdMatch = url.match(/!\[.*?\]\((.*?)\)/);
  if (mdMatch && mdMatch[1]) url = mdMatch[1].trim();

  // Direct CDN host check
  if (url.includes('i.ibb.co') || url.includes('i.ibb.co.com')) return getHighResImageUrlServer(url);
  if (url.match(/\.(jpeg|jpg|gif|png|webp|svg|avif)($|\?)/i)) return getHighResImageUrlServer(url);

  // Check if it's an ImgBB page URL
  if (url.includes('ibb.co/') || url.includes('imgbb.com/')) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        const html = await response.text();

        // 1. Meta og:image or twitter:image or link image_src (flexible attribute order)
        const metaMatch =
          html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i) ||
          html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i) ||
          html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']image_src=["']/i);
        if (metaMatch && metaMatch[1]) return getHighResImageUrlServer(metaMatch[1]);

        // 2. Direct input element with embed-code-option-direct or viewer image
        const inputMatch =
          html.match(/id=["']embed-code-option-direct["'][^>]+value=["']([^"']+)["']/i) ||
          html.match(/value=["']([^"']+)["'][^>]+id=["']embed-code-option-direct["']/i);
        if (inputMatch && inputMatch[1]) return getHighResImageUrlServer(inputMatch[1]);

        // 3. Regex for i.ibb.co direct image links in page HTML
        const ibbDirectMatch = html.match(/https?:\/\/i\.ibb\.co(?:\.com)?\/[^\s"'<>\n\\]+\.(?:jpg|jpeg|png|webp|gif)/i);
        if (ibbDirectMatch && ibbDirectMatch[0]) return getHighResImageUrlServer(ibbDirectMatch[0].replace(/\\/g, ''));
      }
    } catch (err) {
      console.log('ImgBB page fetch fallback triggered:', (err as any)?.message || err);
    }

    // 4. Fallback: Use Gemini AI to resolve the direct image URL if fetch failed or returned non-200
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const aiRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `Given this ImgBB viewer or image URL: "${url}", provide its direct CDN image URL (starting with https://i.ibb.co/). Return ONLY the direct image URL as plain text without any markdown or extra text.`,
        });
        const resolvedText = aiRes.text?.trim().replace(/^["']|["']$/g, '');
        if (resolvedText && (resolvedText.startsWith('http://') || resolvedText.startsWith('https://'))) {
          return getHighResImageUrlServer(resolvedText);
        }
      }
    } catch (aiErr) {
      console.error('Gemini AI URL resolution fallback error:', aiErr);
    }
  }

  // If still an unresolved ibb.co viewer page, return a fallback luxury decor image URL
  if (url.includes('ibb.co/') || url.includes('imgbb.com/')) {
    return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
  }

  return getHighResImageUrlServer(url);
}

// API Routes
app.get('/api/cms/all', (_req, res) => {
  try {
    if (fs.existsSync(CMS_FILE)) {
      const raw = fs.readFileSync(CMS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return res.json({ status: 'ok', data });
    }
    return res.json({ status: 'empty', data: null });
  } catch (err) {
    console.error('Error reading CMS file:', err);
    return res.status(500).json({ error: 'Failed to read CMS data' });
  }
});

app.post('/api/cms/all', (req, res) => {
  try {
    const payload = req.body;
    fs.writeFileSync(CMS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return res.json({ status: 'ok', updated: Date.now() });
  } catch (err) {
    console.error('Error saving CMS file:', err);
    return res.status(500).json({ error: 'Failed to save CMS data' });
  }
});

app.post('/api/cms/reset', (_req, res) => {
  try {
    if (fs.existsSync(CMS_FILE)) {
      fs.unlinkSync(CMS_FILE);
    }
    return res.json({ status: 'ok', reset: true });
  } catch (err) {
    console.error('Error resetting CMS file:', err);
    return res.status(500).json({ error: 'Failed to reset CMS data' });
  }
});

// Real-time ImgBB URL Resolver Endpoint
app.post('/api/resolve-image', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }
    const directUrl = await resolveImgbbUrl(url);
    return res.json({ status: 'ok', originalUrl: url, directUrl });
  } catch (err: any) {
    console.error('Error resolving image URL:', err);
    return res.status(500).json({ error: 'Failed to resolve image URL' });
  }
});

// Gemini 3.1 Flash Automated Image Naming Endpoint
app.post('/api/analyze-image', async (req, res) => {
  let catKey = 'entrance';
  try {
    const { imageUrl, category } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'Missing imageUrl parameter' });
    }

    catKey = (typeof category === 'string' && category.trim() ? category.trim().toLowerCase() : 'entrance');

    // Section title mapping
    const catMap: Record<string, { nameEn: string; nameAs: string }> = {
      entrance: { nameEn: 'Entrance Gate / Entrance Section (প্ৰৱেশ দ্বাৰ)', nameAs: 'প্ৰৱেশ দ্বাৰ' },
      sitting_area: { nameEn: 'Sitting Lounge / Guest Seating Area (বহাৰ স্থান)', nameAs: 'বহাৰ স্থান' },
      mandap: { nameEn: 'Sacred Mandap / Wedding Rituals Mandap (বিবাহ মণ্ডপ)', nameAs: 'বিবাহ মণ্ডপ' },
      stage: { nameEn: 'Wedding Reception Stage / Main Stage (বিবাহ মঞ্চ)', nameAs: 'বিবাহ মঞ্চ' },
      reception: { nameEn: 'Reception Banquet / Party Hall (ৰিসেপশ্বন)', nameAs: 'ৰিসেপশ্বন' },
    };

    const targetCatInfo = catMap[catKey] || catMap['entrance'];

    // 1. Resolve ImgBB or viewer URL first
    const directUrl = await resolveImgbbUrl(imageUrl);

    // 2. Fetch image content safely with a timeout
    let mimeType = 'image/jpeg';
    let base64Data = '';
    let hasImageBuffer = false;

    try {
      const imgRes = await fetch(directUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (imgRes.ok) {
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        mimeType = contentType.startsWith('image/') ? contentType.split(';')[0] : 'image/jpeg';
        const arrayBuf = await imgRes.arrayBuffer();
        base64Data = Buffer.from(arrayBuf).toString('base64');
        hasImageBuffer = true;
      }
    } catch (fetchErr: any) {
      console.log('Image fetch fallback to URL-reference Gemini analysis:', fetchErr?.message || fetchErr);
    }

    // 3. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    let analysis;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const prompt = `You are a high-end luxury event stylist and copywriter for BB Decoration (By Lavish Creation in Assam).
Analyze this wedding/event photo.

CRITICAL REQUIREMENT: This image is being uploaded into the "${targetCatInfo.nameEn}" section.
ALL generated headings (titleEn, titleAs), descriptions (descriptionEn, descriptionAs), and tags (badgeTagEn, badgeTagAs) MUST STRICTLY FOCUS ON THIS SPECIFIC SECTION ("${targetCatInfo.nameEn}").
For example:
- If section is Entrance: titles and descriptions must be specifically about the Entrance Gate / Welcome Arch / Entrance decor.
- If section is Sitting Lounge: titles and descriptions must be specifically about the Sitting Lounge / Guest Seating setup.
- If section is Mandap: titles and descriptions must be specifically about the Sacred Mandap.
- If section is Stage: titles and descriptions must be specifically about the Wedding Stage.
- If section is Reception: titles and descriptions must be specifically about the Reception Banquet.

DO NOT describe it as another section!

Return JSON with:
- titleEn: Short, elegant English title specifically about ${targetCatInfo.nameEn}
- titleAs: Authentic Assamese translation of titleEn in Assamese script
- category: "${catKey}"
- descriptionEn: Short 1-sentence English description highlighting ${targetCatInfo.nameEn} setup
- descriptionAs: Short 1-sentence Assamese description highlighting this setup
- elements: Array of 3 to 5 key decor elements seen in the photo
- badgeTagEn: Short 2-3 word English badge tag for ${targetCatInfo.nameEn}
- badgeTagAs: Short 2-3 word Assamese badge tag in Assamese script (${targetCatInfo.nameAs})`;

        const contentsParts: any[] = [];
        if (hasImageBuffer && base64Data) {
          contentsParts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
        contentsParts.push({ text: `${prompt}\nImage URL reference: ${directUrl}` });

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: { parts: contentsParts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                titleEn: { type: Type.STRING },
                titleAs: { type: Type.STRING },
                category: { type: Type.STRING },
                descriptionEn: { type: Type.STRING },
                descriptionAs: { type: Type.STRING },
                elements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                badgeTagEn: { type: Type.STRING },
                badgeTagAs: { type: Type.STRING },
              },
              required: ['titleEn', 'titleAs', 'category', 'descriptionEn', 'descriptionAs', 'elements', 'badgeTagEn', 'badgeTagAs'],
            },
          },
        });

        const resultText = response.text || '{}';
        analysis = JSON.parse(resultText);
      } catch (geminiErr: any) {
        console.warn('Gemini AI Quota/Error (using smart fallback):', geminiErr?.message || geminiErr);
      }
    }

    if (!analysis) {
      if (catKey === 'entrance') {
        analysis = {
          titleEn: 'Grand Floral Entrance Gate',
          titleAs: 'আকৰ্ষণীয় পুষ্পশোভিত প্ৰৱেশ দ্বাৰ',
          category: 'entrance',
          descriptionEn: 'A welcoming Assamese heritage entrance gate adorned with marigolds, Jaapi motifs, and traditional brass lamps.',
          descriptionAs: 'নৱ-দম্পতীক আদৰিবলৈ সুন্দৰ ফুল আৰু জাপিৰে সজোৱা সাংস্কৃতিক প্ৰৱেশ দ্বাৰ।',
          elements: ['Arch Flowers', 'Brass Xorai', 'Jaapi Accents', 'Welcome Arch'],
          badgeTagEn: 'Entrance Gate',
          badgeTagAs: 'প্ৰৱেশ দ্বাৰ'
        };
      } else if (catKey === 'sitting_area') {
        analysis = {
          titleEn: 'Royal Sitting Lounge Setup',
          titleAs: 'ৰাজকীয় বহাৰ স্থান সাজসজ্জা',
          category: 'sitting_area',
          descriptionEn: 'Elegantly arranged sitting lounge featuring traditional Gamosa cushions, low seating tables, and ambient lighting.',
          descriptionAs: 'অতিথিসকলৰ বাবে আৰামদায়ক আৰু মনোৰম বহাৰ স্থানৰ সুন্দৰ সাজসজ্জা।',
          elements: ['Gamosa Cushions', 'Low Seating Tables', 'Ambient Lanterns', 'Royal Drapes'],
          badgeTagEn: 'Sitting Lounge',
          badgeTagAs: 'বহাৰ স্থান'
        };
      } else if (catKey === 'stage') {
        analysis = {
          titleEn: 'Grand Wedding Reception Stage',
          titleAs: 'বিলাসী বিবাহ মঞ্চ সাজসজ্জা',
          category: 'stage',
          descriptionEn: 'Photogenic wedding stage featuring opulent floral backdrops, golden royal seating, and chandelier lighting.',
          descriptionAs: 'দৰা-কইনাক শুৱনি কৰা নান্দনিক আৰু বিলাসী বিবাহ মঞ্চৰ সজ্জা।',
          elements: ['Floral Backdrop Wall', 'Golden Royal Sofas', 'Warm Spotlights', 'Stage Canopy'],
          badgeTagEn: 'Wedding Stage',
          badgeTagAs: 'বিবাহ মঞ্চ'
        };
      } else if (catKey === 'reception') {
        analysis = {
          titleEn: 'Royal Banquet Reception Setup',
          titleAs: 'ৰাজকীয় ৰিসেপশ্বন প্ৰেক্ষাগৃহ',
          category: 'reception',
          descriptionEn: 'Grand reception banquet decor with royal dining arrangements and lavish floral table centerpieces.',
          descriptionAs: 'অতিথিসকলৰ আপ্যায়নৰ বাবে সজোৱা মনোৰম আৰু বিলাসী ৰিসেপশ্বন প্ৰেক্ষাগৃহ।',
          elements: ['Floral Centerpieces', 'Banquet Drapes', 'Mood Lighting', 'Dining Layout'],
          badgeTagEn: 'Reception Banquet',
          badgeTagAs: 'ৰিসেপশ্বন'
        };
      } else {
        analysis = {
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
    }

    return res.json({
      status: 'ok',
      directUrl,
      analysis,
    });
  } catch (err: any) {
    const isQuota = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
    if (isQuota) {
      console.log(`Gemini rate limit reached for image analysis - returning smart ${catKey} section analysis`);
    } else {
      console.log('Gemini image analysis fallback triggered:', err?.message || err);
    }
    return res.json({
      status: 'ok',
      directUrl: req.body?.imageUrl || '',
      analysis: {
        ...(catKey === 'entrance' ? {
          titleEn: 'Grand Floral Entrance Gate',
          titleAs: 'আকৰ্ষণীয় পুষ্পশোভিত প্ৰৱেশ দ্বাৰ',
          category: 'entrance',
          descriptionEn: 'A welcoming Assamese heritage entrance gate adorned with marigolds, Jaapi motifs, and traditional brass lamps.',
          descriptionAs: 'নৱ-দম্পতীক আদৰিবলৈ সুন্দৰ ফুল আৰু জাপিৰে সজোৱা সাংস্কৃতিক প্ৰৱেশ দ্বাৰ।',
          elements: ['Arch Flowers', 'Brass Xorai', 'Jaapi Accents', 'Welcome Arch'],
          badgeTagEn: 'Entrance Gate',
          badgeTagAs: 'প্ৰৱেশ দ্বাৰ'
        } : catKey === 'sitting_area' ? {
          titleEn: 'Royal Sitting Lounge Setup',
          titleAs: 'ৰাজকীয় বহাৰ স্থান সাজসজ্জা',
          category: 'sitting_area',
          descriptionEn: 'Elegantly arranged sitting lounge featuring traditional Gamosa cushions, low seating tables, and ambient lighting.',
          descriptionAs: 'অতিথিসকলৰ বাবে আৰামদায়ক আৰু মনোৰম বহাৰ স্থানৰ সুন্দৰ সাজসজ্জা।',
          elements: ['Gamosa Cushions', 'Low Seating Tables', 'Ambient Lanterns', 'Royal Drapes'],
          badgeTagEn: 'Sitting Lounge',
          badgeTagAs: 'বহাৰ স্থান'
        } : catKey === 'stage' ? {
          titleEn: 'Grand Wedding Reception Stage',
          titleAs: 'বিলাসী বিবাহ মঞ্চ সাজসজ্জা',
          category: 'stage',
          descriptionEn: 'Photogenic wedding stage featuring opulent floral backdrops, golden royal seating, and chandelier lighting.',
          descriptionAs: 'দৰা-কইনাক শুৱনি কৰা নান্দনিক আৰু বিলাসী বিবাহ মঞ্চৰ সজ্জা।',
          elements: ['Floral Backdrop Wall', 'Golden Royal Sofas', 'Warm Spotlights', 'Stage Canopy'],
          badgeTagEn: 'Wedding Stage',
          badgeTagAs: 'বিবাহ মঞ্চ'
        } : catKey === 'reception' ? {
          titleEn: 'Royal Banquet Reception Setup',
          titleAs: 'ৰাজকীয় ৰিসেপশ্বন প্ৰেক্ষাগৃহ',
          category: 'reception',
          descriptionEn: 'Grand reception banquet decor with royal dining arrangements and lavish floral table centerpieces.',
          descriptionAs: 'অতিথিসকলৰ আপ্যায়নৰ বাবে সজোৱা মনোৰম আৰু বিলাসী ৰিসেপশ্বন প্ৰেক্ষাগৃহ।',
          elements: ['Floral Centerpieces', 'Banquet Drapes', 'Mood Lighting', 'Dining Layout'],
          badgeTagEn: 'Reception Banquet',
          badgeTagAs: 'ৰিসেপশ্বন'
        } : {
          titleEn: 'Sacred Assamese Wedding Mandap',
          titleAs: 'পৱিত্ৰ অসমীয়া বিবাহ মণ্ডপ',
          category: 'mandap',
          descriptionEn: 'Traditional sacred wedding mandap decorated with fresh flowers, banana stems, and auspicious brass lamps.',
          descriptionAs: 'পৰম্পৰাগত বৈদিক নিয়ম আৰু মনোৰম পুষ্পশোভিত বিবাহ মণ্ডপ।',
          elements: ['Fresh Garland Arch', 'Sacred Fire Bedi', 'Banana Stems', 'Brass Chandelier'],
          badgeTagEn: 'Sacred Mandap',
          badgeTagAs: 'বিবাহ মণ্ডপ'
        })
      }
    });
  }
});

// Translation cache
const translationCache = new Map<string, string>();

async function fallbackGoogleTranslate(text: string, from: string, to: string): Promise<string> {
  try {
    const sl = from === 'as' ? 'as' : 'en';
    const tl = to === 'as' ? 'as' : 'en';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const segments = data[0].map((item: any) => item && item[0]).filter(Boolean);
        if (segments.length > 0) {
          return segments.join('');
        }
      }
    }
  } catch {
    // Silent network fallback
  }
  return text;
}

// Gemini Bidirectional Real-time Translation Endpoint (English <-> Assamese)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, from, to } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.json({ status: 'ok', translatedText: '' });
    }

    const trimmedText = text.trim();
    const cacheKey = `${from}:${to}:${trimmedText}`;
    if (translationCache.has(cacheKey)) {
      return res.json({ status: 'ok', translatedText: translationCache.get(cacheKey) });
    }

    let translatedText = '';

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const sourceLang = from === 'as' ? 'Assamese' : 'English';
        const targetLang = to === 'as' ? 'Assamese' : 'English';

        const prompt = `You are a professional translator for BB Decoration / Lavish Creation in Assam, India.
Translate the following ${sourceLang} text into natural, culturally accurate, and elegant ${targetLang}.
- If translating to Assamese, use authentic Assamese script (অসমীয়া).
- If translating to English, use clean, beautiful English suitable for wedding and event decor.
- Maintain formatting and conciseness. Do NOT output quotes, explanations, or notes. Output ONLY the translated text.

Source Text:
${trimmedText}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
        });
        if (response.text && response.text.trim()) {
          translatedText = response.text.trim();
        }
      } catch (transErr: any) {
        const isQuota = transErr?.status === 429 || transErr?.message?.includes('429') || transErr?.message?.includes('quota');
        if (isQuota) {
          console.log('Gemini translation quota limit reached - seamlessly using Google Translate fallback');
        } else {
          console.log('Gemini translation fallback triggered:', transErr?.message || transErr);
        }
      }
    }

    if (!translatedText) {
      translatedText = await fallbackGoogleTranslate(trimmedText, from, to);
    }

    if (translatedText) {
      translationCache.set(cacheKey, translatedText);
      if (translationCache.size > 500) {
        const firstKey = translationCache.keys().next().value;
        if (firstKey) translationCache.delete(firstKey);
      }
    }

    return res.json({
      status: 'ok',
      translatedText: translatedText || trimmedText,
    });
  } catch (err: any) {
    return res.json({ status: 'ok', translatedText: req.body?.text || '' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
