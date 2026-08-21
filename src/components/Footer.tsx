import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { JaapiMotif } from './motifs/JaapiMotif';
import { XoraiMotif } from './motifs/XoraiMotif';
import { MapPin, Phone, Mail } from 'lucide-react';
import { getStoredSettings, subscribeStorage, AdminContactSettings } from '../utils/storage';

interface FooterProps {
  lang: Language;
  onOpenConsultation: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenConsultation, onOpenAdmin }) => {
  const isAssamese = lang === 'as';
  const [settings, setSettings] = useState<AdminContactSettings>(() => getStoredSettings());
  const lastTapRef = useRef(0);

  const handleLogoTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350 && now - lastTapRef.current > 0) {
      e.preventDefault();
      onOpenAdmin();
    }
    lastTapRef.current = now;
  };

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setSettings(getStoredSettings());
    });
    return unsubscribe;
  }, []);

  return (
    <footer className="bg-[#242424] text-[#FAF8F5] relative overflow-hidden">
      {/* Top Traditional Gamosa Border Trim */}
      <div className="gamosa-border" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                onDoubleClick={onOpenAdmin}
                onTouchEnd={handleLogoTouchEnd}
                title="BB Decoration Logo"
                className="w-12 h-12 rounded-xl bg-[#242424] border border-[#D4B16A]/40 flex items-center justify-center overflow-hidden shrink-0 shadow-md cursor-pointer select-none"
              >
                <img
                  src="https://i.ibb.co/ds07wJms/Chat-GPT-Image-Jul-28-2026-10-32-13-PM.png"
                  alt="BB Decoration Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover scale-125 translate-y-[3px]"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className={`text-xl sm:text-2xl font-bold tracking-tight text-[#FAF8F5] leading-tight ${
                  isAssamese ? 'font-assamese' : ''
                }`}>
                  {isAssamese ? 'বি বি ডেকোৰেচন' : 'BB Decoration'}
                </h3>
                <span className="text-xs text-[#D4B16A] tracking-wider uppercase font-semibold -mt-0.5">
                  By Lavish Creation
                </span>
              </div>
            </div>

            <p className={`text-xs text-[#FAF8F5]/70 leading-relaxed ${
              isAssamese ? 'font-assamese' : ''
            }`}>
              {isAssamese
                ? 'অসমৰ প্ৰাচীন কৃষ্টি, পৰম্পৰা আৰু আধুনিক আভিজাত্যক সামৰি প্ৰস্তুত কৰা বিলাসী বৈবাহিক সজ্জা প্রতিষ্ঠান।'
                : 'Pioneering ultra-luxury Assamese wedding decoration, blending handwoven textiles, bell-metal artistry, and contemporary editorial styling.'}
            </p>


          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-widest text-[#D4B16A] ${
              isAssamese ? 'font-assamese text-sm' : ''
            }`}>
              {isAssamese ? 'দ্ৰুত লিংক' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/80">
              <li><a href="#gallery" className="hover:text-[#D4B16A] transition-colors">Showcase Gallery (গ্যালৰী)</a></li>
              <li><a href="#stories" className="hover:text-[#D4B16A] transition-colors">Family Testimonials (গল্প)</a></li>
            </ul>
          </div>

          {/* Col 3: Assam & Regional Hubs */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-widest text-[#D4B16A] ${
              isAssamese ? 'font-assamese text-sm' : ''
            }`}>
              {isAssamese ? 'অফিচ আৰু কাৰ্যালয়' : 'Office Locations'}
            </h4>

            <div className="space-y-3 text-xs text-[#FAF8F5]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4B16A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#FAF8F5] block">Guwahati Office</span>
                  <span>{settings.guwahatiAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-[#D4B16A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#FAF8F5] block">Goalpara Office</span>
                  <span>{settings.goalparaAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Direct Contacts */}
          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest text-[#D4B16A] ${
              isAssamese ? 'font-assamese text-sm' : ''
            }`}>
              {isAssamese ? 'যোগাযোগ কৰক' : 'Direct Contact'}
            </h4>

            <div className="space-y-2 text-xs text-[#FAF8F5]/80">
              <a href={`tel:+${settings.adminWhatsApp}`} className="flex items-center gap-2 hover:text-[#D4B16A] transition-colors">
                <Phone className="w-4 h-4 text-[#D4B16A]" />
                <span>{settings.phoneDisplay}</span>
              </a>

              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-[#D4B16A] transition-colors">
                <Mail className="w-4 h-4 text-[#D4B16A]" />
                <span>{settings.email}</span>
              </a>
            </div>

            <button
              onClick={onOpenConsultation}
              className="w-full bg-[#8C1D18] hover:bg-[#5A0F12] text-[#FAF8F5] py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs border border-[#D4B16A]/40 cursor-pointer"
            >
              <span className={isAssamese ? 'font-assamese font-semibold' : ''}>
                {isAssamese ? 'পৰামৰ্শ বুক কৰক' : 'Book Consultation'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom copyright & tagline */}
        <div className="pt-8 border-t border-[#FAF8F5]/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FAF8F5]/60 gap-4 text-center sm:text-left">
          <p className="font-assamese text-xs text-[#D4B16A]">
            "অসমীয়া পৰম্পৰা, আধুনিক সৌন্দৰ্য" — © 2026 BB Decoration (By Lavish Creation). All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-xs">
            <span className="text-[#D4B16A] font-medium tracking-wide">
              Developed by <span className="text-[#FAF8F5] font-semibold">Devid Saud</span>
            </span>
            <span className="hidden sm:inline text-[#FAF8F5]/30">•</span>
            <a href="#" className="hover:underline text-[#FAF8F5]/60">Privacy Policy</a>
            <span className="text-[#FAF8F5]/30">•</span>
            <a href="#" className="hover:underline text-[#FAF8F5]/60">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
