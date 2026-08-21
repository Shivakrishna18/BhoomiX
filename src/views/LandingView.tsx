import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Layers,
  FileCheck,
  Building2,
  Calendar,
  Bookmark,
  Heart,
} from 'lucide-react';
import { Property } from '../types';

interface LandingViewProps {
  onSearch: (query: string) => void;
  onSelectProperty: (property: Property) => void;
  onNavigate: (tab: string) => void;
  featuredProperties: Property[];
  savedPropertyIds?: Set<string>;
  onToggleSave?: (property: Property) => void;
  onOpenSellerStudio?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSearch,
  onSelectProperty,
  onNavigate,
  featuredProperties,
  savedPropertyIds = new Set(),
  onToggleSave,
  onOpenSellerStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      onNavigate('discover');
    }
  };

  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const sampleCorridorSearches = [
    'Maheshwaram highway commercial 4 acres',
    'Shankarpally residential villa plot 600 sq yards',
    'Shamshabad ORR investment land 2 acres',
    'Yadadri agricultural farmland with borewell',
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heroGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGrid)" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Direct-to-Direct Verified Land Platform • Telangana Pilot</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Discover Verified Land Directly from Owners. Powered by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">
              AI Intelligence.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate intermediary friction. Explore certified Dharani passbook titles, 3D interactive
            spatial boundaries, and real-time micro-market price intelligence across Telangana’s prime growth corridors.
          </p>

          {/* AI Natural Language Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center space-x-3 px-3 py-1.5 w-full">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask BhoomiX AI (e.g. 5 acres highway-facing land near Maheshwaram under 6 Cr)"
                className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-xs transition-all shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Smart Search</span>
            </button>
          </form>

          {/* Preset Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-1">
            <span className="text-slate-400 font-semibold">Try querying:</span>
            {sampleCorridorSearches.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(sample);
                  onSearch(sample);
                  onNavigate('discover');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto border-t border-slate-800 text-left">
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-bold text-white">100%</span>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Direct Pattadar Listings</p>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-bold text-indigo-400">Dharani</span>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Title & EC Pre-Checked</p>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-bold text-amber-400">3D & DGPS</span>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Spatial Land Boundaries</p>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-bold text-teal-400">0%</span>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Brokerage Overhead</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Land Parcels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Verified Telangana Land Listings
              </h2>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Direct from Pattadar Owners
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              High-growth parcels with certified Dharani passbooks and surveyed DGPS boundaries.
            </p>
          </div>

          <button
            onClick={() => onNavigate('discover')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1.5 group"
          >
            <span>Explore All Corridors</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.slice(0, 3).map((property) => (
            <div
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:border-indigo-300"
            >
              {/* Photo & Badge */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={
                    property.coverPhoto ||
                    property.photos?.[0] ||
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={property.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Top Badges & Wishlist Save Button */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white capitalize">
                    {property.purpose}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600/90 backdrop-blur-md text-white flex items-center space-x-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                    <span>{property.documentVerifiedPercentage || 96}% Verified</span>
                  </span>
                </div>

                {/* Save to Wishlist Button */}
                {onToggleSave && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(property);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md shadow-sm transition-all duration-200 flex items-center space-x-1 ${
                      savedPropertyIds.has(property.id)
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-slate-950/60 text-white hover:bg-slate-900 hover:text-rose-300'
                    }`}
                    title={savedPropertyIds.has(property.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        savedPropertyIds.has(property.id) ? 'fill-white text-white' : 'text-white'
                      }`}
                    />
                    <span className="text-[10px] font-semibold pr-0.5 hidden sm:inline">
                      {savedPropertyIds.has(property.id) ? 'Wishlisted' : 'Wishlist'}
                    </span>
                  </button>
                )}

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-slate-200">
                  {property.landSize} {property.landUnit}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{property.locality}, {property.district}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                    {property.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Asking Value
                    </span>
                    <p className="text-base font-bold text-slate-900">
                      {formatINR(property.askingPrice)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Unit Rate
                    </span>
                    <p className="text-xs font-semibold text-indigo-600">
                      {formatINR(Math.round(property.askingPrice / (property.landSize || 1)))} / {property.landUnit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Pillar Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800">
          <div className="max-w-3xl space-y-4 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why BhoomiX Replaces Traditional Land Discovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Land deals in India often suffer from opaque title chains, unverified boundaries, and inflated brokerage markups. BhoomiX solves this with automated intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Dharani Title Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Optical AI extracts survey numbers, extent, and pattadar names from uploaded passbooks and 30-year ECs to ensure record consistency.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">3D Spatial & Plot Boundaries</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect terrain contours, road frontage widths, and true-north sun orientation in an interactive 3D WebGL model before visiting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Circle Rate & Price Benchmarks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare asking prices with official sub-registrar guideline rates and calculate total all-inclusive acquisition outlays upfront.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action for Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-800/40 shadow-lg">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              For Landowners & Pattadars
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              List Your Land Directly to High-Intent Verified Buyers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Showcase your Dharani passbook, plot coordinates, and video walkthroughs with zero commission overhead. Receive direct visit bookings and chat requests.
            </p>
          </div>

          <button
            onClick={() => {
              if (onOpenSellerStudio) onOpenSellerStudio();
              else onNavigate('seller');
            }}
            className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all shrink-0 flex items-center space-x-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-white" />
            <span>Open Seller Studio</span>
          </button>
        </div>
      </section>
    </div>
  );
};
