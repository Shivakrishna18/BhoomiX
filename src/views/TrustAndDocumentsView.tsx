import React from 'react';
import {
  ShieldCheck,
  FileCheck,
  Compass,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react';

export const TrustAndDocumentsView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>BhoomiX Land Verification Framework</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          How Land Titles & Boundaries are Verified in Telangana
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          India's land ecosystem requires rigorous multi-source due diligence. BhoomiX integrates optical AI extraction with official government registration records to ensure zero ambiguity before you commit capital.
        </p>
      </div>

      {/* 4 Pillars of Due Diligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Dharani Digital Pattadar Passbook
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Telangana’s integrated land records management system (Dharani) maintains immutable digital titles. BhoomiX verifies the Passbook Number, Khata Number, Pattadar Name, and Survey Extent to confirm single lawful ownership and check for non-agricultural or agricultural conversions.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-base font-bold text-slate-900">
            30-Year Encumbrance Certificate (EC)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Issued by the Registration and Stamps Department (IGRS Telangana), an EC verifies whether the property has registered financial liabilities, bank mortgages, prior sales, or court attachments. We flag any non-nil entries for advocate review.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Cadastral Village Maps & Tippon Sketches
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Revenue Department village survey maps (Tippon / FMB) define the physical geometry of each survey sub-division. Our spatial tool plots DGPS coordinate markers directly on cadastral grid layers to detect boundary overlaps.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold">
            4
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Section 22A & Prohibited Property Screening
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Certain lands (Wakf, Inam, Assigned, Ceiling surplus, Government Poramboke) are barred from registration under Section 22-A of the Registration Act. Every listing is cross-checked against prohibited survey lists.
          </p>
        </div>
      </div>

      {/* AI Optical Cross-Validation Process */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white space-y-6 border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>Automated Optical Verification Workflow</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold">
          How BhoomiX AI Processes Uploaded Legal Deeds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <span className="font-bold text-white text-sm">Step 1: OCR Extraction</span>
            <p className="leading-relaxed">
              Extracts seller name, survey number, sub-division (e.g. 142/A), and land extent (Acres & Guntas) from PDF/image deeds.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <span className="font-bold text-white text-sm">Step 2: Cross-Deed Matrix</span>
            <p className="leading-relaxed">
              Checks consistency across the Passbook, EC, and Registered Sale Deed. Mismatched extents or names trigger an immediate discrepancy notice.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <span className="font-bold text-white text-sm">Step 3: Verification Checklist</span>
            <p className="leading-relaxed">
              Generates a tailored physical due diligence checklist for your advocate and field surveyor during the physical site inspection.
            </p>
          </div>
        </div>
      </div>

      {/* Regulatory Transparency Notice */}
      <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-2">
        <div className="flex items-center space-x-2 font-bold text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <span>Legal Disclaimer & Due Diligence Advisory</span>
        </div>
        <p>
          BhoomiX provides automated document analysis and price benchmarking solely as an exploratory decision-support aid. Before executing an agreement of sale or financial token transfer, buyers are strongly advised to engage a practicing real estate legal advocate in Telangana to conduct a certified physical search at the jurisdictional Sub-Registrar Office (SRO) and obtain a licensed surveyor's demarcation.
        </p>
      </div>
    </div>
  );
};
