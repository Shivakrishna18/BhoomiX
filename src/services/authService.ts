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

const AUTH_USER_STORAGE_KEY = 'bhoomix_authenticated_user_profile_v3';

// Built-in Demo / Test Personas for seamless testing across devices & judge mode
export const DEMO_TEST_PERSONAS: Record<UserRole, UserProfile> = {
  BUYER: {
    id: 'user_buyer_srikanth_rao',
    displayName: 'Srikanth Rao',
    email: 'srikanth.rao@bhoomix.in',
    phone: '+91 98490 12345',
    role: 'BUYER',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  SELLER: {
    id: 'user_seller_venkata_reddy',
    displayName: 'Venkata Reddy (Pattadar)',
    email: 's16677481@gmail.com',
    phone: '+91 98480 54321',
    role: 'SELLER',
    createdAt: '2026-01-10T09:30:00.000Z',
  },
  ADMIN: {
    id: 'user_admin_bhoomix',
    displayName: 'BhoomiX Land Officer',
    email: 'officer@bhoomix.in',
    phone: '+91 98000 00000',
    role: 'ADMIN',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
};

export const authService = {
  // Get active cached session or default to initial role profile
  getCurrentStoredProfile(preferredRole: UserRole = 'BUYER'): UserProfile {
    try {
      const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return DEMO_TEST_PERSONAS[preferredRole];
  },

  // Save active profile to localStorage and broadcast change event
  saveActiveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(profile));
      window.dispatchEvent(
        new CustomEvent('bhoomix_auth_changed', { detail: { user: profile } })
      );
      // Sync to Firestore quietly in the background
      setDoc(doc(db, 'users', profile.id), profile, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Profile save note:', e);
    }
  },

  // Listen for Auth changes from Firebase & custom switches
  onAuthChange(callback: (user: UserProfile) => void) {
    // 1. Initial fire with current stored profile
    const initialProfile = this.getCurrentStoredProfile('BUYER');
    callback(initialProfile);

    // 2. Firebase Auth state listener
    const unsubscribeFb = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            this.saveActiveProfile(profile);
            callback(profile);
            return;
          }
          // Construct profile from Firebase User
          const newProfile: UserProfile = {
            id: fbUser.uid,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'BhoomiX User',
            email: fbUser.email || '',
            avatarUrl: fbUser.photoURL || undefined,
            role: 'BUYER',
            createdAt: new Date().toISOString(),
          };
          this.saveActiveProfile(newProfile);
          callback(newProfile);
        } catch (e) {
          console.warn('Firebase auth listener sync note:', e);
        }
      }
    });

    // 3. Custom event listener for instant local role / test persona switching
    const handleCustomAuth = (e: Event) => {
      const customEvent = e as CustomEvent<{ user: UserProfile }>;
      if (customEvent.detail && customEvent.detail.user) {
        callback(customEvent.detail.user);
      }
    };
    window.addEventListener('bhoomix_auth_changed', handleCustomAuth);

    return () => {
      unsubscribeFb();
      window.removeEventListener('bhoomix_auth_changed', handleCustomAuth);
    };
  },

  // Google Sign-In with Firebase Auth popup
  async signInWithGoogle(preferredRole: UserRole = 'BUYER'): Promise<UserProfile> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const existing = userSnap.data() as UserProfile;
        this.saveActiveProfile(existing);
        return existing;
      }

      const newProfile: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'BhoomiX User',
        role: preferredRole,
        avatarUrl: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, newProfile);
      this.saveActiveProfile(newProfile);
      return newProfile;
    } catch (error: any) {
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

      const profile: UserProfile = {
        id: fbUser.uid,
        email,
        displayName,
        phone,
        role,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', fbUser.uid), profile);
      this.saveActiveProfile(profile);
      return profile;
    } catch (error: any) {
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
        const profile = userSnap.data() as UserProfile;
        this.saveActiveProfile(profile);
        return profile;
      }

      const profile: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split('@')[0],
        role: 'BUYER',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', fbUser.uid), profile);
      this.saveActiveProfile(profile);
      return profile;
    } catch (error: any) {
      console.error('Email login failed:', error);
      throw error;
    }
  },

  // Update current user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.getCurrentStoredProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveActiveProfile(updated);

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Firestore user update note:', error);
    }

    return updated;
  },

  // Set / Switch to a specific persona (for Judge Mode or testing)
  async setDemoUser(persona: UserProfile): Promise<UserProfile> {
    this.saveActiveProfile(persona);
    return persona;
  },

  // Switch role between BUYER and SELLER
  async switchRole(newRole: UserRole): Promise<UserProfile> {
    const current = this.getCurrentStoredProfile(newRole);
    const updated: UserProfile = {
      ...current,
      role: newRole,
      updatedAt: new Date().toISOString(),
    };
    this.saveActiveProfile(updated);
    return updated;
  },

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await fbSignOut(auth);
    } catch {}
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    // Reset to demo buyer profile
    const defaultBuyer = DEMO_TEST_PERSONAS.BUYER;
    this.saveActiveProfile(defaultBuyer);
  },
};
