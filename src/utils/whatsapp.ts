import { getStoredSettings } from './storage';

export const ADMIN_WHATSAPP_NUMBER = '916002483363';
export const DISPLAY_WHATSAPP_NUMBER = '+91 60024 83363';

export interface WhatsAppInquiryData {
  fullName?: string;
  phone?: string;
  email?: string;
  eventDate?: string;
  venueCity?: string;
  customDetails?: string;
  setupTitle?: string;
}

export function buildWhatsAppInquiryMessage(data?: WhatsAppInquiryData): string {
  let message = `Hello Lavish Creation,\nI’m planning a wedding and I’m interested in your decoration work. I’d like to discuss your designs and availability.\nLet me know how we can connect.`;

  if (data?.setupTitle) {
    message += `\n\n📌 Selected Setup: ${data.setupTitle}`;
  }

  if (data?.fullName || data?.phone || data?.eventDate || data?.venueCity) {
    message += `\n\n📋 Client Details:`;
    if (data?.fullName) message += `\n• Name: ${data.fullName}`;
    if (data?.phone) message += `\n• Phone/WhatsApp: ${data.phone}`;
    if (data?.email) message += `\n• Email: ${data.email}`;
    if (data?.eventDate) message += `\n• Event Date: ${data.eventDate}`;
    if (data?.venueCity) message += `\n• Venue City: ${data.venueCity}`;
  }

  if (data?.customDetails) {
    message += `\n\n📝 Custom Notes: ${data.customDetails}`;
  }

  message += `\n\nPlease let me know your availability and catalog details. Thank you!`;

  return message;
}

export function openWhatsAppInquiry(data?: WhatsAppInquiryData) {
  const settings = getStoredSettings();
  const targetNumber = settings.adminWhatsApp || ADMIN_WHATSAPP_NUMBER;
  const text = buildWhatsAppInquiryMessage(data);
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedText}`;

  // Robust link triggering for standard and in-app browsers (Instagram, etc.)
  try {
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_system'; // As outlined in the workaround guide for webviews
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    window.open(whatsappUrl, '_blank');
  }
}


