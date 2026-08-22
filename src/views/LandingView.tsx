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
  Users,
  ChevronDown,
  Box,
} from 'lucide-react';
import { Property } from '../types';
import { HeroSpatialIllustration } from '../components/HeroSpatialIllustration';

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section - Spatial Liquid Glass Apple Aesthetic */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8">
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-indigo-500/18 via-sky-400/18 to-emerald-400/12 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[350px] bg-gradient-to-br from-cyan-400/15 to-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="relative max-w-7xl mx-auto">
          {/* Top Layout Grid: Left Content + Right 3D Spatial Graphic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-10">
            {/* Left Column: Headlines & Subtitles */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Spatial Glass Badge */}
              <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full liquid-glass-pill text-indigo-950 text-xs font-semibold shadow-[0_2px_12px_rgba(79,70,229,0.06)] border border-white/90">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Direct-to-Direct Verified Land Platform • Telangana Pilot</span>
              </div>

              {/* Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 leading-[1.14]">
                Discover Verified Land <br className="hidden sm:inline" />
                Directly from Owners. <br />
                Powered by{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 font-black">
                  AI Intelligence.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-normal">
                Eliminate intermediary friction. Explore certified Dharani passbook titles, 3D interactive
                spatial boundaries, and real-time micro-market price intelligence across Telangana’s prime growth corridors.
              </p>
            </div>

            {/* Right Column: 3D Isometric Layered Glass Cube Visual */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              <HeroSpatialIllustration />
            </div>
          </div>

          {/* Centered AI Natural Language Search Bar with Liquid Glass Sheen */}
          <div className="max-w-4xl mx-auto space-y-4">
            <form
              onSubmit={handleSearchSubmit}
              className="liquid-glass rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-[0_20px_50px_-10px_rgba(79,70,229,0.12),0_1px_2px_rgba(0,0,0,0.02)] border border-white/95 flex flex-col sm:flex-row items-center gap-2 transition-all duration-300 focus-within:shadow-[0_24px_60px_-10px_rgba(79,70,229,0.22),0_0_0_2px_rgba(99,102,241,0.6)] focus-within:border-white"
            >
              <div className="flex-1 flex items-center space-x-3 px-3.5 py-2 w-full">
                <div className="w-8 h-8 rounded-full bg-indigo-50/90 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask BhoomiX AI (e.g. 5 acres highway-facing land near Maheshwaram under 60L)"
                  className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-hidden font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-[0_4px_18px_rgba(79,70,229,0.32)] transition-all shrink-0 spring-press cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Smart Search</span>
              </button>
            </form>

            {/* Preset Query Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-1">
              <span className="text-slate-500 font-semibold text-xs">Try querying:</span>
              {sampleCorridorSearches.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(sample);
                    onSearch(sample);
                    onNavigate('discover');
                  }}
                  className="px-3.5 py-1.5 rounded-full liquid-glass-pill hover:bg-white text-slate-700 text-xs font-medium transition-all shadow-2xs spring-press cursor-pointer hover:text-indigo-700 hover:border-indigo-200"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* 4 Feature Squircles / Glass Cards (Below Search) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-10 max-w-6xl mx-auto">
            {/* Card 1: 100% Verified */}
            <div className="p-4.5 liquid-glass-card rounded-2xl border border-white/90 flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">100% Verified</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-snug">
                  Dharani passbook verified properties only
                </p>
              </div>
            </div>

            {/* Card 2: 3D Land Maps */}
            <div className="p-4.5 liquid-glass-card rounded-2xl border border-white/90 flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-100/80 border border-cyan-200/80 text-cyan-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Box className="w-5 h-5 text-cyan-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">3D Land Maps</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-snug">
                  Interactive spatial boundaries & overlays
                </p>
              </div>
            </div>

            {/* Card 3: Price Intelligence */}
            <div className="p-4.5 liquid-glass-card rounded-2xl border border-white/90 flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100/80 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Price Intelligence</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-snug">
                  Real-time micro-market insights & trends
                </p>
              </div>
            </div>

            {/* Card 4: Direct from Owners */}
            <div className="p-4.5 liquid-glass-card rounded-2xl border border-white/90 flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100/80 border border-purple-200/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Direct from Owners</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-snug">
                  No brokers. Direct owner-to-buyer deals
                </p>
              </div>
            </div>
          </div>

          {/* Down Chevron Smooth Scroll Button */}
          <div className="flex justify-center pt-8">
            <button
              onClick={() => scrollToSection('listings-section')}
              className="w-10 h-10 rounded-full liquid-glass border border-white/90 shadow-2xs flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:scale-110 transition-all cursor-pointer spring-press"
              title="Scroll to land listings"
            >
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Verified Land Parcels */}
      <section id="listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Verified Telangana Land Listings
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50/90 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                Direct from Pattadar Owners
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              High-growth parcels with certified Dharani passbooks and surveyed DGPS boundaries.
            </p>
          </div>

          <button
            onClick={() => onNavigate('discover')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1.5 group spring-press cursor-pointer px-4 py-2 rounded-full liquid-glass-pill border border-indigo-100"
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
              className="group liquid-glass-card rounded-3xl border border-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.15)] transition-all duration-300 overflow-hidden flex flex-col cursor-pointer spring-press hover:-translate-y-1"
            >
              {/* Photo & Badge */}
              <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                <img
                  src={
                    property.coverPhoto ||
                    property.photos?.[0] ||
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={property.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Top Badges & Wishlist Save Button */}
                <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white capitalize shadow-xs">
                    {property.purpose}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/90 backdrop-blur-md text-white flex items-center space-x-1 shadow-xs">
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
                    className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md shadow-xs transition-all duration-200 flex items-center space-x-1 spring-press ${
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

                <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-slate-100 shadow-xs">
                  {property.landSize} {property.landUnit}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{property.locality}, {property.district}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3.5 border-t border-slate-100/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Asking Value
                    </span>
                    <p className="text-lg font-black text-slate-900 tracking-tight">
                      {formatINR(property.askingPrice)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Unit Rate
                    </span>
                    <p className="text-xs font-bold text-indigo-600">
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
        <div className="liquid-glass-dark rounded-3xl p-8 sm:p-12 text-white border border-slate-700/60 shadow-[0_20px_50px_rgba(15,23,42,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
          
          <div className="max-w-3xl space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Institutional Standard Direct Trading
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Why BhoomiX Replaces Traditional Land Discovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Land deals in India often suffer from opaque title chains, unverified boundaries, and inflated brokerage markups. BhoomiX solves this with automated intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/60 space-y-3 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Dharani Title Intelligence</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Optical AI extracts survey numbers, extent, and pattadar names from uploaded passbooks and 30-year ECs to ensure record consistency.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/60 space-y-3 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">3D Spatial & Plot Boundaries</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspect terrain contours, road frontage widths, and true-north sun orientation in an interactive 3D WebGL model before visiting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/60 space-y-3 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Circle Rate & Price Benchmarks</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Compare asking prices with official sub-registrar guideline rates and calculate total all-inclusive acquisition outlays upfront.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action for Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="liquid-glass rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/90 shadow-[0_16px_40px_rgba(79,70,229,0.08)]">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              For Landowners & Pattadars
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              List Your Land Directly to High-Intent Verified Buyers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Showcase your Dharani passbook, plot coordinates, and video walkthroughs with zero commission overhead. Receive direct visit bookings and chat requests.
            </p>
          </div>

          <button
            onClick={() => {
              if (onOpenSellerStudio) onOpenSellerStudio();
              else onNavigate('seller');
            }}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition-all shrink-0 flex items-center space-x-2.5 cursor-pointer spring-press"
          >
            <Building2 className="w-4 h-4 text-white" />
            <span>Open Seller Studio</span>
          </button>
        </div>
      </section>
    </div>
  );
};
