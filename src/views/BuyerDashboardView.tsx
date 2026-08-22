import React, { useState } from 'react';
import {
  Bookmark,
  MessageSquare,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  Trash2,
} from 'lucide-react';
import { UserProfile, SavedProperty, Conversation, SiteVisit, Property } from '../types';
import { Settings } from 'lucide-react';

interface BuyerDashboardViewProps {
  currentUser: UserProfile;
  savedProperties: SavedProperty[];
  conversations: Conversation[];
  siteVisits: SiteVisit[];
  onSelectPropertyId: (id: string) => void;
  onOpenChat: (conv: Conversation) => void;
  onNavigateTab: (tab: string) => void;
  onUnsaveProperty: (propId: string) => void;
  onOpenProfileModal?: () => void;
}

export const BuyerDashboardView: React.FC<BuyerDashboardViewProps> = ({
  currentUser,
  savedProperties,
  conversations,
  siteVisits,
  onSelectPropertyId,
  onOpenChat,
  onNavigateTab,
  onUnsaveProperty,
  onOpenProfileModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'chats' | 'visits'>('saved');

  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Greeting Banner */}
      <div className="liquid-glass-dark rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.25)] relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Buyer Command Hub</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              Verified Buyer Account
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome back, <span className="font-bold text-white">{currentUser.displayName}</span>. Monitor your bookmarked land parcels, direct owner conversations, and confirmed physical site inspections.
          </p>
          {currentUser.phone ? (
            <p className="text-xs text-emerald-400 font-mono flex items-center space-x-1.5 pt-1">
              <span>📞 Contact Number: {currentUser.phone}</span>
            </p>
          ) : (
            <p className="text-xs text-amber-300 font-medium flex items-center space-x-1.5 pt-1">
              <span>⚠️ No phone number in profile. Add phone to easily share contacts with landowners.</span>
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
              <span>Edit Profile & Phone</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('recommendations')}
            className="px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all spring-press shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Open AI Matchmaker</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="liquid-glass-card hover-card-glass p-6 rounded-3xl border border-white/80 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Saved Properties
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
            {savedProperties.length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Bookmarked for evaluation</p>
        </div>

        <div className="liquid-glass-card hover-card-glass p-6 rounded-3xl border border-white/80 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Active Seller Conversations
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
            {conversations.length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Direct inquiries</p>
        </div>

        <div className="liquid-glass-card hover-card-glass p-6 rounded-3xl border border-white/80 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Site Visits Scheduled
          </span>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1 font-mono tracking-tight">
            {siteVisits.length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Physical inspections</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-full backdrop-blur-md max-w-fit space-x-1 border border-slate-200/60">
        <button
          onClick={() => setActiveSubTab('saved')}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all spring-press flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'saved'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Land ({savedProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chats')}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all spring-press flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'chats'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Direct Messages ({conversations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('visits')}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all spring-press flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'visits'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Physical Site Visits ({siteVisits.length})</span>
        </button>
      </div>

      {/* Tab 1: Saved Properties */}
      {activeSubTab === 'saved' && (
        <div className="space-y-4">
          {savedProperties.length === 0 ? (
            <div className="p-12 liquid-glass-card rounded-3xl border border-white/80 text-center space-y-3 shadow-sm">
              <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No saved properties yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore Telangana growth corridors and bookmark properties to track price benchmarks and document checks.
              </p>
              <button
                onClick={() => onNavigateTab('discover')}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 shadow-sm spring-press"
              >
                Browse Available Land
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((item) => {
                const p = item.propertyData;
                return (
                  <div
                    key={item.id}
                    className="liquid-glass-card hover-card-glass rounded-3xl border border-white/80 shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={
                            p.coverPhoto ||
                            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <button
                          onClick={() => onUnsaveProperty(p.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/70 backdrop-blur-md text-white hover:bg-rose-600 transition-colors spring-press"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[10px] flex items-center space-x-1.5 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                          <span>{p.documentVerifiedPercentage || 96}% Verified</span>
                        </span>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center space-x-1.5 text-xs text-indigo-600 font-bold">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{p.locality}, {p.district}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">
                          {p.landSize} {p.landUnit} • {formatINR(p.askingPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-3 border-t border-slate-100/80 flex justify-end">
                      <button
                        onClick={() => onSelectPropertyId(p.id)}
                        className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20 spring-press cursor-pointer"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Conversations */}
      {activeSubTab === 'chats' && (
        <div className="space-y-3">
          {conversations.length === 0 ? (
            <div className="p-12 liquid-glass-card rounded-3xl border border-white/80 text-center space-y-2 shadow-sm">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No active conversations</h3>
              <p className="text-xs text-slate-500">
                You can start direct messaging with landowners from any property detail page.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onOpenChat(conv)}
                className="liquid-glass-card hover-card-glass rounded-3xl border border-white/80 p-5 shadow-sm hover:border-indigo-300 transition-all flex items-center justify-between cursor-pointer spring-press"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/20">
                    {(conv.sellerName || 'S').charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{conv.sellerName || 'Landowner'}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{conv.propertyTitle}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Site Visits */}
      {activeSubTab === 'visits' && (
        <div className="space-y-3">
          {siteVisits.length === 0 ? (
            <div className="p-12 liquid-glass-card rounded-3xl border border-white/80 text-center space-y-2 shadow-sm">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No site visits requested yet</h3>
              <p className="text-xs text-slate-500">
                Schedule physical land inspections with verified coordinates and physical boundary verification.
              </p>
            </div>
          ) : (
            siteVisits.map((visit) => (
              <div
                key={visit.id}
                className="liquid-glass-card hover-card-glass rounded-3xl border border-white/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
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
                    <h4 className="font-extrabold text-sm text-slate-900">{visit.propertyTitle}</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Seller: <span className="font-semibold">{visit.sellerName}</span> • Location: {visit.propertyLocation}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    Scheduled Date: {visit.date} ({visit.timeSlot})
                  </p>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => onSelectPropertyId(visit.propertyId)}
                    className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-all spring-press"
                  >
                    View Listing Details →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
