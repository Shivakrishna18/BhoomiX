import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { authService, DEMO_TEST_PERSONAS } from '../services/authService';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  onSuccess?: (user: UserProfile) => void;
}

function formatAuthError(err: any): string {
  const code = err?.code || '';
  const message = err?.message || '';

  if (code === 'auth/unauthorized-domain' || message.includes('auth/unauthorized-domain')) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
    console.error(
      `[BhoomiX Firebase Auth Diagnostic]\n` +
      `Error: auth/unauthorized-domain\n` +
      `Host: ${hostname}\n` +
      `Firebase Project: boxwood-transducer-dmvz5\n` +
      `Resolution: Add "${hostname}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`
    );
    return 'Sign-in is temporarily unavailable on this domain. Please try again in a moment or use the 1-Click test personas below.';
  }

  if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user') || code === 'auth/cancelled-popup-request') {
    return 'Sign-in popup was closed before completion. Please try again.';
  }

  if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
    return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    message.includes('auth/invalid-credential') ||
    message.includes('auth/user-not-found') ||
    message.includes('auth/wrong-password')
  ) {
    return 'Invalid email or password. You can sign up as a new user or use the 1-Click test personas below.';
  }

  if (code === 'auth/email-already-in-use' || message.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (code === 'auth/weak-password' || message.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  if (code === 'auth/invalid-email' || message.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }

  if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
    return 'Network connection error. Please check your internet connection.';
  }

  if (code === 'auth/operation-not-allowed' || message.includes('operation-not-allowed')) {
    return 'This authentication method is currently disabled in Firebase Console.';
  }

  return message || 'Authentication failed. Please check your credentials.';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'BUYER',
  onSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validatePhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!firstName.trim()) {
        setError('Please enter your First Name.');
        return;
      }
      if (!lastName.trim()) {
        setError('Please enter your Last Name.');
        return;
      }
      if (phone && !validatePhone(phone)) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const profile = await authService.signUpWithEmail(
          email,
          password,
          firstName,
          lastName,
          role,
          phone
        );
        onSuccess?.(profile);
        onClose();
      } else {
        const profile = await authService.loginWithEmail(email, password);
        onSuccess?.(profile);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const profile = await authService.signInWithGoogle(role);
      onSuccess?.(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersonaLogin = async (personaKey: keyof typeof DEMO_TEST_PERSONAS) => {
    setLoading(true);
    setError(null);
    try {
      const persona = DEMO_TEST_PERSONAS[personaKey];
      const result = await authService.setDemoUser(persona);
      onSuccess?.(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch test account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
      <div className="liquid-glass-card bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-white/90 overflow-hidden relative">
        {/* Header */}
        <div className="liquid-glass-dark text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-white">
              {isSignUp ? 'Create your BhoomiX account' : 'Sign in to BhoomiX'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct-to-direct verified land platform • Telangana
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-5 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50/90 backdrop-blur-md border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start space-x-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Account Type / Role:</label>
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

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-full border border-slate-200 bg-white/80 backdrop-blur-md hover:bg-white text-slate-800 text-xs font-bold flex items-center justify-center space-x-2.5 transition-all spring-press disabled:opacity-50 shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center space-x-2 my-2">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Or with Email</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white/80 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Kumar"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white/80 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/80 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp (+91)</label>
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
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/80 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all spring-press disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create BhoomiX Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Login / SignUp */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign in here' : "Don't have an account? Create one in seconds"}
            </button>
          </div>

          {/* Judge / 1-Click Test Personas */}
          <div className="pt-3 border-t border-slate-200/80">
            <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Test Personas</span>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickPersonaLogin('SELLER_RAHUL')}
                className="w-full text-left p-3 rounded-2xl bg-white/70 backdrop-blur-md hover:bg-white border border-slate-200/80 hover:border-indigo-300 transition-all spring-press flex items-center justify-between text-xs cursor-pointer shadow-2xs"
              >
                <div>
                  <p className="font-bold text-slate-900">Rahul Kumar (Seller / Pattadar)</p>
                  <p className="text-[11px] text-slate-500">seller.rahul@bhoomix.in • +91 98480 54321</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Seller Portal
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersonaLogin('BUYER_SHIVA')}
                className="w-full text-left p-3 rounded-2xl bg-white/70 backdrop-blur-md hover:bg-white border border-slate-200/80 hover:border-indigo-300 transition-all spring-press flex items-center justify-between text-xs cursor-pointer shadow-2xs"
              >
                <div>
                  <p className="font-bold text-slate-900">Shiva Krishna (Buyer / Investor)</p>
                  <p className="text-[11px] text-slate-500">buyer.shiva@bhoomix.in • +91 98490 12345</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Buyer Portal
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
