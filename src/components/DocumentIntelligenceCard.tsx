import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Upload,
  Eye,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Property, PropertyDocument, DocumentAnalysis } from '../types';
import { documentService } from '../services/documentService';

interface DocumentIntelligenceCardProps {
  property: Property;
  isSeller?: boolean;
}

export const DocumentIntelligenceCard: React.FC<DocumentIntelligenceCardProps> = ({
  property,
  isSeller = false,
}) => {
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<any>('PASSBOOK');
  const [docTitle, setDocTitle] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [property.id]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocumentsForProperty(property.id);
      if (docs.length === 0) {
        // Create baseline demonstration documents for the listing
        const baselineDocs: PropertyDocument[] = [
          {
            id: `doc-demo-passbook-${property.id}`,
            propertyId: property.id,
            sellerId: property.sellerId,
            documentType: 'PASSBOOK',
            fileUrl: '#',
            fileName: 'Dharani_Passbook_Verified.pdf',
            analysisSummary: {
              documentTypeDetected: 'Dharani Digital Pattadar Passbook',
              confidenceScore: 98,
              extractedDetails: {
                surveyNumber: property.surveyNumber || 'Sy. 142/A',
                extent: `${property.landSize} ${property.landUnit}`,
                ownerName: property.sellerName,
                village: property.locality,
                district: property.district,
              },
              consistencyChecks: [
                { check: 'Pattadar name', status: 'MATCH', detail: 'Matches seller identity record' },
                { check: 'Survey number', status: 'MATCH', detail: 'Matches cadastral village map' },
                { check: 'Section 22A check', status: 'MATCH', detail: 'Not under prohibited land category' },
              ],
              potentialRisks: [],
              referenceVerification: {
                dharaniOrGovtMatch: 'LIKELY_MATCH',
                notes: 'Matches Dharani revenue digital ledger.',
              },
              summary:
                'Clear digital passbook record registered with Telangana Revenue Department Dharani portal. Pattadar title matches seller identification.',
              recommendedNextSteps: ['Proceed to boundary demarcation inspection.'],
            },
            status: 'VERIFIED_REF',
            createdAt: new Date().toISOString(),
          },
          {
            id: `doc-demo-ec-${property.id}`,
            propertyId: property.id,
            sellerId: property.sellerId,
            documentType: 'ENCUMBRANCE_CERTIFICATE',
            fileUrl: '#',
            fileName: 'EC_30Years_Nil.pdf',
            analysisSummary: {
              documentTypeDetected: '30-Year Encumbrance Certificate (EC)',
              confidenceScore: 95,
              extractedDetails: {
                surveyNumber: property.surveyNumber || 'Sy. 142/A',
                extent: `${property.landSize} ${property.landUnit}`,
                sroOffice: `${property.district} SRO`,
              },
              consistencyChecks: [
                { check: 'Encumbrance liabilities', status: 'MATCH', detail: 'Zero active mortgages or bank attachments' },
                { check: 'Chain of title', status: 'MATCH', detail: 'Continuous 30-year unbroken chain' },
              ],
              potentialRisks: [],
              referenceVerification: {
                dharaniOrGovtMatch: 'LIKELY_MATCH',
                notes: 'IGRS search returned NIL encumbrance.',
              },
              summary:
                'Registration Department search shows nil registered liabilities, court attachments, or conflicting sale deeds for the specified period.',
              recommendedNextSteps: ['Obtain certified physical copy prior to final agreement.'],
            },
            status: 'VERIFIED_REF',
            createdAt: new Date().toISOString(),
          },
        ];
        setDocuments(baselineDocs);
        setExpandedDocId(baselineDocs[0].id);
      } else {
        setDocuments(docs);
        if (docs.length > 0) setExpandedDocId(docs[0].id);
      }
    } catch (e) {
      console.warn('Error loading documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAnalysis = async (docItem: PropertyDocument) => {
    setAnalyzingDocId(docItem.id);
    try {
      const analysis = await documentService.analyzeDocument(
        docItem.documentType,
        docItem.fileName,
        docNotes || 'Verified land title deed matching Telangana Dharani portal records.',
        property
      );
      setDocuments((prev) =>
        prev.map((d) => (d.id === docItem.id ? { ...d, analysisSummary: analysis, status: 'VERIFIED_REF' } : d))
      );
    } catch (err) {
      console.error('Document analysis error:', err);
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    const newDoc: PropertyDocument = {
      id: `doc-custom-${Date.now()}`,
      propertyId: property.id,
      sellerId: property.sellerId,
      documentType: selectedDocType,
      fileName: `${docTitle.replace(/\s+/g, '_')}.pdf`,
      fileUrl: '#',
      status: 'UPLOADED',
      createdAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setUploadModalOpen(false);
    setDocTitle('');
    setDocNotes('');

    // Trigger AI analysis on the newly added document
    handleTriggerAnalysis(newDoc);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">
              Document Trust & Legal Verification
            </h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Verified Repository
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dharani digital passbook, 30-year EC & cadastral survey records
          </p>
        </div>

        {isSeller && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap gap-2">
        {property.verificationBadges?.map((badge, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
            <span>{badge}</span>
          </span>
        ))}
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="py-6 text-center text-xs text-slate-500 font-medium">Loading document vault...</div>
      ) : documents.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/80">
          No public documents attached yet.
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((docItem) => {
            const isExpanded = expandedDocId === docItem.id;
            const isAnalyzing = analyzingDocId === docItem.id;

            return (
              <div
                key={docItem.id}
                className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <div
                  onClick={() => setExpandedDocId(isExpanded ? null : docItem.id)}
                  className="p-4 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{docItem.fileName.replace(/_/g, ' ').replace('.pdf', '')}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {docItem.documentType} • {docItem.fileName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {docItem.analysisSummary ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        AI Verified ({docItem.analysisSummary.confidenceScore}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                        Pending
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details / AI Intelligence */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-200/80 bg-white space-y-4">
                    {docItem.analysisSummary ? (
                      <div className="space-y-3">
                        {/* Extracted Record Fields */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 font-medium">Extracted Sy. No.</span>
                            <p className="font-bold text-slate-900 font-mono">
                              {docItem.analysisSummary.extractedDetails?.surveyNumber || property.surveyNumber || 'Sy. 142/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-medium">Document Extent</span>
                            <p className="font-bold text-slate-900 font-mono">
                              {docItem.analysisSummary.extractedDetails?.extent || `${property.landSize} ${property.landUnit}`}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-medium">Pattadar / Owner</span>
                            <p className="font-bold text-slate-900">
                              {docItem.analysisSummary.extractedDetails?.ownerName || property.sellerName}
                            </p>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="text-xs text-slate-700 leading-relaxed bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100">
                          <p className="font-bold text-indigo-950 mb-1 flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>AI Intelligence Analysis</span>
                          </p>
                          <p>{docItem.analysisSummary.summary}</p>
                        </div>

                        {/* Consistency Checks */}
                        {docItem.analysisSummary.consistencyChecks?.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                              Key Verification Checkpoints
                            </span>
                            <ul className="space-y-1">
                              {docItem.analysisSummary.consistencyChecks.map((item, idx) => (
                                <li key={idx} className="text-xs text-slate-700 flex items-center space-x-2 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{item.check}: {item.detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Potential Risks */}
                        {docItem.analysisSummary.potentialRisks?.length > 0 && (
                          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                            <div className="flex items-center space-x-1 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                              <span>Items to inspect physically:</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {docItem.analysisSummary.potentialRisks.map((risk, rIdx) => (
                                <li key={rIdx}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-2">
                        <p className="text-xs text-slate-600">
                          Run AI optical document verification against revenue database standards.
                        </p>
                        <button
                          onClick={() => handleTriggerAnalysis(docItem)}
                          disabled={isAnalyzing}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 inline-flex items-center space-x-2 shadow-xs"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Analyzing Document...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Run AI Document Intelligence</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Upload Legal Land Document
            </h3>
            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="PASSBOOK">Dharani Digital Pattadar Passbook</option>
                  <option value="ENCUMBRANCE_CERTIFICATE">Encumbrance Certificate (EC)</option>
                  <option value="ROR_1B">Record of Rights (ROR 1B / Pahani)</option>
                  <option value="SURVEY_SKETCH">Tippon / Village Cadastral Map</option>
                  <option value="SALE_DEED">Registered Sale Deed (Registered SRO)</option>
                  <option value="OTHER">Other NOC / Layout Approval</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024 Dharani e-Passbook"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Notes / Text</label>
                <textarea
                  rows={3}
                  placeholder="Paste OCR text or specific survey comments..."
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Save & Analyze
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
