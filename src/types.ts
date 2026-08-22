export type Language = 'as' | 'en';

export type DecorCategory = 'all' | 'entrance' | 'mandap' | 'stage' | 'sitting_area' | 'reception';

export interface GalleryItem {
  id: string;
  titleAs: string;
  titleEn: string;
  category: DecorCategory;
  image: string;
  descriptionAs: string;
  descriptionEn: string;
  elements: string[];
  enabled?: boolean;
}

export interface DecorPackage {
  id: string;
  nameAs: string;
  nameEn: string;
  taglineAs: string;
  taglineEn: string;
  featuredImage: string;
  highlightsAs: string[];
  highlightsEn: string[];
  popular?: boolean;
}

export interface ConsultationRequest {
  fullName: string;
  phone: string;
  email: string;
  eventDate: string;
  venueCity: string;
  selectedPackage?: string;
  customDetails?: string;
}

export type PaymentStatus = 'Pending' | 'Partially Paid' | 'Fully Paid';
export type ProjectStatus = 'Inquiry' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Client {
  id: string;
  name: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  projectName: string;
  fullPayment: number;
  advancePayment: number;
  remainingPayment: number;
  paymentStatus: PaymentStatus;
  projectStatus: ProjectStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

