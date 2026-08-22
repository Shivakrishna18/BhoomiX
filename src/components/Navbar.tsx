import React, { useState, useRef, useEffect } from 'react';
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
  LogOut,
  ChevronDown,
  MessageSquare,
  Compass,
  FileCheck,
  Settings,
  LogIn,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { BhoomiXLogo } from './BhoomiXLogo';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenCreateWizard: () => void;
  onOpenAuth?: (role?: UserRole) => void;
  onOpenProfileModal?: () => void;
  onSignOut?: () => void;
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
  onOpenAuth,
  onOpenProfileModal,
  onSignOut,
  savedCount,
  compareCount = 0,
  onOpenCompare,
  unreadNotifsCount = 0,
  onOpenNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleRoleChange = (role: UserRole) => {
    onSelectRole(role);
    if (role === 'SELLER') {
      onNavigate('seller');
    } else if (activeTab === 'seller') {
      onNavigate('discover');
    }
    setProfileDropdownOpen(false);
  };

  const handleSignOutClick = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    onSignOut?.();
  };

  return (
    <header className="sticky top-2.5 sm:top-4 z-40 px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-300">
      <div className="liquid-glass-nav rounded-2xl sm:rounded-full border border-white/90 shadow-[0_16px_40px_-10px_rgba(79,70,229,0.09),0_2px_6px_rgba(0,0,0,0.02)] px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* 3D BhoomiX Logo & Brand */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <button
              id="navbar-logo-btn"
              onClick={() => handleNav('landing')}
              className="text-left focus:outline-hidden group cursor-pointer spring-press py-1"
            >
              <BhoomiXLogo size="md" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-slate-200/60">
              <button
                id="nav-home-btn"
                onClick={() => handleNav('landing')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer spring-press ${
                  activeTab === 'landing'
                    ? 'bg-slate-900/90 text-white shadow-[0_4px_12px_rgba(15,23,42,0.2)] font-bold backdrop-blur-md'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
                }`}
              >
                Home
              </button>

              <button
                id="nav-discover-btn"
                onClick={() => handleNav('discover')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer spring-press ${
                  activeTab === 'discover'
                    ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
                }`}
              >
                Explore Land
              </button>

              <button
                id="nav-ai-match-btn"
                onClick={() => handleNav('recommendations')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer spring-press ${
                  activeTab === 'recommendations'
                    ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'recommendations' ? 'text-amber-300' : 'text-indigo-600'}`} />
                <span>AI Matchmaker</span>
              </button>

              <button
                id="nav-trust-btn"
                onClick={() => handleNav('trust')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer spring-press ${
                  activeTab === 'trust'
                    ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
                }`}
              >
                Document Trust
              </button>

              <button
                id="nav-how-it-works-btn"
                onClick={() => handleNav('how-it-works')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer spring-press ${
                  activeTab === 'how-it-works'
                    ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
                }`}
              >
                About & Works
              </button>
            </nav>
          </div>

          {/* Desktop Right Action Bar */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Compare Badge Trigger */}
            {compareCount > 0 && onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="px-3 py-1.5 rounded-full bg-indigo-50/90 backdrop-blur-md text-indigo-700 border border-indigo-200/80 text-xs font-bold flex items-center space-x-1.5 hover:bg-indigo-100 transition-all cursor-pointer spring-press shadow-2xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Compare ({compareCount})</span>
              </button>
            )}

            {/* Role Switcher Pill (BUYER vs SELLER) - Liquid Glass Segmented */}
            <div className="flex items-center p-1 bg-slate-200/40 backdrop-blur-xl rounded-full border border-white/90 shadow-inner">
              <button
                id="nav-buyer-role-btn"
                onClick={() => handleRoleChange('BUYER')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 spring-press ${
                  activeRole === 'BUYER'
                    ? 'bg-white text-indigo-700 shadow-[0_2px_8px_rgba(15,23,42,0.08)]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Buyer</span>
              </button>

              <button
                id="nav-seller-role-btn"
                onClick={() => handleRoleChange('SELLER')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 spring-press ${
                  activeRole === 'SELLER'
                    ? 'bg-white text-indigo-700 shadow-[0_2px_8px_rgba(15,23,42,0.08)]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Seller</span>
              </button>
            </div>

            {/* Notification Bell Trigger */}
            {onOpenNotifications && (
              <button
                id="nav-notifications-btn"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full bg-white/80 hover:bg-white border border-white/90 text-slate-700 transition-all cursor-pointer spring-press shadow-2xs hover:shadow-xs"
                title="View activity & direct notifications"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            )}

            {/* Primary Action Button (Wishlist for Buyer, List Land for Seller) */}
            {activeRole === 'BUYER' ? (
              <button
                id="nav-wishlist-btn"
                onClick={() => handleNav('buyer')}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-[0_4px_16px_rgba(79,70,229,0.28)] transition-all cursor-pointer spring-press"
                title="View your saved land wishlist"
              >
                <Heart className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse" />
                <span>Wishlist</span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {savedCount}
                </span>
              </button>
            ) : (
              <button
                id="nav-list-land-btn"
                onClick={onOpenCreateWizard}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-[0_4px_16px_rgba(79,70,229,0.28)] transition-all cursor-pointer spring-press"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ List Land</span>
              </button>
            )}

            {/* Profile Avatar & Dropdown / Sign-In Button */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="nav-profile-menu-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 pr-2.5 rounded-full bg-white/80 hover:bg-white border border-white/90 shadow-2xs transition-all cursor-pointer group spring-press"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    {currentUser.displayName?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-transform" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-68 liquid-glass rounded-2xl shadow-[0_20px_50px_-10px_rgba(15,23,42,0.15)] border border-white/90 p-2 space-y-1 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-200/60 mb-1">
                      <p className="text-xs font-bold text-slate-900">{currentUser.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email || 'Verified Account'}</p>
                      <div className="flex items-center space-x-1.5 mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-700">
                          {currentUser.role === 'SELLER' ? 'Pattadar Landowner' : 'Direct Land Buyer'}
                        </span>
                      </div>
                    </div>

                    {onOpenProfileModal && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenProfileModal();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white/80 hover:text-indigo-900 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-indigo-600" />
                        <span>Edit Profile & Contact Details</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNav(currentUser.role === 'SELLER' ? 'seller' : 'buyer')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white/80 hover:text-indigo-900 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>{currentUser.role === 'SELLER' ? 'Seller Studio Dashboard' : 'Buyer Dashboard & Activity'}</span>
                    </button>

                    <button
                      onClick={() => handleNav('seller')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white/80 hover:text-indigo-900 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>My Land Listings</span>
                    </button>

                    <button
                      onClick={() => handleNav('buyer')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white/80 hover:text-indigo-900 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Saved Land Wishlist ({savedCount})</span>
                    </button>

                    <div className="pt-1 border-t border-slate-200/60 mt-1">
                      <button
                        onClick={() => handleRoleChange(activeRole === 'BUYER' ? 'SELLER' : 'BUYER')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white/80 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-slate-500" />
                        <span>Switch to {activeRole === 'BUYER' ? 'Seller' : 'Buyer'} View</span>
                      </button>

                      {onOpenAuth && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onOpenAuth(activeRole);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white/80 flex items-center space-x-2 transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Switch Account / Sign In</span>
                        </button>
                      )}

                      <button
                        onClick={handleSignOutClick}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/80 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth?.(activeRole)}
                className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-[0_4px_14px_rgba(15,23,42,0.2)] transition-all cursor-pointer spring-press"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Quick Role Toggle */}
            <div className="flex items-center p-0.5 bg-slate-200/60 rounded-full border border-white/80 text-xs font-bold">
              <button
                onClick={() => handleRoleChange('BUYER')}
                className={`px-2 py-0.5 rounded-full ${
                  activeRole === 'BUYER' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => handleRoleChange('SELLER')}
                className={`px-2 py-0.5 rounded-full ${
                  activeRole === 'SELLER' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Seller
              </button>
            </div>

            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="p-1.5 rounded-full bg-white/80 border border-white/90 text-slate-700 relative cursor-pointer"
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
                className="p-1.5 rounded-full bg-indigo-50/90 text-indigo-700 border border-indigo-200 relative"
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
                className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-600 text-white text-xs font-bold shadow-xs"
              >
                + List
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-slate-700 bg-white/80 border border-white/90 hover:bg-white focus:outline-hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 liquid-glass rounded-2xl border border-white/90 p-4 space-y-3 shadow-2xl animate-in fade-in-50 zoom-in-98 duration-150">
          {/* User Status Bar */}
          {currentUser ? (
            <div className="p-3 bg-white/60 rounded-xl border border-white/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{currentUser.displayName}</p>
                  <p className="text-[10px] text-slate-500">{currentUser.email || 'Verified Account'}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                {currentUser.role}
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth?.(activeRole);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google or Email</span>
            </button>
          )}

          {/* Navigation Items */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => handleNav('landing')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'landing' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('discover')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'discover' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              Explore Land
            </button>

            <button
              onClick={() => handleNav('recommendations')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 ${
                activeTab === 'recommendations' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Matchmaker</span>
            </button>

            <button
              onClick={() => handleNav('trust')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'trust' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              Document Trust
            </button>

            <button
              onClick={() => handleNav('how-it-works')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'how-it-works' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              About & How It Works
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200/60 space-y-2">
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
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 text-white flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ List New Land Parcel</span>
              </button>
            )}

            {currentUser && onOpenProfileModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfileModal();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/70 text-slate-800 border border-white/90 flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Edit Profile & Contact Number</span>
              </button>
            )}

            {currentUser && onSignOut && (
              <button
                onClick={handleSignOutClick}
                className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/80 flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
