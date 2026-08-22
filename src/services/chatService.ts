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

const getLocalConvsKey = () => `bhoomix_conversations_cache_v4`;
const getLocalMsgsKey = (convId: string) => `bhoomix_msgs_v4_${convId}`;

// Helper: Get local conversations from cache
const getLocalConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(getLocalConvsKey());
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch (e) {
    return [];
  }
};

const saveLocalConversation = (conv: Conversation, emitEvent: boolean = false) => {
  try {
    const list = getLocalConversations().filter((c) => c.id !== conv.id);
    localStorage.setItem(getLocalConvsKey(), JSON.stringify([conv, ...list]));
    if (emitEvent) {
      window.dispatchEvent(
        new CustomEvent('bhoomix_conv_updated', { detail: { conversation: conv } })
      );
    }
  } catch (e) {}
};

// Helper: Get local messages
const getLocalMessages = (convId: string): Message[] => {
  try {
    const raw = localStorage.getItem(getLocalMsgsKey(convId));
    if (!raw) return [];
    return JSON.parse(raw) as Message[];
  } catch (e) {
    return [];
  }
};

const saveLocalMessage = (msg: Message, emitEvent: boolean = false) => {
  try {
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

// Deterministic conversation ID generator based on Property + Buyer UID + Seller UID
export const generateDeterministicConvId = (
  propertyId: string,
  buyerUserId: string,
  sellerUserId?: string
): string => {
  const cleanProp = (propertyId || 'prop').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanBuyer = (buyerUserId || 'buyer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanSeller = (sellerUserId || 'seller').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `conv_${cleanProp}_${cleanBuyer}_${cleanSeller}`;
};

export const chatService = {
  // Prune old / invalid chat caches
  async cleanUpOldChats(): Promise<void> {},

  // Find or create a deterministic conversation between buyer, seller, and property
  async getOrCreateConversation(
    propertyId: string,
    propertyTitle: string,
    propertyLocation: string,
    buyerUserId: string,
    buyerName: string,
    sellerUserId: string,
    sellerName: string
  ): Promise<Conversation> {
    const deterministicId = generateDeterministicConvId(propertyId, buyerUserId, sellerUserId);

    // 1. Check Firestore directly by deterministic ID first
    try {
      const docSnap = await getDoc(doc(db, CONVS_COLLECTION, deterministicId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const conv = { id: docSnap.id, ...data } as Conversation;
        // If names were updated, merge them in background
        if ((buyerName && data.buyerName !== buyerName) || (sellerName && data.sellerName !== sellerName)) {
          setDoc(
            doc(db, CONVS_COLLECTION, deterministicId),
            {
              buyerName: buyerName || data.buyerName,
              sellerName: sellerName || data.sellerName,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch(() => {});
        }
        saveLocalConversation(conv);
        return conv;
      }
    } catch (e) {
      console.warn('Firestore doc get note:', e);
    }

    // 2. Check Firestore by query (propertyId + buyerId + sellerId)
    try {
      const convsRef = collection(db, CONVS_COLLECTION);
      const q = query(
        convsRef,
        where('propertyId', '==', propertyId),
        where('buyerId', '==', buyerUserId),
        where('sellerId', '==', sellerUserId)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const firstDoc = snap.docs[0];
        const conv = { id: firstDoc.id, ...firstDoc.data() } as Conversation;
        saveLocalConversation(conv);
        return conv;
      }
    } catch (e) {
      console.warn('Firestore query note:', e);
    }

    // 3. Check local cache fallback
    const localConvs = getLocalConversations();
    const localExisting = localConvs.find(
      (c) =>
        c.id === deterministicId ||
        (c.propertyId === propertyId && c.buyerId === buyerUserId && c.sellerId === sellerUserId)
    );
    if (localExisting) {
      // Also ensure it is written to Firestore
      try {
        await setDoc(doc(db, CONVS_COLLECTION, deterministicId), localExisting, { merge: true });
      } catch {}
      return localExisting;
    }

    // 4. Create new conversation document in Firestore
    const now = new Date().toISOString();
    const newConv: Conversation = {
      id: deterministicId,
      conversationId: deterministicId,
      propertyId,
      propertyTitle: propertyTitle || 'Land Parcel',
      propertyLocation: propertyLocation || 'Telangana',
      buyerId: buyerUserId,
      buyerUserId,
      buyerName: buyerName || 'Direct Buyer',
      sellerId: sellerUserId,
      sellerUserId,
      sellerName: sellerName || 'Direct Landowner',
      lastMessage: `Namaste, I am interested in exploring "${propertyTitle}".`,
      lastMessageTimestamp: now,
      lastMessageSenderId: buyerUserId,
      createdAt: now,
      updatedAt: now,
    };

    saveLocalConversation(newConv, true);

    // Initial introductory greeting message
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const initialMsg: Message = {
      id: msgId,
      messageId: msgId,
      conversationId: deterministicId,
      senderId: buyerUserId,
      senderUserId: buyerUserId,
      senderName: buyerName || 'Direct Buyer',
      receiverId: sellerUserId,
      receiverUserId: sellerUserId,
      body: `Namaste, I am interested in exploring "${propertyTitle}". Let's discuss details directly.`,
      message: `Namaste, I am interested in exploring "${propertyTitle}". Let's discuss details directly.`,
      messageType: 'TEXT',
      status: 'sent',
      read: false,
      createdAt: now,
    };
    saveLocalMessage(initialMsg, true);

    try {
      const newRef = doc(db, CONVS_COLLECTION, deterministicId);
      await setDoc(newRef, newConv, { merge: true });
      const msgRef = doc(db, MSGS_COLLECTION, msgId);
      await setDoc(msgRef, initialMsg);
    } catch (e) {
      console.warn('Firestore write note:', e);
    }

    return newConv;
  },

  // Get conversations for current user (as either buyer or seller)
  async getUserConversations(userId: string): Promise<Conversation[]> {
    if (!userId) return [];

    const localList = getLocalConversations().filter(
      (c) => c.buyerId === userId || c.sellerId === userId || c.buyerUserId === userId || c.sellerUserId === userId
    );

    try {
      const convsRef = collection(db, CONVS_COLLECTION);
      const [snapBuyer, snapSeller] = await Promise.all([
        getDocs(query(convsRef, where('buyerId', '==', userId))),
        getDocs(query(convsRef, where('sellerId', '==', userId))),
      ]);

      const map = new Map<string, Conversation>();
      localList.forEach((d) => map.set(d.id, d));

      snapBuyer.forEach((d) => {
        const conv = { id: d.id, ...d.data() } as Conversation;
        map.set(d.id, conv);
        saveLocalConversation(conv);
      });

      snapSeller.forEach((d) => {
        const conv = { id: d.id, ...d.data() } as Conversation;
        map.set(d.id, conv);
        saveLocalConversation(conv);
      });

      const list = Array.from(map.values());
      list.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
      return list;
    } catch (error) {
      return localList;
    }
  },

  // Real-time listener for user conversations
  subscribeToUserConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): Unsubscribe {
    if (!userId) {
      callback([]);
      return () => {};
    }

    // Initial callback with cached items
    const initialLocal = getLocalConversations().filter(
      (c) => c.buyerId === userId || c.sellerId === userId || c.buyerUserId === userId || c.sellerUserId === userId
    );
    callback(initialLocal);

    let buyerDocs = new Map<string, Conversation>();
    let sellerDocs = new Map<string, Conversation>();

    const mergeAndEmit = () => {
      const combined = new Map<string, Conversation>();
      // Include local cached
      getLocalConversations()
        .filter((c) => c.buyerId === userId || c.sellerId === userId)
        .forEach((c) => combined.set(c.id, c));

      buyerDocs.forEach((c, id) => combined.set(id, c));
      sellerDocs.forEach((c, id) => combined.set(id, c));

      const list = Array.from(combined.values());
      list.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
      callback(list);
    };

    const convsRef = collection(db, CONVS_COLLECTION);
    const qBuyer = query(convsRef, where('buyerId', '==', userId));
    const qSeller = query(convsRef, where('sellerId', '==', userId));

    const unsubBuyer = onSnapshot(
      qBuyer,
      (snapshot) => {
        buyerDocs.clear();
        snapshot.forEach((d) => {
          const conv = { id: d.id, ...d.data() } as Conversation;
          buyerDocs.set(d.id, conv);
          saveLocalConversation(conv);
        });
        mergeAndEmit();
      },
      (err) => {
        console.warn('Conversations buyer snapshot note:', err);
      }
    );

    const unsubSeller = onSnapshot(
      qSeller,
      (snapshot) => {
        sellerDocs.clear();
        snapshot.forEach((d) => {
          const conv = { id: d.id, ...d.data() } as Conversation;
          sellerDocs.set(d.id, conv);
          saveLocalConversation(conv);
        });
        mergeAndEmit();
      },
      (err) => {
        console.warn('Conversations seller snapshot note:', err);
      }
    );

    const handleLocalConv = () => mergeAndEmit();
    window.addEventListener('bhoomix_conv_updated', handleLocalConv);

    return () => {
      unsubBuyer();
      unsubSeller();
      window.removeEventListener('bhoomix_conv_updated', handleLocalConv);
    };
  },

  // Fetch single conversation by ID
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const local = getLocalConversations().find((c) => c.id === conversationId);
    if (local) return local;

    try {
      const snap = await getDoc(doc(db, CONVS_COLLECTION, conversationId));
      if (snap.exists()) {
        const conv = { id: snap.id, ...snap.data() } as Conversation;
        saveLocalConversation(conv);
        return conv;
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
    // 1. Initial fire with cached messages
    const initialLocal = getLocalMessages(conversationId);
    callback(initialLocal);

    // 2. Setup Firestore real-time onSnapshot listener
    let firestoreUnsub: Unsubscribe = () => {};
    try {
      const q = query(
        collection(db, MSGS_COLLECTION),
        where('conversationId', '==', conversationId)
      );

      firestoreUnsub = onSnapshot(
        q,
        (snapshot) => {
          const map = new Map<string, Message>();
          // Add local cached first
          getLocalMessages(conversationId).forEach((m) => map.set(m.id, m));

          snapshot.forEach((d) => {
            const m = { id: d.id, messageId: d.id, ...d.data() } as Message;
            map.set(d.id, m);
            saveLocalMessage(m);
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

    // 3. Local custom event listener
    const handleLocalMsg = (e: Event) => {
      const customEvent = e as CustomEvent<{ conversationId: string; message: Message }>;
      if (customEvent.detail && customEvent.detail.conversationId === conversationId) {
        callback(getLocalMessages(conversationId));
      }
    };
    window.addEventListener('bhoomix_chat_message', handleLocalMsg);

    return () => {
      if (typeof firestoreUnsub === 'function') {
        firestoreUnsub();
      }
      window.removeEventListener('bhoomix_chat_message', handleLocalMsg);
    };
  },

  // Mark unread messages in a conversation as READ
  async markMessagesAsRead(conversationId: string, currentUserId: string): Promise<void> {
    try {
      const localMsgs = getLocalMessages(conversationId);
      const unreadIncoming = localMsgs.filter(
        (m) => m.senderId !== currentUserId && !m.read
      );

      if (unreadIncoming.length === 0) return;

      const now = new Date().toISOString();
      const updated = localMsgs.map((m) => {
        if (m.senderId !== currentUserId && !m.read) {
          return { ...m, read: true, readAt: now, status: 'read' as const };
        }
        return m;
      });

      localStorage.setItem(getLocalMsgsKey(conversationId), JSON.stringify(updated));

      // Asynchronously mark in Firestore
      for (const m of unreadIncoming) {
        updateDoc(doc(db, MSGS_COLLECTION, m.id), {
          read: true,
          readAt: now,
          status: 'read',
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Mark read note:', e);
    }
  },

  // Send a message (text, media, or interactive request)
  async sendMessage(
    conversationId: string,
    senderUserId: string,
    senderName: string,
    body: string,
    messageType: MessageType = 'TEXT',
    requestStatus?: 'PENDING' | 'APPROVED' | 'DECLINED',
    metadata?: Message['metadata'],
    mediaAttachment?: ChatMediaAttachment,
    receiverUserId?: string
  ): Promise<Message> {
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newMsg: Message = {
      id: msgId,
      messageId: msgId,
      conversationId,
      senderId: senderUserId,
      senderUserId,
      senderName,
      receiverId: receiverUserId,
      receiverUserId,
      body,
      message: body,
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
      status: 'sent',
      read: false,
      createdAt: now,
    };

    saveLocalMessage(newMsg, true);

    // Summary for last message in conversation list
    let lastMsgPreview = body;
    if (mediaAttachment?.fileType === 'image') {
      lastMsgPreview = `📷 Photo: ${mediaAttachment.fileName || 'Image'}${body ? ` - ${body}` : ''}`;
    } else if (mediaAttachment?.fileType === 'document' || mediaAttachment?.fileType === 'pdf') {
      lastMsgPreview = `📄 Document: ${mediaAttachment.fileName || 'File'}${body ? ` - ${body}` : ''}`;
    } else if (messageType === 'PHONE_NUMBER_REQUEST') {
      lastMsgPreview = '📞 Requested direct phone number';
    } else if (messageType === 'PHONE_NUMBER_SHARED') {
      lastMsgPreview = '✅ Shared direct phone number';
    } else if (messageType === 'SITE_VISIT_REQUEST') {
      lastMsgPreview = '📅 Requested physical site visit';
    }

    // Update conversation locally
    const allConvs = getLocalConversations();
    const conv = allConvs.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = lastMsgPreview;
      conv.lastMessageTimestamp = now;
      conv.lastMessageSenderId = senderUserId;
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
        lastMessageSenderId: senderUserId,
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
