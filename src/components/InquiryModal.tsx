import React, { useState, useEffect } from 'react';
import { Language, ConsultationRequest, GalleryItem } from '../types';
import { JaapiMotif } from './motifs/JaapiMotif';
import { X, Send, Calendar, MapPin, Phone, User, Mail, CheckCircle2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { openWhatsAppInquiry, DISPLAY_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  prefilledItem?: GalleryItem | null;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  lang,
  prefilledItem,
}) => {
  const isAssamese = lang === 'as';

  const [formData, setFormData] = useState<ConsultationRequest>({
    fullName: '',
    phone: '',
    email: '',
    eventDate: '',
    venueCity: 'Guwahati',
    customDetails: '',
  });

  const [submitted, setSubmitted] = useState(false);

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

  useEffect(() => {
    if (prefilledItem) {
      setFormData(prev => ({
        ...prev,
        customDetails: `Inquiring about exact gallery setup: ${prefilledItem.titleEn} (${prefilledItem.titleAs})`
      }));
    }
  }, [prefilledItem]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Automatically launch WhatsApp with the pre-filled English message
    openWhatsAppInquiry({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      eventDate: formData.eventDate,
      venueCity: formData.venueCity,
      customDetails: formData.customDetails,
      setupTitle: prefilledItem?.titleEn,
    });
  };

  const handleDirectWhatsApp = () => {
    openWhatsAppInquiry({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      eventDate: formData.eventDate,
      venueCity: formData.venueCity,
      customDetails: formData.customDetails,
      setupTitle: prefilledItem?.titleEn,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#242424]/80 backdrop-blur-md flex flex-col items-center justify-center p-2.5 sm:p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-[#FAF8F5] rounded-2xl sm:rounded-3xl max-w-2xl w-full border-2 border-[#D8C2A3] shadow-2xl relative overflow-hidden my-auto max-h-[92dvh] flex flex-col min-h-0"
        >
          {/* Top Gamosa Accent Line */}
          <div className="gamosa-border shrink-0" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#F7F2EA] hover:bg-[#8C1D18] hover:text-[#FAF8F5] transition-colors text-[#3A2F28] min-w-[40px] min-h-[40px] flex items-center justify-center shadow-xs"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-5 sm:p-8 md:p-10 overflow-y-auto">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <JaapiMotif size={36} />
                </div>

                <h3 className={`text-2xl md:text-3xl font-bold text-[#242424] font-serif-playfair mb-2 ${
                  isAssamese ? 'font-assamese text-3xl' : ''
                }`}>
                  {isAssamese ? 'পৰামৰ্শ আৰু প্ৰস্তাৱ বুক কৰক' : 'Request Luxury Consultation'}
                </h3>

                <p className={`text-xs md:text-sm text-[#3A2F28]/80 ${
                  isAssamese ? 'font-assamese' : ''
                }`}>
                  {isAssamese
                    ? 'আমাৰ ডে কৰ ডাইৰেক্টৰে ১২ ঘণ্টাৰ ভিতৰত আপোনাৰ সৈতে যোগাযোগ কৰি বিশেষ পৰিকল্পনা আগবঢ়াব।'
                    : 'Our decor directors will connect within 12 hours to curate your bespoke Assamese wedding experience.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#B68C4A] mb-1">
                    <span className={isAssamese ? 'font-assamese' : ''}>
                      {isAssamese ? 'সম্পূৰ্ণ নাম' : 'Full Name'} *
                    </span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#B68C4A] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={isAssamese ? 'যেনে: ড° নিৰঞ্জন শৰ্মা' : 'e.g. Dr. Niranjan Sharma'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F2EA] border border-[#D8C2A3] text-xs md:text-sm text-[#242424] focus:outline-none focus:border-[#8C1D18]"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#B68C4A] mb-1">
                      <span className={isAssamese ? 'font-assamese' : ''}>
                        {isAssamese ? 'ফোন / হোৱাটছএপ নম্বৰ' : 'Phone / WhatsApp'} *
                      </span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#B68C4A] absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 60024 83363"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F2EA] border border-[#D8C2A3] text-xs md:text-sm text-[#242424] focus:outline-none focus:border-[#8C1D18]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#B68C4A] mb-1">
                      <span className={isAssamese ? 'font-assamese' : ''}>
                        {isAssamese ? 'ইমেইল ঠিকনা' : 'Email Address'}
                      </span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#B68C4A] absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F2EA] border border-[#D8C2A3] text-xs md:text-sm text-[#242424] focus:outline-none focus:border-[#8C1D18]"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#B68C4A] mb-1">
                      <span className={isAssamese ? 'font-assamese' : ''}>
                        {isAssamese ? 'অনুষ্ঠানৰ তাৰিখ' : 'Event Date'} *
                      </span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#B68C4A] absolute left-3.5 top-3.5" />
                      <input
                        type="date"
                        required
                        value={formData.eventDate}
                        onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F2EA] border border-[#D8C2A3] text-xs md:text-sm text-[#242424] focus:outline-none focus:border-[#8C1D18]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#B68C4A] mb-1">
                      <span className={isAssamese ? 'font-assamese' : ''}>
                        {isAssamese ? 'স্থান / নগৰ' : 'Venue City'} *
                      </span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#B68C4A] absolute left-3.5 top-3.5" />
                      <select
                        value={formData.venueCity}
                        onChange={e => setFormData({ ...formData, venueCity: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F2EA] border border-[#D8C2A3] text-xs md:text-sm text-[#242424] focus:outline-none focus:border-[#8C1D18]"
                      >
                        <option value="Guwahati">Guwahati (গুৱাহাটী)</option>
                        <option value="Jorhat">Jorhat (যোৰহাট)</option>
                        <option value="Dibrugarh">Dibrugarh (ডিব্ৰুগড়)</option>
                        <option value="Tezpur">Tezpur (তেজপুৰ)</option>
                        <option value="Silchar">Silchar (শিলচৰ)</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Other">Other Venue (অন্য স্থান)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#B68C4A] mb-1">
                    <span className={isAssamese ? 'font-assamese' : ''}>
                      {isAssamese ? 'বিশেষ পছন্দ / তথ্য' : 'Custom Preferences or Notes'}
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.customDetails}
                    onChange={e => setFormData({ ...formData, customDetails: e.target.value })}
                    placeholder={isAssamese ? 'যেনে: প্ৰৱেশদ্বাৰত ৪টা শৰাই আৰু বগা অৰ্কিডৰ বিশেষ প্ৰয়োজন...' : 'Tell us about venue layout, specific flowers, or guest capacity...'}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F2EA] border border-[#D8C2A3] text-xs md:text-sm text-[#242424] focus:outline-none focus:border-[#8C1D18]"
                  />
                </div>

                {/* Submit CTAs */}
                <div className="space-y-3 mt-6">
                  <button
                    type="submit"
                    className="w-full bg-[#8C1D18] hover:bg-[#5A0F12] text-[#FAF8F5] py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#D4B16A]/40"
                  >
                    <MessageCircle className="w-4 h-4 text-[#D4B16A]" />
                    <span className={isAssamese ? 'font-assamese font-semibold text-base' : ''}>
                      {isAssamese ? 'হোৱাটছএপত বুক কৰক (WhatsApp Open)' : `Submit & Open WhatsApp (${DISPLAY_WHATSAPP_NUMBER})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Instant WhatsApp Message ({DISPLAY_WHATSAPP_NUMBER})</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Success Receipt Preview */
            <div className="text-center py-6 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#8C1D18] text-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <CheckCircle2 className="w-10 h-10 text-[#D4B16A]" />
              </div>

              <span className="text-xs font-semibold text-[#8C1D18] tracking-widest uppercase block mb-1">
                Consultation Request Prepared
              </span>

              <h3 className={`text-2xl md:text-3xl font-bold text-[#242424] font-serif-playfair mb-3 ${
                isAssamese ? 'font-assamese' : ''
              }`}>
                {isAssamese ? 'ধন্যবাদ! হোৱাটছএপত পঠিয়াওক' : 'WhatsApp Message Ready!'}
              </h3>

              <p className={`text-sm text-[#3A2F28]/80 max-w-md mx-auto mb-6 ${
                isAssamese ? 'font-assamese' : ''
              }`}>
                {isAssamese
                  ? `শ্ৰীযুত/শ্ৰীমতী ${formData.fullName}, আপোনাৰ বিয়াৰ সজ্জা অনুৰোধ হোৱাটছএপ নম্বৰ ${DISPLAY_WHATSAPP_NUMBER} লৈ প্ৰেৰণ কৰা হৈছে।`
                  : `Dear ${formData.fullName}, WhatsApp should have opened automatically. If not, click below to send your pre-filled inquiry directly to ${DISPLAY_WHATSAPP_NUMBER}.`}
              </p>

              {/* Consultation Reference Card */}
              <div className="bg-[#F7F2EA] p-6 rounded-2xl border border-[#D8C2A3] text-left max-w-md mx-auto mb-6 text-xs space-y-2">
                <div className="flex justify-between border-b border-[#D8C2A3]/40 pb-2">
                  <span className="text-[#3A2F28]/60">Target Admin WhatsApp:</span>
                  <span className="font-mono font-bold text-[#8C1D18]">{DISPLAY_WHATSAPP_NUMBER}</span>
                </div>
                <div className="flex justify-between border-b border-[#D8C2A3]/40 pb-2">
                  <span className="text-[#3A2F28]/60">Client:</span>
                  <span className="font-semibold">{formData.fullName || 'Valued Client'} ({formData.phone || 'N/A'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A2F28]/60">Venue City:</span>
                  <span className="font-semibold">{formData.venueCity}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleDirectWhatsApp}
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-full text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Re-open WhatsApp ({DISPLAY_WHATSAPP_NUMBER})</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-[#3A2F28] hover:bg-[#242424] text-[#FAF8F5] px-6 py-3 rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  Close Summary
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
  );
};
