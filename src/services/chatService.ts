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
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Conversation, Message, MessageType, ChatMediaAttachment } from '../types';

const CONVS_COLLECTION = 'conversations';
const MSGS_COLLECTION = 'messages';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days in milliseconds

const getLocalConvsKey = () => `bhoomix_conversations_cache`;
const getLocalMsgsKey = (convId: string) => `bhoomix_msgs_${convId}`;

// Helper: Check if a timestamp is older than 30 days
const isOlderThan30Days = (timestampStr?: string): boolean => {
  if (!timestampStr) return false;
  try {
    const time = new Date(timestampStr).getTime();
    return Date.now() - time > THIRTY_DAYS_MS;
  } catch {
    return false;
  }
};

// Helper: Get local conversations and filter out > 30-day-old chats
const getLocalConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(getLocalConvsKey());
    if (!raw) return [];
    const list: Conversation[] = JSON.parse(raw);
    // Filter 30-day retention
    const valid = list.filter(
      (c) => !isOlderThan30Days(c.lastMessageTimestamp || c.updatedAt || c.createdAt)
    );
    if (valid.length !== list.length) {
      localStorage.setItem(getLocalConvsKey(), JSON.stringify(valid));
    }
    return valid;
  } catch (e) {
    return [];
  }
};

const saveLocalConversation = (conv: Conversation, emitEvent: boolean = false) => {
  try {
    // If expired, don't save
    if (isOlderThan30Days(conv.lastMessageTimestamp || conv.updatedAt || conv.createdAt)) {
      return;
    }
    const list = getLocalConversations().filter((c) => c.id !== conv.id);
    localStorage.setItem(getLocalConvsKey(), JSON.stringify([conv, ...list]));
    if (emitEvent) {
      window.dispatchEvent(
        new CustomEvent('bhoomix_conv_updated', { detail: { conversation: conv } })
      );
    }
  } catch (e) {}
};

// Helper: Get local messages and filter out > 30-day-old messages
const getLocalMessages = (convId: string): Message[] => {
  try {
    const raw = localStorage.getItem(getLocalMsgsKey(convId));
    if (!raw) return [];
    const list: Message[] = JSON.parse(raw);
    // Filter 30-day retention
    const valid = list.filter((m) => !isOlderThan30Days(m.createdAt));
    if (valid.length !== list.length) {
      localStorage.setItem(getLocalMsgsKey(convId), JSON.stringify(valid));
    }
    return valid;
  } catch (e) {
    return [];
  }
};

const saveLocalMessage = (msg: Message, emitEvent: boolean = false) => {
  try {
    if (isOlderThan30Days(msg.createdAt)) return;
    const list = getLocalMessages(msg.conversationId).filter((m) => m.id !== msg.id);
    const updated = [...list, msg].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    localStorage.setItem(getLocalMsgsKey(msg.conversationId), JSON.stringify(updated));

    if (emitEvent) {
      window.dispatchEvent(
        new CustomEvent('bhoomix_chat_message', {
          detail: { conversationId: msg.conversationId, message: msg },
        })
      );
    }
  } catch (e) {}
};

// Deterministic conversation ID generator
const generateDeterministicConvId = (propertyId: string, buyerId: string): string => {
  const cleanProp = (propertyId || 'prop').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanBuyer = (buyerId || 'buyer').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `conv_${cleanProp}_${cleanBuyer}`;
};

export const chatService = {
  // Prune any messages and conversations older than 30 days from database and storage
  async cleanUpOldChats(): Promise<void> {
    try {
      const convs = getLocalConversations();
      for (const c of convs) {
        if (isOlderThan30Days(c.lastMessageTimestamp || c.updatedAt || c.createdAt)) {
          // Delete from local
          localStorage.removeItem(getLocalMsgsKey(c.id));
          // Attempt delete from firestore
          try {
            await deleteDoc(doc(db, CONVS_COLLECTION, c.id));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Cleanup note:', e);
    }
  },

  // Find or create a conversation between buyer, seller, and property
  async getOrCreateConversation(
    propertyId: string,
    propertyTitle: string,
    propertyLocation: string,
    buyerId: string,
    buyerName: string,
    sellerId: string,
    sellerName: string
  ): Promise<Conversation> {
    // 1. Check local cache with matching propertyId & buyerId
    const localConvs = getLocalConversations();
    const localExisting = localConvs.find(
      (c) =>
        c.propertyId === propertyId &&
        c.buyerId === buyerId &&
        !isOlderThan30Days(c.lastMessageTimestamp || c.createdAt)
    );
    if (localExisting) return localExisting;

    const deterministicId = generateDeterministicConvId(propertyId, buyerId);

    // 2. Check by deterministic doc ID in Firestore first
    try {
      const docSnap = await getDoc(doc(db, CONVS_COLLECTION, deterministicId));
      if (docSnap.exists()) {
        const conv = { id: docSnap.id, ...docSnap.data() } as Conversation;
        if (!isOlderThan30Days(conv.lastMessageTimestamp || conv.createdAt)) {
          saveLocalConversation(conv);
          return conv;
        }
      }
    } catch (e) {
      console.warn('Firestore doc get note:', e);
    }

    // 3. Fallback: Query collection by propertyId and buyerId
    try {
      const convsRef = collection(db, CONVS_COLLECTION);
      const q = query(
        convsRef,
        where('propertyId', '==', propertyId),
        where('buyerId', '==', buyerId)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const firstDoc = snap.docs[0];
        const conv = { id: firstDoc.id, ...firstDoc.data() } as Conversation;
        if (!isOlderThan30Days(conv.lastMessageTimestamp || conv.createdAt)) {
          saveLocalConversation(conv);
          return conv;
        }
      }
    } catch (e) {
      console.warn('Firestore query note:', e);
    }

    // 4. Create new conversation with deterministic ID
    const now = new Date().toISOString();
    const newConv: Conversation = {
      id: deterministicId,
      propertyId,
      propertyTitle,
      propertyLocation: propertyLocation || 'Telangana',
      buyerId,
      buyerName,
      sellerId,
      sellerName,
      lastMessage: 'Direct chat channel initialized',
      lastMessageTimestamp: now,
      createdAt: now,
      updatedAt: now,
    };

    saveLocalConversation(newConv);

    // Initial greeting message
    const msgId = `msg-${Date.now()}-init`;
    const initialMsg: Message = {
      id: msgId,
      conversationId: deterministicId,
      senderId: buyerId,
      senderName: buyerName,
      body: `Namaste, I am interested in exploring "${propertyTitle}". Let's discuss details directly.`,
      messageType: 'TEXT',
      read: false,
      createdAt: now,
    };
    saveLocalMessage(initialMsg);

    try {
      const newRef = doc(db, CONVS_COLLECTION, deterministicId);
      await setDoc(newRef, newConv);
      const msgRef = doc(db, MSGS_COLLECTION, msgId);
      await setDoc(msgRef, initialMsg);
    } catch (e) {
      console.warn('Firestore write note:', e);
    }

    return newConv;
  },

  // Get conversations for current user (either buyer or seller)
  async getUserConversations(userId: string): Promise<Conversation[]> {
    // 30-day filter applied inside getLocalConversations()
    const localList = getLocalConversations().filter(
      (c) =>
        c.buyerId === userId ||
        c.sellerId === userId ||
        c.sellerId.includes('demo') ||
        userId.includes('demo') ||
        userId.includes('user') ||
        userId.includes('seller')
    );

    try {
      const convsRef = collection(db, CONVS_COLLECTION);
      const qBuyer = query(convsRef, where('buyerId', '==', userId));
      const snapBuyer = await getDocs(qBuyer);

      const qSeller = query(convsRef, where('sellerId', '==', userId));
      const snapSeller = await getDocs(qSeller);

      const map = new Map<string, Conversation>();
      localList.forEach((d) => map.set(d.id, d));

      snapBuyer.forEach((d) => {
        const conv = { id: d.id, ...d.data() } as Conversation;
        if (!isOlderThan30Days(conv.lastMessageTimestamp || conv.createdAt)) {
          map.set(d.id, conv);
          saveLocalConversation(conv);
        }
      });

      snapSeller.forEach((d) => {
        const conv = { id: d.id, ...d.data() } as Conversation;
        if (!isOlderThan30Days(conv.lastMessageTimestamp || conv.createdAt)) {
          map.set(d.id, conv);
          saveLocalConversation(conv);
        }
      });

      const list = Array.from(map.values());
      list.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
      return list;
    } catch (error) {
      return localList;
    }
  },

  // Fetch single conversation by ID
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const local = getLocalConversations().find((c) => c.id === conversationId);
    if (local && !isOlderThan30Days(local.lastMessageTimestamp || local.createdAt)) {
      return local;
    }

    try {
      const snap = await getDoc(doc(db, CONVS_COLLECTION, conversationId));
      if (snap.exists()) {
        const conv = { id: snap.id, ...snap.data() } as Conversation;
        if (!isOlderThan30Days(conv.lastMessageTimestamp || conv.createdAt)) {
          saveLocalConversation(conv);
          return conv;
        }
      }
    } catch (e) {
      console.warn('Get conv note:', e);
    }
    return local || null;
  },

  // Subscribe to real-time messages in a conversation
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
    // Helper to reload & deduplicate all messages for this conversation
    const reloadMessages = async () => {
      const localMsgs = getLocalMessages(conversationId);
      const map = new Map<string, Message>();
      localMsgs.forEach((m) => {
        if (!isOlderThan30Days(m.createdAt)) map.set(m.id, m);
      });

      try {
        const q = query(
          collection(db, MSGS_COLLECTION),
          where('conversationId', '==', conversationId)
        );
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const msg = { id: d.id, ...d.data() } as Message;
          if (!isOlderThan30Days(msg.createdAt)) {
            map.set(d.id, msg);
            saveLocalMessage(msg);
          }
        });
      } catch {}

      const list = Array.from(map.values());
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      callback(list);
    };

    // 1. Initial fire with cached messages
    callback(getLocalMessages(conversationId));
    reloadMessages();

    // 2. Window event listener for instantaneous local dispatch
    const handleLocalMsg = (e: Event) => {
      const customEvent = e as CustomEvent<{ conversationId: string; message: Message }>;
      if (customEvent.detail && customEvent.detail.conversationId === conversationId) {
        reloadMessages();
      }
    };
    window.addEventListener('bhoomix_chat_message', handleLocalMsg);

    // 3. Storage event listener for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === getLocalMsgsKey(conversationId) || e.key === getLocalConvsKey()) {
        reloadMessages();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Firestore real-time onSnapshot listener
    let firestoreUnsub: Unsubscribe = () => {};
    try {
      const q = query(
        collection(db, MSGS_COLLECTION),
        where('conversationId', '==', conversationId)
      );

      firestoreUnsub = onSnapshot(
        q,
        (snapshot) => {
          const localMsgs = getLocalMessages(conversationId);
          const map = new Map<string, Message>();
          localMsgs.forEach((m) => {
            if (!isOlderThan30Days(m.createdAt)) map.set(m.id, m);
          });

          snapshot.forEach((d) => {
            const m = { id: d.id, ...d.data() } as Message;
            if (!isOlderThan30Days(m.createdAt)) {
              map.set(d.id, m);
              saveLocalMessage(m);
            }
          });

          const list = Array.from(map.values());
          list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          callback(list);
        },
        (error) => {
          console.warn('Firestore snapshot note:', error);
          callback(getLocalMessages(conversationId));
        }
      );
    } catch (e) {
      console.warn('Snapshot setup note:', e);
    }

    // 5. Periodic 2.5s polling safety-net for background refresh
    const intervalId = setInterval(() => {
      reloadMessages();
    }, 2500);

    // Cleanup all listeners when unmounted
    return () => {
      window.removeEventListener('bhoomix_chat_message', handleLocalMsg);
      window.removeEventListener('storage', handleStorage);
      clearInterval(intervalId);
      if (typeof firestoreUnsub === 'function') {
        firestoreUnsub();
      }
    };
  },

  // Send a message (text, media, or interactive request)
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    body: string,
    messageType: MessageType = 'TEXT',
    requestStatus?: 'PENDING' | 'APPROVED' | 'DECLINED',
    metadata?: Message['metadata'],
    mediaAttachment?: ChatMediaAttachment
  ): Promise<Message> {
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newMsg: Message = {
      id: msgId,
      conversationId,
      senderId,
      senderName,
      body,
      messageType,
      requestStatus,
      metadata: {
        ...(metadata || {}),
        ...(mediaAttachment
          ? {
              mediaUrl: mediaAttachment.fileUrl,
              fileName: mediaAttachment.fileName,
              fileSize: mediaAttachment.fileSize,
              mimeType: mediaAttachment.mimeType,
            }
          : {}),
      },
      mediaAttachment,
      read: false,
      createdAt: now,
    };

    saveLocalMessage(newMsg, true);

    // Generate preview summary for last message
    let lastMsgPreview = body;
    if (mediaAttachment?.fileType === 'image') {
      lastMsgPreview = `📷 Photo: ${mediaAttachment.fileName || 'Image'}${body ? ` - ${body}` : ''}`;
    } else if (mediaAttachment?.fileType === 'document' || mediaAttachment?.fileType === 'pdf') {
      lastMsgPreview = `📄 Document: ${mediaAttachment.fileName || 'File'}${body ? ` - ${body}` : ''}`;
    }

    // Update conversation in cache
    const allConvs = getLocalConversations();
    const conv = allConvs.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = lastMsgPreview;
      conv.lastMessageTimestamp = now;
      conv.updatedAt = now;
      saveLocalConversation(conv, true);
    }

    // Write to Firestore
    try {
      const msgRef = doc(db, MSGS_COLLECTION, msgId);
      await setDoc(msgRef, newMsg);

      const convRef = doc(db, CONVS_COLLECTION, conversationId);
      await updateDoc(convRef, {
        lastMessage: lastMsgPreview,
        lastMessageTimestamp: now,
        updatedAt: now,
      });
    } catch (error) {
      console.warn('Firestore send note:', error);
    }

    return newMsg;
  },

  // Update a request message status (e.g. Seller approves phone number or site visit)
  async updateMessageStatus(
    messageId: string,
    conversationId: string,
    requestStatus: 'APPROVED' | 'DECLINED',
    metadata?: Message['metadata']
  ): Promise<void> {
    const localMsgs = getLocalMessages(conversationId);
    const updated = localMsgs.map((m) => {
      if (m.id === messageId) {
        return {
          ...m,
          requestStatus,
          metadata: { ...(m.metadata || {}), ...(metadata || {}) },
        };
      }
      return m;
    });
    localStorage.setItem(getLocalMsgsKey(conversationId), JSON.stringify(updated));

    // Dispatch update event
    window.dispatchEvent(
      new CustomEvent('bhoomix_chat_message', {
        detail: { conversationId, message: updated.find((m) => m.id === messageId) },
      })
    );

    try {
      const docRef = doc(db, MSGS_COLLECTION, messageId);
      await updateDoc(docRef, {
        requestStatus,
        metadata: metadata || {},
      });
    } catch (e) {
      console.warn('Firestore update status note:', e);
    }
  },
};
