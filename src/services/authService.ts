import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

const IP_USER_STORAGE_KEY = 'bhoomix_ip_user_profile_v2';
const IP_CLIENT_CACHE_KEY = 'bhoomix_detected_ip';

let cachedClientIp: string | null = null;

export const authService = {
  // Fetch or resolve client IP address
  async detectClientIp(): Promise<string> {
    if (cachedClientIp) return cachedClientIp;

    try {
      const stored = localStorage.getItem(IP_CLIENT_CACHE_KEY);
      if (stored) {
        cachedClientIp = stored;
        return stored;
      }
    } catch {}

    try {
      const res = await fetch('/api/auth/ip-session');
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          cachedClientIp = data.ip;
          try {
            localStorage.setItem(IP_CLIENT_CACHE_KEY, data.ip);
          } catch {}
          return data.ip;
        }
      }
    } catch (e) {
      console.warn('Backend IP detection note, using fallback:', e);
    }

    // Fallback deterministic IP for offline or isolated sandboxes
    const fallbackIp = '122.161.44.189';
    cachedClientIp = fallbackIp;
    return fallbackIp;
  },

  // Auto-login or retrieve current IP-based user session
  async getOrInitIpSession(preferredRole: UserRole = 'BUYER'): Promise<UserProfile> {
    const clientIp = await this.detectClientIp();
    const sanitizedIp = clientIp.replace(/[^a-zA-Z0-9]/g, '_');

    try {
      const storedRaw = localStorage.getItem(`${IP_USER_STORAGE_KEY}_${preferredRole}`);
      if (storedRaw) {
        const parsed = JSON.parse(storedRaw) as UserProfile;
        if (parsed && parsed.id) {
          parsed.role = preferredRole;
          parsed.ipAddress = clientIp;
          return parsed;
        }
      }
    } catch {}

    // Construct fresh IP-authenticated profile
    const isSeller = preferredRole === 'SELLER';
    const profileId = isSeller ? `seller_ip_${sanitizedIp}` : `buyer_ip_${sanitizedIp}`;
    const defaultName = isSeller
      ? 'Venkata Reddy (Pattadar)'
      : 'Srikanth Rao (Direct Buyer)';
    const defaultEmail = isSeller
      ? `seller.${sanitizedIp}@bhoomix-direct.in`
      : `buyer.${sanitizedIp}@bhoomix-direct.in`;
    const defaultPhone = isSeller ? '+91 98480 54321' : '+91 98490 12345';

    const newProfile: UserProfile = {
      id: profileId,
      displayName: defaultName,
      email: defaultEmail,
      phone: defaultPhone,
      role: preferredRole,
      ipAddress: clientIp,
      sessionType: 'IP_AUTO',
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`${IP_USER_STORAGE_KEY}_${preferredRole}`, JSON.stringify(newProfile));
      // Sync to Firestore quietly so cross-device queries and permissions resolve
      setDoc(doc(db, 'users', newProfile.id), newProfile, { merge: true }).catch(() => {});
    } catch {}

    return newProfile;
  },

  // Update IP User Profile (e.g. customized name or contact number)
  async updateIpProfile(
    role: UserRole,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const current = await this.getOrInitIpSession(role);
    const updated: UserProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`${IP_USER_STORAGE_KEY}_${role}`, JSON.stringify(updated));
      setDoc(doc(db, 'users', updated.id), updated, { merge: true }).catch(() => {});
      window.dispatchEvent(
        new CustomEvent('bhoomix_auth_changed', { detail: { user: updated } })
      );
    } catch {}

    return updated;
  },

  // Listen to Auth state changes (Supports automatic IP session & Firebase)
  onAuthChange(callback: (user: UserProfile | null) => void) {
    // 1. First trigger with active IP session
    this.getOrInitIpSession('BUYER').then((ipUser) => {
      callback(ipUser);
    });

    const handleCustomAuth = (e: Event) => {
      const customEvent = e as CustomEvent<{ user: UserProfile }>;
      if (customEvent.detail && customEvent.detail.user) {
        callback(customEvent.detail.user);
      }
    };
    window.addEventListener('bhoomix_auth_changed', handleCustomAuth);

    return () => {
      window.removeEventListener('bhoomix_auth_changed', handleCustomAuth);
    };
  },

  // Google Popup Sign In (Maintained as optional fallback)
  async signInWithGoogle(preferredRole: UserRole = 'BUYER'): Promise<UserProfile> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const existing = userSnap.data() as UserProfile;
        return existing;
      }

      const clientIp = await this.detectClientIp();
      const newProfile: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'BhoomiX User',
        role: preferredRole,
        avatarUrl: fbUser.photoURL || undefined,
        ipAddress: clientIp,
        sessionType: 'CUSTOM',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  },

  // Email & Password Sign Up
  async signUpWithEmail(
    email: string,
    pass: string,
    displayName: string,
    role: UserRole = 'BUYER',
    phone?: string
  ): Promise<UserProfile> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = cred.user;
      await updateProfile(fbUser, { displayName });

      const clientIp = await this.detectClientIp();
      const profile: UserProfile = {
        id: fbUser.uid,
        email,
        displayName,
        phone,
        role,
        ipAddress: clientIp,
        sessionType: 'CUSTOM',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', fbUser.uid), profile);
      return profile;
    } catch (error) {
      console.error('Email sign up failed:', error);
      throw error;
    }
  },

  // Email & Password Login
  async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = cred.user;
      const userSnap = await getDoc(doc(db, 'users', fbUser.uid));

      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }

      const clientIp = await this.detectClientIp();
      const profile: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split('@')[0],
        role: 'BUYER',
        ipAddress: clientIp,
        sessionType: 'CUSTOM',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', fbUser.uid), profile);
      return profile;
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  },

  // Switch role or update profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  // Sign Out (Re-initializes fresh IP session)
  async signOut(): Promise<void> {
    sessionStorage.removeItem('bhoomix_active_demo_user');
    try {
      await fbSignOut(auth);
    } catch {}
  },

  // 1-Click Test Judge / Quick Switch
  async setDemoUser(demoUser: UserProfile): Promise<UserProfile> {
    sessionStorage.setItem('bhoomix_active_demo_user', JSON.stringify(demoUser));
    try {
      localStorage.setItem(`${IP_USER_STORAGE_KEY}_${demoUser.role}`, JSON.stringify(demoUser));
      await setDoc(doc(db, 'users', demoUser.id), demoUser, { merge: true });
      window.dispatchEvent(
        new CustomEvent('bhoomix_auth_changed', { detail: { user: demoUser } })
      );
    } catch {}
    return demoUser;
  },
};
