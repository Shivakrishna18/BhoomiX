import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { Property, UserProfile, SiteVisit } from '../types';
import { siteVisitService } from '../services/siteVisitService';

interface SiteVisitModalProps {
  isOpen?: boolean;
  property: Property | null;
  currentUser: UserProfile;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SiteVisitModal: React.FC<SiteVisitModalProps> = ({
  isOpen = true,
  property,
  currentUser,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !property) return null;
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [buyerPhone, setBuyerPhone] = useState(currentUser.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate) return;

    setLoading(true);
    try {
      await siteVisitService.requestSiteVisit({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.locality,
        buyerId: currentUser.id,
        buyerName: currentUser.displayName || 'Buyer',
        buyerPhone: buyerPhone || '+91 98480 00000',
        sellerId: property.sellerId,
        sellerName: property.sellerName,
        date: preferredDate,
        timeSlot,
        notes,
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Site visit scheduling error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Schedule Physical Land Visit</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px]">
              {property.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Visit Request Dispatched</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct notification sent to <span className="font-semibold">{property.sellerName}</span> for{' '}
              {preferredDate} ({timeSlot.toLowerCase()}). You can track real-time status in your Site Visits tab.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">{property.locality}, {property.district}</p>
                <p className="text-[11px] text-slate-500 font-mono">{property.address || property.surveyNumber}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Visit Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time Window
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'MORNING', label: 'Morning (9-11 AM)' },
                  { id: 'AFTERNOON', label: 'Noon (1-3 PM)' },
                  { id: 'EVENING', label: 'Evening (4-6 PM)' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setTimeSlot(slot.id as any)}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-colors ${
                      timeSlot === slot.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Contact Number (for coordinates confirmation)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98480 00000"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Inspection Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Please arrange to show physical boundary survey stones and borewell motor test."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-xs"
              >
                {loading ? 'Submitting...' : 'Confirm Visit Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
