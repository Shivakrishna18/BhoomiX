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

interface BuyerDashboardViewProps {
  currentUser: UserProfile;
  savedProperties: SavedProperty[];
  conversations: Conversation[];
  siteVisits: SiteVisit[];
  onSelectPropertyId: (id: string) => void;
  onOpenChat: (conv: Conversation) => void;
  onNavigateTab: (tab: string) => void;
  onUnsaveProperty: (propId: string) => void;
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
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold">Buyer Command Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600/80 text-indigo-100">
              Verified Buyer Account
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Welcome back, <span className="font-semibold text-slate-200">{currentUser.displayName}</span>. Monitor your bookmarked land parcels, direct owner conversations, and confirmed physical site inspections.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('recommendations')}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-xs transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Open AI Matchmaker</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Saved Properties
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {savedProperties.length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Bookmarked for evaluation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Seller Conversations
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {conversations.length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Direct inquiries</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Site Visits Scheduled
          </span>
          <p className="text-2xl font-bold text-indigo-600 mt-1 font-mono">
            {siteVisits.length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">Physical inspections</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveSubTab('saved')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeSubTab === 'saved'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Land ({savedProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chats')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeSubTab === 'chats'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Direct Messages ({conversations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('visits')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeSubTab === 'visits'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
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
            <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3 shadow-xs">
              <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No saved properties yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore Telangana growth corridors and bookmark properties to track price benchmarks and document checks.
              </p>
              <button
                onClick={() => onNavigateTab('discover')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs"
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
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-slate-100">
                        <img
                          src={
                            p.coverPhoto ||
                            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onUnsaveProperty(p.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[10px] flex items-center space-x-1 shadow-xs">
                          <ShieldCheck className="w-3 h-3 text-emerald-200" />
                          <span>{p.documentVerifiedPercentage || 96}% Verified</span>
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center space-x-1 text-xs text-indigo-600 font-semibold">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{p.locality}, {p.district}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">
                          {p.landSize} {p.landUnit} • {formatINR(p.askingPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => onSelectPropertyId(p.id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center space-x-1 shadow-xs"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
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
            <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center space-y-2 shadow-xs">
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
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {(conv.sellerName || 'S').charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{conv.sellerName || 'Landowner'}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{conv.propertyTitle}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">{conv.lastMessage}</p>
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
            <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center space-y-2 shadow-xs">
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
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        visit.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : visit.status === 'COMPLETED'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {visit.status}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{visit.propertyTitle}</h4>
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
                    className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
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
