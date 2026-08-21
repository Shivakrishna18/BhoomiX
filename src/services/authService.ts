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
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

const AUTH_USER_STORAGE_KEY = 'bhoomix_authenticated_user_profile_v4';

// Helper to parse Full Name into First and Last names
export function parseNames(fullName?: string | null): { firstName: string; lastName: string } {
  if (!fullName || !fullName.trim()) {
    return { firstName: 'BhoomiX', lastName: 'User' };
  }
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || 'User';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

// Built-in Test Personas for Judge Mode and Seamless Testing
export const DEMO_TEST_PERSONAS: Record<string, UserProfile> = {
  SELLER_RAHUL: {
    id: 'user_seller_rahul_kumar',
    userId: 'user_seller_rahul_kumar',
    firstName: 'Rahul',
    lastName: 'Kumar',
    displayName: 'Rahul Kumar',
    email: 'seller.rahul@bhoomix.in',
    phone: '+91 98480 54321',
    phoneNumber: '+91 98480 54321',
    role: 'SELLER',
    createdAt: '2026-01-10T09:30:00.000Z',
  },
  BUYER_SHIVA: {
    id: 'user_buyer_shiva_krishna',
    userId: 'user_buyer_shiva_krishna',
    firstName: 'Shiva',
    lastName: 'Krishna',
    displayName: 'Shiva Krishna',
    email: 'buyer.shiva@bhoomix.in',
    phone: '+91 98490 12345',
    phoneNumber: '+91 98490 12345',
    role: 'BUYER',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
};

export const authService = {
  // Get active cached session or return null when not logged in
  getCurrentStoredProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return null;
  },

  // Save active profile to localStorage and broadcast change event
  saveActiveProfile(profile: UserProfile | null): void {
    try {
      if (profile) {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(profile));
        window.dispatchEvent(
          new CustomEvent('bhoomix_auth_changed', { detail: { user: profile } })
        );
        // Persist to Firestore in background
        setDoc(
          doc(db, 'users', profile.id),
          {
            ...profile,
            userId: profile.id,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      } else {
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        window.dispatchEvent(
          new CustomEvent('bhoomix_auth_changed', { detail: { user: null } })
        );
      }
    } catch (e) {
      console.warn('Profile save note:', e);
    }
  },

  // Listen for Auth changes from Firebase & custom switches
  onAuthChange(callback: (user: UserProfile | null) => void) {
    // 1. Initial fire with current stored profile (or null)
    const initialProfile = this.getCurrentStoredProfile();
    callback(initialProfile);

    // 2. Firebase Auth state listener
    const unsubscribeFb = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const profile = { id: fbUser.uid, userId: fbUser.uid, ...userDoc.data() } as UserProfile;
            this.saveActiveProfile(profile);
            callback(profile);
            return;
          }
          // Construct profile from Firebase User
          const { firstName, lastName } = parseNames(fbUser.displayName);
          const newProfile: UserProfile = {
            id: fbUser.uid,
            userId: fbUser.uid,
            firstName,
            lastName,
            displayName: fbUser.displayName || `${firstName} ${lastName}`.trim() || fbUser.email?.split('@')[0] || 'BhoomiX User',
            email: fbUser.email || '',
            phoneNumber: fbUser.phoneNumber || undefined,
            phone: fbUser.phoneNumber || undefined,
            profilePhoto: fbUser.photoURL || undefined,
            avatarUrl: fbUser.photoURL || undefined,
            role: 'BUYER',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', fbUser.uid), newProfile);
          this.saveActiveProfile(newProfile);
          callback(newProfile);
        } catch (e) {
          console.warn('Firebase auth listener sync note:', e);
        }
      } else {
        // If not logged into Firebase Auth, check if custom persona is stored in local storage
        const current = this.getCurrentStoredProfile();
        if (!current) {
          callback(null);
        }
      }
    });

    // 3. Custom event listener for instant local role / test persona switching
    const handleCustomAuth = (e: Event) => {
      const customEvent = e as CustomEvent<{ user: UserProfile | null }>;
      callback(customEvent.detail?.user || null);
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

      const { firstName, lastName } = parseNames(fbUser.displayName);

      if (userSnap.exists()) {
        const existing = { id: fbUser.uid, userId: fbUser.uid, ...userSnap.data() } as UserProfile;
        // Merge latest photo if available
        if (fbUser.photoURL && !existing.profilePhoto) {
          existing.profilePhoto = fbUser.photoURL;
          existing.avatarUrl = fbUser.photoURL;
          await updateDoc(userDocRef, {
            profilePhoto: fbUser.photoURL,
            avatarUrl: fbUser.photoURL,
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
        this.saveActiveProfile(existing);
        return existing;
      }

      const newProfile: UserProfile = {
        id: fbUser.uid,
        userId: fbUser.uid,
        firstName,
        lastName,
        displayName: fbUser.displayName || `${firstName} ${lastName}`.trim() || 'BhoomiX User',
        email: fbUser.email || '',
        phoneNumber: fbUser.phoneNumber || undefined,
        phone: fbUser.phoneNumber || undefined,
        role: preferredRole,
        profilePhoto: fbUser.photoURL || undefined,
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
    firstName: string,
    lastName: string,
    role: UserRole = 'BUYER',
    phone?: string
  ): Promise<UserProfile> {
    try {
      const cleanFirst = firstName.trim();
      const cleanLast = lastName.trim();
      const displayName = `${cleanFirst} ${cleanLast}`.trim();

      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = cred.user;
      await updateProfile(fbUser, { displayName });

      const profile: UserProfile = {
        id: fbUser.uid,
        userId: fbUser.uid,
        firstName: cleanFirst,
        lastName: cleanLast,
        displayName,
        email,
        phoneNumber: phone?.trim() || undefined,
        phone: phone?.trim() || undefined,
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
        const profile = { id: fbUser.uid, userId: fbUser.uid, ...userSnap.data() } as UserProfile;
        this.saveActiveProfile(profile);
        return profile;
      }

      const { firstName, lastName } = parseNames(fbUser.displayName);
      const profile: UserProfile = {
        id: fbUser.uid,
        userId: fbUser.uid,
        firstName,
        lastName,
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
      ...(current || ({} as UserProfile)),
      ...updates,
      id: userId,
      userId,
      updatedAt: new Date().toISOString(),
    };

    this.saveActiveProfile(updated);

    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore user update note:', error);
    }

    return updated;
  },

  // Set / Switch to a specific persona (for Judge Mode or testing)
  async setDemoUser(persona: UserProfile): Promise<UserProfile> {
    // Ensure persona exists in Firestore so queries/chats work seamlessly
    try {
      await setDoc(
        doc(db, 'users', persona.id),
        {
          ...persona,
          userId: persona.id,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Set demo user note:', e);
    }
    this.saveActiveProfile(persona);
    return persona;
  },

  // Switch role between BUYER and SELLER
  async switchRole(newRole: UserRole): Promise<UserProfile | null> {
    const current = this.getCurrentStoredProfile();
    if (!current) return null;

    const updated: UserProfile = {
      ...current,
      role: newRole,
      updatedAt: new Date().toISOString(),
    };
    this.saveActiveProfile(updated);
    return updated;
  },

  // Sign Out Completely
  async signOut(): Promise<void> {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout note:', e);
    }
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    // Explicitly emit null user to clear all authenticated state across app
    this.saveActiveProfile(null);
  },
};
