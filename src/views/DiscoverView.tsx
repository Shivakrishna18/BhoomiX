import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  ShieldCheck,
  Compass,
  Bookmark,
  Heart,
  Scale,
  Video,
  ArrowUpDown,
  CheckCircle2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Property, LandPurpose } from '../types';
import { MapPlotViewer } from '../components/MapPlotViewer';

interface DiscoverViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  savedPropertyIds: Set<string>;
  onToggleSave: (property: Property) => void;
  compareList: Property[];
  onToggleCompare: (property: Property) => void;
  onOpenCompareModal: () => void;
  initialQuery?: string;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  properties,
  onSelectProperty,
  savedPropertyIds,
  onToggleSave,
  compareList,
  onToggleCompare,
  onOpenCompareModal,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [maxPriceCr, setMaxPriceCr] = useState<number>(50);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'size_desc'>('recommended');
  const [viewLayout, setViewLayout] = useState<'grid' | 'split_map'>('grid');

  // Filter and sort logic
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Purpose
        if (selectedPurpose !== 'all') {
          const propPurpose = (p.purpose || '').toLowerCase();
          const targetPurpose = selectedPurpose.toLowerCase();
          if (propPurpose !== targetPurpose && !propPurpose.includes(targetPurpose)) return false;
        }
        // District
        if (selectedDistrict !== 'all') {
          const propDistrict = (p.district || '').toLowerCase();
          const targetDistrict = selectedDistrict.toLowerCase();
          if (propDistrict !== targetDistrict && !propDistrict.includes(targetDistrict)) return false;
        }
        // Max Price (only filter if less than 50 Cr cap)
        if (maxPriceCr < 50 && (p.askingPrice || 0) > maxPriceCr * 10000000) return false;
        // Verified Only
        if (verifiedOnly && !p.clearTitle && (p.documentVerifiedPercentage || 0) < 80) return false;
        // Query search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchLoc = (p.locality || '').toLowerCase().includes(q);
          const matchDist = (p.district || '').toLowerCase().includes(q);
          const matchTitle = (p.title || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchSy = (p.surveyNumber || '').toLowerCase().includes(q);
          const matchPurpose = (p.purpose || '').toLowerCase().includes(q);
          const matchSeller = (p.sellerName || p.ownerName || '').toLowerCase().includes(q);
          const matchAddr = (p.address || '').toLowerCase().includes(q);
          if (!matchLoc && !matchDist && !matchTitle && !matchDesc && !matchSy && !matchPurpose && !matchSeller && !matchAddr) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return (a.askingPrice || 0) - (b.askingPrice || 0);
        if (sortBy === 'price_desc') return (b.askingPrice || 0) - (a.askingPrice || 0);
        if (sortBy === 'size_desc') return (b.landSize || 0) - (a.landSize || 0);
        return (b.trustScore || 90) - (a.trustScore || 90);
      });
  }, [properties, selectedPurpose, selectedDistrict, maxPriceCr, verifiedOnly, searchQuery, sortBy]);

  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const purposes = [
    { id: 'all', label: 'All Land Types' },
    { id: 'agricultural', label: '🌾 Agricultural Farm' },
    { id: 'commercial', label: '🏢 Commercial Land' },
    { id: 'residential', label: '🏡 Villa / Plotted' },
    { id: 'industrial', label: '🏭 Industrial Zone' },
    { id: 'investment', label: '📈 Growth Investment' },
  ];

  const districts = [
    'all',
    'Ranga Reddy',
    'Sangareddy',
    'Yadadri Bhuvanagiri',
    'Medchal-Malkajgiri',
    'Vikarabad',
    'Mahabubnagar',
    'Siddipet',
    'Nalgonda',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Search & Filter Bar - Spatial Liquid Glass Card */}
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 border border-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)] space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Query input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by corridor (Maheshwaram, Shamshabad, Mokila), Sy. No, or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-full focus:ring-2 focus:ring-indigo-600 focus:bg-white focus:outline-hidden transition-all shadow-inner font-medium text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* District selector */}
          <div className="w-full md:w-56">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full py-2.5 px-4 text-xs border border-slate-200/80 rounded-full focus:ring-2 focus:ring-indigo-600 focus:outline-hidden bg-white/70 backdrop-blur-md text-slate-700 font-semibold cursor-pointer shadow-2xs"
            >
              <option value="all">All Telangana Districts</option>
              {districts.filter((d) => d !== 'all').map((dist) => (
                <option key={dist} value={dist}>
                  {dist} District
                </option>
              ))}
            </select>
          </div>

          {/* Max Budget Slider */}
          <div className="w-full md:w-64 px-2 space-y-1.5 bg-white/50 p-2.5 rounded-2xl border border-white/80">
            <div className="flex justify-between text-[11px] font-bold text-slate-700">
              <span>Budget Cap:</span>
              <span className="text-indigo-600 font-mono">
                {maxPriceCr >= 50 ? 'All (No Limit)' : `Up to ₹${maxPriceCr} Cr`}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={maxPriceCr}
              onChange={(e) => setMaxPriceCr(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-full"
            />
          </div>
        </div>

        {/* Purpose Pills & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
          <div className="flex flex-wrap gap-1.5">
            {purposes.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPurpose(p.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all spring-press cursor-pointer ${
                  selectedPurpose === p.id
                    ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)]'
                    : 'liquid-glass-pill text-slate-700 hover:bg-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-700 font-bold px-3 py-1.5 rounded-full liquid-glass-pill">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded-sm text-indigo-600 focus:ring-indigo-600 h-4 w-4"
              />
              <span>Dharani Verified Only</span>
            </label>

            {/* Layout Toggle */}
            <div className="bg-slate-200/60 p-1 rounded-full flex space-x-1 border border-white/80">
              <button
                onClick={() => setViewLayout('grid')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewLayout === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewLayout('split_map')}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewLayout === 'split_map' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>Map + Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-xs text-slate-600 font-semibold">
          Showing <span className="font-extrabold text-slate-900">{filteredProperties.length}</span> direct land listings in Telangana
        </p>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-1.5 px-3 text-xs border border-white/90 rounded-full liquid-glass text-slate-700 font-bold focus:outline-hidden shadow-2xs cursor-pointer"
          >
            <option value="recommended">BhoomiX Trust Rating</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="size_desc">Land Size: Largest</option>
          </select>
        </div>
      </div>

      {/* Layout: Split Map or Pure Grid */}
      {viewLayout === 'split_map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-[520px] sticky top-24 rounded-3xl overflow-hidden shadow-lg border border-white/90">
            <MapPlotViewer
              allProperties={filteredProperties}
              onSelectProperty={onSelectProperty}
              height="h-full"
            />
          </div>
          <div className="lg:col-span-7 space-y-4">
            {filteredProperties.map((property) => (
              <PropertyCardHorizontal
                key={property.id}
                property={property}
                onSelect={() => onSelectProperty(property)}
                isSaved={savedPropertyIds.has(property.id)}
                onToggleSave={() => onToggleSave(property)}
                isCompared={compareList.some((c) => c.id === property.id)}
                onToggleCompare={() => onToggleCompare(property)}
              />
            ))}
          </div>
        </div>
      )}

      {viewLayout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3 liquid-glass-card rounded-3xl border border-white/90 p-8 shadow-xs">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No properties match your current filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your budget cap or clearing specific corridor filters to view available land parcels.
              </p>
              <button
                onClick={() => {
                  setSelectedPurpose('all');
                  setSelectedDistrict('all');
                  setMaxPriceCr(50);
                  setSearchQuery('');
                  setVerifiedOnly(false);
                }}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 shadow-md spring-press cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredProperties.map((property) => (
              <PropertyCardGrid
                key={property.id}
                property={property}
                onSelect={() => onSelectProperty(property)}
                isSaved={savedPropertyIds.has(property.id)}
                onToggleSave={() => onToggleSave(property)}
                isCompared={compareList.some((c) => c.id === property.id)}
                onToggleCompare={() => onToggleCompare(property)}
              />
            ))
          )}
        </div>
      )}

      {/* Floating Comparison Drawer / Button - VisionOS Style Glass Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 liquid-glass-dark text-white p-3.5 px-5 rounded-full shadow-[0_20px_50px_rgba(15,23,42,0.3)] border border-slate-700/80 flex items-center space-x-4 animate-in slide-in-from-bottom">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold font-mono">
              {compareList.length} / 4 Land Parcels Selected
            </span>
          </div>
          <button
            onClick={onOpenCompareModal}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all spring-press cursor-pointer"
          >
            Compare Side-by-Side
          </button>
        </div>
      )}
    </div>
  );
};

// Grid Card Component
const PropertyCardGrid: React.FC<{
  property: Property;
  onSelect: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  isCompared: boolean;
  onToggleCompare: () => void;
}> = ({ property, onSelect, isSaved, onToggleSave, isCompared, onToggleCompare }) => {
  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="group liquid-glass-card rounded-3xl border border-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.15)] transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1">
      <div>
        {/* Photo Container */}
        <div className="relative h-52 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={onSelect}>
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

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white capitalize shadow-xs">
              {property.purpose}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/90 backdrop-blur-md text-white flex items-center space-x-1 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-200" />
              <span>{property.documentVerifiedPercentage || 96}% Verified</span>
            </span>
          </div>

          {/* Action Icons Top Right */}
          <div className="absolute top-3.5 right-3.5 flex space-x-1.5 items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className={`p-1.5 px-2.5 rounded-full backdrop-blur-md transition-all flex items-center space-x-1 spring-press cursor-pointer ${
                isSaved
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'bg-slate-900/70 text-white hover:bg-slate-900 hover:text-rose-300'
              }`}
              title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
              <span className="text-[10px] font-semibold">{isSaved ? 'Saved' : 'Wishlist'}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare();
              }}
              className={`p-1.5 px-2 rounded-full backdrop-blur-md transition-colors spring-press cursor-pointer ${
                isCompared ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-900/60 text-white hover:bg-slate-900'
              }`}
              title="Add to Comparison"
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-3.5 left-3.5 right-3.5 flex justify-between items-center text-[10px] font-bold text-white">
            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md shadow-xs">
              {property.surveyNumber || 'Sy. Verified'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md shadow-xs">
              {property.landSize} {property.landUnit}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 cursor-pointer" onClick={onSelect}>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{property.locality}, {property.district}</span>
          </div>

          <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
            {property.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
            {property.description}
          </p>

          {/* Road Frontage Tag */}
          {property.roadFacing && (
            <div className="text-[11px] text-slate-700 bg-white/70 px-3 py-1 rounded-full border border-slate-200/80 truncate font-semibold">
              🛣️ Frontage: {property.roadFacing}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 pt-3.5 border-t border-slate-100/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asking Price</span>
          <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {formatINR(property.askingPrice)}
          </p>
        </div>

        <button
          onClick={onSelect}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold transition-all shadow-[0_4px_12px_rgba(79,70,229,0.22)] spring-press cursor-pointer"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// Horizontal Card (for Split Map View)
const PropertyCardHorizontal: React.FC<{
  property: Property;
  onSelect: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  isCompared: boolean;
  onToggleCompare: () => void;
}> = ({ property, onSelect, isSaved, onToggleSave, isCompared, onToggleCompare }) => {
  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div
      onClick={onSelect}
      className="liquid-glass-card rounded-2xl border border-white/90 p-3.5 hover:shadow-lg transition-all flex gap-3.5 cursor-pointer spring-press hover:-translate-y-0.5"
    >
      <img
        src={
          property.coverPhoto ||
          property.photos?.[0] ||
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
        }
        alt={property.title}
        referrerPolicy="no-referrer"
        className="w-28 h-28 object-cover rounded-xl shrink-0"
      />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-indigo-600 font-bold mb-1">
            <div className="flex items-center space-x-1.5">
              <span>{property.locality}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                {property.documentVerifiedPercentage || 96}% Verified
              </span>
            </div>
            <span className="font-black text-slate-900 text-xs tracking-tight">{formatINR(property.askingPrice)}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{property.title}</h4>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{property.roadFacing || property.description}</p>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100/80 font-semibold">
          <span>{property.landSize} {property.landUnit}</span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className={`p-1 px-2.5 rounded-full transition-all flex items-center space-x-1 spring-press ${
                isSaved
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200/80'
              }`}
              title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-3 h-3 ${isSaved ? 'fill-white text-white' : 'text-slate-600'}`} />
              <span className="text-[10px]">{isSaved ? 'Saved' : 'Wishlist'}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare();
              }}
              className={`p-1 px-2 rounded-full transition-all spring-press ${
                isCompared
                  ? 'bg-amber-600 text-white'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200/80'
              }`}
              title="Compare"
            >
              <Scale className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
