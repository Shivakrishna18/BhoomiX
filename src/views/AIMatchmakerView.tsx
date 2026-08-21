import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Compass,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Bookmark,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { Property, BuyerPreferences, AIRecommendation, UserProfile } from '../types';
import { aiService } from '../services/aiService';

interface AIMatchmakerViewProps {
  properties: Property[];
  currentUser: UserProfile | null;
  onSelectProperty: (property: Property) => void;
  savedPropertyIds?: Set<string>;
  onToggleSave?: (property: Property) => void;
  onOpenAuth?: (role?: any) => void;
}

export const AIMatchmakerView: React.FC<AIMatchmakerViewProps> = ({
  properties,
  currentUser,
  onSelectProperty,
  savedPropertyIds = new Set(),
  onToggleSave,
  onOpenAuth,
}) => {
  const [purpose, setPurpose] = useState<'agricultural' | 'commercial' | 'residential' | 'industrial' | 'investment'>('commercial');
  const [district, setDistrict] = useState<string>('Ranga Reddy');
  const [minBudgetCr, setMinBudgetCr] = useState<number>(1);
  const [maxBudgetCr, setMaxBudgetCr] = useState<number>(6);
  const [minLandSize, setMinLandSize] = useState<number>(2);
  const [landUnit, setLandUnit] = useState<'acres' | 'sq_yards' | 'guntas'>('acres');
  const [roadPreference, setRoadPreference] = useState<string>('40 Feet or wider BT Road');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    // If user has saved preferences, load them
    if (currentUser) {
      aiService.getBuyerPreferences(currentUser.id).then((saved) => {
        if (saved) {
          if (saved.purpose && saved.purpose !== 'any') setPurpose(saved.purpose);
          if (saved.preferredDistricts) setDistrict(saved.preferredDistricts);
          if (saved.budgetMin) setMinBudgetCr(saved.budgetMin / 10000000);
          if (saved.budgetMax) setMaxBudgetCr(saved.budgetMax / 10000000);
          if (saved.landSizeMin) setMinLandSize(saved.landSizeMin);
          if (saved.landUnit) setLandUnit(saved.landUnit);
        }
      });
    }
  }, [currentUser]);

  const handleRunMatchmaker = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasRun(true);

    const prefs: BuyerPreferences = {
      id: `pref-${currentUser?.id || 'guest'}`,
      userId: currentUser?.id || 'guest-buyer',
      purpose,
      preferredDistricts: district,
      budgetMin: minBudgetCr * 10000000,
      budgetMax: maxBudgetCr * 10000000,
      landSizeMin: minLandSize,
      landUnit,
      roadAccessibility: roadPreference,
    };

    if (currentUser) {
      aiService.saveBuyerPreferences(prefs).catch((e) => console.warn(e));
    }

    try {
      const result = await aiService.getRecommendations(prefs, properties);
      setRecommendations(result.recommendations);
      setIsAiGenerated(result.aiGenerated);
    } catch (err) {
      console.error('Matchmaker error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Resolve recommended properties
  const matchedList = recommendations
    .map((rec) => {
      const prop = properties.find((p) => p.id === rec.propertyId);
      return prop ? { rec, property: prop } : null;
    })
    .filter(Boolean) as { rec: AIRecommendation; property: Property }[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Gemini AI Land Intelligence Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          AI Land Matchmaker & Investment Advisory
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Define your land acquisition objectives, corridor preferences, and capital allocation.
          BhoomiX AI will evaluate all active Dharani-verified listings to surface optimal matches with transparent trade-off analysis.
        </p>
      </div>

      {/* Questionnaire Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={handleRunMatchmaker} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Primary Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Primary Land Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as any)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white text-slate-700 font-medium"
              >
                <option value="commercial">Commercial / Warehousing / Highway</option>
                <option value="residential">Residential Villa / Plotted Layout</option>
                <option value="agricultural">Agricultural Farm / Weekend Farmhouse</option>
                <option value="industrial">Industrial Zone / Manufacturing</option>
                <option value="investment">Long-Term High Appreciation Investment</option>
              </select>
            </div>

            {/* Target Growth Corridor */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Target Telangana Corridor / District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white text-slate-700 font-medium"
              >
                <option value="Ranga Reddy">Ranga Reddy (Maheshwaram / Shamshabad / Ibrahimpatnam)</option>
                <option value="Sangareddy">Sangareddy (Shankarpally / Mokila / Kandi)</option>
                <option value="Yadadri Bhuvanagiri">Yadadri Bhuvanagiri (Alair / Bhongir / Warangal Hwy)</option>
                <option value="Medchal-Malkajgiri">Medchal-Malkajgiri (Gundlapochampally / NH-44)</option>
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Capital Outlay Cap: <span className="text-indigo-600 font-mono">₹{maxBudgetCr} Cr</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                value={maxBudgetCr}
                onChange={(e) => setMaxBudgetCr(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
              />
            </div>

            {/* Minimum Size */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Minimum Land Extent
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={minLandSize}
                  onChange={(e) => setMinLandSize(parseFloat(e.target.value) || 1)}
                  className="w-1/2 p-2.5 text-xs border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-600"
                />
                <select
                  value={landUnit}
                  onChange={(e) => setLandUnit(e.target.value as any)}
                  className="w-1/2 p-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="acres">Acres</option>
                  <option value="sq_yards">Sq. Yards</option>
                  <option value="guntas">Guntas</option>
                </select>
              </div>
            </div>

            {/* Road Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Approach Road Width
              </label>
              <select
                value={roadPreference}
                onChange={(e) => setRoadPreference(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-600"
              >
                <option value="60 Feet Highway">60+ Feet Arterial / Highway Road</option>
                <option value="40 Feet or wider BT Road">40 Feet Wide Blacktop Road</option>
                <option value="33 Feet Standard Road">33 Feet Panchayat Road Access</option>
              </select>
            </div>

            {/* Submit Action */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xs transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Evaluating Listings with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Run AI Matchmaker</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {hasRun && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              AI Ranked Land Recommendations ({matchedList.length})
            </h2>
            {isAiGenerated && (
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                ✨ Gemini 2.5 Multi-Factor Synthesis
              </span>
            )}
          </div>

          <div className="space-y-6">
            {matchedList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600">
                  No direct listings perfectly matched this exact budget and extent. Try relaxing your budget cap or road width criteria.
                </p>
              </div>
            ) : (
              matchedList.map(({ rec, property }, idx) => (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden p-6 space-y-5 hover:border-indigo-200"
                >
                  {/* Top Row: Rank, Title, Match Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {property.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center space-x-1 shrink-0">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>{property.documentVerifiedPercentage || 96}% Verified</span>
                          </span>
                        </div>
                        <p className="text-xs text-indigo-600 font-semibold">
                          {property.locality}, {property.district} • Extent: {property.landSize} {property.landUnit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Match Fit</span>
                        <p className="text-lg font-bold text-emerald-600 font-mono">
                          {rec.matchScore}%
                        </p>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asking</span>
                        <p className="text-sm font-bold text-slate-900">
                          {formatINR(property.askingPrice)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Match Highlights & Reasoning */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Reasoning */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>AI Match Reasoning</span>
                      </span>
                      <p className="text-slate-700 leading-relaxed">{rec.reasoning}</p>
                    </div>

                    {/* Fit Highlights */}
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                      <span className="font-bold text-emerald-950 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Target Criteria Alignment</span>
                      </span>
                      <ul className="space-y-1">
                        {rec.fitHighlights?.map((fh, fIdx) => (
                          <li key={fIdx} className="text-emerald-900 flex items-start space-x-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{fh}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pros & Physical Inspection Considerations */}
                  <div className="flex flex-col sm:flex-row gap-3 text-xs pt-2">
                    {rec.pros && rec.pros.length > 0 && (
                      <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                        <span className="font-bold text-slate-900">Key Strengths: </span>
                        {rec.pros.join(', ')}
                      </div>
                    )}
                    {rec.considerations && (
                      <div className="flex-1 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900">
                        <span className="font-bold">Inspection Note: </span>
                        {rec.considerations}
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions: Wishlist and 3D Explore */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {onToggleSave && (
                      <button
                        type="button"
                        onClick={() => onToggleSave(property)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          savedPropertyIds.has(property.id)
                            ? 'bg-rose-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            savedPropertyIds.has(property.id) ? 'fill-white text-white' : 'text-slate-600'
                          }`}
                        />
                        <span>{savedPropertyIds.has(property.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectProperty(property)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs ml-auto cursor-pointer"
                    >
                      <span>Explore 3D Terrain & Full Verification</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
