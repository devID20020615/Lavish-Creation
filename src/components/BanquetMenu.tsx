import React, { useState, useEffect } from 'react';
import { Language, MenuCategory } from '../types';
import { getStoredBanquetMenu, subscribeStorage } from '../utils/storage';
import { Utensils, Sparkles, ChefHat } from 'lucide-react';

interface BanquetMenuProps {
  lang: Language;
}

export const BanquetMenu: React.FC<BanquetMenuProps> = ({ lang }) => {
  const [categories, setCategories] = useState<MenuCategory[]>(getStoredBanquetMenu);

  const isAssamese = lang === 'as';

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setCategories(getStoredBanquetMenu());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <section id="banquet-menu" className="py-16 sm:py-24 bg-[#F7F3EB] relative overflow-hidden">
      {/* Background Subtle Floral & Luxury Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4B16A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8C1D18]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8C1D18]/10 border border-[#8C1D18]/20 text-[#8C1D18] text-xs font-semibold tracking-wide uppercase mb-4 shadow-2xs">
            <ChefHat className="w-4 h-4 text-[#8C1D18]" />
            <span>{isAssamese ? 'বি বি ডেকৰেচন' : 'BB DECORATION'}</span>
          </div>

          <h2
            className={`text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#242424] tracking-tight leading-tight mb-4 ${
              isAssamese ? 'font-assamese' : ''
            }`}
          >
            {isAssamese ? 'ৰিসেপশ্বন বেংকুৱেট আহাৰৰ বিশেষ তালিকাসমূহ' : 'Reception Banquet Catering Menu'}
          </h2>

          <p
            className={`text-sm sm:text-base text-[#5A4F43] leading-relaxed max-w-2xl mx-auto ${
              isAssamese ? 'font-assamese text-base' : ''
            }`}
          >
            {isAssamese
              ? 'ৰাজকীয় অসমীয়া সোৱাদৰ পৰা বিশেষ অনা-অসমীয়া নিৰামিষ আৰু আমিষ ব্যঞ্জনলৈ - আমাৰ দ্বাৰা পৰিবেশন কৰা বিশ্বমানৰ খাদ্য তালিকা।'
              : 'Our official catering offerings featuring authentic Assamese heritage classics, gourmet starters, main courses, and banquet delicacies.'}
          </p>
        </div>

        {/* Display Category Sections Directly */}
        {categories.length === 0 ? (
          <div className="bg-white/80 rounded-2xl p-12 text-center border border-[#D8C2A3]/50">
            <Utensils className="w-12 h-12 text-[#8C7A6B] mx-auto mb-3 opacity-50" />
            <p className="text-base font-semibold text-[#242424] mb-1">
              {isAssamese ? 'কোনো আহাৰ পোৱা নগ’ল' : 'No menu items available'}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-3xl border border-[#D8C2A3]/70 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8C2A3]/60 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-8 rounded-full bg-[#8C1D18]" />
                    <div>
                      <h3
                        className={`text-xl sm:text-2xl font-extrabold text-[#242424] tracking-tight ${
                          isAssamese ? 'font-assamese' : ''
                        }`}
                      >
                        {isAssamese ? category.titleAs : category.titleEn}
                      </h3>
                      <p className="text-xs text-[#8C7A6B] font-medium mt-0.5">
                        {category.subSections.reduce((acc, sub) => acc + sub.items.length, 0)} {isAssamese ? 'আহাৰ পৰিবেশন কৰা হয়' : 'Total Items Provided'}
                      </p>
                    </div>
                  </div>
                  {category.badgeEn && (
                    <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#D4B16A]/20 text-[#8C1D18] border border-[#D4B16A]/40 w-fit shrink-0">
                      {isAssamese ? category.badgeAs : category.badgeEn}
                    </span>
                  )}
                </div>

                {/* SubSections List with Full-Width Dish Grids */}
                <div className="space-y-6">
                  {category.subSections.map((subSection, idx) => (
                    <div key={subSection.id} className={idx > 0 ? 'pt-4 border-t border-[#F2ECE1]' : ''}>
                      {/* SubSection Title Header */}
                      <div className="flex items-center justify-between mb-3.5">
                        <h4
                          className={`text-sm sm:text-base font-extrabold text-[#8C1D18] tracking-tight flex items-center gap-2 uppercase ${
                            isAssamese ? 'font-assamese' : ''
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-[#D4B16A]" />
                          <span>{isAssamese ? subSection.titleAs : subSection.titleEn}</span>
                        </h4>
                        <span className="text-[11px] font-semibold text-[#8C7A6B] bg-[#F7F3EB] border border-[#E6DCCE] px-2.5 py-0.5 rounded-full">
                          {subSection.items.length} {isAssamese ? 'প্ৰকাৰ' : 'Items'}
                        </span>
                      </div>

                      {/* Full-Width Responsive 4-Column Grid for Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                        {subSection.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DCCE]/80 hover:border-[#8C1D18]/50 hover:bg-white text-xs sm:text-sm font-medium flex items-center justify-between text-[#242424] shadow-2xs hover:shadow-xs transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {/* Veg / Non-Veg Indicator Icon */}
                              <span
                                className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 p-0.5 ${
                                  item.isVeg === false
                                    ? 'border-red-600 bg-red-50'
                                    : 'border-emerald-600 bg-emerald-50'
                                }`}
                                title={item.isVeg === false ? 'Non-Vegetarian' : 'Vegetarian'}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.isVeg === false ? 'bg-red-600' : 'bg-emerald-600'
                                  }`}
                                />
                              </span>

                              {/* Item Name */}
                              <span className={`truncate text-[#242424] font-semibold ${isAssamese ? 'font-assamese' : ''}`}>
                                {isAssamese ? item.nameAs : item.nameEn}
                              </span>
                            </div>

                            {item.popular && (
                              <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                <Sparkles className="w-2.5 h-2.5 fill-current text-amber-600" />
                                <span>Popular</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
