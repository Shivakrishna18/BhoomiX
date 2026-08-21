import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SavedProperty, Property } from '../types';

const COLLECTION_NAME = 'savedProperties';

const getLocalSavedKey = (userId: string) => `bhoomix_wishlist_${userId}`;

const getLocalSaved = (userId: string): SavedProperty[] => {
  try {
    const raw = localStorage.getItem(getLocalSavedKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const setLocalSaved = (userId: string, list: SavedProperty[]) => {
  try {
    localStorage.setItem(getLocalSavedKey(userId), JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save to local storage', e);
  }
};

export const savedPropertyService = {
  // Get all saved properties for a buyer
  async getSavedProperties(userId: string): Promise<SavedProperty[]> {
    const localList = getLocalSaved(userId);
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const remoteList: SavedProperty[] = [];
      snapshot.forEach((d) => {
        remoteList.push({ id: d.id, ...d.data() } as SavedProperty);
      });

      // Merge remote into local
      const map = new Map<string, SavedProperty>();
      localList.forEach((item) => map.set(item.propertyId, item));
      remoteList.forEach((item) => map.set(item.propertyId, item));

      const merged = Array.from(map.values());
      setLocalSaved(userId, merged);
      return merged;
    } catch (error) {
      console.warn('Firestore fetch note (using local cache):', error);
      return localList;
    }
  },

  // Save / Bookmark a property
  async saveProperty(
    userId: string,
    propertyId: string,
    propertyData: Property
  ): Promise<SavedProperty> {
    const saveId = `${userId}_${propertyId}`;
    const record: SavedProperty = {
      id: saveId,
      userId,
      propertyId,
      propertyData: {
        id: propertyData.id,
        title: propertyData.title,
        locality: propertyData.locality,
        district: propertyData.district,
        state: propertyData.state,
        landSize: propertyData.landSize,
        landUnit: propertyData.landUnit,
        askingPrice: propertyData.askingPrice,
        pricePerUnit: propertyData.pricePerUnit,
        coverPhoto: propertyData.coverPhoto || propertyData.photos?.[0],
        purpose: propertyData.purpose,
        trustScore: propertyData.trustScore,
        documentVerifiedPercentage: propertyData.documentVerifiedPercentage || propertyData.trustScore || 95,
      },
      createdAt: new Date().toISOString(),
    };

    // Update local cache immediately
    const current = getLocalSaved(userId).filter((i) => i.propertyId !== propertyId);
    setLocalSaved(userId, [record, ...current]);

    // Async sync to Firestore
    try {
      const docRef = doc(db, COLLECTION_NAME, saveId);
      await setDoc(docRef, record);
    } catch (error) {
      console.warn('Firestore background write note (saved locally):', error);
    }

    return record;
  },

  // Unsave / Remove bookmark
  async unsaveProperty(userId: string, propertyId: string): Promise<void> {
    // Update local cache immediately
    const current = getLocalSaved(userId).filter((i) => i.propertyId !== propertyId);
    setLocalSaved(userId, current);

    // Async sync to Firestore
    try {
      const saveId = `${userId}_${propertyId}`;
      const docRef = doc(db, COLLECTION_NAME, saveId);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Firestore background delete note:', error);
    }
  },

  // Check if a property is saved
  async isSaved(userId: string, propertyId: string): Promise<boolean> {
    const localList = getLocalSaved(userId);
    if (localList.some((i) => i.propertyId === propertyId)) {
      return true;
    }
    try {
      const saveId = `${userId}_${propertyId}`;
      const docRef = doc(db, COLLECTION_NAME, saveId);
      const snap = await getDoc(docRef);
      return snap.exists();
    } catch (error) {
      return false;
    }
  },
};
