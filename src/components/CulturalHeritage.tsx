import React from 'react';
import { Language } from '../types';
import { CULTURAL_STORIES } from '../data/mockData';
import { GamosaDivider } from './motifs/GamosaDivider';
import { JaapiMotif } from './motifs/JaapiMotif';
import { XoraiMotif } from './motifs/XoraiMotif';
import { ShieldCheck, Heart, Sparkles, Feather } from 'lucide-react';
import { motion } from 'motion/react';

interface HeritageProps {
  lang: Language;
}

export const CulturalHeritage: React.FC<HeritageProps> = ({ lang }) => {
  const isAssamese = lang === 'as';

  return (
    <section id="heritage" className="py-20 md:py-28 bg-[#F7F2EA] relative overflow-hidden assamese-weave-pattern">
      {/* Decorative Traditional Border Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#8C1D18] to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#D8C2A3] text-xs font-semibold text-[#8C1D18] uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B68C4A]" />
            <span className={isAssamese ? 'font-assamese' : ''}>
              {isAssamese ? 'অসমীয়া কৃষ্টি আৰু ঐতিহ্য' : 'Cultural Identity & Legacy'}
            </span>
          </div>

          <h2 className={`text-3xl md:text-5xl font-bold text-[#242424] font-serif-playfair leading-tight mb-4 ${
            isAssamese ? 'font-assamese' : ''
          }`}>
            {isAssamese ? 'অসমীয়া পৰম্পৰা, আধুনিক সৌন্দৰ্য' : 'The Essence of Luxury Assamese Heritage'}
          </h2>

          <p className={`text-base md:text-lg text-[#3A2F28]/80 leading-relaxed font-serif-cormorant ${
            isAssamese ? 'font-assamese text-lg' : ''
          }`}>
            {isAssamese
              ? 'আমাৰ প্ৰতিটো সজ্জাত প্ৰতিফলিত হয় অসমীয়া লোকসংস্কৃতিৰ পবিত্ৰস্পৰ্শ — খোদিত জাপি, পলিচ কৰা কাঁহৰ শৰাই, ৰঙা-বগা গামোচাৰ ৰেখা আৰু সৌগন্ধিক তগৰ-পদুমৰ সমাহাৰ।'
              : 'Every setup we design is a homage to Assam’s glorious weaving traditions, hand-carved bamboo sculptures, bell-metal Xorai stands, and pure white orchid garlands.'}
          </p>
        </motion.div>

        {/* 3 Main Heritage Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {CULTURAL_STORIES.map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.15, ease: 'easeOut' }}
              className="bg-[#FAF8F5] rounded-2xl p-8 border border-[#D8C2A3]/60 shadow-xs hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between"
            >
              {/* Corner Traditional Motif Accent */}
              <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-100 transition-opacity">
                {idx === 0 ? <JaapiMotif size={36} /> : idx === 1 ? <XoraiMotif size={36} /> : <Feather className="w-8 h-8 text-[#8C1D18]" />}
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-[#F7F2EA] border border-[#D8C2A3] flex items-center justify-center mb-6 text-[#8C1D18]">
                  {idx === 0 ? (
                    <JaapiMotif size={28} />
                  ) : idx === 1 ? (
                    <XoraiMotif size={28} />
                  ) : (
                    <Heart className="w-6 h-6 text-[#8C1D18]" />
                  )}
                </div>

                <h3 className={`text-xl font-bold text-[#242424] mb-3 font-serif-playfair ${
                  isAssamese ? 'font-assamese text-xl' : ''
                }`}>
                  {isAssamese ? story.titleAs : story.titleEn}
                </h3>

                <p className={`text-sm text-[#3A2F28]/80 leading-relaxed font-light ${
                  isAssamese ? 'font-assamese text-base' : ''
                }`}>
                  {isAssamese ? story.descAs : story.descEn}
                </p>
              </div>

              {/* Bottom Gamosa Accent Strip */}
              <div className="mt-6 pt-4 border-t border-[#D8C2A3]/40 flex items-center justify-between text-xs text-[#B68C4A] font-medium">
                <span className={isAssamese ? 'font-assamese font-semibold text-xs' : ''}>
                  {isAssamese ? 'পৰম্পৰাগত সুৰক্ষা' : 'Artisan Craftsmanship'}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#8C1D18]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Assamese Craftsmanship Guarantee Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-[#FAF8F5] rounded-2xl p-8 border-2 border-[#D8C2A3] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#8C1D18] text-[#FAF8F5] rounded-2xl shadow-sm shrink-0">
              <ShieldCheck className="w-8 h-8 text-[#D4B16A]" />
            </div>
            <div>
              <h4 className={`text-lg font-bold text-[#242424] font-serif-playfair ${
                isAssamese ? 'font-assamese text-xl' : ''
              }`}>
                {isAssamese ? 'খাটি অসমীয়া শিল্পীৰ দ্বাৰা হস্তশিল্পিত' : 'Handcrafted by Master Assamese Artisans'}
              </h4>
              <p className={`text-sm text-[#3A2F28]/80 ${
                isAssamese ? 'font-assamese text-sm' : ''
              }`}>
                {isAssamese
                  ? 'সৰ্থেবাৰীৰ কাঁহৰ শৰাই, নলবাৰী আৰু মাজুলীৰ বাঁহ-জাপি শিল্পীৰ সূক্ষ্ম পৰশ প্ৰতিটো সজ্জাত।'
                  : 'Sarthebari bell-metal Xorais, Nalbari handcrafted Jaapis, and Majuli bamboo art integrated seamlessly.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="text-right hidden md:block">
              <span className="block text-xs uppercase tracking-widest text-[#B68C4A] font-medium">Verified Quality</span>
              <span className="text-sm font-semibold text-[#8C1D18]">Assam Crafts Board Certified</span>
            </div>
          </div>
        </motion.div>
      </div>

      <GamosaDivider variant="jaapi" labelAs="অসমীয়া কৃষ্টি" labelEn="Heritage Standard" isAssamese={isAssamese} />
    </section>
  );
};
