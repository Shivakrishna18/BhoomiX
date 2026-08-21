import React, { useEffect, useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Calendar,
  Phone,
  MessageSquare,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { AppNotification, UserProfile } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationsModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onOpenChatWithProperty?: (propertyId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onOpenChatWithProperty,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const list = await notificationService.getUserNotifications(currentUser.id);
      setNotifications(list);
    } catch (e) {
      console.warn('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchNotifs();

    const handleCustomNotif = (e: any) => {
      if (e.detail) {
        setNotifications((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener('bhoomix_new_notification', handleCustomNotif);
    return () => window.removeEventListener('bhoomix_new_notification', handleCustomNotif);
  }, [isOpen, currentUser.id]);

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full h-[520px] shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Activity & Notifications</h3>
              <p className="text-[11px] text-slate-400">
                Direct buyer-seller requests, visits, and phone sharing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action sub-bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {notifications.filter((n) => !n.read).length} unread alerts
          </span>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification items list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-slate-50/60">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs font-medium">No notifications yet</p>
              <p className="text-[11px] text-slate-400">
                You will be notified here when site visits, phone numbers, or messages are requested.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isPhone = notif.type === 'PHONE_REQUEST' || notif.type === 'PHONE_SHARED';
              const isVisit = notif.type === 'VISIT_REQUEST' || notif.type === 'VISIT_CONFIRMED';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    notificationService.markAsRead(currentUser.id, notif.id);
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                    );
                    if (notif.propertyId && onOpenChatWithProperty) {
                      onOpenChatWithProperty(notif.propertyId);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-white border-slate-200/70 opacity-80'
                      : 'bg-indigo-50/60 border-indigo-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isPhone
                          ? 'bg-indigo-100 text-indigo-700'
                          : isVisit
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isPhone ? (
                        <Phone className="w-3.5 h-3.5" />
                      ) : isVisit ? (
                        <Calendar className="w-3.5 h-3.5" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                        <span className="text-indigo-600 font-bold flex items-center space-x-0.5">
                          <span>Open in Direct Chat</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
