import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, Phone, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  onSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'BUYER',
  onSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) throw new Error('Please enter your full name');
        const profile = await authService.signUpWithEmail(email, password, displayName, role, phone);
        onSuccess?.(profile);
        onClose();
      } else {
        const profile = await authService.loginWithEmail(email, password);
        onSuccess?.(profile);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found')) {
        msg = 'Invalid email or password. You can also sign up as a new user or use 1-Click Judge Mode below.';
      }
      setError(msg);
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
      setError(err.message || 'Google sign-in popup was closed or unavailable in this window.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Judge & Test Logins
  const handleQuickDemoLogin = async (demoRole: UserRole, name: string, emailStr: string, phoneStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const demoUser: UserProfile = {
        id: `demo-user-${demoRole.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`,
        email: emailStr,
        displayName: name,
        phone: phoneStr,
        role: demoRole,
        createdAt: new Date().toISOString(),
      };
      const result = await authService.setDemoUser(demoUser);
      onSuccess?.(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden relative">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {isSignUp ? 'Create your BhoomiX account' : 'Sign in to BhoomiX'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct-to-direct verified land platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2">
              <span className="font-bold">Notice:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">I am using BhoomiX as a:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                  role === 'BUYER'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Land Buyer / Investor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                  role === 'SELLER'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Land Owner / Seller</span>
              </button>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 shadow-xs"
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Venkata Reddy"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 98480 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isSignUp ? 'Create BhoomiX Account' : 'Sign In'}
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
              className="text-xs text-indigo-600 hover:underline font-bold"
            >
              {isSignUp ? 'Already have an account? Sign in here' : "Don't have an account? Create one in seconds"}
            </button>
          </div>

          {/* Judge / 1-Click Test Modes */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Test Personas (Judge Mode)</span>
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin(
                    'SELLER',
                    'Venkata Reddy Garu',
                    'seller.reddy@bhoomix-demo.in',
                    '+91 98480 22334'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">Venkata Reddy Garu</p>
                  <p className="text-[11px] text-slate-500">Seller • Maheshwaram Commercial Land</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Seller View
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin(
                    'BUYER',
                    'Ananya Sharma',
                    'ananya.sharma@bhoomix-demo.in',
                    '+91 99887 76655'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">Ananya Sharma</p>
                  <p className="text-[11px] text-slate-500">Buyer • Looking for Shankarpally / Mokila Plot</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Buyer View
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
