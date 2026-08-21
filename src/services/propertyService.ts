import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../types';
import { TELANGANA_DEMO_PROPERTIES, INITIAL_TELANGANA_PROPERTIES } from '../data/telanganaDemoData';

const COLLECTION_NAME = 'properties';
const LOCAL_PROPERTIES_KEY = 'bhoomix_custom_properties_v2';
const DELETED_PROPERTIES_KEY = 'bhoomix_deleted_property_ids';

const getDeletedPropertyIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_PROPERTIES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (e) {
    return new Set();
  }
};

const markPropertyAsDeletedLocally = (id: string) => {
  try {
    const ids = getDeletedPropertyIds();
    ids.add(id);
    localStorage.setItem(DELETED_PROPERTIES_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.warn('Failed to mark deleted id:', e);
  }
};

const getLocalCustomProperties = (): Property[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    const list: Property[] = raw ? JSON.parse(raw) : [];
    const deletedIds = getDeletedPropertyIds();
    return list.filter((p) => !deletedIds.has(p.id));
  } catch (e) {
    return [];
  }
};

const saveLocalCustomProperty = (prop: Property) => {
  try {
    // Unmark as deleted if re-created/updated
    const deletedIds = getDeletedPropertyIds();
    if (deletedIds.has(prop.id)) {
      deletedIds.delete(prop.id);
      localStorage.setItem(DELETED_PROPERTIES_KEY, JSON.stringify(Array.from(deletedIds)));
    }
    const existing = getLocalCustomProperties().filter((p) => p.id !== prop.id);
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify([prop, ...existing]));
  } catch (e) {
    console.warn('Failed to save property locally:', e);
  }
};

const deleteLocalCustomProperty = (propId: string) => {
  try {
    markPropertyAsDeletedLocally(propId);
    const raw = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    const existing: Property[] = raw ? JSON.parse(raw) : [];
    const updated = existing.filter((p) => p.id !== propId);
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete property locally:', e);
  }
};

// Helper for timeout
const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
};

export const propertyService = {
  // Compress and resize image file to safe lightweight Base64
  compressImage(file: File, maxDimension = 1200, quality = 0.75): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(readerEvent.target?.result as string);
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  // Get all published properties for public & buyer discovery
  async getPublishedProperties(): Promise<Property[]> {
    const localCustom = getLocalCustomProperties();
    const deletedIds = getDeletedPropertyIds();
    try {
      const fetchPromise = (async () => {
        const q = query(
          collection(db, COLLECTION_NAME),
          where('status', '==', 'PUBLISHED')
        );
        const snapshot = await getDocs(q);
        const list: Property[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Property);
        });

        // Merge remote + local custom + demo benchmarks
        const map = new Map<string, Property>();
        INITIAL_TELANGANA_PROPERTIES.forEach((p) => {
          if (!deletedIds.has(p.id)) map.set(p.id, p);
        });
        list.forEach((p) => {
          if (!deletedIds.has(p.id)) map.set(p.id, p);
        });
        localCustom.forEach((p) => {
          if (!deletedIds.has(p.id)) map.set(p.id, p);
        });

        return Array.from(map.values());
      })();

      const fallbackList: Property[] = [...localCustom, ...INITIAL_TELANGANA_PROPERTIES].filter(
        (p) => !deletedIds.has(p.id)
      );
      return await withTimeout(fetchPromise, 3500, fallbackList);
    } catch (error) {
      console.warn('Error fetching published properties from Firestore:', error);
      const map = new Map<string, Property>();
      INITIAL_TELANGANA_PROPERTIES.forEach((p) => {
        if (!deletedIds.has(p.id)) map.set(p.id, p);
      });
      localCustom.forEach((p) => {
        if (!deletedIds.has(p.id)) map.set(p.id, p);
      });
      return Array.from(map.values());
    }
  },

  // Get properties created by a specific seller
  async getSellerProperties(sellerId: string): Promise<Property[]> {
    const deletedIds = getDeletedPropertyIds();
    const localCustom = getLocalCustomProperties().filter(
      (p) =>
        !deletedIds.has(p.id) &&
        (p.sellerId === sellerId || p.sellerId === 'demo-seller-profile' || sellerId === 'demo-seller-profile')
    );
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('sellerId', '==', sellerId)
      );
      const snapshot = await getDocs(q);
      const list: Property[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Property);
      });

      const map = new Map<string, Property>();
      localCustom.forEach((p) => {
        if (!deletedIds.has(p.id)) map.set(p.id, p);
      });
      list.forEach((p) => {
        if (!deletedIds.has(p.id)) map.set(p.id, p);
      });
      return Array.from(map.values());
    } catch (error) {
      console.warn('Note getting seller properties from firestore:', error);
      return localCustom;
    }
  },

  // Get a single property by ID
  async getPropertyById(id: string): Promise<Property | null> {
    const deletedIds = getDeletedPropertyIds();
    if (deletedIds.has(id)) return null;

    const localMatch = getLocalCustomProperties().find((p) => p.id === id);
    if (localMatch) return localMatch;

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Property;
      }

      // Check if it matches a demo property id
      const demoMatch = INITIAL_TELANGANA_PROPERTIES.find((p) => p.id === id);
      if (demoMatch && !deletedIds.has(demoMatch.id)) return demoMatch;

      return null;
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      const demoMatch = INITIAL_TELANGANA_PROPERTIES.find((p) => p.id === id);
      return (demoMatch && !deletedIds.has(demoMatch.id)) ? demoMatch : null;
    }
  },

  // Create a new property listing (Seller)
  async createProperty(
    propertyData: Omit<Property, 'id' | 'createdAt'>
  ): Promise<Property> {
    const newDocRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const newProperty: Property = {
      ...propertyData,
      id: newDocRef.id,
      documentVerifiedPercentage: propertyData.documentVerifiedPercentage || 96,
      createdAt: now,
      updatedAt: now,
    };

    // Save locally immediately so seller never loses their work
    saveLocalCustomProperty(newProperty);

    // Sync to Firestore
    try {
      await setDoc(newDocRef, newProperty);
    } catch (error) {
      console.warn('Firestore write note (listing saved locally):', error);
    }

    window.dispatchEvent(new CustomEvent('bhoomix_property_created', { detail: { property: newProperty } }));
    return newProperty;
  },

  // Update existing property (Seller / Admin)
  async updateProperty(
    id: string,
    updates: Partial<Property>
  ): Promise<void> {
    const existing = await this.getPropertyById(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      saveLocalCustomProperty(updated);
    }
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Firestore update note:', error);
    }
    window.dispatchEvent(new CustomEvent('bhoomix_property_updated', { detail: { id, updates } }));
  },

  // Delete / Archive property
  async deleteProperty(id: string): Promise<void> {
    deleteLocalCustomProperty(id);
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Firestore delete note:', error);
    }
    window.dispatchEvent(new CustomEvent('bhoomix_property_deleted', { detail: { id } }));
  },

  // Seed Telangana demonstration properties directly to Firestore
  async seedDemoProperties(): Promise<Property[]> {
    const seededList: Property[] = [];
    for (let i = 0; i < INITIAL_TELANGANA_PROPERTIES.length; i++) {
      const item = INITIAL_TELANGANA_PROPERTIES[i];
      const docRef = doc(db, COLLECTION_NAME, item.id);
      try {
        await setDoc(docRef, item, { merge: true });
        seededList.push(item);
      } catch (e) {
        seededList.push(item);
      }
    }
    return seededList;
  },
};
