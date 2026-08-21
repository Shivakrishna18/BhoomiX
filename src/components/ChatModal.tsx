import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Phone,
  Calendar,
  Clock,
  Loader2,
  ShieldCheck,
  Check,
  Copy,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Eye,
  Maximize2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { Conversation, Message, Property, UserProfile, ChatMediaAttachment } from '../types';
import { chatService } from '../services/chatService';
import { notificationService } from '../services/notificationService';
import { siteVisitService } from '../services/siteVisitService';

interface ChatModalProps {
  isOpen?: boolean;
  conversation?: Conversation | null;
  property?: Property | null;
  sellerId?: string;
  sellerName?: string;
  currentUser: UserProfile;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen = true,
  conversation: initialConv,
  property,
  sellerId,
  sellerName,
  currentUser,
  onClose,
}) => {
  const [activeConv, setActiveConv] = useState<Conversation | null>(initialConv || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputBody, setInputBody] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedTopPhone, setCopiedTopPhone] = useState(false);

  // Phone share modal state for seller
  const [phonePromptMsgId, setPhonePromptMsgId] = useState<string | null>(null);
  const [phoneNumberInput, setPhoneNumberInput] = useState(() => currentUser.phone || property?.sellerPhone || '+91 98480 54321');
  const [phoneShareError, setPhoneShareError] = useState<string | null>(null);

  // Staged Media Attachment
  const [stagedMedia, setStagedMedia] = useState<ChatMediaAttachment | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; title: string } | null>(null);

  // Site visit request sub-modal inside chat
  const [showVisitPicker, setShowVisitPicker] = useState(false);
  const [visitDate, setVisitDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [visitTimeSlot, setVisitTimeSlot] = useState('10:00 AM - 12:00 PM (Morning)');
  const [visitNotes, setVisitNotes] = useState('Need physical boundary stone demarcations & survey stone review');

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or fetch conversation
  useEffect(() => {
    if (!isOpen) return;

    if (initialConv) {
      setActiveConv(initialConv);
      return;
    }

    if (property && (sellerId || property.sellerId)) {
      const targetSellerId = sellerId || property.sellerId;
      const targetSellerName = sellerName || property.sellerName || 'Direct Landowner';

      setLoadingConv(true);
      chatService
        .getOrCreateConversation(
          property.id,
          property.title,
          `${property.locality}, ${property.district}`,
          currentUser.id,
          currentUser.displayName || 'Prospective Buyer',
          targetSellerId,
          targetSellerName
        )
        .then((conv) => {
          setActiveConv(conv);
        })
        .catch((err) => {
          console.warn('Error fetching conversation:', err);
        })
        .finally(() => {
          setLoadingConv(false);
        });
    }
  }, [isOpen, initialConv, property, sellerId, sellerName, currentUser]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!activeConv?.id) return;

    const unsubscribe = chatService.subscribeToMessages(activeConv.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 60);
    });

    return () => unsubscribe();
  }, [activeConv?.id]);

  if (!isOpen) return null;

  const isUserSeller = activeConv
    ? currentUser.id === activeConv.sellerId || (currentUser.role === 'SELLER' && currentUser.id !== activeConv.buyerId)
    : currentUser.role === 'SELLER';
  const isBuyer = !isUserSeller;
  const isSeller = isUserSeller;

  // Find any shared/approved phone number in this conversation
  const sharedPhoneFromMessages = messages
    .slice()
    .reverse()
    .find((m) => m.metadata?.phoneNumber || (m.messageType === 'PHONE_NUMBER_SHARED' && m.body?.includes('+91')) || (m.messageType === 'PHONE_NUMBER_REQUEST' && m.requestStatus === 'APPROVED' && m.metadata?.phoneNumber))
    ?.metadata?.phoneNumber || null;

  const activeContactPhone = sharedPhoneFromMessages || (activeConv?.metadata as any)?.sharedPhoneNumber || (isBuyer && messages.some(m => m.requestStatus === 'APPROVED') ? property?.sellerPhone : null);

  const cleanPhoneForLinks = (phoneStr?: string | null) => {
    if (!phoneStr) return '';
    return phoneStr.replace(/[^0-9]/g, '');
  };

  // Handle File Upload (Photos or Documents)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    const reader = new FileReader();

    if (isImage) {
      reader.onload = (event) => {
        const rawData = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1280;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setStagedMedia({
              fileUrl: compressed,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type || 'image/jpeg',
              fileType: 'image',
              previewUrl: compressed,
            });
          }
          setUploadingMedia(false);
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    } else {
      // Document / PDF
      reader.onload = (event) => {
        const rawData = event.target?.result as string;
        setStagedMedia({
          fileUrl: rawData,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
          fileType: isPdf ? 'pdf' : 'document',
        });
        setUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle standard text / media message send
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputBody.trim() && !stagedMedia) || sending || !activeConv) return;

    setSending(true);
    const bodyToSend = inputBody.trim();
    const mediaToSend = stagedMedia;

    setInputBody('');
    setStagedMedia(null);

    try {
      const messageType = mediaToSend
        ? mediaToSend.fileType === 'image'
          ? 'IMAGE'
          : 'DOCUMENT'
        : 'TEXT';

      await chatService.sendMessage(
        activeConv.id,
        currentUser.id,
        currentUser.displayName || (isBuyer ? 'Buyer' : 'Seller'),
        bodyToSend,
        messageType,
        undefined,
        undefined,
        mediaToSend || undefined
      );

      const recipientId = isBuyer ? activeConv.sellerId : activeConv.buyerId;
      const notifSnippet = mediaToSend
        ? `${mediaToSend.fileType === 'image' ? '📷 Photo' : '📄 Document'}: ${mediaToSend.fileName}`
        : bodyToSend.length > 60
        ? `${bodyToSend.slice(0, 60)}...`
        : bodyToSend;

      await notificationService.addNotification({
        userId: recipientId,
        type: 'MESSAGE',
        title: `New message from ${currentUser.displayName || (isBuyer ? 'Buyer' : 'Owner')}`,
        message: notifSnippet,
        propertyId: activeConv.propertyId,
        conversationId: activeConv.id,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // 1. Request Phone Number Action (Buyer)
  const handleRequestPhoneNumber = async () => {
    if (!activeConv || sending) return;
    setSending(true);

    const targetSellerPhone = property?.sellerPhone || '+91 98480 54321';

    try {
      await chatService.sendMessage(
        activeConv.id,
        currentUser.id,
        currentUser.displayName || 'Direct Buyer',
        '📞 Has requested your direct contact phone number for discussion regarding this land.',
        'PHONE_NUMBER_REQUEST',
        'PENDING',
        {
          requestedNumber: targetSellerPhone,
          requesterName: currentUser.displayName || 'Direct Buyer',
          requesterPhone: currentUser.phone || '+91 98490 12345',
        }
      );

      // Notify seller
      await notificationService.addNotification({
        userId: activeConv.sellerId,
        type: 'PHONE_REQUEST',
        title: 'Phone Number Request Received',
        message: `${currentUser.displayName || 'A buyer'} requested your direct contact number for ${activeConv.propertyTitle}.`,
        propertyId: activeConv.propertyId,
        conversationId: activeConv.id,
      });
    } catch (e) {
      console.error('Error requesting phone number:', e);
    } finally {
      setSending(false);
    }
  };

  // Direct Share My Number Action (Available to both Buyer and Seller)
  const handleDirectShareMyNumber = async () => {
    if (!activeConv || sending) return;
    setSending(true);

    const myNumber = currentUser.phone || (isSeller ? '+91 98480 54321' : '+91 98490 12345');

    try {
      await chatService.sendMessage(
        activeConv.id,
        currentUser.id,
        currentUser.displayName || (isSeller ? 'Landowner' : 'Direct Buyer'),
        `✅ Direct Contact Phone Number Shared: ${myNumber}`,
        'PHONE_NUMBER_SHARED',
        'APPROVED',
        {
          phoneNumber: myNumber,
          senderRole: isSeller ? 'SELLER' : 'BUYER',
        }
      );

      const recipientId = isBuyer ? activeConv.sellerId : activeConv.buyerId;
      await notificationService.addNotification({
        userId: recipientId,
        type: 'PHONE_SHARED',
        title: `Direct Phone Number Shared by ${currentUser.displayName || (isSeller ? 'Landowner' : 'Buyer')}`,
        message: `${currentUser.displayName || 'User'} shared direct contact number: ${myNumber}`,
        propertyId: activeConv.propertyId,
        conversationId: activeConv.id,
      });
    } catch (e) {
      console.error('Error sharing phone number:', e);
    } finally {
      setSending(false);
    }
  };

  // 2. Request Schedule Physical Site Visit Action (Buyer)
  const handleConfirmSiteVisitRequest = async () => {
    if (!activeConv || sending) return;
    setSending(true);
    setShowVisitPicker(false);

    try {
      const visitObj = await siteVisitService.requestSiteVisit({
        propertyId: activeConv.propertyId,
        propertyTitle: activeConv.propertyTitle,
        propertyLocation: activeConv.propertyLocation || 'Telangana',
        buyerId: currentUser.id,
        buyerName: currentUser.displayName || 'Buyer',
        buyerPhone: currentUser.phone || '+91 98490 12345',
        sellerId: activeConv.sellerId,
        sellerName: activeConv.sellerName,
        date: visitDate,
        timeSlot: visitTimeSlot,
        notes: visitNotes,
      });

      await chatService.sendMessage(
        activeConv.id,
        currentUser.id,
        currentUser.displayName || 'Buyer',
        `📅 Has requested a Physical Site Visit for ${visitDate} (${visitTimeSlot}).`,
        'SITE_VISIT_REQUEST',
        'PENDING',
        {
          visitDate,
          visitTime: visitTimeSlot,
          notes: visitNotes,
          visitId: visitObj?.id,
        }
      );

      await notificationService.addNotification({
        userId: activeConv.sellerId,
        type: 'VISIT_REQUEST',
        title: 'New Site Visit Request',
        message: `${currentUser.displayName || 'A buyer'} requested a physical site visit on ${visitDate} (${visitTimeSlot}).`,
        propertyId: activeConv.propertyId,
        conversationId: activeConv.id,
      });
    } catch (e) {
      console.error('Error requesting site visit:', e);
    } finally {
      setSending(false);
    }
  };

  // 1-Click Instant Approve Phone Number (Seller)
  const handleInstantApprovePhoneNumber = async (msgId: string, phoneToShare?: string) => {
    if (!activeConv) return;
    const finalPhone = (phoneToShare || currentUser.phone || property?.sellerPhone || '+91 98480 54321').trim();

    try {
      await chatService.updateMessageStatus(msgId, activeConv.id, 'APPROVED', {
        phoneNumber: finalPhone,
      });

      await chatService.sendMessage(
        activeConv.id,
        currentUser.id,
        currentUser.displayName || 'Landowner',
        `✅ Direct Phone Number Shared: ${finalPhone}`,
        'PHONE_NUMBER_SHARED',
        'APPROVED',
        { phoneNumber: finalPhone }
      );

      await notificationService.addNotification({
        userId: activeConv.buyerId,
        type: 'PHONE_SHARED',
        title: 'Phone Number Approved by Landowner',
        message: `${activeConv.sellerName || currentUser.displayName} approved your request and shared their phone number: ${finalPhone}`,
        propertyId: activeConv.propertyId,
        conversationId: activeConv.id,
      });
    } catch (e) {
      console.error('Error instantly approving phone:', e);
    }
  };

  // Seller Open Phone Prompt
  const handleOpenPhonePrompt = (msgId: string) => {
    const defaultNumber = currentUser.phone || property?.sellerPhone || '+91 98480 54321';
    setPhoneNumberInput(defaultNumber);
    setPhonePromptMsgId(msgId);
    setPhoneShareError(null);
  };

  // Confirm and Send Custom Phone Number
  const handleConfirmSendPhoneNumber = async () => {
    if (!activeConv || !phonePromptMsgId) return;

    const trimmedPhone = phoneNumberInput.trim();
    if (!trimmedPhone || trimmedPhone.length < 8) {
      setPhoneShareError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    const msgId = phonePromptMsgId;
    setPhonePromptMsgId(null);

    await handleInstantApprovePhoneNumber(msgId, trimmedPhone);
  };

  // Seller Decline Phone Number
  const handleDeclinePhoneNumber = async (msgId: string) => {
    if (!activeConv) return;
    try {
      await chatService.updateMessageStatus(msgId, activeConv.id, 'DECLINED');
      await chatService.sendMessage(
        activeConv.id,
        currentUser.id,
        currentUser.displayName || 'Landowner',
        '❌ Phone number sharing declined at this stage. Please continue discussions via secure direct chat.',
        'TEXT'
      );
    } catch (e) {}
  };

  // Seller Approve Site Visit
  const handleApproveSiteVisit = async (msg: Message) => {
    if (!activeConv) return;
    try {
      await chatService.updateMessageStatus(msg.id, activeConv.id, 'APPROVED', msg.metadata);

      if (msg.metadata?.visitId) {
        await siteVisitService.updateStatus(msg.metadata.visitId, 'CONFIRMED', 'Confirmed by landowner in chat');
      }

      await chatService.sendMessage(
        activeConv.id,
        currentUser.id,
        currentUser.displayName || 'Owner',
        `✅ Physical Site Visit Confirmed for ${msg.metadata?.visitDate || 'Scheduled Date'} (${msg.metadata?.visitTime || 'Time Slot'}). Our field representative will meet you at the site!`,
        'SITE_VISIT_CONFIRMED',
        'APPROVED',
        msg.metadata
      );

      await notificationService.addNotification({
        userId: activeConv.buyerId,
        type: 'VISIT_CONFIRMED',
        title: 'Physical Site Visit Confirmed!',
        message: `Your visit for ${activeConv.propertyTitle} is confirmed for ${msg.metadata?.visitDate} (${msg.metadata?.visitTime}).`,
        propertyId: activeConv.propertyId,
        conversationId: activeConv.id,
      });
    } catch (e) {
      console.error('Error approving visit:', e);
    }
  };

  // Seller Decline Site Visit
  const handleDeclineSiteVisit = async (msg: Message) => {
    if (!activeConv) return;
    try {
      await chatService.updateMessageStatus(msg.id, activeConv.id, 'DECLINED', msg.metadata);
      if (msg.metadata?.visitId) {
        await siteVisitService.updateStatus(msg.metadata.visitId, 'DECLINED', 'Declined by landowner');
      }

      await chatService.sendMessage(
        activeConv.id,
        currentUser.id,
        currentUser.displayName || 'Owner',
        '❌ Physical site visit requested slot unavailable. Please suggest an alternative date or time.',
        'TEXT'
      );
    } catch (e) {
      console.error('Error declining visit:', e);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[620px] max-h-[92vh] shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden relative">
        {/* Header with Land Info & Perspective */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold truncate">
                  {activeConv?.propertyTitle || property?.title || 'Land Direct Chat'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  {isSeller ? 'Landowner View' : 'Buyer View'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {isSeller
                  ? `Chatting with Prospective Buyer: ${activeConv?.buyerName || 'Buyer'}`
                  : `Direct Chat with Landowner: ${activeConv?.sellerName || property?.sellerName || 'Venkata Reddy'}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 30-Day Auto Retention & Encrypted Status Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-600 font-medium">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Direct Encrypted Chat</span>
          </span>
          <span className="text-slate-500 font-mono">
            🕒 Messages stored for 30 days
          </span>
        </div>

        {/* Top Direct Contact Sticky Bar (Always visible to Buyer & Seller when phone is known) */}
        {activeContactPhone && (
          <div className="bg-emerald-50 border-b border-emerald-200/90 px-4 py-2 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 shadow-2xs">
                <Phone className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                  Direct Contact (Visible in Chat)
                </div>
                <div className="text-xs font-bold font-mono text-emerald-950 truncate">
                  {activeContactPhone}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeContactPhone);
                  setCopiedTopPhone(true);
                  setTimeout(() => setCopiedTopPhone(false), 2000);
                }}
                className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                title="Copy phone number"
              >
                {copiedTopPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTopPhone ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={`tel:${cleanPhoneForLinks(activeContactPhone)}`}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>

              <a
                href={`https://wa.me/${cleanPhoneForLinks(activeContactPhone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                title="Open in WhatsApp"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WA</span>
              </a>
            </div>
          </div>
        )}

        {/* Action Request Bar */}
        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200/80 flex items-center justify-between gap-2">
          {isBuyer ? (
            <>
              <button
                type="button"
                disabled={sending}
                onClick={handleRequestPhoneNumber}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Request Number</span>
              </button>

              <button
                type="button"
                disabled={sending}
                onClick={handleDirectShareMyNumber}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Share your buyer contact number"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Share My Phone</span>
              </button>

              <button
                type="button"
                disabled={sending}
                onClick={() => setShowVisitPicker(true)}
                className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Schedule Visit</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={sending}
                onClick={handleDirectShareMyNumber}
                className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Share Landowner Number ({currentUser.phone || '+91 98480 54321'})</span>
              </button>
            </>
          )}
        </div>

        {/* Site Visit Selection Sub-Card */}
        {showVisitPicker && (
          <div className="bg-emerald-50/90 border-b border-emerald-200 p-4 space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Schedule Physical Site Visit</span>
              </span>
              <button
                type="button"
                onClick={() => setShowVisitPicker(false)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Preferred Time Slot</label>
                <select
                  value={visitTimeSlot}
                  onChange={(e) => setVisitTimeSlot(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="10:00 AM - 12:00 PM (Morning)">10:00 AM - 12:00 PM (Morning)</option>
                  <option value="02:00 PM - 04:00 PM (Afternoon)">02:00 PM - 04:00 PM (Afternoon)</option>
                  <option value="04:30 PM - 06:00 PM (Evening)">04:30 PM - 06:00 PM (Evening)</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowVisitPicker(false)}
                className="py-1.5 px-3 bg-white text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSiteVisitRequest}
                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Send Visit Request
              </button>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
          {loadingConv ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Connecting conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 font-medium space-y-2">
              <p>Direct communication channel active.</p>
              <p className="text-[11px] text-slate-400">
                You can chat directly, share land photos/documents, request phone numbers, or schedule an inspection.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              const hasMedia = !!msg.mediaAttachment || !!msg.metadata?.mediaUrl;
              const mediaUrl = msg.mediaAttachment?.fileUrl || msg.metadata?.mediaUrl;
              const mediaType = msg.mediaAttachment?.fileType || (msg.messageType === 'IMAGE' ? 'image' : 'document');
              const fileName = msg.mediaAttachment?.fileName || msg.metadata?.fileName || 'Attachment';
              const fileSize = msg.mediaAttachment?.fileSize || msg.metadata?.fileSize;

              // 1. Phone Number Request Card
              if (msg.messageType === 'PHONE_NUMBER_REQUEST') {
                const isRecipient = isSeller || msg.senderId !== currentUser.id;
                const isApproved = msg.requestStatus === 'APPROVED';
                const isDeclined = msg.requestStatus === 'DECLINED';
                const isPending = !isApproved && !isDeclined;
                const displayPhone = msg.metadata?.phoneNumber || msg.metadata?.requestedNumber || (isApproved ? property?.sellerPhone : null) || '+91 98480 54321';

                return (
                  <div key={msg.id} className="w-full my-2">
                    <div
                      className={`border rounded-2xl p-4 space-y-3 shadow-2xs transition-all ${
                        isApproved
                          ? 'bg-emerald-50/95 border-emerald-300'
                          : isDeclined
                          ? 'bg-rose-50/90 border-rose-200'
                          : isRecipient
                          ? 'bg-indigo-50/95 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-indigo-50/80 border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                          <Phone className="w-4 h-4 text-indigo-600" />
                          <span>Direct Phone Number Request</span>
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDeclined
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isApproved
                            ? 'Approved & Visible to Both'
                            : isDeclined
                            ? 'Declined'
                            : 'Pending Response'}
                        </span>
                      </div>

                      <p className="text-xs text-indigo-950/90 leading-relaxed font-medium">
                        {msg.body}
                      </p>

                      {/* Interactive Section for Seller when Pending */}
                      {isRecipient && isPending && (
                        <div className="pt-1.5 space-y-2">
                          <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-200 flex items-center justify-between">
                            <span className="text-[11px] text-slate-700 font-semibold">
                              Buyer is requesting your phone number:
                            </span>
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                              Action Required
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleInstantApprovePhoneNumber(msg.id, currentUser.phone || property?.sellerPhone || '+91 98480 54321')}
                              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Share My Number ({currentUser.phone || property?.sellerPhone || '+91 98480 54321'})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPhonePrompt(msg.id)}
                              className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 cursor-pointer transition-colors"
                            >
                              Custom Number
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeclinePhoneNumber(msg.id)}
                              className="py-2 px-3 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Pending note for Buyer */}
                      {!isRecipient && isPending && (
                        <div className="p-2.5 bg-white/80 rounded-xl border border-indigo-100 space-y-1 text-xs text-slate-700">
                          <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Request sent to landowner. Waiting for contact approval...</span>
                          </div>
                          {msg.metadata?.requestedNumber && (
                            <p className="text-[11px] text-slate-500 pl-5">
                              Target contact number: <span className="font-mono font-bold text-slate-700">{msg.metadata.requestedNumber}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Unlocked phone info: VISIBLE IN BOTH BUYER AND SELLER CHATS */}
                      {isApproved && displayPhone && (
                        <div className="p-3.5 bg-white rounded-xl border border-emerald-300 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Verified Direct Landowner Phone</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Visible to Buyer & Seller
                            </span>
                          </div>

                          <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                            <span className="text-sm font-black font-mono text-emerald-950 tracking-wide">
                              📞 {displayPhone}
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(displayPhone);
                                  setCopiedPhone(true);
                                  setTimeout(() => setCopiedPhone(false), 2000);
                                }}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                                title="Copy Phone Number"
                              >
                                {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                              </button>
                              <a
                                href={`tel:${cleanPhoneForLinks(displayPhone)}`}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-2xs transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call</span>
                              </a>
                              <a
                                href={`https://wa.me/${cleanPhoneForLinks(displayPhone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-2xs transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // 1.5. Phone Number Shared Card (VISIBLE IN BOTH CHATS)
              if (msg.messageType === 'PHONE_NUMBER_SHARED') {
                const phoneVal = msg.metadata?.phoneNumber || msg.body?.replace(/^.*:\s*/, '') || '+91 98480 54321';
                const roleTag = msg.metadata?.senderRole === 'BUYER' ? 'Buyer Contact Number' : 'Direct Landowner Number';

                return (
                  <div key={msg.id} className="w-full my-2">
                    <div className="bg-emerald-50/95 border border-emerald-300 rounded-2xl p-4 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Direct Phone Number Shared ({roleTag})</span>
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active & Visible in Both Chats
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-2 shadow-2xs">
                        <span className="text-sm font-black font-mono text-emerald-950 tracking-wide">
                          📞 {phoneVal}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(phoneVal || '');
                              setCopiedPhone(true);
                              setTimeout(() => setCopiedPhone(false), 2000);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                          </button>
                          {phoneVal && (
                            <>
                              <a
                                href={`tel:${cleanPhoneForLinks(phoneVal)}`}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-2xs transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call</span>
                              </a>
                              <a
                                href={`https://wa.me/${cleanPhoneForLinks(phoneVal)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-2xs transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // 2. Site Visit Request Card
              if (msg.messageType === 'SITE_VISIT_REQUEST') {
                return (
                  <div key={msg.id} className="w-full my-2">
                    <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Physical Site Visit Request</span>
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            msg.requestStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : msg.requestStatus === 'DECLINED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {msg.requestStatus === 'APPROVED'
                            ? 'Confirmed'
                            : msg.requestStatus === 'DECLINED'
                            ? 'Declined'
                            : 'Pending Response'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs space-y-1">
                        <div className="flex items-center space-x-2 text-slate-800 font-bold">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {msg.metadata?.visitDate || 'Selected Date'} • {msg.metadata?.visitTime || 'Time Slot'}
                          </span>
                        </div>
                        {msg.metadata?.notes && (
                          <p className="text-[11px] text-slate-600 pl-5">{msg.metadata.notes}</p>
                        )}
                      </div>

                      {/* Interactive Buttons for Seller */}
                      {isSeller && msg.requestStatus === 'PENDING' && (
                        <div className="pt-1 flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleApproveSiteVisit(msg)}
                            className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            Approve Site Visit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineSiteVisit(msg)}
                            className="py-1.5 px-3 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Standard Text & Media Messages
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-xs ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    <p className="font-bold text-[10px] opacity-80 mb-1">
                      {isMine ? 'You' : msg.senderName}
                    </p>

                    {/* Image Attachment Rendering */}
                    {hasMedia && mediaType === 'image' && mediaUrl && (
                      <div className="mb-2 overflow-hidden rounded-xl bg-slate-950/20 border border-white/20 relative group">
                        <img
                          src={mediaUrl}
                          alt={fileName}
                          className="max-h-60 w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setPreviewImageModal({ url: mediaUrl, title: fileName })}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <span className="px-2.5 py-1 bg-white/90 text-slate-900 rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                            <Maximize2 className="w-3 h-3" />
                            <span>Click to Zoom</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Document / PDF Attachment Rendering */}
                    {hasMedia && (mediaType === 'document' || mediaType === 'pdf') && (
                      <div
                        className={`mb-2 p-2.5 rounded-xl border flex items-center justify-between space-x-2 ${
                          isMine
                            ? 'bg-indigo-700/60 border-indigo-400/40 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-rose-500 text-white shrink-0 shadow-xs">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate max-w-[180px]">{fileName}</p>
                            <p className="text-[10px] opacity-75 font-mono">{formatFileSize(fileSize)}</p>
                          </div>
                        </div>

                        {mediaUrl && (
                          <a
                            href={mediaUrl}
                            download={fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer shrink-0 ${
                              isMine
                                ? 'bg-white/20 hover:bg-white/30 text-white'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Text Body */}
                    {msg.body && (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono flex items-center space-x-1">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMine && <span>• Sent</span>}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Staged File Attachment Preview bar */}
        {stagedMedia && (
          <div className="bg-indigo-50/90 border-t border-indigo-100 px-4 py-2 flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              {stagedMedia.fileType === 'image' ? (
                <img
                  src={stagedMedia.fileUrl}
                  alt="Preview"
                  className="w-9 h-9 rounded-lg object-cover border border-indigo-200 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{stagedMedia.fileName}</p>
                <p className="text-[10px] text-slate-500 font-mono">{formatFileSize(stagedMedia.fileSize)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStagedMedia(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200/80 flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <button
            type="button"
            disabled={uploadingMedia || sending}
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="Attach Photo or PDF Document"
          >
            {uploadingMedia ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          <input
            type="text"
            value={inputBody}
            onChange={(e) => setInputBody(e.target.value)}
            placeholder="Type message to landowner / buyer..."
            className="flex-1 px-3 py-2 text-xs bg-slate-100/80 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={(!inputBody.trim() && !stagedMedia) || sending}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Seller Phone Input Modal */}
        {phonePromptMsgId && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Share Your Direct Phone Number</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPhonePromptMsgId(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-600">
                This verified phone number will be displayed in both buyer and seller chats for direct voice calls & WhatsApp.
              </p>

              {phoneShareError && (
                <p className="text-[11px] text-rose-600 font-medium">{phoneShareError}</p>
              )}

              <div>
                <input
                  type="tel"
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  placeholder="+91 98480 12345"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPhonePromptMsgId(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendPhoneNumber}
                  className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Send & Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Full-screen Zoom Modal */}
        {previewImageModal && (
          <div
            className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4"
            onClick={() => setPreviewImageModal(null)}
          >
            <div className="max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center relative">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <p className="text-white text-xs font-medium mt-3">{previewImageModal.title}</p>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="absolute top-2 right-2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
