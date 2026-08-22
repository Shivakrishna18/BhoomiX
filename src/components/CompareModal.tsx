import React, { useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Scale, MapPin, ExternalLink, PlusCircle } from 'lucide-react';
import { Property } from '../types';

interface CompareModalProps {
  isOpen?: boolean;
  properties: Property[];
  onRemove?: (id: string) => void;
  onRemoveProperty?: (id: string) => void;
  onClose: () => void;
  onSelectProperty: (prop: Property) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen = true,
  properties,
  onRemove,
  onRemoveProperty,
  onClose,
  onSelectProperty,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRemoveItem = (id: string) => {
    if (onRemoveProperty) onRemoveProperty(id);
    else if (onRemove) onRemove(id);
  };

  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in"
    >
      <div className="liquid-glass-card bg-white/90 backdrop-blur-xl rounded-3xl max-w-5xl w-full max-h-[90vh] shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-white/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="liquid-glass-dark text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 backdrop-blur-md shadow-inner">
              <Scale className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Land Side-by-Side Comparison
              </h3>
              <p className="text-xs text-slate-400">
                {properties.length} {properties.length === 1 ? 'parcel' : 'parcels'} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content */}
        {properties.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Scale className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900">No properties selected for comparison</h4>
              <p className="text-xs text-slate-500 max-w-md">
                Click the compare icon on any land listing in the discovery feed to compare prices, legal titles, survey boundaries, and road frontage side by side.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition-all spring-press cursor-pointer shadow-md shadow-indigo-600/20"
            >
              Explore Land Listings
            </button>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-x-auto overflow-y-auto space-y-4">
            <div className="min-w-[650px] grid" style={{ gridTemplateColumns: `180px repeat(${properties.length}, minmax(220px, 1fr))` }}>
              {/* Headers */}
              <div className="p-3 font-bold text-xs text-slate-400 uppercase tracking-wider self-end">
                Land Attribute
              </div>
              {properties.map((p) => (
                <div key={p.id} className="p-3.5 bg-white/70 backdrop-blur-md border border-white/90 rounded-2xl relative shadow-2xs">
                  <button
                    onClick={() => handleRemoveItem(p.id)}
                    className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-white transition-colors cursor-pointer shadow-2xs"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <img
                    src={p.coverPhoto || p.photos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-24 object-cover rounded-xl mb-2.5"
                  />
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">{p.title}</h4>
                  <button
                    onClick={() => {
                      onSelectProperty(p);
                      onClose();
                    }}
                    className="mt-2 text-[11px] text-indigo-600 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Asking Price */}
              <div className="p-3.5 font-bold text-xs text-slate-700 border-t border-slate-200/80 flex items-center">
                Asking Price
              </div>
              {properties.map((p) => (
                <div key={`price-${p.id}`} className="p-3.5 font-extrabold text-sm text-slate-900 border-t border-slate-200/80 font-mono">
                  {formatINR(p.askingPrice)}
                </div>
              ))}

              {/* Land Size & Rate */}
              <div className="p-3.5 font-bold text-xs text-slate-700 border-t border-slate-200/80 flex items-center">
                Size & Unit Rate
              </div>
              {properties.map((p) => (
                <div key={`size-${p.id}`} className="p-3.5 text-xs text-slate-800 border-t border-slate-200/80">
                  <span className="font-bold text-slate-900">{p.landSize} {p.landUnit}</span>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatINR(Math.round(p.askingPrice / (p.landSize || 1)))} / {p.landUnit}
                  </p>
                </div>
              ))}

              {/* Locality & Corridor */}
              <div className="p-3.5 font-bold text-xs text-slate-700 border-t border-slate-200/80 flex items-center">
                Locality / District
              </div>
              {properties.map((p) => (
                <div key={`loc-${p.id}`} className="p-3.5 text-xs text-slate-800 border-t border-slate-200/80">
                  <p className="font-bold text-slate-900">{p.locality}</p>
                  <p className="text-[11px] text-slate-500">{p.district}, {p.state}</p>
                </div>
              ))}

              {/* Road Access */}
              <div className="p-3.5 font-bold text-xs text-slate-700 border-t border-slate-200/80 flex items-center">
                Road Frontage
              </div>
              {properties.map((p) => (
                <div key={`road-${p.id}`} className="p-3.5 text-xs text-slate-700 border-t border-slate-200/80 font-medium">
                  {p.roadFacing || 'Standard Access Road'}
                </div>
              ))}

              {/* Purpose & Zone */}
              <div className="p-3.5 font-bold text-xs text-slate-700 border-t border-slate-200/80 flex items-center">
                Usage & Zone
              </div>
              {properties.map((p) => (
                <div key={`zone-${p.id}`} className="p-3.5 text-xs text-slate-700 border-t border-slate-200/80 capitalize">
                  <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full text-[10px]">
                    {p.purpose}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-medium">{p.zoneType || 'Growth Corridor'}</p>
                </div>
              ))}

              {/* Trust Badges */}
              <div className="p-3.5 font-bold text-xs text-slate-700 border-t border-b border-slate-200/80 flex items-center">
                Verified Title Badges
              </div>
              {properties.map((p) => (
                <div key={`trust-${p.id}`} className="p-3.5 text-xs border-t border-b border-slate-200/80 space-y-1.5">
                  {p.verificationBadges?.map((badge, bIdx) => (
                    <div key={bIdx} className="flex items-center space-x-1.5 text-[10px] text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
