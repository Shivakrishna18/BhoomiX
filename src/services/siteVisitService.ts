import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SiteVisit, SiteVisitStatus } from '../types';

const COLLECTION_NAME = 'siteVisits';

export const siteVisitService = {
  // Request a site visit (Buyer)
  async requestSiteVisit(
    visitData: Omit<SiteVisit, 'id' | 'createdAt' | 'status'>
  ): Promise<SiteVisit> {
    try {
      const newRef = doc(collection(db, COLLECTION_NAME));
      const now = new Date().toISOString();
      const newVisit: SiteVisit = {
        ...visitData,
        id: newRef.id,
        status: 'REQUESTED',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(newRef, newVisit);
      return newVisit;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  // Get site visits for user (as buyer or seller)
  async getSiteVisitsForUser(userId: string): Promise<SiteVisit[]> {
    try {
      const qBuyer = query(
        collection(db, COLLECTION_NAME),
        where('buyerId', '==', userId)
      );
      const qSeller = query(
        collection(db, COLLECTION_NAME),
        where('sellerId', '==', userId)
      );

      const [snapBuyer, snapSeller] = await Promise.all([
        getDocs(qBuyer),
        getDocs(qSeller),
      ]);

      const map = new Map<string, SiteVisit>();
      snapBuyer.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as SiteVisit));
      snapSeller.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as SiteVisit));

      const list = Array.from(map.values());
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return list;
    } catch (error) {
      console.warn('Error fetching site visits:', error);
      return [];
    }
  },

  // Update site visit status (Seller or Buyer)
  async updateStatus(
    visitId: string,
    status: SiteVisitStatus,
    sellerRemarks?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, visitId);
      const updates: Partial<SiteVisit> = {
        status,
        updatedAt: new Date().toISOString(),
      };
      if (sellerRemarks !== undefined) {
        updates.sellerRemarks = sellerRemarks;
      }
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${visitId}`);
    }
  },
};
