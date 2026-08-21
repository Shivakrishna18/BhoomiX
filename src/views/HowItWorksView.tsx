import React from 'react';
import {
  Compass,
  FileCheck,
  MessageSquare,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Building2,
  User,
  CheckCircle2,
} from 'lucide-react';

interface HowItWorksViewProps {
  onNavigate: (tab: string) => void;
  onOpenSellerStudio?: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({
  onNavigate,
  onOpenSellerStudio,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          How BhoomiX Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          A transparent, direct-to-direct transaction workflow designed to eliminate opaque brokerage markups and fraudulent title claims.
        </p>
      </div>

      {/* For Land Buyers */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            For Land Buyers & Investors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">Discover with AI & Spatial Maps</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search by growth corridor or use the AI Matchmaker to find land matching your budget, extent, and arterial road frontage requirements.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">Inspect 3D Terrain & Dharani Passbooks</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review interactive 3D WebGL terrain boundaries, sun orientation, 30-year EC records, and transparent sub-registrar circle rate benchmarks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">Direct Chat & Book Site Visits</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect directly with verified pattadar landowners via real-time encrypted messaging and schedule physical inspections with zero agent commission.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('discover')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center space-x-2 transition-colors shadow-xs"
          >
            <span>Start Exploring Verified Land</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* For Land Sellers */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            For Landowners & Pattadars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">List in 3 Simple Steps</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Input survey numbers, asking price, approach road width, soil type, and pin your 4 corner boundary coordinates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">Upload Dharani Passbook & EC</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our automated optical intelligence instantly verifies ownership consistency, awarding your listing trusted verification badges that attract serious buyers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">Manage Inquiries & Visits</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive direct chat inquiries from verified buyers, confirm site visits on your chosen dates, and sell with zero middlemen commissions.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => {
              if (onOpenSellerStudio) onOpenSellerStudio();
              else onNavigate('seller');
            }}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center space-x-2 transition-colors shadow-xs cursor-pointer"
          >
            <span>List Your Land in Seller Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
