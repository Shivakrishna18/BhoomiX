import React from 'react';
import { Layers, ShieldCheck, FileCheck, Compass, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Bhoomi<span className="text-indigo-400">X</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier AI-powered direct-to-direct land discovery platform. Connecting genuine
              sellers and buyers with deep document intelligence, boundary visualization, and transparent price intelligence.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-indigo-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Telangana Growth Corridors Demo</span>
            </div>
          </div>

          {/* Quick Corridors */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Telangana Corridors
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Shamshabad Airport & ORR Growth Corridor</li>
              <li>Maheshwaram E-City & Hardware Park</li>
              <li>Shankarpally - Mokila Villa Growth Belt</li>
              <li>Yadadri Temple City & Warangal Highway</li>
              <li>Medchal NH-44 Industrial Hub</li>
            </ul>
          </div>

          {/* Platform Capabilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Technology & Trust
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Document Intelligence & Dharani Extraction</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>2D Boundary & 3D Interactive Spatial Plot</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Circle Rate & Acquisition Cost Analytics</span>
              </li>
              <li>Direct Real-time Buyer-Seller Chat</li>
              <li>Scheduled Site Visit Protocol</li>
            </ul>
          </div>

          {/* Legal Transparency & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Regulatory Transparency
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              BhoomiX is a land discovery and AI analysis platform. Document intelligence indicators are generated via automated optical and algorithmic record matching and do not substitute certified physical title verification by qualified legal advocates and local Sub-Registrar Offices (SRO).
            </p>
            <p className="text-[10px] text-slate-500">
              © {new Date().getFullYear()} BhoomiX Technologies India. Built with Sleek Interface aesthetic.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
