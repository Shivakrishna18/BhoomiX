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
        const { firstName, lastName } = parseNames(fbUser.displayName);
        const fallbackProfile: UserProfile = {
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

        // Emit immediately to ensure responsive UI
        this.saveActiveProfile(fallbackProfile);
        callback(fallbackProfile);

        // Safely check remote Firestore in background with race timeout
        try {
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
          const userDocPromise = getDoc(doc(db, 'users', fbUser.uid));
          const userDoc: any = await Promise.race([userDocPromise, timeoutPromise]);
          
          if (userDoc && userDoc.exists && userDoc.exists()) {
            const data = userDoc.data();
            const profile: UserProfile = {
              ...fallbackProfile,
              ...data,
              role: data.role || fallbackProfile.role,
            };
            this.saveActiveProfile(profile);
            callback(profile);
          } else {
            setDoc(doc(db, 'users', fbUser.uid), fallbackProfile, { merge: true }).catch(() => {});
          }
        } catch (e) {
          // Non-fatal, offline/timeout gracefully swallowed
        }
      } else {
        // If not logged into Firebase Auth, check if custom persona is stored in local storage
        const current = this.getCurrentStoredProfile();
        // If the stored profile was a real firebase uid (not a mock persona), clear it
        if (current && !current.id.startsWith('user_seller_rahul') && !current.id.startsWith('user_buyer_shiva')) {
          this.saveActiveProfile(null);
          callback(null);
        } else if (!current) {
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
      const { firstName, lastName } = parseNames(fbUser.displayName);

      // Construct base profile immediately
      const profile: UserProfile = {
        id: fbUser.uid,
        userId: fbUser.uid,
        firstName,
        lastName,
        displayName: fbUser.displayName || `${firstName} ${lastName}`.trim() || fbUser.email?.split('@')[0] || 'BhoomiX User',
        email: fbUser.email || '',
        phoneNumber: fbUser.phoneNumber || undefined,
        phone: fbUser.phoneNumber || undefined,
        role: preferredRole,
        profilePhoto: fbUser.photoURL || undefined,
        avatarUrl: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
      };

      // Instantly save locally
      this.saveActiveProfile(profile);

      // Non-blocking firestore sync
      (async () => {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
          const snap: any = await Promise.race([getDoc(userDocRef), timeoutPromise]);
          if (snap && snap.exists && snap.exists()) {
            const existingData = snap.data();
            const synced: UserProfile = {
              ...profile,
              ...existingData,
              role: existingData.role || preferredRole,
              profilePhoto: existingData.profilePhoto || fbUser.photoURL || undefined,
              avatarUrl: existingData.avatarUrl || fbUser.photoURL || undefined,
            };
            this.saveActiveProfile(synced);
          } else {
            await setDoc(userDocRef, profile, { merge: true });
          }
        } catch (dbErr) {
          // Gracefully ignore offline database errors in background
        }
      })();

      return profile;
    } catch (error: any) {
      console.error('[BhoomiX Auth] Google Sign In error details:', {
        code: error?.code,
        message: error?.message,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      });
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
      await updateProfile(fbUser, { displayName }).catch(() => {});

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

      setDoc(doc(db, 'users', fbUser.uid), profile, { merge: true }).catch(() => {});
      this.saveActiveProfile(profile);
      return profile;
    } catch (error: any) {
      console.error('[BhoomiX Auth] Email sign up error details:', {
        code: error?.code,
        message: error?.message,
      });
      throw error;
    }
  },

  // Email & Password Login
  async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = cred.user;

      try {
        const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          const profile: UserProfile = {
            id: fbUser.uid,
            userId: fbUser.uid,
            firstName: data.firstName || 'BhoomiX',
            lastName: data.lastName || 'User',
            displayName: data.displayName || fbUser.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'BhoomiX User',
            email: fbUser.email || email,
            phoneNumber: data.phoneNumber || data.phone || fbUser.phoneNumber || undefined,
            phone: data.phone || data.phoneNumber || fbUser.phoneNumber || undefined,
            role: data.role || 'BUYER',
            createdAt: data.createdAt || new Date().toISOString(),
            ...data,
          };
          this.saveActiveProfile(profile);
          return profile;
        }
      } catch (dbErr) {
        console.warn('[BhoomiX Auth] Non-fatal user profile fetch note on login:', dbErr);
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

      setDoc(doc(db, 'users', fbUser.uid), profile, { merge: true }).catch(() => {});
      this.saveActiveProfile(profile);
      return profile;
    } catch (error: any) {
      console.error('[BhoomiX Auth] Email login error details:', {
        code: error?.code,
        message: error?.message,
      });
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

  // Fetch user profile by UID directly from Firestore
  async getUserProfileById(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          userId: snap.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User',
          email: data.email || '',
          phone: data.phone || data.phoneNumber || undefined,
          phoneNumber: data.phoneNumber || data.phone || undefined,
          role: data.role || 'BUYER',
          ...data,
        } as UserProfile;
      }
    } catch (e) {
      console.warn('Error fetching user profile by ID:', e);
    }
    return null;
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
