export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type LandUnit = 'sq_yards' | 'acres' | 'guntas' | 'sq_feet';
export type LandPurpose = 'residential' | 'commercial' | 'agricultural' | 'industrial' | 'investment' | 'any';
export type PropertyStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'UNPUBLISHED' | 'SOLD' | 'ARCHIVED';

export interface BoundaryPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface Property {
  id: string;
  sellerId: string; // Authenticated User ID
  sellerUserId?: string; // Canonical user reference
  sellerName: string; // Owner / Pattadar Name
  ownerName?: string; // Explicit owner field
  sellerEmail?: string; // Optional email
  sellerPhone?: string; // Mobile / WhatsApp
  title: string;
  description: string;
  state: string;
  district: string;
  city?: string;
  locality: string;
  address?: string;
  surveyNumber?: string;
  landSize: number;
  landUnit: LandUnit;
  purpose: LandPurpose;
  askingPrice: number; // Canonical numeric price in INR
  pricePerUnit: number; // Price per unit in INR
  referenceValue?: number;
  latitude: number;
  longitude: number;
  boundary?: BoundaryPoint[];
  photos: string[];
  coverPhoto?: string;
  videoUrl?: string; // Optional video walkthrough URL
  roadFacing?: string;
  facing?: string;
  zoneType?: string;
  soilType?: string;
  waterSource?: string;
  electricity?: boolean;
  clearTitle?: boolean;
  trustScore?: number;
  documentVerifiedPercentage?: number;
  verificationBadges?: string[];
  isDemo?: boolean;
  status: PropertyStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  sellerId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  status: 'DRAFT' | 'UPLOADING' | 'PROCESSING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'UPLOADED' | 'VERIFIED_REF';
  analysisSummary?: DocumentAnalysis;
  createdAt: string;
}

export interface DocumentAnalysis {
  documentTypeDetected: string;
  confidenceScore: number;
  extractedDetails: {
    surveyNumber?: string;
    extent?: string;
    ownerName?: string;
    village?: string;
    district?: string;
    registrationDate?: string;
    sroOffice?: string;
  };
  consistencyChecks: {
    check: string;
    status: 'MATCH' | 'WARNING' | 'UNVERIFIED';
    detail: string;
  }[];
  potentialRisks: string[];
  referenceVerification: {
    dharaniOrGovtMatch: 'LIKELY_MATCH' | 'PARTIAL_MATCH' | 'UNABLE_TO_VERIFY';
    notes: string;
  };
  summary: string;
  recommendedNextSteps: string[];
}

export interface PriceIntelligence {
  normalizedPricePerUnit: number;
  unitLabel: string;
  marketRangeMin: number;
  marketRangeMax: number;
  referenceGovtValue: number;
  valuationVerdict: 'POTENTIALLY_GOOD_VALUE' | 'BROADLY_IN_RANGE' | 'POTENTIALLY_OVERPRICED' | 'UNUSUALLY_LOW';
  verdictExplanation: string;
  estimatedAdditionalCosts: {
    stampDutyAndRegistration: number;
    legalAndDueDiligence: number;
    boundarySurveyAndFencing: number;
    totalEstimatedAcquisitionCost: number;
  };
  growthCatalysts: string[];
  priceConfidence: number;
}

export interface BuyerPreferences {
  id: string;
  userId: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredStates?: string;
  preferredDistricts?: string;
  preferredLocalities?: string;
  landSizeMin?: number;
  landSizeMax?: number;
  landUnit?: LandUnit;
  purpose?: LandPurpose;
  investmentHorizon?: string;
  roadAccessibility?: string;
  documentRiskPreference?: 'strict_verified_only' | 'moderate' | 'all';
  updatedAt?: string;
}

export interface AIRecommendation {
  propertyId: string;
  matchScore: number;
  fitHighlights: string[];
  reasoning: string;
  pros: string[];
  considerations: string;
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  createdAt: string;
  updatedAt?: string;
}

export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'DOCUMENT'
  | 'PHONE_NUMBER_REQUEST'
  | 'PHONE_NUMBER_SHARED'
  | 'SITE_VISIT_REQUEST'
  | 'SITE_VISIT_CONFIRMED'
  | 'SITE_VISIT_DECLINED';

export interface ChatMediaAttachment {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  fileType: 'image' | 'document' | 'pdf';
  previewUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  messageType?: MessageType;
  mediaAttachment?: ChatMediaAttachment;
  requestStatus?: 'PENDING' | 'APPROVED' | 'DECLINED';
  metadata?: {
    phoneNumber?: string;
    requestedNumber?: string;
    senderRole?: 'BUYER' | 'SELLER';
    requesterName?: string;
    requesterPhone?: string;
    visitDate?: string;
    visitTime?: string;
    notes?: string;
    visitId?: string;
    mediaUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    [key: string]: any;
  };
  read?: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'MESSAGE' | 'PHONE_REQUEST' | 'PHONE_SHARED' | 'VISIT_REQUEST' | 'VISIT_CONFIRMED' | 'VISIT_DECLINED';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  propertyId?: string;
  conversationId?: string;
}

export type SiteVisitStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'DECLINED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface SiteVisit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  sellerId: string;
  sellerName: string;
  date: string;
  timeSlot: string;
  notes?: string;
  sellerRemarks?: string;
  status: SiteVisitStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedProperty {
  id: string;
  userId: string;
  propertyId: string;
  propertyData?: Partial<Property>;
  createdAt: string;
}
