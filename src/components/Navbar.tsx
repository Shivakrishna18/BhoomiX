import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Bookmark,
  Layers,
  Menu,
  X,
  Building2,
  User,
  Heart,
  Bell,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenCreateWizard: () => void;
  savedCount: number;
  compareCount?: number;
  onOpenCompare?: () => void;
  unreadNotifsCount?: number;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  onSelectRole,
  activeTab,
  onNavigate,
  onOpenCreateWizard,
  savedCount,
  compareCount = 0,
  onOpenCompare,
  unreadNotifsCount = 0,
  onOpenNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const handleRoleChange = (role: UserRole) => {
    onSelectRole(role);
    if (role === 'SELLER') {
      onNavigate('seller');
    } else if (activeTab === 'seller') {
      onNavigate('discover');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <button
              id="navbar-logo-btn"
              onClick={() => handleNav('landing')}
              className="flex items-center space-x-3 text-left focus:outline-hidden group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xl tracking-tight text-slate-900">
                    Bhoomi<span className="text-indigo-600">X</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Telangana
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                  Verified Land Network
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
              <button
                id="nav-discover-btn"
                onClick={() => handleNav('discover')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'discover'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Discover Land
              </button>

              <button
                id="nav-ai-match-btn"
                onClick={() => handleNav('recommendations')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'recommendations'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Matchmaker</span>
              </button>

              <button
                id="nav-trust-btn"
                onClick={() => handleNav('trust')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'trust'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Document Trust
              </button>

              <button
                id="nav-how-it-works-btn"
                onClick={() => handleNav('how-it-works')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'how-it-works'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                How It Works
              </button>
            </nav>
          </div>

          {/* Right Action Controls: 3 Options (BUYER, SELLER, and WISHLIST / LIST LAND) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* IP Auto-Logged Badge */}
            <div
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-900 shadow-2xs"
              title={`Logged in via Client IP: ${currentUser?.ipAddress || 'Auto-Detected'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono font-semibold">
                {currentUser?.ipAddress ? `IP: ${currentUser.ipAddress}` : 'IP Auto-Logged'}
              </span>
            </div>

            {/* Compare Badge trigger */}
            {compareCount > 0 && onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center space-x-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Compare ({compareCount})</span>
              </button>
            )}

            {/* Role Switcher Pill Container (BUYER vs SELLER) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                id="nav-buyer-role-btn"
                onClick={() => handleRoleChange('BUYER')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeRole === 'BUYER'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>BUYER</span>
              </button>

              <button
                id="nav-seller-role-btn"
                onClick={() => handleRoleChange('SELLER')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeRole === 'SELLER'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>SELLER</span>
              </button>
            </div>

            {/* Notification Bell Trigger */}
            {onOpenNotifications && (
              <button
                id="nav-notifications-btn"
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                title="View activity & direct notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            )}

            {/* Third Action Option: Wishlist for Buyer, or List Land for Seller */}
            {activeRole === 'BUYER' ? (
              <button
                id="nav-wishlist-btn"
                onClick={() => handleNav('buyer')}
                className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  activeTab === 'buyer'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                title="View your saved land wishlist"
              >
                <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
                <span>Wishlist</span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {savedCount}
                </span>
              </button>
            ) : (
              <button
                id="nav-list-land-btn"
                onClick={onOpenCreateWizard}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ List Land</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle & Role Indicators */}
          <div className="flex md:hidden items-center space-x-2">
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => handleRoleChange('BUYER')}
                className={`px-2 py-1 rounded-lg ${
                  activeRole === 'BUYER' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => handleRoleChange('SELLER')}
                className={`px-2 py-1 rounded-lg ${
                  activeRole === 'SELLER' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Seller
              </button>
            </div>

            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            )}

            {activeRole === 'BUYER' ? (
              <button
                onClick={() => handleNav('buyer')}
                className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 relative"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={onOpenCreateWizard}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                + List
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {/* Quick Perspective Switching */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-700">Active Mode:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => handleRoleChange('BUYER')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  activeRole === 'BUYER' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                BUYER
              </button>
              <button
                onClick={() => handleRoleChange('SELLER')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  activeRole === 'SELLER' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                SELLER
              </button>
            </div>
          </div>

          <button
            onClick={() => handleNav('discover')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'discover' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Discover Land
          </button>
          <button
            onClick={() => handleNav('recommendations')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 ${
              activeTab === 'recommendations' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Matchmaker</span>
          </button>
          <button
            onClick={() => handleNav('trust')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'trust' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Document Trust
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'how-it-works' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            How It Works
          </button>

          <div className="pt-2 border-t border-slate-200">
            {activeRole === 'BUYER' ? (
              <button
                onClick={() => handleNav('buyer')}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center space-x-2"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Buyer Wishlist ({savedCount} Saved)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenCreateWizard();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ List New Land</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
