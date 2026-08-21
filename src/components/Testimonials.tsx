import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { JaapiMotif } from './motifs/JaapiMotif';
import { Quote, Star } from 'lucide-react';
import { getStoredTestimonials, subscribeStorage, TestimonialItem } from '../utils/storage';
import { motion } from 'motion/react';

interface TestimonialsProps {
  lang: Language;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ lang }) => {
  const isAssamese = lang === 'as';
  const [reviews, setReviews] = useState<TestimonialItem[]>(() => getStoredTestimonials());

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setReviews(getStoredTestimonials());
    });
    return unsubscribe;
  }, []);

  return (
    <section id="stories" className="pt-12 md:pt-16 pb-20 md:pb-28 bg-[#F7F2EA] relative border-b border-[#D8C2A3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#D8C2A3] text-xs font-semibold text-[#8C1D18] uppercase tracking-widest mb-3">
            <Star className="w-3.5 h-3.5 text-[#B68C4A] fill-current" />
            <span className={isAssamese ? 'font-assamese' : ''}>
              {isAssamese ? 'গ্ৰাহকৰ আশীৰ্বাদ' : 'Client Testimonials'}
            </span>
          </div>

          <h2 className={`text-3xl md:text-5xl font-bold text-[#242424] font-serif-playfair leading-tight mb-4 ${
            isAssamese ? 'font-assamese' : ''
          }`}>
            {isAssamese ? 'অনুগ্ৰহী পৰিয়ালবৰ্গৰ অভিজ্ঞতা' : 'Stories of Assamese Celebrations'}
          </h2>

          <p className={`text-base text-[#3A2F28]/80 max-w-2xl mx-auto ${
            isAssamese ? 'font-assamese text-lg' : ''
          }`}>
            {isAssamese
              ? 'আমাৰ কাৰুকাৰ্যই নতুন দম্পতী আৰু তেওঁলোকৰ পৰিয়ালৰ হৃদয়ত সঞ্চিত কৰা সুন্দৰ স্মৃতি।'
              : 'Cherished feedback from families across Assam and PAN-India who trusted Lavish Creation for their sacred day.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <motion.div
              key={rev.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.12, ease: 'easeOut' }}
              className="bg-[#FAF8F5] rounded-2xl p-8 border border-[#D8C2A3]/80 shadow-xs flex flex-col justify-between relative group hover:border-[#8C1D18] transition-colors"
            >
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 text-[#8C1D18]" />
              </div>

              <div>
                <div className="flex items-center gap-1 text-[#D4B16A] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className={`text-sm md:text-base text-[#3A2F28]/90 italic mb-6 leading-relaxed font-serif-cormorant ${
                  isAssamese ? 'font-assamese text-lg not-italic' : ''
                }`}>
                  "{isAssamese ? rev.storyAs : rev.storyEn}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#D8C2A3]/40 flex items-center justify-between">
                <div>
                  <h4 className={`text-base font-bold text-[#242424] ${
                    isAssamese ? 'font-assamese' : ''
                  }`}>
                    {isAssamese ? rev.nameAs : rev.nameEn}
                  </h4>
                  <span className="text-xs text-[#8C1D18] font-medium block">
                    {isAssamese ? rev.locationAs : rev.locationEn} • {isAssamese ? rev.eventAs : rev.eventEn}
                  </span>
                </div>
                <JaapiMotif size={28} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

