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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* 3D BhoomiX Logo & Brand */}
          <div className="flex items-center space-x-6">
            <button
              id="navbar-logo-btn"
              onClick={() => handleNav('landing')}
              className="text-left focus:outline-hidden group cursor-pointer"
            >
              <BhoomiXLogo size="md" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-slate-200">
              <button
                id="nav-home-btn"
                onClick={() => handleNav('landing')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'landing'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </button>

              <button
                id="nav-discover-btn"
                onClick={() => handleNav('discover')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'discover'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Explore Land
              </button>

              <button
                id="nav-ai-match-btn"
                onClick={() => handleNav('recommendations')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'recommendations'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Matchmaker</span>
              </button>

              <button
                id="nav-trust-btn"
                onClick={() => handleNav('trust')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
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
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'how-it-works'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                About & Works
              </button>
            </nav>
          </div>

          {/* Desktop Right Action Bar */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Compare Badge Trigger */}
            {compareCount > 0 && onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center space-x-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Compare ({compareCount})</span>
              </button>
            )}

            {/* Role Switcher Pill (BUYER vs SELLER) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                id="nav-buyer-role-btn"
                onClick={() => handleRoleChange('BUYER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeRole === 'BUYER'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Buyer</span>
              </button>

              <button
                id="nav-seller-role-btn"
                onClick={() => handleRoleChange('SELLER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeRole === 'SELLER'
                    ? 'bg-white text-indigo-700 shadow-xs'
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

            {/* Primary Action Button (Wishlist for Buyer, List Land for Seller) */}
            {activeRole === 'BUYER' ? (
              <button
                id="nav-wishlist-btn"
                onClick={() => handleNav('buyer')}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  activeTab === 'buyer'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                title="View your saved land wishlist"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
                <span>Wishlist</span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {savedCount}
                </span>
              </button>
            ) : (
              <button
                id="nav-list-land-btn"
                onClick={onOpenCreateWizard}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ List Land</span>
              </button>
            )}

            {/* Profile Avatar & Dropdown / Sign-In Button */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="nav-profile-menu-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                      {currentUser.displayName}
                    </p>
                    <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 space-y-1 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">{currentUser.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email || 'Verified Account'}</p>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
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
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-indigo-600" />
                        <span>Edit Profile & Contact Details</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNav(currentUser.role === 'SELLER' ? 'seller' : 'buyer')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>{currentUser.role === 'SELLER' ? 'Seller Studio Dashboard' : 'Buyer Dashboard & Activity'}</span>
                    </button>

                    <button
                      onClick={() => handleNav('seller')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>My Land Listings</span>
                    </button>

                    <button
                      onClick={() => handleNav('buyer')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Saved Land Wishlist ({savedCount})</span>
                    </button>

                    <div className="pt-1 border-t border-slate-100 mt-1">
                      <button
                        onClick={() => handleRoleChange(activeRole === 'BUYER' ? 'SELLER' : 'BUYER')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors cursor-pointer"
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
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Switch Account / Sign In</span>
                        </button>
                      )}

                      <button
                        onClick={handleSignOutClick}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors cursor-pointer"
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
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Quick Role Toggle */}
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {/* User Status Bar */}
          {currentUser ? (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{currentUser.displayName}</p>
                  <p className="text-[10px] text-slate-500">{currentUser.email || 'Verified Account'}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">
                {currentUser.role}
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth?.(activeRole);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google or Email</span>
            </button>
          )}

          {/* Navigation Items */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => handleNav('landing')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'landing' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('discover')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'discover' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Explore Land
            </button>

            <button
              onClick={() => handleNav('recommendations')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 ${
                activeTab === 'recommendations' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Matchmaker</span>
            </button>

            <button
              onClick={() => handleNav('trust')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'trust' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Document Trust
            </button>

            <button
              onClick={() => handleNav('how-it-works')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'how-it-works' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              About & How It Works
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
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
                <span>+ List New Land Parcel</span>
              </button>
            )}

            {currentUser && onOpenProfileModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfileModal();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Edit Profile & Contact Number</span>
              </button>
            )}

            {currentUser && onSignOut && (
              <button
                onClick={handleSignOutClick}
                className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center justify-center space-x-1.5"
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
