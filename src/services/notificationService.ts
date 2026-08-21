import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppNotification } from '../types';

const COLLECTION_NAME = 'notifications';

const getLocalNotifKey = (userId: string) => `bhoomix_notifs_${userId}`;

const getLocalNotifs = (userId: string): AppNotification[] => {
  try {
    const raw = localStorage.getItem(getLocalNotifKey(userId));
    if (raw) return JSON.parse(raw);
    
    // Seed initial welcome notifications for buyer/seller if empty
    const initial: AppNotification[] = [
      {
        id: `init-notif-${Date.now()}-1`,
        userId,
        type: 'MESSAGE',
        title: 'Welcome to BhoomiX Real Estate Network',
        message: 'Your direct verified communication channel is active. Inquire, request phone numbers, or schedule site inspections safely.',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    return initial;
  } catch (e) {
    return [];
  }
};

const setLocalNotifs = (userId: string, list: AppNotification[]) => {
  try {
    localStorage.setItem(getLocalNotifKey(userId), JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to store notifications locally:', e);
  }
};

export const notificationService = {
  // Get notifications for user
  async getUserNotifications(userId: string): Promise<AppNotification[]> {
    const localList = getLocalNotifs(userId);
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const remoteList: AppNotification[] = [];
      snapshot.forEach((d) => {
        remoteList.push({ id: d.id, ...d.data() } as AppNotification);
      });

      const map = new Map<string, AppNotification>();
      localList.forEach((n) => map.set(n.id, n));
      remoteList.forEach((n) => map.set(n.id, n));

      const merged = Array.from(map.values());
      merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setLocalNotifs(userId, merged);
      return merged;
    } catch (error) {
      return localList;
    }
  },

  // Add new notification
  async addNotification(
    data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
  ): Promise<AppNotification> {
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newNotif: AppNotification = {
      ...data,
      id: notifId,
      read: false,
      createdAt: now,
    };

    // Save locally
    const current = getLocalNotifs(data.userId);
    setLocalNotifs(data.userId, [newNotif, ...current]);

    // Send custom event for real-time UI reaction
    try {
      window.dispatchEvent(new CustomEvent('bhoomix_new_notification', { detail: newNotif }));
    } catch (e) {}

    // Background Firestore write
    try {
      const docRef = doc(db, COLLECTION_NAME, notifId);
      await setDoc(docRef, newNotif);
    } catch (e) {
      console.warn('Firestore notification note:', e);
    }

    return newNotif;
  },

  // Mark single notification as read
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const current = getLocalNotifs(userId).map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setLocalNotifs(userId, current);

    try {
      const docRef = doc(db, COLLECTION_NAME, notificationId);
      await updateDoc(docRef, { read: true });
    } catch (e) {}
  },

  // Mark all as read
  async markAllAsRead(userId: string): Promise<void> {
    const current = getLocalNotifs(userId).map((n) => ({ ...n, read: true }));
    setLocalNotifs(userId, current);
  },
};
