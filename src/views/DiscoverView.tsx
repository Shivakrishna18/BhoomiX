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
  const [maxPriceCr, setMaxPriceCr] = useState<number>(10);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'size_desc'>('recommended');
  const [viewLayout, setViewLayout] = useState<'grid' | 'split_map'>('grid');

  // Filter and sort logic
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Purpose
        if (selectedPurpose !== 'all' && p.purpose !== selectedPurpose) return false;
        // District
        if (selectedDistrict !== 'all' && p.district !== selectedDistrict) return false;
        // Max Price
        if (p.askingPrice > maxPriceCr * 10000000) return false;
        // Verified Only
        if (verifiedOnly && !p.clearTitle) return false;
        // Query search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchLoc = p.locality.toLowerCase().includes(q);
          const matchDist = p.district.toLowerCase().includes(q);
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSy = p.surveyNumber?.toLowerCase().includes(q);
          const matchPurpose = p.purpose.toLowerCase().includes(q);
          if (!matchLoc && !matchDist && !matchTitle && !matchDesc && !matchSy && !matchPurpose) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.askingPrice - b.askingPrice;
        if (sortBy === 'price_desc') return b.askingPrice - a.askingPrice;
        if (sortBy === 'size_desc') return b.landSize - a.landSize;
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
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Query input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by corridor (Maheshwaram, Shamshabad, Mokila), Sy. No, or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
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
              className="w-full py-2.5 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-hidden bg-white text-slate-700 font-medium"
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
          <div className="w-full md:w-64 px-2 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-700">
              <span>Budget Cap:</span>
              <span className="text-indigo-600 font-bold font-mono">Up to ₹{maxPriceCr} Cr</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={maxPriceCr}
              onChange={(e) => setMaxPriceCr(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Purpose Pills & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {purposes.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPurpose(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedPurpose === p.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer select-none text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-600 h-4 w-4"
              />
              <span>Dharani Verified Only</span>
            </label>

            {/* Layout Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex space-x-1">
              <button
                onClick={() => setViewLayout('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  viewLayout === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewLayout('split_map')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                  viewLayout === 'split_map' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-600 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredProperties.length}</span> direct land listings in Telangana
        </p>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-1 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-hidden"
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
          <div className="lg:col-span-5 h-[520px] sticky top-24">
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
            <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No properties match your current filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your budget cap or clearing specific corridor filters to view available land parcels.
              </p>
              <button
                onClick={() => {
                  setSelectedPurpose('all');
                  setSelectedDistrict('all');
                  setMaxPriceCr(15);
                  setSearchQuery('');
                  setVerifiedOnly(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs"
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

      {/* Floating Comparison Drawer / Button */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-4 animate-in slide-in-from-bottom">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold font-mono">
              {compareList.length} / 4 Land Parcels Selected
            </span>
          </div>
          <button
            onClick={onOpenCompareModal}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
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
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between hover:border-indigo-300">
      <div>
        {/* Photo Container */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={onSelect}>
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

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white capitalize">
              {property.purpose}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600/90 backdrop-blur-md text-white flex items-center space-x-1 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-200" />
              <span>{property.documentVerifiedPercentage || 96}% Verified</span>
            </span>
          </div>

          {/* Action Icons Top Right */}
          <div className="absolute top-2.5 right-2.5 flex space-x-1.5 items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className={`p-1.5 px-2 rounded-lg backdrop-blur-md transition-all flex items-center space-x-1 ${
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
              className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                isCompared ? 'bg-amber-600 text-white' : 'bg-slate-900/60 text-white hover:bg-slate-900'
              }`}
              title="Add to Comparison"
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-[10px] font-semibold text-white">
            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md">
              {property.surveyNumber || 'Sy. Verified'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md">
              {property.landSize} {property.landUnit}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 cursor-pointer" onClick={onSelect}>
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-600">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{property.locality}, {property.district}</span>
          </div>

          <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
            {property.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {property.description}
          </p>

          {/* Road Frontage Tag */}
          {property.roadFacing && (
            <div className="text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 truncate font-medium">
              🛣️ Frontage: {property.roadFacing}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Asking Price</span>
          <p className="text-sm sm:text-base font-bold text-slate-900">
            {formatINR(property.askingPrice)}
          </p>
        </div>

        <button
          onClick={onSelect}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-2xs"
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
      className="bg-white rounded-xl border border-slate-200/80 p-3 hover:border-indigo-300 hover:shadow-md transition-all flex gap-3 cursor-pointer"
    >
      <img
        src={
          property.coverPhoto ||
          property.photos?.[0] ||
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
        }
        alt={property.title}
        referrerPolicy="no-referrer"
        className="w-28 h-28 object-cover rounded-lg shrink-0"
      />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-indigo-600 font-semibold mb-1">
            <div className="flex items-center space-x-1.5">
              <span>{property.locality}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                {property.documentVerifiedPercentage || 96}% Verified
              </span>
            </div>
            <span className="font-bold text-slate-900 text-xs">{formatINR(property.askingPrice)}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{property.title}</h4>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{property.roadFacing || property.description}</p>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <span>{property.landSize} {property.landUnit}</span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className={`p-1 px-2 rounded-md transition-all flex items-center space-x-1 ${
                isSaved
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              className={`p-1 px-1.5 rounded-md transition-all ${
                isCompared
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
