import React, { useState } from 'react';
import {
  PlusCircle,
  Building2,
  FileCheck,
  Calendar,
  MessageSquare,
  Sparkles,
  MapPin,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Upload,
  Layers,
  ChevronRight,
  AlertTriangle,
  X,
  Loader2,
  Phone,
} from 'lucide-react';
import { Property, UserProfile, SiteVisit, Conversation } from '../types';
import { propertyService } from '../services/propertyService';
import { siteVisitService } from '../services/siteVisitService';
import { Settings } from 'lucide-react';

interface SellerStudioViewProps {
  currentUser: UserProfile;
  sellerProperties: Property[];
  siteVisits: SiteVisit[];
  conversations?: Conversation[];
  onOpenChat?: (conv: Conversation) => void;
  onSelectProperty: (property: Property) => void;
  onRefreshData: () => void;
  onOpenCreateWizard: () => void;
  onOpenProfileModal?: () => void;
}

export const SellerStudioView: React.FC<SellerStudioViewProps> = ({
  currentUser,
  sellerProperties,
  siteVisits,
  conversations = [],
  onOpenChat,
  onSelectProperty,
  onRefreshData,
  onOpenCreateWizard,
  onOpenProfileModal,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'visits' | 'chats'>('listings');
  const [updatingVisitId, setUpdatingVisitId] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleUpdateVisitStatus = async (visitId: string, status: any) => {
    setUpdatingVisitId(visitId);
    try {
      await siteVisitService.updateStatus(visitId, status);
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingVisitId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    const targetTitle = propertyToDelete.title;
    try {
      await propertyService.deleteProperty(propertyToDelete.id);
      setPropertyToDelete(null);
      showNotification(`"${targetTitle}" has been permanently deleted.`);
      onRefreshData();
    } catch (e) {
      console.error('Delete error:', e);
      showNotification('Failed to delete property. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="liquid-glass-dark rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.25)] relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Pattadar Seller Studio</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              Direct Landowner Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome back, <span className="font-bold text-white">{currentUser.displayName}</span>. Manage your published land listings, review AI Dharani verifications, chat with prospective buyers, and coordinate physical site visit bookings.
          </p>
          {currentUser.phone && (
            <p className="text-xs text-emerald-400 font-mono flex items-center space-x-1.5 pt-1">
              <span>📞 Landowner Contact Number: {currentUser.phone}</span>
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3 shrink-0 relative z-10">
          {onOpenProfileModal && (
            <button
              onClick={onOpenProfileModal}
              className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 border border-white/20 backdrop-blur-md transition-all spring-press cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              <span>Edit Landowner Profile</span>
            </button>
          )}

          <button
            onClick={onOpenCreateWizard}
            className="px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all spring-press shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ List New Land Parcel</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="liquid-glass-card hover-card-glass p-6 rounded-3xl border border-white/80 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Active Published Listings
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
            {sellerProperties.length}
          </p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">100% Direct Pattadar Ownership</p>
        </div>

        <div className="liquid-glass-card hover-card-glass p-6 rounded-3xl border border-white/80 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Active Buyer Inquiries
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
            {conversations.length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Direct private conversations</p>
        </div>

        <div className="liquid-glass-card hover-card-glass p-6 rounded-3xl border border-white/80 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Scheduled Site Visits
          </span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1 font-mono tracking-tight">
            {siteVisits.length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Direct buyer bookings</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-full backdrop-blur-md max-w-fit space-x-1 border border-slate-200/60">
        <button
          onClick={() => setActiveTab('listings')}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all spring-press flex items-center space-x-2 cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Land Listings ({sellerProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all spring-press flex items-center space-x-2 cursor-pointer ${
            activeTab === 'chats'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Buyer Messages & Chats ({conversations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all spring-press flex items-center space-x-2 cursor-pointer ${
            activeTab === 'visits'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Site Visit Requests ({siteVisits.length})</span>
        </button>
      </div>

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {sellerProperties.length === 0 ? (
            <div className="p-12 liquid-glass-card rounded-3xl border border-white/80 text-center space-y-3 shadow-sm">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No properties listed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Publish your first certified land parcel with Dharani passbook upload and 3D boundary coordinates.
              </p>
              <button
                onClick={onOpenCreateWizard}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 shadow-sm spring-press cursor-pointer"
              >
                Create Listing Now
              </button>
            </div>
          ) : (
            sellerProperties.map((property) => (
              <div
                key={property.id}
                className="liquid-glass-card hover-card-glass rounded-3xl border border-white/80 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-indigo-200 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      property.coverPhoto ||
                      property.photos?.[0] ||
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={property.title}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-inner"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white capitalize">
                        {property.purpose}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600">
                        {property.locality}, {property.district}
                      </span>
                      {property.documentVerifiedPercentage && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{property.documentVerifiedPercentage}% Verified</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-500">
                      {property.surveyNumber || 'Sy. No. Demarcated'} • {property.landSize} {property.landUnit}
                    </p>
                    <p className="text-xs font-extrabold text-slate-900">
                      Asking: <span className="font-mono text-indigo-600">{formatINR(property.askingPrice)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
                  <button
                    onClick={() => onSelectProperty(property)}
                    className="px-4 py-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-2xs spring-press cursor-pointer"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setPropertyToDelete(property)}
                    className="p-2.5 rounded-full text-rose-600 hover:bg-rose-50 border border-rose-200/80 bg-white/80 backdrop-blur-md shadow-2xs transition-colors spring-press cursor-pointer"
                    title="Delete Land Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Buyer Chats */}
      {activeTab === 'chats' && (
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <div className="p-12 liquid-glass-card rounded-3xl border border-white/80 text-center space-y-2 shadow-sm">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No buyer messages yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When prospective buyers inquire about your land parcels, their direct messages will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conversations.map((conv) => {
                const hasPhoneRequest = conv.lastMessage?.toLowerCase().includes('phone') || conv.lastMessage?.toLowerCase().includes('contact number');
                return (
                  <div
                    key={conv.id}
                    onClick={() => onOpenChat && onOpenChat(conv)}
                    className={`liquid-glass-card hover-card-glass rounded-3xl border p-5 shadow-sm hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between group spring-press ${
                      hasPhoneRequest ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20' : 'border-white/80'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-100 shadow-2xs">
                            {conv.buyerName?.charAt(0) || 'B'}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {conv.buyerName || 'Prospective Buyer'}
                            </h4>
                            <span className="text-[10px] text-slate-500">{conv.propertyLocation || 'Telangana'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {hasPhoneRequest && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center space-x-1 border border-amber-200">
                              <Phone className="w-3 h-3 text-amber-600" />
                              <span>Phone Requested</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">
                            {conv.lastMessageTimestamp
                              ? new Date(conv.lastMessageTimestamp).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : ''}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50/80 backdrop-blur-md rounded-2xl border border-slate-100">
                        <p className="text-[11px] font-bold text-slate-800 truncate mb-1">
                          Parcel: {conv.propertyTitle}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 italic">
                          "{conv.lastMessage || 'Direct inquiry started'}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-3">
                      <span className="text-[10px] font-bold text-indigo-600 flex items-center space-x-1">
                        <span>Open Protected Chat</span>
                        {hasPhoneRequest && <span className="text-amber-600 font-bold">• Action Needed</span>}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Site Visits */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          {siteVisits.length === 0 ? (
            <div className="p-12 liquid-glass-card rounded-3xl border border-white/80 text-center space-y-2 shadow-sm">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No site visits requested yet</h3>
              <p className="text-xs text-slate-500">
                When prospective buyers request a physical land inspection, bookings will appear here for confirmation.
              </p>
            </div>
          ) : (
            siteVisits.map((visit) => (
              <div
                key={visit.id}
                className="liquid-glass-card hover-card-glass rounded-3xl border border-white/80 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        visit.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : visit.status === 'COMPLETED'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {visit.status}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">{visit.propertyTitle}</span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Buyer: <span className="font-semibold">{visit.buyerName}</span> ({visit.buyerPhone || 'Requested in Chat'})
                  </p>

                  <p className="text-xs text-slate-500 font-mono">
                    Scheduled Date: {visit.date} • Slot: {visit.timeSlot}
                  </p>

                  {visit.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                      Buyer Note: "{visit.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2.5 self-end sm:self-center">
                  {visit.status === 'REQUESTED' && (
                    <>
                      <button
                        onClick={() => handleUpdateVisitStatus(visit.id, 'CONFIRMED')}
                        disabled={updatingVisitId === visit.id}
                        className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm spring-press cursor-pointer"
                      >
                        Accept Visit
                      </button>
                      <button
                        onClick={() => handleUpdateVisitStatus(visit.id, 'DECLINED')}
                        disabled={updatingVisitId === visit.id}
                        className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 spring-press cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {visit.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateVisitStatus(visit.id, 'COMPLETED')}
                      disabled={updatingVisitId === visit.id}
                      className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm spring-press cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 liquid-glass-dark text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Custom Confirmation Modal to Delete Listing */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass-card bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-white/90 space-y-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => !isDeleting && setPropertyToDelete(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Confirm Land Deletion</h3>
                <p className="text-xs text-slate-500">Permanent action • Cannot be undone</p>
              </div>
            </div>

            {/* Land Parcel Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50/80 backdrop-blur-md border border-slate-200/80 flex items-center space-x-3.5">
              <img
                src={
                  propertyToDelete.coverPhoto ||
                  propertyToDelete.photos?.[0] ||
                  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80'
                }
                alt={propertyToDelete.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-inner"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {propertyToDelete.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {propertyToDelete.locality}, {propertyToDelete.district}
                </p>
                <div className="flex items-center space-x-2 text-[11px] font-mono">
                  <span className="text-slate-600">{propertyToDelete.landSize} {propertyToDelete.landUnit}</span>
                  <span>•</span>
                  <span className="font-bold text-indigo-700">{formatINR(propertyToDelete.askingPrice)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this listing? It will be removed from your Seller Studio, public catalog, and buyer search results.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors spring-press cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all spring-press flex items-center space-x-2 cursor-pointer disabled:opacity-50"
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
