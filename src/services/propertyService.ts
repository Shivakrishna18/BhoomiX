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
  onSnapshot,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../types';
import { INITIAL_TELANGANA_PROPERTIES } from '../data/telanganaDemoData';

const COLLECTION_NAME = 'properties';

// Helper to remove any undefined values before sending to Firestore
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        sanitized[key] = sanitizeFirestorePayload(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized as T;
}

export const propertyService = {
  // Compress and resize image file to lightweight high-quality Base64 / Storage DataURL
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

  // Real-time listener for all published properties across all devices
  subscribeToPublishedProperties(
    callback: (properties: Property[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const propertiesMap = new Map<string, Property>();

        // 1. Load benchmark Telangana listings as base
        INITIAL_TELANGANA_PROPERTIES.forEach((prop) => {
          propertiesMap.set(prop.id, prop);
        });

        // 2. Overlay live Firestore listings
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Property;
          const status = (data.status || 'PUBLISHED').toUpperCase();

          // Only keep published listings for explore/discovery
          if (status === 'PUBLISHED' || status === 'PENDING_REVIEW') {
            propertiesMap.set(docSnap.id, {
              ...data,
              id: docSnap.id,
              status: status as any,
            });
          } else if (status === 'ARCHIVED' || status === 'DELETED') {
            propertiesMap.delete(docSnap.id);
          }
        });

        // Sort properties by creation date descending (newest first)
        const sorted = Array.from(propertiesMap.values()).sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        callback(sorted);
      },
      (error) => {
        console.warn('[BhoomiX Properties] Real-time properties listener notice:', error);
        if (onError) onError(error);
        // Provide benchmark fallback on connection issues
        callback(INITIAL_TELANGANA_PROPERTIES);
      }
    );

    return unsubscribe;
  },

  // Get all published properties for public & buyer discovery (One-shot fetch)
  async getPublishedProperties(): Promise<Property[]> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);
      const propertiesMap = new Map<string, Property>();

      // Base demo properties
      INITIAL_TELANGANA_PROPERTIES.forEach((p) => propertiesMap.set(p.id, p));

      // Overwrite / append with Firestore records
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Property;
        const status = (data.status || 'PUBLISHED').toUpperCase();
        if (status === 'PUBLISHED' || status === 'PENDING_REVIEW') {
          propertiesMap.set(docSnap.id, {
            ...data,
            id: docSnap.id,
            status: status as any,
          });
        } else if (status === 'ARCHIVED' || status === 'DELETED') {
          propertiesMap.delete(docSnap.id);
        }
      });

      return Array.from(propertiesMap.values()).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.warn('[BhoomiX Properties] One-shot fetch notice:', error);
      return INITIAL_TELANGANA_PROPERTIES;
    }
  },

  // Real-time listener for a specific seller's properties
  subscribeToSellerProperties(
    sellerId: string,
    callback: (properties: Property[]) => void
  ): Unsubscribe {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, where('sellerId', '==', sellerId));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Property[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Property;
          const status = (data.status || 'PUBLISHED').toUpperCase();
          if (status !== 'DELETED') {
            list.push({ id: docSnap.id, ...data, status: status as any });
          }
        });
        callback(
          list.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          })
        );
      },
      (error) => {
        console.warn('[BhoomiX Properties] Seller properties listener notice:', error);
        callback([]);
      }
    );
  },

  // Get properties created by a specific seller
  async getSellerProperties(sellerId: string): Promise<Property[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('sellerId', '==', sellerId)
      );
      const snapshot = await getDocs(q);
      const list: Property[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Property;
        if (data.status !== 'ARCHIVED' && (data as any).status !== 'DELETED') {
          list.push({ id: docSnap.id, ...data } as Property);
        }
      });
      return list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.warn('[BhoomiX Properties] Error fetching seller properties:', error);
      return [];
    }
  },

  // Get a single property by ID directly from Firestore
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Property;
      }

      // Check if it matches a benchmark demo property id
      const demoMatch = INITIAL_TELANGANA_PROPERTIES.find((p) => p.id === id);
      if (demoMatch) return demoMatch;

      return null;
    } catch (error) {
      console.error('[BhoomiX Properties] Error fetching property by ID:', error);
      const demoMatch = INITIAL_TELANGANA_PROPERTIES.find((p) => p.id === id);
      return demoMatch || null;
    }
  },

  // Create a new property listing (Seller) — Writes authoritatively to Firestore
  async createProperty(
    propertyData: Omit<Property, 'id' | 'createdAt'>
  ): Promise<Property> {
    const newDocRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const newProperty: Property = {
      ...propertyData,
      id: newDocRef.id,
      documentVerifiedPercentage: propertyData.documentVerifiedPercentage || 94,
      status: propertyData.status || 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    };

    // Mandatory authoritative Firestore write with sanitized payload
    const sanitizedData = sanitizeFirestorePayload(newProperty);
    await setDoc(newDocRef, sanitizedData);

    console.log('[BhoomiX SELLER WRITE SUCCESS]', {
      collection: COLLECTION_NAME,
      propertyId: newProperty.id,
      sellerId: newProperty.sellerId,
      status: newProperty.status,
      title: newProperty.title,
    });

    // Dispatch global event for instant local view updates
    window.dispatchEvent(
      new CustomEvent('bhoomix_property_created', { detail: { property: newProperty } })
    );

    return newProperty;
  },

  // Update existing property (Seller / Admin)
  async updateProperty(
    id: string,
    updates: Partial<Property>
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updatedPayload = sanitizeFirestorePayload({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    await updateDoc(docRef, updatedPayload);

    window.dispatchEvent(
      new CustomEvent('bhoomix_property_updated', { detail: { id, updates: updatedPayload } })
    );
  },

  // Delete / Archive property permanently from Firestore
  async deleteProperty(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    // Mark as DELETED in Firestore to ensure real-time propagation across all subscribed clients
    try {
      await updateDoc(docRef, {
        status: 'ARCHIVED',
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      // If document doesn't exist, try deleteDoc
      await deleteDoc(docRef).catch(() => {});
    }

    window.dispatchEvent(
      new CustomEvent('bhoomix_property_deleted', { detail: { id } })
    );
  },

  // Seed Telangana demonstration properties directly to Firestore (Idempotent)
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
