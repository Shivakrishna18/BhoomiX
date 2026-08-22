import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Check, AlertCircle, Building2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { authService, formatIndianPhoneNumber, validateIndianPhoneNumber } from '../services/authService';
import { auth } from '../lib/firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onProfileUpdated?: (updated: UserProfile) => void;
  initialMessage?: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  initialMessage,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('BUYER');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setPhone(currentUser.phone || currentUser.phoneNumber || '');
      setRole(currentUser.role || 'BUYER');
      setError(null);
      setSavedSuccess(false);
      setSaving(false);
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return; // Prevent double submission

    setError(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (!cleanFirst) {
      setError('Please enter your First Name.');
      return;
    }

    if (phone.trim() && !validateIndianPhoneNumber(phone)) {
      setError('Please enter a valid 10-digit mobile number (+91).');
      return;
    }

    // Resolve active authenticated user UID
    const targetUid = auth.currentUser?.uid || currentUser.id;
    if (!targetUid) {
      setError('Your session has expired. Please sign in again.');
      return;
    }

    const cleanPhone = phone.trim() ? formatIndianPhoneNumber(phone) : '';

    setSaving(true);
    try {
      const displayName = `${cleanFirst} ${cleanLast}`.trim();
      const updated = await authService.updateUserProfile(targetUid, {
        firstName: cleanFirst,
        lastName: cleanLast,
        displayName,
        phone: cleanPhone,
        phoneNumber: cleanPhone,
        role,
      });

      // Update parent state and notify
      onProfileUpdated?.(updated);
      setSavedSuccess(true);

      // Smoothly close after user sees the verified success checkmark
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1100);
    } catch (err: any) {
      console.error('[BhoomiX Profile] Save error details:', err);

      if (
        !navigator.onLine ||
        err?.message?.includes('network') ||
        err?.message?.includes('offline') ||
        err?.message?.includes('connect') ||
        err?.message?.includes('timed out')
      ) {
        setError('Unable to save profile. Please check your internet connection and try again.');
      } else if (
        err?.code === 'permission-denied' ||
        err?.message?.includes('permission') ||
        err?.message?.includes('denied')
      ) {
        setError('Profile update permission denied. Please sign in again.');
      } else if (err?.message?.includes('session') || err?.message?.includes('Unauthenticated')) {
        setError('Your session has expired. Please sign in again.');
      } else {
        setError(err?.message || 'Unable to save your profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
      <div className="liquid-glass-card bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-white/90 overflow-hidden relative">
        {/* Header */}
        <div className="liquid-glass-dark text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold shrink-0 backdrop-blur-md shadow-inner">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Your BhoomiX Profile</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authenticated Account • {currentUser.email || 'Direct User'}
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

        {/* Notice banner if needed */}
        {initialMessage && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center space-x-2 text-xs text-amber-900 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{initialMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50/90 backdrop-blur-md border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start space-x-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50/90 backdrop-blur-md border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 shadow-2xs animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Profile updated successfully!</span>
            </div>
          )}

          {/* Account Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Account Type / Primary Role</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`py-3 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all spring-press cursor-pointer ${
                  role === 'BUYER'
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white/70 backdrop-blur-md text-slate-700 hover:bg-white'
                }`}
              >
                <User className={`w-3.5 h-3.5 ${role === 'BUYER' ? 'text-white' : 'text-indigo-600'}`} />
                <span>Buyer / Investor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`py-3 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all spring-press cursor-pointer ${
                  role === 'SELLER'
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white/70 backdrop-blur-md text-slate-700 hover:bg-white'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${role === 'SELLER' ? 'text-white' : 'text-indigo-600'}`} />
                <span>Pattadar / Seller</span>
              </button>
            </div>
          </div>

          {/* First and Last Name */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white/80 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                placeholder="e.g. Kumar"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white/80 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Email Address (Read-only from Firebase Auth) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                disabled
                value={currentUser.email || ''}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-100/70 border border-slate-200 rounded-2xl text-slate-600 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Verified via Firebase Authentication.</p>
          </div>

          {/* Mobile / WhatsApp Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile / WhatsApp Contact Number (+91)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                placeholder="+91 98480 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/80 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Required for 1-click contact number sharing in buyer-seller conversations.
            </p>
          </div>

          {/* Security details */}
          <div className="p-3.5 bg-slate-50/80 backdrop-blur-md rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
            <div className="flex items-center space-x-1.5 text-slate-700 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Identity Verification</span>
            </div>
            <p className="text-[11px] text-slate-500">
              UID: <span className="font-mono text-slate-700">{currentUser.id}</span>
            </p>
          </div>

          <div className="pt-2 flex space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold border border-slate-200 bg-white/80 backdrop-blur-md rounded-full hover:bg-white text-slate-700 transition-all spring-press cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || savedSuccess}
              className={`flex-1 py-3 text-xs font-bold rounded-full shadow-md transition-all spring-press disabled:opacity-75 flex items-center justify-center space-x-1.5 cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved ✓</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
