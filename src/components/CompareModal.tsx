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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">
              Land Side-by-Side Comparison ({properties.length} Selected)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content */}
        {properties.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Scale className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">No properties selected for comparison</h4>
              <p className="text-xs text-slate-500 max-w-md">
                Click the compare icon on any land listing in the discovery feed to compare prices, legal titles, survey boundaries, and road frontage side by side.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
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
                <div key={p.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-t-2xl relative">
                  <button
                    onClick={() => handleRemoveItem(p.id)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-white transition-colors cursor-pointer"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <img
                    src={p.coverPhoto || p.photos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-24 object-cover rounded-xl mb-2"
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
              <div className="p-3 font-semibold text-xs text-slate-600 border-t border-slate-200/80 flex items-center">
                Asking Price
              </div>
              {properties.map((p) => (
                <div key={`price-${p.id}`} className="p-3 font-bold text-sm text-slate-900 border-t border-slate-200/80 font-mono">
                  {formatINR(p.askingPrice)}
                </div>
              ))}

              {/* Land Size & Rate */}
              <div className="p-3 font-semibold text-xs text-slate-600 border-t border-slate-200/80 flex items-center">
                Size & Unit Rate
              </div>
              {properties.map((p) => (
                <div key={`size-${p.id}`} className="p-3 text-xs text-slate-800 border-t border-slate-200/80">
                  <span className="font-bold">{p.landSize} {p.landUnit}</span>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formatINR(Math.round(p.askingPrice / (p.landSize || 1)))} / {p.landUnit}
                  </p>
                </div>
              ))}

              {/* Locality & Corridor */}
              <div className="p-3 font-semibold text-xs text-slate-600 border-t border-slate-200/80 flex items-center">
                Locality / District
              </div>
              {properties.map((p) => (
                <div key={`loc-${p.id}`} className="p-3 text-xs text-slate-800 border-t border-slate-200/80">
                  <p className="font-semibold text-slate-900">{p.locality}</p>
                  <p className="text-[11px] text-slate-500">{p.district}, {p.state}</p>
                </div>
              ))}

              {/* Road Access */}
              <div className="p-3 font-semibold text-xs text-slate-600 border-t border-slate-200/80 flex items-center">
                Road Frontage
              </div>
              {properties.map((p) => (
                <div key={`road-${p.id}`} className="p-3 text-xs text-slate-700 border-t border-slate-200/80 font-medium">
                  {p.roadFacing || 'Standard Access Road'}
                </div>
              ))}

              {/* Purpose & Zone */}
              <div className="p-3 font-semibold text-xs text-slate-600 border-t border-slate-200/80 flex items-center">
                Usage & Zone
              </div>
              {properties.map((p) => (
                <div key={`zone-${p.id}`} className="p-3 text-xs text-slate-700 border-t border-slate-200/80 capitalize">
                  <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg text-[10px]">
                    {p.purpose}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">{p.zoneType || 'Growth Corridor'}</p>
                </div>
              ))}

              {/* Trust Badges */}
              <div className="p-3 font-semibold text-xs text-slate-600 border-t border-b border-slate-200/80 flex items-center">
                Verified Title Badges
              </div>
              {properties.map((p) => (
                <div key={`trust-${p.id}`} className="p-3 text-xs border-t border-b border-slate-200/80 space-y-1">
                  {p.verificationBadges?.map((badge, bIdx) => (
                    <div key={bIdx} className="flex items-center space-x-1 text-[10px] text-slate-700 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
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
