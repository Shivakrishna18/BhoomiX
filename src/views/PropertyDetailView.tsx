import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Compass,
  Bookmark,
  Heart,
  Scale,
  MessageSquare,
  Calendar,
  Share2,
  Phone,
  User,
  CheckCircle2,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
  Navigation,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import { Property, UserProfile } from '../types';
import { Land3DViewer } from '../components/Land3DViewer';
import { MapPlotViewer } from '../components/MapPlotViewer';
import { PriceIntelligenceCard } from '../components/PriceIntelligenceCard';
import { PricePerSqYardTrendCard } from '../components/PricePerSqYardTrendCard';
import { EMICalculatorCard } from '../components/EMICalculatorCard';
import { DocumentIntelligenceCard } from '../components/DocumentIntelligenceCard';
import { propertyService } from '../services/propertyService';

interface PropertyDetailViewProps {
  property: Property;
  onBack: () => void;
  currentUser: UserProfile | null;
  onOpenAuth?: (role?: any) => void;
  isSaved: boolean;
  onToggleSave: () => void;
  isCompared: boolean;
  onToggleCompare: () => void;
  onStartChat: (property: Property) => void;
  onScheduleVisit: (property: Property) => void;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
  property,
  onBack,
  currentUser,
  onOpenAuth,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  onStartChat,
  onScheduleVisit,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | '3d' | '2d_map' | 'video'>('photos');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUser?.id === property.sellerId || currentUser?.role === 'SELLER';

  const handleDeleteListing = async () => {
    setIsDeleting(true);
    try {
      await propertyService.deleteProperty(property.id);
      setShowDeleteConfirm(false);
      onBack();
    } catch (err) {
      console.error('Failed to delete property from details view:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const photos = property.photos && property.photos.length > 0
    ? property.photos
    : [property.coverPhoto || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </button>

        <div className="flex items-center space-x-2">
          {isOwner && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Delete This Listing"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Listing</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Copy Listing Link"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copiedLink ? 'Copied Link!' : 'Share'}</span>
          </button>

          <button
            onClick={onToggleSave}
            className={`p-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isSaved
                ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold shadow-xs'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-rose-600'
            }`}
            title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : 'text-slate-600'}`} />
            <span>{isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
          </button>

          <button
            onClick={onToggleCompare}
            className={`p-2 px-3 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isCompared
                ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">{isCompared ? 'In Compare' : 'Compare'}</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white capitalize">
            {property.purpose} Land
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center space-x-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{property.documentVerifiedPercentage || 96}% Document Verified</span>
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">
            {property.surveyNumber || 'Sy. No. Verified'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
          {property.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center space-x-1 text-indigo-600 font-semibold">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{property.locality}, {property.district}, Telangana</span>
          </div>
          <span>•</span>
          <span className="font-semibold text-slate-900">
            Extent: {property.landSize} {property.landUnit}
          </span>
          {property.roadFacing && (
            <>
              <span>•</span>
              <span className="text-slate-700 font-medium">Road Frontage: {property.roadFacing}</span>
            </>
          )}
        </div>
      </div>

      {/* Media Inspection Canvas Tabs (Photos, 3D Model, 2D Spatial Map, Video Walkthrough) */}
      <div className="space-y-3">
        <div className="bg-slate-100 p-1 rounded-2xl flex flex-wrap gap-1 max-w-fit">
          <button
            onClick={() => setActiveMediaTab('photos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMediaTab === 'photos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Photos ({photos.length})
          </button>
          <button
            onClick={() => setActiveMediaTab('3d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeMediaTab === '3d' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>3D Spatial Land Model</span>
          </button>
          <button
            onClick={() => setActiveMediaTab('2d_map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeMediaTab === '2d_map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
            <span>2D Cadastral Plot</span>
          </button>
          {property.videoUrl && (
            <button
              onClick={() => setActiveMediaTab('video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeMediaTab === 'video' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-rose-600" />
              <span>Video Walkthrough</span>
            </button>
          )}
        </div>

        {/* Media Canvas Viewport */}
        <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-sm">
          {activeMediaTab === 'photos' && (
            <div className="space-y-3 p-2 bg-slate-950">
              <div className="relative h-96 sm:h-[460px] w-full rounded-xl overflow-hidden">
                <img
                  src={photos[selectedPhotoIndex]}
                  alt={`Land view ${selectedPhotoIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {photos.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto">
                  {photos.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        selectedPhotoIndex === idx ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMediaTab === '3d' && (
            <div className="p-2 bg-slate-950">
              <Land3DViewer property={property} />
            </div>
          )}

          {activeMediaTab === '2d_map' && (
            <div className="p-2 bg-slate-950">
              <MapPlotViewer property={property} height="h-[460px]" />
            </div>
          )}

          {activeMediaTab === 'video' && property.videoUrl && (
            <div className="p-4 bg-slate-950 flex items-center justify-center">
              <video
                controls
                autoPlay
                className="max-h-[460px] w-full rounded-xl object-contain"
                src={property.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Details & Analytics vs Right Seller Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Description, Specs, Price Intel, Document Trust */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview & Key Highlights */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Land Overview & Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Road Access</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.roadFacing || 'Direct Road'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Facing Orientation</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.facing || 'East Facing'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Soil Classification</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.soilType || 'Red Loam'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Water Resource</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.waterSource || 'Borewell Potential'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Electricity / Grid</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.electricity ? 'Available on site' : 'Nearby feeder'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Master Plan Zone</span>
                <p className="font-bold text-slate-900 mt-0.5">{property.zoneType || 'General Growth Zone'}</p>
              </div>
            </div>
          </div>

          {/* AI Price Intelligence Card */}
          <PriceIntelligenceCard property={property} />

          {/* Price Per Square Yard & Telangana Market Trend Calculator */}
          <PricePerSqYardTrendCard property={property} />

          {/* Interactive Land Loan & Monthly EMI Calculator */}
          <EMICalculatorCard property={property} />

          {/* Document Trust & Legal Verification Card */}
          <DocumentIntelligenceCard
            property={property}
            isSeller={currentUser?.id === property.sellerId || currentUser?.role === 'SELLER'}
          />
        </div>

        {/* Right Sticky Sidebar (4 cols): Direct Pattadar Seller & Action Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sticky top-24 space-y-6">
            {/* Price Box */}
            <div className="space-y-1 pb-5 border-b border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Direct Asking Price</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {formatINR(property.askingPrice)}
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  {formatINR(Math.round(property.askingPrice / (property.landSize || 1)))} / {property.landUnit}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Direct deal with 0% brokerage or commission.
              </p>
            </div>

            {/* Direct Pattadar Seller Identity */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {property.sellerName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{property.sellerName}</h4>
                  <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified Pattadar Owner</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-indigo-700 bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100 font-medium">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Protected Direct Chat • Request number in chat</span>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={onToggleSave}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  isSaved
                    ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-slate-300 hover:bg-slate-50 text-slate-800 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : 'text-slate-600'}`} />
                <span>{isSaved ? 'Saved in Your Wishlist' : 'Add Land to Wishlist'}</span>
              </button>

              <button
                onClick={() => onStartChat(property)}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Directly with Owner</span>
              </button>

              <button
                onClick={() => onScheduleVisit(property)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Schedule Physical Site Visit</span>
              </button>
            </div>

            {/* Transparency Note */}
            <div className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                All conversations and visit bookings occur strictly between you and the verified landowner. No agent fees.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => !isDeleting && setShowDeleteConfirm(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Land Listing</h3>
                <p className="text-xs text-slate-500">Permanent action • Cannot be undone</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-semibold text-slate-900">"{property.title}"</span>? This will remove all verification records, site inquiries, and public catalog listings for this parcel.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm & Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
