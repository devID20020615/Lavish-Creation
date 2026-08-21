import { GalleryItem, DecorPackage } from '../types';

export const GALLERY_ITEMS: GalleryItem[] = [
  // ================= ENTRANCE GATES (12 items) =================
  {
    id: 'entrance-1',
    titleAs: 'অসমীয়া পৰম্পৰাগত আদৰণি দ্বাৰ',
    titleEn: 'Assamese Heritage Welcome Archway',
    category: 'entrance',
    image: 'https://i.ibb.co/4g2NFX0c/Chat-GPT-Image-Jul-31-2026-02-06-43-PM.png',
    descriptionAs: 'অতিথিদেৱো ভৱ — জাপি আৰু গামোচাৰ ৰঙীন সুতাৰে প্ৰস্তুত কৰা ঐতিহাসিক আদৰণি দ্বাৰ।',
    descriptionEn: 'Grand reception entrance with hanging Jaapi art, brass oil lamps, warm fairy light canopies, and woven Gamosa accents.',
    elements: ['Jaapi Art Installation', 'Warm Lantern Pathway', 'Gamosa Motifs', 'Entrance Brass Xorai Stand']
  },
  {
    id: 'entrance-2',
    titleAs: 'ৰাজকীয় জাপি ও শৰাই আদৰণি দ্বাৰ',
    titleEn: 'Royal Jaapi & Bell-Metal Entrance',
    category: 'entrance',
    image: 'https://i.ibb.co/fz7ZFVxq/Chat-GPT-Image-Jul-31-2026-02-52-03-PM.png',
    descriptionAs: 'পিতলৰ দীঘল পলিচ কৰা শৰাই আৰু বগা ফুলৰ থোপেৰে সজোৱা অভিজাত দ্বাৰ।',
    descriptionEn: 'Opulent archway featuring oversized polished brass Xorai structures, trailing jasmine, and warm gold drapes.',
    elements: ['Monumental Brass Xorai', 'White Jasmine Trails', 'Royal Red Carpet', 'Muga Frame Accents']
  },
  {
    id: 'entrance-3',
    titleAs: 'মুগা চিল্ক আৰু গেন্দা ফুলৰ আদৰণি',
    titleEn: 'Muga Silk & Marigold Archway',
    category: 'entrance',
    image: 'https://i.ibb.co/Mxnyf83V/Chat-GPT-Image-Jul-31-2026-02-54-20-PM.png',
    descriptionAs: 'উজ্জ্বল গেন্দা আৰু সুগন্ধি তগৰেৰে গাৰ্ডেন এণ্ট্ৰেন্সৰ বিশেষ উপস্থাপন।',
    descriptionEn: 'Vibrant marigold garlands interwoven with traditional Muga silk drapes and ambient bamboo torchlights.',
    elements: ['Marigold Garlands', 'Muga Silk Drapes', 'Bamboo Torch Pathway', 'Traditional Diya Urli']
  },
  {
    id: 'entrance-4',
    titleAs: 'প্ৰাকৃতিক বাঁহৰ ৰাজকীয় দ্বাৰ',
    titleEn: 'Natural Bamboo & Orchid Pavilion Gate',
    category: 'entrance',
    image: 'https://i.ibb.co/7JM3r4VR/Chat-GPT-Image-Jul-31-2026-02-55-50-PM.png',
    descriptionAs: 'অসমৰ বিশেষ বাঁহৰ অলংকৰণ আৰু সুগন্ধি অৰ্কিডেৰে সজোৱা পবিত্ৰ দ্বাৰ।',
    descriptionEn: 'Hand-carved Assamese bamboo lattice arch enriched with pristine white orchids and warm LED backlighting.',
    elements: ['Bamboo Lattice Frame', 'White Orchid Cascades', 'Warm LED Illumination', 'Brass Lotus Bowls']
  },
  {
    id: 'entrance-5',
    titleAs: 'বন্তি আৰু অৰ্কিডৰ পবিত্ৰ আদৰণি পথ',
    titleEn: 'Glowing Diya & Orchid Welcome Passage',
    category: 'entrance',
    image: 'https://i.ibb.co/PKvH0Zg/Chat-GPT-Image-Jul-31-2026-02-56-44-PM.png',
    descriptionAs: 'শিতল আলোকময় পথ, য’ত সাৰি সাৰিকৈ পিতলৰ চাকি আৰু বগা পদ্ম ফুলে অতিথি আদৰে।',
    descriptionEn: 'Illuminated aisle flanked by traditional oil lamps and floating lotus bowls leading guests into the venue.',
    elements: ['Traditional Brass Diya Columns', 'Floating Lotus Urlis', 'Silk Runner Carpet', 'Hanging Lanterns']
  },
  {
    id: 'entrance-6',
    titleAs: 'ৰাজকীয় বৰদ্বাৰ এণ্ট্ৰেন্স',
    titleEn: 'Grand Bor-Dwar Palace Entrance',
    category: 'entrance',
    image: 'https://i.ibb.co/Vc9Ld1mh/Chat-GPT-Image-Jul-31-2026-02-57-21-PM.png',
    descriptionAs: 'ৰাজকীয় প্ৰাসাদোপম সজ্জা, হাতত খোদিত কাঁহ-পিতলৰ অলংকৰণ আৰু মুগা পর্দা।',
    descriptionEn: 'Palatial entry arch incorporating oversized heritage Jaapi crests, brass lamps, and cascading red floral wreaths.',
    elements: ['Heritage Jaapi Crests', 'Cascading Red Roses', 'Brass Bell Columns', 'Golden Canopy']
  },
  {
    id: 'entrance-7',
    titleAs: 'পদ্মফুল আৰু কাঁহৰ শৰাই দ্বাৰ',
    titleEn: 'Lotus & Bell-Metal Xorai Portal',
    category: 'entrance',
    image: 'https://i.ibb.co/kVdVy12d/Chat-GPT-Image-Jul-31-2026-02-58-44-PM.png',
    descriptionAs: 'বগা আৰু ৰঙা পদ্মফুলৰ সতে সজোৱা শৰাই প্ৰতিমা থকা মূল আদৰণি দ্বাৰ।',
    descriptionEn: 'Ceremonial portal anchored by twin monumental Xorais filled with betel leaves and fragrant white lotus.',
    elements: ['Twin Xorai Pillars', 'Betel Leaf Arrangements', 'Fresh Lotus Wreaths', 'Ambient Wash Lights']
  },
  {
    id: 'entrance-8',
    titleAs: 'স্বৰ্ণালী তগৰ আৰু বাঁহৰ দ্বাৰ',
    titleEn: 'Golden Tagar & Bamboo Arch',
    category: 'entrance',
    image: 'https://i.ibb.co/hRFNrVf1/Chat-GPT-Image-Jul-31-2026-02-59-14-PM.png',
    descriptionAs: 'তগৰ আৰু শেৱালি ফুলৰ মৰমৰ ছাঁয়াত সজোৱা গ্ৰাম্য ঐতিহ্যপূৰ্ণ দ্বাৰ।',
    descriptionEn: 'Ethereal entrance arch wrapped in fresh fragrant Tagar blooms with woven bamboo hanging bells.',
    elements: ['Fragrant Tagar Garlands', 'Bamboo Hanging Bells', 'Muga Fabric Borders', 'Warm Fairy Lights']
  },
  {
    id: 'entrance-9',
    titleAs: 'ৰঙা গামোচা মেট্ৰিক্স আদৰণি',
    titleEn: 'Red Gamosa Motif Heritage Gate',
    category: 'entrance',
    image: 'https://i.ibb.co/G4tF9tcH/Chat-GPT-Image-Jul-31-2026-03-03-58-PM.png',
    descriptionAs: 'অসমৰ জাতীয় গামোচাৰ ৰঙা-বগা সূতাৰ আৰ্ট ইনষ্টলেশ্বনৰে সজোৱা দ্বাৰ।',
    descriptionEn: 'Cultural art installation showcasing expanded Gamosa weave patterns framing the main entryway.',
    elements: ['Gamosa Weave Canvas', 'Red Orchid Cascades', 'Brass Oil Torches', 'Ivory Fabric Pillars']
  },
  {
    id: 'entrance-10',
    titleAs: 'পৰম্পৰাগত পিতলৰ লেম্প দ্বাৰ',
    titleEn: 'Vintage Brass Lantern Passage',
    category: 'entrance',
    image: 'https://i.ibb.co/R4zC8kQy/Chat-GPT-Image-Jul-31-2026-03-04-49-PM.png',
    descriptionAs: 'পিতলৰ প্ৰদীপ আৰু চাকিৰ উষ্ম পোহৰেৰে উজ্জ্বল পথ।',
    descriptionEn: 'Vintage brass lanterns suspended from bent bamboo poles creating a golden glowing canopy at dusk.',
    elements: ['Suspended Brass Lanterns', 'Bent Bamboo Poles', 'Marigold Petal Carpet', 'Urli Candle Pathway']
  },
  {
    id: 'entrance-11',
    titleAs: 'ৰাজকীয় বগা অৰ্কিড দ্বাৰ',
    titleEn: 'Royal White Orchid & Ivory Portal',
    category: 'entrance',
    image: 'https://i.ibb.co/BKvyfK7S/Chat-GPT-Image-Jul-31-2026-03-05-27-PM.png',
    descriptionAs: 'শুভ্ৰ অৰ্কিড আৰু সোণালী সূতাৰ সুন্দৰ সংমিশ্ৰণ।',
    descriptionEn: 'Pristine white orchid archway accented with handwoven gold thread ribbons and brass incense burners.',
    elements: ['Pure White Orchids', 'Gold Thread Ribbons', 'Brass Incense Burners', 'Ivory Silk Curtains']
  },
  {
    id: 'entrance-12',
    titleAs: 'পৰম্পৰাগত ৰাজকীয় আদৰণি পথ',
    titleEn: 'Royal Assamese Tradition Pathway',
    category: 'entrance',
    image: 'https://i.ibb.co/JRnGFcPm/Chat-GPT-Image-Jul-31-2026-03-06-26-PM.png',
    descriptionAs: 'জাপি চিলিং লাইটিং আৰু বাঁহৰ স্তম্ভৰে গঠিত দীঘলীয়া পথ।',
    descriptionEn: 'A majestic covered walkway featuring a ceiling lined with illuminated miniature Jaapis and red silk runners.',
    elements: ['Illuminated Miniature Jaapis', 'Red Silk Carpet Runner', 'Brass Candle Stands', 'Jasmine Garlands']
  },

  // ================= SACRED MANDAP (12 items) =================
  {
    id: 'mandap-1',
    titleAs: 'স্বৰ্ণালী বাঁহৰ বিয়া মণ্ডপ',
    titleEn: 'Sacred Bamboo & Floral Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1545232979-fbf5963d13a2?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'বাঁহৰ সূক্ষ্ম কাৰুকাৰ্য আৰু তগৰ-গেন্দা ফুলৰে সজোৱা পবিত্ৰ বিয়াৰ মণ্ডপ।',
    descriptionEn: 'Opulent Assamese Biya mandap crafted with structural bamboo pillars, marigolds, white jasmine, and brass diya paths.',
    elements: ['Organic Bamboo Pavilion', 'Tagar & Marigold Garlands', 'Traditional Diya Path', 'Brass Urli Floating Flowers']
  },
  {
    id: 'mandap-2',
    titleAs: 'ৰাজকীয় চতুৰ্ষ স্তম্ভ পিতলৰ মণ্ডপ',
    titleEn: 'Royal Four-Pillar Brass Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: '৪ টা বিৰাট পলিচ কৰা পিতলৰ স্তম্ভ আৰু বগা অৰ্কিডেৰে পবিত্ৰ বিয়াৰ স্থান।',
    descriptionEn: 'Four solid brass pillars wrapped in white orchid vines with a central sacrificial fire altar and brass urlis.',
    elements: ['Four Brass Pillars', 'White Orchid Vines', 'Traditional Fire Altar', 'Muga Cushion Low Seating']
  },
  {
    id: 'mandap-3',
    titleAs: 'তগৰ আৰু শেৱালি ফুলৰ মণ্ডপ',
    titleEn: 'Fragrant Tagar & Jasmine Sacred Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'পবিত্ৰ তগৰ ফুল আৰু গন্ধৰাজৰ সুবাসেৰে পূৰ্ণ শুভ বিবাহৰ মণ্ডপ।',
    descriptionEn: 'Draped in fresh scented white Tagar blooms with hanging brass chimes and red silk accents.',
    elements: ['Fresh Tagar Canopy', 'Brass Chimes', 'Red Silk Borders', 'Traditional Low Diwan']
  },
  {
    id: 'mandap-4',
    titleAs: 'পৰম্পৰাগত অগ্নি কুণ্ড বিয়া মণ্ডপ',
    titleEn: 'Traditional Agni Kunda Sacred Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'পবিত্ৰ হোম-অগ্নিৰ সতে পিতলৰ থালি আৰু বগা অৰ্কিড ফুলৰ সজ্জা।',
    descriptionEn: 'Centerpiece sacred fire altar framed by carved wooden Jaapi motifs and marigold floral grids.',
    elements: ['Sacred Fire Altar', 'Carved Jaapi Motifs', 'Marigold Grid Ceiling', 'Brass Agni Accessories']
  },
  {
    id: 'mandap-5',
    titleAs: 'পদ্মফুল ও জল প্ৰতিফলিত মণ্ডপ',
    titleEn: 'Lotus & Water Mirror Sacred Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'পানীৰ উপৰত স্থাপিত বগা পদ্ম ফুল আৰু পিতলৰ বন্তিযুক্ত মণ্ডপ।',
    descriptionEn: 'A tranquil floating mandap built over a shallow water mirror filled with lotus petals and floating brass oil lamps.',
    elements: ['Water Mirror Platform', 'Pink & White Lotus', 'Floating Diya Urlis', 'Bamboo Lattice Roof']
  },
  {
    id: 'mandap-6',
    titleAs: 'স্বৰ্ণালী মুগা সূতাৰ মণ্ডপ',
    titleEn: 'Golden Muga Thread Draped Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'মুগা চিল্কৰ সোণালী সুতা আৰু ৰঙা কাপোৰেৰে সজ্জিত মণ্ডপ।',
    descriptionEn: 'Rich golden Muga silk drapery framed by intricate woven bamboo poles and warm chandelier lighting.',
    elements: ['Golden Muga Silk Drapery', 'Woven Bamboo Pillars', 'Crystal Chandelier', 'Brass Lotus Bowls']
  },
  {
    id: 'mandap-7',
    titleAs: 'গেন্দা আৰু ৰঙা গোলাপৰ মণ্ডপ',
    titleEn: 'Marigold & Red Rose Pavilion Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'ৰঙা আৰু হালোধীয়া ৰঙৰ উজ্জ্বল গাৰ্ডেন বিয়া মণ্ডপ।',
    descriptionEn: 'Bright orange and yellow marigold curtains paired with deep red roses for a joyous traditional aesthetic.',
    elements: ['Marigold Curtains', 'Red Rose Borders', 'Brass Oil Lamps', 'Carved Wooden Low Chairs']
  },
  {
    id: 'mandap-8',
    titleAs: 'আধুনিক বাঁহৰ বক্ৰাকাৰ মণ্ডপ',
    titleEn: 'Contemporary Bamboo Rib Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'আধুনিক ডিজাইনৰ বাঁহৰ পবিত্ৰ কাঠাম আৰু সূক্ষ্ম আলোকসজ্জা।',
    descriptionEn: 'Architectural curved bamboo arches forming a modern dome adorned with cascading white florals.',
    elements: ['Curved Bamboo Arches', 'White Floral Dome', 'Warm Floor Lights', 'Brass Urli Perimeter']
  },
  {
    id: 'mandap-9',
    titleAs: 'পবিত্ৰ দিয়া বন্তি মণ্ডপ',
    titleEn: 'Sacred Diya Light Pathway Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'শ শ পিতলৰ চাকিৰে উদ্ভাষিত ৰাতিৰ সুন্দৰ মণ্ডপ।',
    descriptionEn: 'Evening mandap surrounded by hundreds of flickering brass oil lamps creating a magical spiritual glow.',
    elements: ['Flickering Brass Oil Lamps', 'Jasmine Garlands', 'Ivory Silk Canopy', 'Traditional Low Seating']
  },
  {
    id: 'mandap-10',
    titleAs: 'ৰাজকীয় ৰঙা আৰু বগা গামোচা মণ্ডপ',
    titleEn: 'Royal Red & White Gamosa Weave Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'গামোচাৰ ৰঙা ফুলৰ ফুলবৰা কাৰুকাৰ্যৰে সজোৱা মণ্ডপ।',
    descriptionEn: 'Cultural fusion mandap highlighting giant handwoven Gamosa pattern panels and brass Xorai motifs.',
    elements: ['Gamosa Pattern Panels', 'Brass Xorai Motifs', 'Orchid Cascades', 'Crimson Floor Carpet']
  },
  {
    id: 'mandap-11',
    titleAs: 'মুকলি আকাশৰ ফুলৰ মণ্ডপ',
    titleEn: 'Heritage Open-Air Floral Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'প্ৰাকৃতিক গছৰ ছাঁয়াত সজোৱা মুকলি আকাশৰ মনোৰম মণ্ডপ।',
    descriptionEn: 'Outdoor garden mandap sheltered under lush green trees draped in cascading white jasmine strands.',
    elements: ['Cascading Jasmine Strands', 'Natural Wooden Pillars', 'Brass Urli Floating Lotus', 'Muga Cushion Sets']
  },
  {
    id: 'mandap-12',
    titleAs: 'ৰাজকীয় পিতলৰ শৰাই মণ্ডপ',
    titleEn: 'Royal Brass Urli & Xorai Mandap',
    category: 'mandap',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'বিৰাট কাঁহৰ শৰাই আৰু তামোল-পানেৰে সজোৱা ঐতিহাসিক মণ্ডপ।',
    descriptionEn: 'Monumental bell-metal Xorais anchoring the four corners of a lavish silk-draped wedding pavilion.',
    elements: ['Bell-Metal Corner Xorais', 'Silk Drapes', 'Brass Fire Vessel', 'Orchid & Jasmine Garlands']
  },

  // ================= WEDDING STAGE (12 items) =================
  {
    id: 'stage-1',
    titleAs: 'ৰাজকীয় বিয়াৰ মঞ্চ (মুগা আৰু জোৰাই)',
    titleEn: 'Royal Biya Stage (Muga & Xorai Elegance)',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'হাতত খোদিত জাপি, পলিচ কৰা কাঁহ-পিতলৰ খোৰাই, আৰু বগা অৰ্কিডৰ মনোৰম মিলন।',
    descriptionEn: 'A luxury Assamese wedding stage with golden Jaapi circular motifs, white orchid drapes, brass Xorai lamps and warm candles.',
    elements: ['Brass Xorai Pillars', 'Handcrafted Jaapi Wall Art', 'Muga Silk Drapes', 'White Orchid & Jasmine Cascades']
  },
  {
    id: 'stage-2',
    titleAs: 'আধুনিক গ্লামাৰ আৰু অসমীয়া ঐতিহ্য',
    titleEn: 'Modern Glamour & Heritage Fusion Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'আধুনিক আলোকসজ্জা আৰু বৰ্গীত-অনুপ্ৰাণিত গম্ভীৰ শৈলীৰে সমৃদ্ধ বিশেষ মঞ্চ।',
    descriptionEn: 'Minimalist luxury stage featuring glowing brass accents, warm ivory backdrops, and cascading white floral installations.',
    elements: ['Ambient Fairy Canopy', 'Brass Lotus Urlis', 'Ivory Silk Fabric', 'Minimalist Bamboo Ribbons']
  },
  {
    id: 'stage-3',
    titleAs: 'বিৰাট জাপি ৱাল আৰ্ট মঞ্চ',
    titleEn: 'Grand Jaapi Wall Art Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'বৃহৎ কাৰুকাৰ্যমণ্ডিত জাপিৰ বেকড্ৰপ আৰু ৰাজকীয় সিংহাসন।',
    descriptionEn: 'Feature wall showcasing a massive central handcrafted Jaapi surrounded by glowing brass oil torchiere lamps.',
    elements: ['Central Giant Jaapi', 'Brass Torchiere Lamps', 'Gold Velvet Throne', 'Jasmine Flower Waterfall']
  },
  {
    id: 'stage-4',
    titleAs: 'শুভ্ৰ অৰ্কিড আৰু মুগা চিল্ক মঞ্চ',
    titleEn: 'White Orchid & Muga Silk Regal Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1545232979-fbf5963d13a2?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'শুভ্ৰ আৰু সোণালী ৰঙৰ এক অত্যন্ত সৌভাগ্যপূৰ্ণ উপস্থাপন।',
    descriptionEn: 'Sophisticated stage design combining cascading white phalaenopsis orchids with rich Muga silk drapes.',
    elements: ['Phalaenopsis Orchids', 'Muga Silk Swags', 'Brass Candle Candelabras', 'Plush Ivory Sofas']
  },
  {
    id: 'stage-5',
    titleAs: 'পিতলৰ চ্যান্ডেলিয়াৰ ও ৰাজকীয় সিংসাহন',
    titleEn: 'Brass Candelabra Royal Throne Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'অভিজাত বৰদ্বাৰ শৈলীৰ পিতলৰ চ্যান্ডেলিয়াৰ আৰু লাল ভেলভেট আসন।',
    descriptionEn: 'Opulent palace-inspired stage setting with multi-tiered brass candelabras and royal crimson velvet seating.',
    elements: ['Multi-Tier Brass Candelabras', 'Crimson Velvet Chairs', 'Golden Lattice Backdrop', 'Fresh Rose Bed']
  },
  {
    id: 'stage-6',
    titleAs: 'স্বৰ্ণালী বাঁহৰ জাল সজ্জা মঞ্চ',
    titleEn: 'Golden Bamboo Lattice Backdrop Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'বাঁহৰ সূক্ষ্ম বৈপ্লৱিক কাঠাম আৰু সোণালী লাইটিং।',
    descriptionEn: 'Geometric bamboo lattice backdrop backlit with warm gold LED panels and topped with weeping white wisteria.',
    elements: ['Geometric Bamboo Lattice', 'Warm Gold LED Panels', 'Weeping White Wisteria', 'Brass Urli Display']
  },
  {
    id: 'stage-7',
    titleAs: 'পৰম্পৰাগত যোৰণ ও বিয়া মঞ্চ',
    titleEn: 'Traditional Joron & Biya Curation Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'যোৰণ আৰু বিয়াৰ বাবে বিশেষভাৱে প্ৰস্তুত কৰা ঐতিহাসিক মঞ্চ।',
    descriptionEn: 'Dual-purpose stage curated for Joron gift exchange and the main wedding couple throne backdrop.',
    elements: ['Joron Pedestals', 'Polished Bell-Metal Xorais', 'Red & Gold Silk Backdrop', 'Marigold Borders']
  },
  {
    id: 'stage-8',
    titleAs: 'ফেয়াৰী লাইট আৰু বাঁহৰ ওলমি থকা চাদ',
    titleEn: 'Fairy Light Canopy & Bamboo Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'হেজাৰ লাইটৰ পোহৰত উজ্জ্বল নিশাব্যাপী বিয়াৰ মঞ্চ।',
    descriptionEn: 'A magical night-sky stage with thousands of twinkling fairy lights draped over woven bamboo rafters.',
    elements: ['Twinkling Fairy Canopy', 'Woven Bamboo Rafters', 'Lotus Urli Stage Edging', 'Ivory Couch']
  },
  {
    id: 'stage-9',
    titleAs: 'পদ্মফুল মোটিফ আৰু কাঁহৰ শৰাই মঞ্চ',
    titleEn: 'Lotus Motif & Bell-Metal Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'পবিত্ৰ পদ্ম ফুলৰ আৰ্ট আৰু হাতত কাটা পিতলৰ সজ্জা।',
    descriptionEn: 'Artistic stage centering hand-carved lotus motifs flanked by majestic bell-metal Xorais with betel offerings.',
    elements: ['Carved Lotus Motifs', 'Bell-Metal Xorai Stands', 'Soft Velvet Seating', 'Warm Spotlight Grids']
  },
  {
    id: 'stage-10',
    titleAs: 'মুগা চিল্ক আৰু শেৱালি ফুলৰ মঞ্চ',
    titleEn: 'Muga Weave & Jasmine Backdrop Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'মুগা সুতাৰ ফুল আৰু তগৰ-শেৱালিৰ মনোৰম মিলন।',
    descriptionEn: 'Soft pastel stage anchored by authentic Muga silk textile panels and dense jasmine flower walls.',
    elements: ['Muga Silk Textile Panels', 'Dense Jasmine Wall', 'Brass Floor Lamps', 'Gold Carved Settee']
  },
  {
    id: 'stage-11',
    titleAs: 'আধুনিক মিনিমালিষ্ট অসমীয়া মঞ্চ',
    titleEn: 'Modern Minimalist Assamese Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'সৰল তথাপি অত্যন্ত আভিজাত্যপূৰ্ণ আধুনিক বিয়াৰ মঞ্চ।',
    descriptionEn: 'Clean architectural lines featuring bamboo poles, subtle warm backlighting, and a single statement Jaapi.',
    elements: ['Architectural Bamboo Poles', 'Statement Jaapi Motif', 'Ivory Draped Wall', 'Brass Urli Accent']
  },
  {
    id: 'stage-12',
    titleAs: 'ৰাজকীয় ফ্লোৰেল গাৰ্ডেন মঞ্চ',
    titleEn: 'Royal Botanical Garden Stage',
    category: 'stage',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'প্ৰাকৃতিক সেউজীয়া আৰু ৰঙীন ফুলৰ মনোৰম মঞ্চ সজ্জা।',
    descriptionEn: 'Botanical luxury stage surrounded by lush green foliage, trailing white orchids, and brass lanterns.',
    elements: ['Lush Foliage Backdrop', 'Trailing White Orchids', 'Brass Standing Lanterns', 'Royal Throne Bench']
  },

  // ================= SITTING AREA (12 items) =================
  {
    id: 'sitting-1',
    titleAs: 'ৰাজকীয় মেহফিল ও অতিথি বহাৰ স্থান',
    titleEn: 'Royal Assamese Guest Sitting Lounge',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'বোলষ্টাৰ কুচন, মুগা চিল্ক গাৰু আৰু কাঁহৰ বাসনেৰে সজোৱা অভিজাত অতিথি বহা স্থান।',
    descriptionEn: 'Traditional royal low-seating diwan lounge adorned with Muga silk bolster cushions, bamboo shades, and brass accent tables.',
    elements: ['Muga Silk Cushion Sets', 'Brass Tea & Betel Tables', 'Low Diwan Seating', 'Warm Ambient Lanterns']
  },
  {
    id: 'sitting-2',
    titleAs: 'ভিআইপি ডাইনিং ও গাৰ্ডেন ছিটিং',
    titleEn: 'VIP Garden & Dining Lounge',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'গামোচা মেট্ৰিক্স ৰানাৰ আৰু পিতলৰ চাকিৰে সজোৱা মুকলি অতিথি ডাইনিং lounge।',
    descriptionEn: 'Opulent outdoor family sitting area framed by hanging bamboo lamps, plush seating, and handcrafted Assamese runners.',
    elements: ['Custom Gamosa Table Runners', 'Suspended Bamboo Lamps', 'VIP Lounge Sofas', 'Floating Flower Urlis']
  },
  {
    id: 'sitting-3',
    titleAs: 'নিম্ন দিৱান মুগা গাৰু স্থান',
    titleEn: 'Traditional Low Diwan Muga Lounge',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'মাটিত পাৰি ৰখা কোমল কুচন আৰু পৰম্পৰাগত সজ্জা।',
    descriptionEn: 'Floor-level royal seating setup with silk bolsters, velvet rugs, and low brass tea tables for elderly guests.',
    elements: ['Muga Silk Bolsters', 'Plush Velvet Rugs', 'Low Brass Tables', 'Handcrafted Bamboo Screens']
  },
  {
    id: 'sitting-4',
    titleAs: 'প্ৰাকৃতিক বাঁহৰ পৰ্দা গাৰ্ডেন ছিটিং',
    titleEn: 'Natural Bamboo Screen Garden Lounge',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1545232979-fbf5963d13a2?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'বাঁহৰ পৰ্দা আৰু গেন্দা ফুলৰ গাৰ্ডেন ছিটিং এৰিয়া।',
    descriptionEn: 'Private garden cabanas partitioned with natural bamboo screens and wrapped in fragrant marigold garlands.',
    elements: ['Natural Bamboo Cabanas', 'Fragrant Marigold Swags', 'Comfortable Plush Loungers', 'Brass Urli Centerpieces']
  },
  {
    id: 'sitting-5',
    titleAs: 'পিতলৰ টেবুল তামোল-পান ভিআইপি ছিটিং',
    titleEn: 'Brass Table Betel & Tea Seating Enclosure',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'তামোল-পান আৰু বিয়াৰ চাহ আগবঢ়াব পৰা বিশেষ ভিআইপি স্থান।',
    descriptionEn: 'Exclusive VIP guest seating featuring bell-metal Xorais pre-set with betel leaf trays and traditional Assamese tea service.',
    elements: ['Xorai Betel Leaf Trays', 'Bell-Metal Tea Sets', 'Royal Cream Armchairs', 'Golden Drapes']
  },
  {
    id: 'sitting-6',
    titleAs: 'আলোকোজ্জ্বল বাঁহৰ লেম্প পৰিয়াল পেভিলিয়ন',
    titleEn: 'Open-Air Bamboo Lantern Family Pavilion',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'মুকলি চালিৰ তলত পৰিয়াল আৰু বান্ধৱীসকলৰ আনন্দৰ স্থান।',
    descriptionEn: 'Spacious open-air seating area lit by dozens of handwoven bamboo pendant lamps floating from wooden beams.',
    elements: ['Woven Bamboo Pendant Lamps', 'Modular Cream Sofas', 'Jasmine Garland Borders', 'Warm Ambient Spotlights']
  },
  {
    id: 'sitting-7',
    titleAs: 'ৰাজকীয় ভেলভেট ও মুগা চিল্ক lounge',
    titleEn: 'Royal Velvet & Muga Silk Guest Lounge',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'অভিজাত ৰঙা ভেলভেট আৰু সোণালী সূতাৰ কুচন সজ্জা।',
    descriptionEn: 'Luxury indoor guest lounge featuring deep crimson velvet sofas accented with hand-loomed gold Muga cushions.',
    elements: ['Crimson Velvet Sofas', 'Gold Muga Cushions', 'Brass Candle Columns', 'Handwoven Carpet']
  },
  {
    id: 'sitting-8',
    titleAs: 'গেন্দা ফুলৰ কৰিডৰ ছিটিং',
    titleEn: 'Marigold Draped Guest Corridor Lounge',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'হালোধীয়া আৰু ৰঙা ফুলৰে সজ্জিত অতিথি বাটি।',
    descriptionEn: 'Long shaded corridor flanked by thick marigold curtains and comfortable cushioned benches.',
    elements: ['Thick Marigold Curtains', 'Cushioned Wooden Benches', 'Brass Diya Pedestals', 'Gamosa Accent Runners']
  },
  {
    id: 'sitting-9',
    titleAs: 'ৰাতিৰ কেণ্ডেললাইট ভিআইপি লাউঞ্জ',
    titleEn: 'Ambient Candlelight VIP Enclosure',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'নৰম মোমবাতিৰ পোহৰত আলোকিত অভিজাত বৈঠক।',
    descriptionEn: 'Intimate evening seating pavilion lit exclusively with safe flickering glass candle holders and brass lanterns.',
    elements: ['Glass Candle Holders', 'Brass Floor Lanterns', 'Plush Tufted Armchairs', 'Ivory Silk Curtains']
  },
  {
    id: 'sitting-10',
    titleAs: 'গামোচা ৰানাৰ বেংকুৱেট ছিটিং',
    titleEn: 'Gamosa Runner Banquet Seating Layout',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'দীঘলীয়া ডাইনিং টেবুলত ৰঙা গামোচা ৰানাৰ সজ্জা।',
    descriptionEn: 'Long communal dining tables draped in pristine white linen with handwoven red-and-white Gamosa center runners.',
    elements: ['Gamosa Center Runners', 'Brass Floral Bowls', 'Chiavari Seating', 'Warm Ceiling Wash']
  },
  {
    id: 'sitting-11',
    titleAs: 'ঐতিহাসিক লন গাৰ্ডেন লাউঞ্জ',
    titleEn: 'Heritage Lawn Lounge & Tea Corner',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'মুকলি সেউজীয়া লনত বিয়াৰ বিশেষ চাহ মেল ছিটিং।',
    descriptionEn: 'Lawn-style lounge with low wicker furniture, colorful Assam silk throws, and traditional brass urlis.',
    elements: ['Low Wicker Furniture', 'Assam Silk Throws', 'Floating Flower Urlis', 'Bamboo Parasols']
  },
  {
    id: 'sitting-12',
    titleAs: 'ৰাজকীয় চোতাল বৈঠক',
    titleEn: 'Royal Courtyard Sitting Setup',
    category: 'sitting_area',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'পুৰণি পৰম্পৰাগত ঘৰৰ চোতালৰ নিচিনা অভিজাত বৈঠক।',
    descriptionEn: 'Courtyard seating configuration centered around a large brass fountain filled with fresh lotus blossoms.',
    elements: ['Central Brass Fountain', 'Fresh Lotus Blossoms', 'Diwan Bench Seating', 'Carved Jaapi Wall Accents']
  },

  // ================= RECEPTION (12 items) =================
  {
    id: 'reception-1',
    titleAs: 'প্ৰীতি ভোজৰ ৰাজকীয় প্ৰেক্ষাপট',
    titleEn: 'Royal Reception & Banquet Curation',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'অভিজাত ক্ৰীম-সোণালী লাইটিং আৰু বাঁহৰ ওলমি থকা চিলিং ডে কৰ।',
    descriptionEn: 'Sophisticated reception styling with suspended bamboo art, brass candelabras, and custom Gamosa weave table runners.',
    elements: ['Suspended Bamboo Weave Ceiling', 'Brass Candelabras', 'Silk Cushion Seating', 'Warm Ambient Wash']
  },
  {
    id: 'reception-2',
    titleAs: 'ওলমি থকা বাঁহৰ চালি ৰিচেপশ্বন',
    titleEn: 'Suspended Bamboo Canopy Banquet Hall',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'চিলিঙত বাঁহৰ সুন্দৰ কলাত্মক সজ্জা আৰু ঝাৰবাতি।',
    descriptionEn: 'Grand indoor banquet hall decorated with intricate hanging bamboo chandeliers and cream floral installations.',
    elements: ['Hanging Bamboo Chandeliers', 'Cream Floral Cascades', 'Gold Chiavari Seating', 'Silk Backdrop']
  },
  {
    id: 'reception-3',
    titleAs: 'পিতলৰ কঁাহৰ ক্যান্দেল লাভ ডাইনিং',
    titleEn: 'Brass Urli & Candelabra Reception Dining',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1545232979-fbf5963d13a2?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'প্ৰীতি ভোজ ডাইনিং টেবুলত সোণালী ক্যান্দেল আৰু কাঁহৰ বাসনেৰে সজোৱা স্থান।',
    descriptionEn: 'Luxury reception dining arrangement anchored by high brass candelabras and bell-metal tableware accents.',
    elements: ['High Brass Candelabras', 'Bell-Metal Tableware Accents', 'Gamosa Cloth Runners', 'White Orchid Vases']
  },
  {
    id: 'reception-4',
    titleAs: 'মুগা চিল্ক টেবুল ৰানাৰ প্ৰীতি ভোজ',
    titleEn: 'Muga Silk Table Runner Reception Setup',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'টেবুলত খোদিত সোণালী মুগা ৰানাৰ আৰু সৰু চাকি।',
    descriptionEn: 'Elegantly dressed reception tables featuring handwoven gold Muga silk runners and crystal stemware.',
    elements: ['Muga Silk Table Runners', 'Crystal Stemware', 'Brass Diya Holders', 'Fresh Jasmine Sprays']
  },
  {
    id: 'reception-5',
    titleAs: 'আধুনিক সোণালী প্ৰীতি ভোজ মঞ্চ',
    titleEn: 'Contemporary Golden Gala Reception Stage',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'প্ৰীতি ভোজত দম্পতীৰ বাবে সুন্দৰ আধুনিক বেকড্ৰপ।',
    descriptionEn: 'Gala reception couple stage with cascading gold foil leafing, white orchids, and plush ivory velvet lounge sofa.',
    elements: ['Gold Foil Leaf Backdrop', 'White Orchid Waterfall', 'Ivory Velvet Lounge Sofa', 'Soft Spotlight Beam']
  },
  {
    id: 'reception-6',
    titleAs: 'ফেয়াৰী লাইট বেংকুৱেট লন',
    titleEn: 'Ambient Fairy Light Banquet Lawn',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'নিশাৰ মুকলি লনত প্ৰীতি ভোজৰ উজ্জ্বল আনন্দময় সজ্জা।',
    descriptionEn: 'Outdoor evening reception under a glowing starry fairy light tunnel with formal dinner seating.',
    elements: ['Starry Fairy Light Tunnel', 'Formal Dinner Seating', 'Brass Urli Pathway', 'Live Acoustic Music Platform']
  },
  {
    id: 'reception-7',
    titleAs: 'ৰাজকীয় কাঁহ-পিতলৰ ভোজ পেভিলিয়ন',
    titleEn: 'Royal Bell-Metal Feast Pavilion',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'অসমৰ কাঁহ শিল্পক প্ৰাধান্য দি সজোৱা প্ৰীতি ভোজ ডাইনিং।',
    descriptionEn: 'Heritage feast hall honoring Assam’s bell-metal craftsmanship with authentic brass serving pedestals.',
    elements: ['Brass Serving Pedestals', 'Jasmine Table Garlands', 'High-Back Dining Chairs', 'Warm Ambient Wash']
  },
  {
    id: 'reception-8',
    titleAs: 'আধুনিক অসমীয়া প্ৰীতি ভোজ আদৰণি',
    titleEn: 'Modern Assamese Gala Welcome Portal',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'ৰিগাল গোল্ড আৰু বগা ৰঙৰ গ্ৰ্যান্ড এণ্ট্ৰেন্স।',
    descriptionEn: 'Grand reception entrance portal decorated with large glowing Jaapi disks and trailing white wisteria.',
    elements: ['Glowing Jaapi Disks', 'Trailing White Wisteria', 'Red Carpet Pathway', 'Brass Torches']
  },
  {
    id: 'reception-9',
    titleAs: 'মোমবাতি আলোকোজ্জ্বল ৰাজকীয় নৈশভোজ',
    titleEn: 'Candlelit Luxury Dinner Reception',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'শান্ত স্নিগ্ধ পোহৰত সজোৱা নৈশভোজ ডাইনিং টেবুল।',
    descriptionEn: 'Romantic candlelit dinner setting with long wooden tables, brass candelabras, and deep red floral accent runner.',
    elements: ['Long Wooden Dining Tables', 'Brass Candelabras', 'Deep Red Floral Runner', 'Gold Rimmed Chargers']
  },
  {
    id: 'reception-10',
    titleAs: 'বগা গোলাপ আৰু পিতলৰ ক্যান্দেল প্ৰীতি ভোজ',
    titleEn: 'White Rose & Brass Candelabra Reception',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'শুভ্ৰ বগা গোলাপ আৰু পিতলৰ ওখ প্ৰদীপ থকা সজ্জা।',
    descriptionEn: 'Classy white rose centerpieces mounted on tall brass stands flanked by delicate glass votive lights.',
    elements: ['Tall Brass Stands', 'White Rose Centerpieces', 'Glass Votive Lights', 'Silk Napkin Accents']
  },
  {
    id: 'reception-11',
    titleAs: 'ৰাজকীয় অসমীয়া খাদ্য সজ্জা',
    titleEn: 'Royal Assamese Feast Enclosure',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'বিশেষ খাদ্য পৰিৱেশনৰ বাবে সজোৱা ৰাজকীয় স্থান।',
    descriptionEn: 'Customized buffet and traditional food serving stations styled with bamboo arches, Xorais, and fresh banana leaves.',
    elements: ['Bamboo Arch Buffet Canopy', 'Brass Xorai Stations', 'Fresh Banana Leaf Accents', 'Gamosa Motifs']
  },
  {
    id: 'reception-12',
    titleAs: 'বিৰাট উৎসৱ বেকড্ৰপ লাউঞ্জ',
    titleEn: 'Grand Celebration Backdrop Lounge',
    category: 'reception',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    descriptionAs: 'সমগ্ৰ পৰিয়াল আৰু বন্ধু-বান্ধৱীসকলৰ মেম’ৰী ফটো তোলাৰ বাবে বিশেষ বেকড্ৰপ।',
    descriptionEn: 'Interactive photo backdrop featuring giant illuminated Jaapi motifs, brass mirrors, and plush seating for reception photos.',
    elements: ['Giant Illuminated Jaapis', 'Brass Frame Mirrors', 'Plush Photo Bench', 'Fresh Floral Framing']
  }
];

export const CURATED_PACKAGES: DecorPackage[] = [
  {
    id: 'pkg-bor-dwar',
    nameAs: 'ৰাজকীয় বৰদ্বাৰ (Royal Heritage)',
    nameEn: 'The Royal Bor-Dwar Package',
    taglineAs: 'পৰম্পৰা আৰু আভিজাত্যৰ পূৰ্ণ সংমিশ্ৰণ',
    taglineEn: 'The Pinnacle of Traditional Assamese Splendor',
    featuredImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    highlightsAs: [
      'খোদিত জাপি আৰু মুগা মেট্ৰিক্সৰ মঞ্চ সজ্জা',
      'প্ৰাকৃতিক বাঁহ আৰু বগা তগৰ ফুলৰ মণ্ডপ',
      '৪ টা ডাঙৰ পিতলৰ শৰাই থকা আদৰণি দ্বাৰ',
      'পৰম্পৰাগত দিয়া বন্তি আৰু এম্বিয়েন্ট লাইটিং',
      'যোৰণ আৰু নোৱনীৰ বাবে পৃথক ফটো বুথ'
    ],
    highlightsEn: [
      'Custom Jaapi & Muga Silk backdrop stage curation',
      'Structural natural bamboo & jasmine sacred mandap',
      'Grand entrance arch with 4 monumental brass Xorais',
      'Full ambient diya lighting & warm fairy pathway',
      'Dedicated Joron & Nuoni cultural photo pavilion'
    ],
    popular: true
  },
  {
    id: 'pkg-swarnali',
    nameAs: 'স্বৰ্ণালী বিয়া (Golden Biya Curation)',
    nameEn: 'Swarnali Biya Package',
    taglineAs: 'আধুনিক মিনিমালিজম আৰু সাংস্কৃতিক সৌন্দৰ্য',
    taglineEn: 'Contemporary Elegance Rooted in Culture',
    featuredImage: 'https://images.unsplash.com/photo-1545232979-fbf5963d13a2?auto=format&fit=crop&w=800&q=80',
    highlightsAs: [
      'বগা অৰ্কিড আৰু গামোচা ট্ৰিমৰ ক্লাছিক মঞ্চ',
      'গেন্দা আৰু গোলাপৰ পবিত্ৰ মণ্ডপ',
      'আলোকোজ্জ্বল বাঁহৰ ওলমি থকা লাইট সজ্জা',
      'অভিজাত ৰিচেপশ্বন লবি সজ্জা'
    ],
    highlightsEn: [
      'Classic stage with white orchids & Gamosa accents',
      'Fragrant marigold & rose sacred wedding mandap',
      'Suspended bamboo lantern lighting installation',
      'Elegantly styled reception seating & photo grid'
    ]
  },
  {
    id: 'pkg-maheeyasi',
    nameAs: 'মহীয়সী (Grand Bespoke Experience)',
    nameEn: 'Maheeyasi Bespoke Luxury',
    taglineAs: 'সম্পূৰ্ণ কাষ্টমাইজড্‌ আৰু অভিজাত অভিজ্ঞতা',
    taglineEn: 'Fully Customized Ultra-Luxury Assamese Experience',
    featuredImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    highlightsAs: [
      'অসমৰ বিশিষ্ট শিল্পীদ্বাৰা প্ৰস্তুত বিশেষ জাপি ও শৰাই ইনষ্টলেশ্বন',
      'সমগ্ৰ ভেনিউৰ বাবে ৰাজকীয় ফ্লোৰেল ডিজাইন',
      'লাইভ বাঁহী আৰু বৰগীত সংগীত এম্বিয়েন্স কনচেপ্ট',
      'ভিআইপি ডাইনিং আৰু বেছপোক টেবুল ৰানাৰ',
      'ব্যক্তিগত ডে কৰ ডাইৰেক্টৰ অন-সাইট'
    ],
    highlightsEn: [
      'Exclusive artisan-crafted Jaapi & Xorai spatial sculpture',
      'Complete venue transformation with luxury florals',
      'Integrated live flute & acoustic traditional soundscape',
      'VIP dining setups with custom Muga & Gamosa weaves',
      'Dedicated On-Site Decor Director for seamless execution'
    ]
  }
];

export const CULTURAL_STORIES = [
  {
    titleAs: 'জাপি — ৰাজকীয় ছত্ৰ আৰু পবিত্ৰ সুৰক্ষা',
    titleEn: 'Jaapi — The Royal Umbrella of Honor',
    descAs: 'জাপি কেৱল এক আভূষণ নহয়; ই অসমৰ গৌৰৱ, সন্মান আৰু আশীৰ্বাদৰ প্ৰতীক। বিয়াৰ মঞ্চত জাপিৰ উপস্থিতিয়ে নতুন দম্পতীক সুৰক্ষা আৰু সমৃদ্ধিৰ বাৰ্তা দিয়ে।',
    descEn: 'More than a woven bamboo hat, the Jaapi represents royal dignity, sacred blessings, and cultural protection over the newly wedded couple.'
  },
  {
    titleAs: 'শৰাই — শ্ৰদ্ধা আৰু পবিত্ৰ আদৰণি',
    titleEn: 'Xorai — Sacred Vessel of Hospitality',
    descAs: 'কাঁহৰ শৰাইত তামোল-পান আগবঢ়োৱাটো অসমীয়া অতিথি পৰম্পৰাৰ পৰম পবিত্ৰ ৰীতি। আমাৰ সজ্জাত শৰাইক ৰাজকীয় মহত্ত্বৰে উপস্থাপন কৰা হয়।',
    descEn: 'Offering betel leaves on a bell-metal Xorai is Assam’s highest expression of honor, hospitality, and divine grace.'
  },
  {
    titleAs: 'গামোচা — হৃদয়ৰ স্নেহ আৰু পবিত্ৰ ৰঙিন সূতা',
    titleEn: 'Gamosa — Handwoven Fabric of Love',
    descAs: 'ৰঙা আৰু বগা সূতাৰ মৰমৰ গামোচাৰ ৰেখা আমাৰ বৈবাহিক সজ্জাত অতি সূক্ষ্মভাৱে প্ৰয়োগ কৰা হয়, যিয়ে পৰিয়ালৰ একতাক প্ৰতিফলিত কৰে।',
    descEn: 'The traditional red-and-white motif embodies deep reverence, family affection, and the sacred binding of two souls.'
  }
];
