import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Save, 
  PenTool, 
  RotateCcw, 
  Sparkles, 
  Plus, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  Eye,
  Sliders,
  CheckCircle,
  Search,
  Layers,
  Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExecutionTemplate, ExecutionMotionData, LawyerProfile, TemplateCategoryId } from '../types';
import { JORDANIAN_COURTS } from '../data/courts';
import { ALL_EXECUTION_TEMPLATES, getTemplateById } from '../data/templates';
import { TEMPLATE_CATEGORIES } from '../data/categories';
import { COMMON_EXECUTION_REQUESTS } from '../data/commonRequests';
import { exportMotionToDocx } from '../utils/docxExport';
import { DocumentPaperPreview } from './DocumentPaperPreview';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface MotionBuilderProps {
  template: ExecutionTemplate;
  onBackToCatalog: () => void;
  onSelectTemplate?: (template: ExecutionTemplate) => void;
  lawyerProfile: LawyerProfile;
  onSaveDraft: (data: ExecutionMotionData) => void;
  initialData?: ExecutionMotionData;
}

export const MotionBuilder: React.FC<MotionBuilderProps> = ({
  template,
  onBackToCatalog,
  onSelectTemplate,
  lawyerProfile,
  onSaveDraft,
  initialData,
}) => {
  // Motion Form State
  const [motionData, setMotionData] = useState<ExecutionMotionData>(() => {
    if (initialData) {
      return {
        ...initialData,
        attendingRole: initialData.attendingRole || 'وكيل المحكوم له',
      };
    }

    const defaultCourt = JORDANIAN_COURTS.find((c) => c.id === (lawyerProfile.defaultCourtId || 'amman_palace')) || JORDANIAN_COURTS[0];

    const initialCustomFields: Record<string, string> = {};
    template.customFields?.forEach((f) => {
      initialCustomFields[f.key] = f.defaultValue || '';
    });

    return {
      courtId: defaultCourt.id,
      courtName: defaultCourt.judgeTitle,
      executionCaseNumber: '',
      executionCaseYear: new Date().getFullYear().toString(),
      
      applicantName: '',
      applicantCapacity: template.defaultApplicantRole,
      applicantLawyer: lawyerProfile.name ? `الأستاذ ${lawyerProfile.name}` : '',
      
      respondentName: '',
      respondentCapacity: template.defaultRespondentRole,
      respondentLawyer: '',
      guarantorName: '',
      
      attendingRole: 'وكيل المحكوم له',
      
      motionDate: new Date().toISOString().split('T')[0],
      subject: template.defaultSubject,
      legalBasis: template.legalBasis,
      
      facts: [...template.defaultFacts],
      requests: [...template.defaultRequests],
      
      customFieldValues: initialCustomFields,
      
      lawyerSignature: lawyerProfile.signatureDataUrl || '',
      lawyerStamp: lawyerProfile.stampDataUrl || '',
      includeStamp: true,
      includeSignature: true,
      notes: '',
    };
  });

  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'signature'>('form');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newFactText, setNewFactText] = useState('');
  const [newRequestText, setNewRequestText] = useState('');
  const [selectedPredefinedRequest, setSelectedPredefinedRequest] = useState('');
  const [requestAddedFeedback, setRequestAddedFeedback] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  // Template switch filter
  const [templateFilterCategory, setTemplateFilterCategory] = useState<TemplateCategoryId | 'all'>('all');
  const [templateSearchText, setTemplateSearchText] = useState('');

  // Sync lawyer profile into applicant lawyer if empty
  useEffect(() => {
    if (!motionData.applicantLawyer && lawyerProfile.name) {
      setMotionData((prev) => ({
        ...prev,
        applicantLawyer: `الأستاذ ${lawyerProfile.name}`,
        lawyerSignature: prev.lawyerSignature || lawyerProfile.signatureDataUrl || '',
        lawyerStamp: prev.lawyerStamp || lawyerProfile.stampDataUrl || '',
      }));
    }
  }, [lawyerProfile]);

  // Handle adding predefined procedural request
  const handleAddPredefinedRequest = (reqText: string) => {
    if (!reqText) return;
    setMotionData((prev) => ({
      ...prev,
      requests: [...prev.requests, reqText],
    }));
    setRequestAddedFeedback(true);
    setTimeout(() => setRequestAddedFeedback(false), 2000);
  };

  // Reset requests to template default
  const handleResetToTemplateRequests = () => {
    setMotionData((prev) => ({
      ...prev,
      requests: [...template.defaultRequests],
    }));
  };

  // Handle switching template from dropdown
  const handleSwitchTemplate = (templateIdNum: number) => {
    const newTmpl = getTemplateById(templateIdNum);
    if (!newTmpl) return;

    if (onSelectTemplate) {
      onSelectTemplate(newTmpl);
    }

    const newCustomFields: Record<string, string> = {};
    newTmpl.customFields?.forEach((f) => {
      newCustomFields[f.key] = f.defaultValue || '';
    });

    setMotionData((prev) => ({
      ...prev,
      subject: newTmpl.defaultSubject,
      legalBasis: newTmpl.legalBasis,
      applicantCapacity: newTmpl.defaultApplicantRole,
      respondentCapacity: newTmpl.defaultRespondentRole,
      facts: [...newTmpl.defaultFacts],
      requests: [...newTmpl.defaultRequests],
      customFieldValues: newCustomFields,
    }));
  };

  // Filtered list of templates for dropdown
  const filteredTemplatesForSelect = ALL_EXECUTION_TEMPLATES.filter((t) => {
    const matchesCat = templateFilterCategory === 'all' || t.category === templateFilterCategory;
    const matchesSearch = !templateSearchText.trim() || 
      t.title.toLowerCase().includes(templateSearchText.toLowerCase()) ||
      t.id.toString() === templateSearchText.trim() ||
      t.categoryName.toLowerCase().includes(templateSearchText.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Handle Court change
  const handleCourtChange = (courtId: string) => {
    if (courtId === 'custom') {
      setMotionData((prev) => ({
        ...prev,
        courtId: 'custom',
        courtName: '',
      }));
    } else {
      const selected = JORDANIAN_COURTS.find((c) => c.id === courtId);
      if (selected) {
        setMotionData((prev) => ({
          ...prev,
          courtId: selected.id,
          courtName: selected.judgeTitle,
          customCourtName: undefined,
        }));
      }
    }
  };

  // Custom Field Value Change
  const handleCustomFieldChange = (key: string, value: string) => {
    setMotionData((prev) => ({
      ...prev,
      customFieldValues: {
        ...prev.customFieldValues,
        [key]: value,
      },
    }));
  };

  // Facts handlers
  const handleAddFact = () => {
    if (!newFactText.trim()) return;
    setMotionData((prev) => ({
      ...prev,
      facts: [...prev.facts, newFactText.trim()],
    }));
    setNewFactText('');
  };

  const handleRemoveFact = (index: number) => {
    setMotionData((prev) => ({
      ...prev,
      facts: prev.facts.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateFact = (index: number, val: string) => {
    const updated = [...motionData.facts];
    updated[index] = val;
    setMotionData((prev) => ({ ...prev, facts: updated }));
  };

  // Requests handlers
  const handleAddRequest = () => {
    if (!newRequestText.trim()) return;
    setMotionData((prev) => ({
      ...prev,
      requests: [...prev.requests, newRequestText.trim()],
    }));
    setNewRequestText('');
  };

  const handleRemoveRequest = (index: number) => {
    setMotionData((prev) => ({
      ...prev,
      requests: prev.requests.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateRequest = (index: number, val: string) => {
    const updated = [...motionData.requests];
    updated[index] = val;
    setMotionData((prev) => ({ ...prev, requests: updated }));
  };

  // Fill Realistic Sample Data
  const handleFillSampleData = () => {
    setMotionData((prev) => ({
      ...prev,
      executionCaseNumber: '4521',
      executionCaseYear: '2026',
      applicantName: 'شركة النماء للاستثمار والتجارة العامة ذ.م.م',
      applicantCapacity: template.defaultApplicantRole,
      applicantLawyer: prev.applicantLawyer || 'الأستاذ محمد نبهان',
      respondentName: 'خالد عبد الله إبراهيم العمري',
      respondentCapacity: template.defaultRespondentRole,
      guarantorName: 'سامي عبد الله إبراهيم العمري',
      attendingRole: 'وكيل المحكوم له',
      customFieldValues: {
        ...prev.customFieldValues,
        plotNumber: '145',
        basinNumber: '3 الحاووز',
        villageName: 'أم أذينة الغربي',
        landsDirectorate: 'مديرية تسجيل أراضي غرب عمان',
        propertyLocation: 'عمان - شارع وصفي التل (الجاردنز) - مجمع رقم 42',
        vehiclePlate: '12-98432',
        vehicleMake: 'تويوتا كامري موديل 2022 لون أسود',
        bankName: 'البنك العربي - فرع الشميساني',
        ibanNumber: 'JO88ARAB0000001234567890123456',
        employerName: 'وزارة التربية والتعليم',
        employeeJobNumber: '9840291',
        monthlyInstallment: '250',
        downPayment: '1000',
        bidderName: 'المحامي محمد نبهان',
        finalPrice: '35000',
        receivedAmount: '1500',
        receivedAmountWords: 'ألف وخمسمائة دينار أردني فقط لا غير',
      },
    }));
  };

  // Export to Word
  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      await exportMotionToDocx(motionData, template);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error('Failed to export docx', err);
    } finally {
      setIsExportingWord(false);
    }
  };

  // Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Copy Text
  const handleCopyText = () => {
    const formattedCaseRef = `${motionData.executionCaseNumber || '....'} / ${motionData.executionCaseYear || new Date().getFullYear()}`;
    const lawyerTitle = motionData.applicantLawyer 
      ? (motionData.applicantLawyer.startsWith('المحامي') || motionData.applicantLawyer.startsWith('الأستاذ')
          ? motionData.applicantLawyer
          : `المحامي ${motionData.applicantLawyer}`)
      : '........................';
    const attendingRole = motionData.attendingRole || 'وكيل المحكوم له';

    const text = `
${motionData.customCourtName || motionData.courtName}
القضية التنفيذية رقم: ( ${formattedCaseRef} )

المحكوم له: ${motionData.applicantName || '........................'}
المحكوم عليه: ${motionData.respondentName || '........................'}
${motionData.guarantorName ? `الكفيل: ${motionData.guarantorName}\n` : ''}الموضوع: ${motionData.subject || template.defaultSubject}

حضر ${attendingRole} ${lawyerTitle} وقال:
${motionData.facts.map((f, i) => (motionData.facts.length > 1 ? `${i + 1}. ${f}` : f)).join('\n')}

لذلك أطلب:
${motionData.requests.map((r, i) => (motionData.requests.length > 1 ? `${i + 1}. ${r}` : r)).join('\n')}
${motionData.legalBasis ? `\n(السند القانوني: ${motionData.legalBasis})` : ''}

توقيع ${attendingRole}: ${lawyerTitle}
توقيع مأمور التنفيذ: .......................................
التاريخ: ${motionData.motionDate || new Date().toISOString().split('T')[0]}

قرار مأمور / رئيس التنفيذ:
....................................................................................................
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Save Draft
  const handleSave = () => {
    setIsSaving(true);
    onSaveDraft(motionData);
    setTimeout(() => setIsSaving(false), 800);
  };

  const formattedCaseNumber = `${motionData.executionCaseNumber || '....'} / ${motionData.executionCaseYear || new Date().getFullYear()}`;

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky top-18 z-30">
        
        {/* Back Button & Current Template Info */}
        <div className="flex items-center gap-3">
          <button
            id="back-to-catalog-btn"
            onClick={onBackToCatalog}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>كافة النماذج (١٠٧)</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-950 text-amber-400 text-xs font-black flex items-center justify-center font-tajawal">
                {template.id}
              </span>
              <h2 className="font-bold text-slate-900 text-base sm:text-lg">
                {template.title}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {template.categoryName} • القضية التنفيذية: <span className="font-mono font-bold text-indigo-900">{formattedCaseNumber}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Quick Fill Sample */}
          <button
            type="button"
            onClick={handleFillSampleData}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition"
            title="تعبئة بيانات تجريبية سريعة (مثال رقم القضية: 4521/2026)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">بيانات نموذجية</span>
          </button>

          {/* Copy Text */}
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            title="نسخ نص الطلب كاملاً"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'تم الحفظ' : 'حفظ مسودة'}</span>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition shadow-xs"
            title="طباعة أو تصدير PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">طباعة / PDF</span>
            <span className="sm:hidden">طباعة</span>
          </button>

          {/* Export DOCX */}
          <button
            id="export-docx-btn"
            type="button"
            onClick={handleExportWord}
            disabled={isExportingWord}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingWord ? 'جاري التحميل...' : 'تصدير Word (.docx)'}</span>
          </button>

        </div>

      </div>

      {/* PROMINENT TEMPLATE SELECTOR BOX (مربع خيارات جميع انواع الطلبات) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-indigo-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                مربع خيارات جميع أنواع الطلبات التنفيذية (١٠٧ نماذج معتمدة)
              </h3>
              <p className="text-[11px] text-slate-300">
                يمكنك التبديل بين أي من الـ ١٠٧ نماذج مباشرة مع الاحتفاظ برقم القضية واسم المحامي والأطراف المدخلة
              </p>
            </div>
          </div>

          {/* Category Filter Pills in Dropdown Header */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setTemplateFilterCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition ${
                templateFilterCategory === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الكل (١٠٧)
            </button>
            <button
              type="button"
              onClick={() => setTemplateFilterCategory('seizure')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                templateFilterCategory === 'seizure' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الحجز (١٠)
            </button>
            <button
              type="button"
              onClick={() => setTemplateFilterCategory('auction_sale')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                templateFilterCategory === 'auction_sale' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              البيع والمزاد (٢٤)
            </button>
            <button
              type="button"
              onClick={() => setTemplateFilterCategory('detention_settlement')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                templateFilterCategory === 'detention_settlement' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الحبس والتسوية (١٣)
            </button>
            <button
              type="button"
              onClick={() => setTemplateFilterCategory('eviction_possession')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                templateFilterCategory === 'eviction_possession' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الإخلاء (٦)
            </button>
            <button
              type="button"
              onClick={() => setTemplateFilterCategory('financial_accounts')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                templateFilterCategory === 'financial_accounts' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الآيبان والحسابات (١٥)
            </button>
            <button
              type="button"
              onClick={() => setTemplateFilterCategory('release_cancel')}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                templateFilterCategory === 'release_cancel' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              كف الطلب (٧)
            </button>
          </div>
        </div>

        {/* Dropdown Select Box */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-9">
            <select
              id="all-templates-select-box"
              value={template.id}
              onChange={(e) => handleSwitchTemplate(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border-2 border-indigo-400/40 text-amber-300 font-bold text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition"
            >
              {templateFilterCategory === 'all' && !templateSearchText.trim() ? (
                TEMPLATE_CATEGORIES.map((cat) => (
                  <optgroup key={cat.id} label={`${cat.name} (${cat.count} نماذج)`} className="bg-slate-950 text-indigo-300 font-bold">
                    {ALL_EXECUTION_TEMPLATES.filter((t) => t.category === cat.id).map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white py-1 font-normal">
                        [{t.id}] {t.title}
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (
                filteredTemplatesForSelect.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white py-1">
                    [{t.id}] {t.title} — ({t.categoryName})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="sm:col-span-3">
            <div className="relative">
              <input
                type="text"
                value={templateSearchText}
                onChange={(e) => setTemplateSearchText(e.target.value)}
                placeholder="بحث سريع بالاسم أو الرقم..."
                className="w-full px-3 py-2.5 pr-8 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-slate-200 p-1 rounded-xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-2 rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
            activeTab === 'form' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>تعبئة وتعديل البيانات</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
            activeTab === 'preview' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>معاينة ورقة المحكمة</span>
        </button>
        <button
          onClick={() => setActiveTab('signature')}
          className={`flex-1 py-2 rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
            activeTab === 'signature' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>التوقيع والختم</span>
        </button>
      </div>

      {/* Main Grid: Form on Right, Preview on Left (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT COLUMN: FORM INPUTS */}
        <div className={`lg:col-span-6 space-y-4 ${activeTab !== 'form' && activeTab !== 'signature' ? 'hidden lg:block' : ''}`}>
          
          {/* Signature Tab on Mobile if selected */}
          {activeTab === 'signature' && (
            <div className="lg:hidden">
              <DigitalSignaturePad
                onSaveSignature={(sig) => setMotionData((prev) => ({ ...prev, lawyerSignature: sig }))}
                onSaveStamp={(stamp) => setMotionData((prev) => ({ ...prev, lawyerStamp: stamp }))}
                currentSignature={motionData.lawyerSignature}
                currentStamp={motionData.lawyerStamp}
                lawyerProfile={lawyerProfile}
              />
            </div>
          )}

          {/* Form Sections */}
          <div className="space-y-4">
            
            {/* Section 1: Lawyer & Execution Minute Opening (خانات تعبأ من قبل المحامي) */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-indigo-100 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2 text-indigo-950 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-black">١</span>
                  <span className="text-indigo-950 font-black">المحامي الوكيل وصفة الحضور في محضر التنفيذ</span>
                </div>
                <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                  ديباجة المحضر القضائي
                </span>
              </div>

              {/* Lawyer Name Field (خانة اسم المحامي) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  اسم المحامي الوكيل <span className="text-rose-500">*</span>
                </label>
                <input
                  id="lawyer-name-input"
                  type="text"
                  value={motionData.applicantLawyer}
                  onChange={(e) => setMotionData((prev) => ({ ...prev, applicantLawyer: e.target.value }))}
                  placeholder="مثال: الأستاذ محمد نبهان / الأستاذة براءة النسور"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm font-bold text-indigo-950 bg-indigo-50/20"
                />
              </div>

              {/* Attendance Role Radio (يبدأ دائما محضر التنفيذ بعبارة حضر وكيل المحكوم له أو وكيل المحكوم عليه) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  عبارة بدء محضر التنفيذ (صفة الحاضر بالطلب):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    motionData.attendingRole === 'وكيل المحكوم له'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="attendingRole"
                      value="وكيل المحكوم له"
                      checked={motionData.attendingRole === 'وكيل المحكوم له'}
                      onChange={() => setMotionData((prev) => ({ ...prev, attendingRole: 'وكيل المحكوم له' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>حضر وكيل المحكوم له</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    motionData.attendingRole === 'وكيل المحكوم عليه'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="attendingRole"
                      value="وكيل المحكوم عليه"
                      checked={motionData.attendingRole === 'وكيل المحكوم عليه'}
                      onChange={() => setMotionData((prev) => ({ ...prev, attendingRole: 'وكيل المحكوم عليه' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>حضر وكيل المحكوم عليه</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    motionData.attendingRole === 'المحكوم له بالذات'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="attendingRole"
                      value="المحكوم له بالذات"
                      checked={motionData.attendingRole === 'المحكوم له بالذات'}
                      onChange={() => setMotionData((prev) => ({ ...prev, attendingRole: 'المحكوم له بالذات' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>المحكوم له بالذات</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    motionData.attendingRole === 'المحكوم عليه بالذات'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="attendingRole"
                      value="المحكوم عليه بالذات"
                      checked={motionData.attendingRole === 'المحكوم عليه بالذات'}
                      onChange={() => setMotionData((prev) => ({ ...prev, attendingRole: 'المحكوم عليه بالذات' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>المحكوم عليه بالذات</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    motionData.attendingRole === 'وكيل الكفيل'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="attendingRole"
                      value="وكيل الكفيل"
                      checked={motionData.attendingRole === 'وكيل الكفيل'}
                      onChange={() => setMotionData((prev) => ({ ...prev, attendingRole: 'وكيل الكفيل' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>حضر وكيل الكفيل</span>
                  </label>
                </div>
              </div>

              {/* Live Minute Opening Preview Box */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <span className="font-bold text-[11px] text-indigo-700">ديباجة المحضر الرسمية:</span>
                <p className="font-amiri text-sm font-bold leading-relaxed text-slate-900">
                  في هذا اليوم، حضر {motionData.attendingRole || 'وكيل المحكوم له'} {motionData.applicantLawyer || '(اسم المحامي)'}، وقدم هذا الطلب في القضية التنفيذية رقم ({formattedCaseNumber}) ملتمساً ما يلي:
                </p>
              </div>

            </div>

            {/* Section 2: Case Number & Year & Court (رقم القضية واختيار السنة يدوياً) */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-slate-900 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs flex items-center justify-center font-bold">٢</span>
                  <span>رقم القضية التنفيذية والسنة والمحكمة</span>
                </div>
                {/* Live formatted pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-mono font-black">
                  <span>القضية:</span>
                  <span>{formattedCaseNumber}</span>
                </div>
              </div>

              {/* Case Number and Year Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                
                {/* Case Number (رقم القضية) */}
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم القضية التنفيذية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="case-number-input"
                    type="text"
                    value={motionData.executionCaseNumber}
                    onChange={(e) => setMotionData((prev) => ({ ...prev, executionCaseNumber: e.target.value }))}
                    placeholder="مثال: 4521 أو 1482"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-mono font-black text-indigo-950 bg-slate-50/50"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    أدخل رقم الدعوى المجرد (مثال: 4521)
                  </span>
                </div>

                {/* Case Year (خانة اختيار السنة يدوياً) */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السنة (يدوياً) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      id="case-year-input"
                      type="text"
                      value={motionData.executionCaseYear}
                      onChange={(e) => setMotionData((prev) => ({ ...prev, executionCaseYear: e.target.value }))}
                      placeholder="2026"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-mono font-black text-center text-indigo-950 bg-slate-50/50"
                    />
                    {/* Quick year buttons */}
                    <button
                      type="button"
                      onClick={() => setMotionData((prev) => ({ ...prev, executionCaseYear: '2026' }))}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold rounded-lg text-slate-700"
                      title="السنة الحالية 2026"
                    >
                      2026
                    </button>
                    <button
                      type="button"
                      onClick={() => setMotionData((prev) => ({ ...prev, executionCaseYear: '2025' }))}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold rounded-lg text-slate-700"
                      title="2025"
                    >
                      2025
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    يظهر كرقم قضية: <span className="font-mono font-bold text-slate-800">{formattedCaseNumber}</span>
                  </span>
                </div>

              </div>

              {/* Court Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  دائرة التنفيذ المختصة
                </label>
                <select
                  value={motionData.courtId}
                  onChange={(e) => handleCourtChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs font-semibold bg-slate-50/70 text-slate-900"
                >
                  {JORDANIAN_COURTS.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name} ({court.governorate})
                    </option>
                  ))}
                  <option value="custom">-- دائرة تنفيذ / محكمة أخرى مخصصة --</option>
                </select>
              </div>

              {/* Custom Court Name input if selected */}
              {motionData.courtId === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    صيغة المخاطبة / اسم رئيس التنفيذ
                  </label>
                  <input
                    type="text"
                    value={motionData.customCourtName || ''}
                    onChange={(e) => setMotionData((prev) => ({ ...prev, customCourtName: e.target.value }))}
                    placeholder="مثال: لدى عطوفة رئيس تنفيذ محكمة بداية دير علا الأكرم"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>
              )}

              {/* Motion Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ تقديم الطلب (تحريراً في)
                </label>
                <input
                  type="date"
                  value={motionData.motionDate}
                  onChange={(e) => setMotionData((prev) => ({ ...prev, motionDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs font-mono"
                />
              </div>

            </div>

            {/* Section 3: Parties Block (أطراف الدعوى) */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900 font-bold text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs flex items-center justify-center font-bold">٣</span>
                <span>أطراف الخصومة التنفيذية (المحكوم له والمحكوم عليه)</span>
              </div>

              {/* Applicant (المحكوم له) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المحكوم له (المستدعي) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={motionData.applicantName}
                    onChange={(e) => setMotionData((prev) => ({ ...prev, applicantName: e.target.value }))}
                    placeholder="مثال: شركة الوفاق للتجارة / محمد أحمد سالم"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الصفة بالدعوى
                  </label>
                  <input
                    type="text"
                    value={motionData.applicantCapacity}
                    onChange={(e) => setMotionData((prev) => ({ ...prev, applicantCapacity: e.target.value }))}
                    placeholder="المحكوم له"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs text-center font-semibold"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 my-1"></div>

              {/* Respondent (المحكوم عليه) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المحكوم عليه (المستدعى ضده) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={motionData.respondentName}
                    onChange={(e) => setMotionData((prev) => ({ ...prev, respondentName: e.target.value }))}
                    placeholder="مثال: عبد الله خالد إبراهيم"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الصفة بالدعوى
                  </label>
                  <input
                    type="text"
                    value={motionData.respondentCapacity}
                    onChange={(e) => setMotionData((prev) => ({ ...prev, respondentCapacity: e.target.value }))}
                    placeholder="المحكوم عليه"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs text-center font-semibold"
                  />
                </div>
              </div>

              {/* Guarantor Name (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الكفيل (اختياري إن وجد)
                </label>
                <input
                  type="text"
                  value={motionData.guarantorName || ''}
                  onChange={(e) => setMotionData((prev) => ({ ...prev, guarantorName: e.target.value }))}
                  placeholder="مثال: الكفيل العدلي السيد ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

            </div>

            {/* Section 4: Template-Specific Dynamic Fields (if any) */}
            {template.customFields && template.customFields.length > 0 && (
              <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2 text-amber-900 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-xs flex items-center justify-center font-bold">٤</span>
                  <span>بيانات تفصيلية خاصة بنموذج ({template.title})</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {template.customFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows={2}
                          value={motionData.customFieldValues[field.key] || ''}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder || ''}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                        />
                      ) : field.type === 'select' && field.options ? (
                        <select
                          value={motionData.customFieldValues[field.key] || field.options[0]}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                        >
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={motionData.customFieldValues[field.key] || ''}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder || ''}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5: Subject & Legal Basis */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900 font-bold text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs flex items-center justify-center font-bold">٥</span>
                <span>الموضوع والسند القانوني</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  موضوع الطلب
                </label>
                <input
                  type="text"
                  value={motionData.subject}
                  onChange={(e) => setMotionData((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  السند القانوني (قانون التنفيذ الأردني)
                </label>
                <input
                  type="text"
                  value={motionData.legalBasis}
                  onChange={(e) => setMotionData((prev) => ({ ...prev, legalBasis: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs text-slate-700"
                />
              </div>
            </div>

            {/* Section 6: Facts & Reasons (الوقائع) */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs flex items-center justify-center font-bold">٦</span>
                  <span>الوقائع والأسباب ({motionData.facts.length})</span>
                </div>
              </div>

              {/* Facts List */}
              <div className="space-y-2">
                {motionData.facts.map((fact, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-xs text-slate-600 mt-1 select-none">{idx + 1}.</span>
                    <textarea
                      rows={2}
                      value={fact}
                      onChange={(e) => handleUpdateFact(idx, e.target.value)}
                      className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none focus:bg-white rounded-md p-1 border-transparent focus:border-slate-300 resize-y"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFact(idx)}
                      className="text-slate-400 hover:text-rose-600 transition p-1 mt-1"
                      title="حذف هذه الفقرة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Fact */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newFactText}
                  onChange={(e) => setNewFactText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFact())}
                  placeholder="إضافة بند أو سبب إضافي إلى الوقائع..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddFact}
                  className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة</span>
                </button>
              </div>
            </div>

            {/* Section 7: Specific Requests (الطلب - قائمة اختيار الطلبات) */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">٧</span>
                  <span>الطلب وملتمسات المحامي ({motionData.requests.length})</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetToTemplateRequests}
                  className="text-[11px] text-slate-500 hover:text-indigo-700 flex items-center gap-1 font-semibold transition"
                  title="استعادة الطلبات الافتراضية لهذا النموذج"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>استعادة طلبات النموذج الافتراضية</span>
                </button>
              </div>

              {/* Ready-made Requests Dropdown Selector (قائمة يختار منها المستخدم) */}
              <div className="bg-gradient-to-br from-indigo-50/90 to-amber-50/50 p-3.5 rounded-xl border border-indigo-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>قائمة الطلبات الإجرائية الجاهزة للاختيار:</span>
                  </div>
                  {requestAddedFeedback && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1">
                      <Check className="w-3 h-3" /> تم إضافة الطلب إلى اللائحة
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    id="predefined-requests-select"
                    value={selectedPredefinedRequest}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedPredefinedRequest(val);
                      if (val) {
                        handleAddPredefinedRequest(val);
                        setSelectedPredefinedRequest('');
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-indigo-300 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">-- اضغط هنا للاختيار من قائمة الطلبات الإجرائية المعتمدة --</option>
                    {COMMON_EXECUTION_REQUESTS.map((group, gIdx) => (
                      <optgroup key={gIdx} label={group.groupName}>
                        {group.items.map((item, iIdx) => (
                          <option key={`${gIdx}-${iIdx}`} value={item}>
                            • {item}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Quick 1-Click Request Action Pills */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">إضافة سريعة بنقرة واحدة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddPredefinedRequest('تسطير كتاب إلى إدارة ترخيص السواقين والمركبات لوضع إشارة الحجز التنفيذي على مركبات المحكوم عليه.')}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold rounded-lg transition"
                    >
                      + حجز مركبات
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPredefinedRequest('تسطير كتاب إلى مديرية تسجيل الأراضي المختصة لوضع إشارة الحجز التنفيذي على حصص المحكوم عليه العقارية.')}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold rounded-lg transition"
                    >
                      + حجز عقارات
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPredefinedRequest('تسطير كتاب إلى البنك المركزي الأردني لحجز حسابات وأرصدة وأمانات المحكوم عليه لدى كافة البنوك بحدود الدين.')}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold rounded-lg transition"
                    >
                      + حجز بنوك
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPredefinedRequest('إصدار قرار بحبس المحكوم عليه لمدة (90) يوماً سنداً لأحكام المادة (22) من قانون التنفيذ وتعديلاته لعدم قيامه بالتسوية وسداد الدين.')}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold rounded-lg transition"
                    >
                      + حبس (المادة 22)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPredefinedRequest('تسطير كتاب إلى إدارة الإقامة والحدود لمنع المحكوم عليه من مغادرة أراضي المملكة الأردنية الهاشمية.')}
                      className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-900 border border-rose-200 text-[11px] font-bold rounded-lg transition"
                    >
                      + منع سفر
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPredefinedRequest('تحويل كافة المبالغ المحصلة والمقبوضة في ملف القضية التنفيذية إلى حساب الآيبان (IBAN) المصرفي المعتمد لوكيل المحكوم له.')}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold rounded-lg transition"
                    >
                      + تحويل للآيبان
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPredefinedRequest('تسطير كتاب إلى مديرية الأمن العام لتوفير القوة الجبرية اللازمة لمرافقة مأمور التنفيذ وتنفيذ القرار.')}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold rounded-lg transition"
                    >
                      + قوة جبرية
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPredefinedRequest('كف الطلب عن المحكوم عليه ورفع إشارة الحجز التنفيذي لتسديد كامل الالتزامات والمصاريف.')}
                      className="px-2.5 py-1 bg-white hover:bg-cyan-100 text-cyan-900 border border-cyan-300 text-[11px] font-bold rounded-lg transition"
                    >
                      + كف طلب ورفع حجز
                    </button>
                  </div>
                </div>
              </div>

              {/* Requests List */}
              <div className="space-y-2">
                {motionData.requests.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                    <span className="font-bold text-xs text-indigo-700 mt-1 select-none">{idx + 1}.</span>
                    <textarea
                      rows={2}
                      value={req}
                      onChange={(e) => handleUpdateRequest(idx, e.target.value)}
                      className="flex-1 bg-transparent text-xs text-slate-900 font-medium focus:outline-none focus:bg-white rounded-md p-1 border-transparent focus:border-indigo-300 resize-y"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRequest(idx)}
                      className="text-slate-400 hover:text-rose-600 transition p-1 mt-1"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Request Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newRequestText}
                  onChange={(e) => setNewRequestText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequest())}
                  placeholder="أو اكتب ملتمساً أو طلباً مخصصاً يدوياً..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddRequest}
                  className="px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة طلب مخصص</span>
                </button>
              </div>
            </div>

            {/* Desktop Signature & Stamp Section */}
            <div className="hidden lg:block">
              <DigitalSignaturePad
                onSaveSignature={(sig) => setMotionData((prev) => ({ ...prev, lawyerSignature: sig }))}
                onSaveStamp={(stamp) => setMotionData((prev) => ({ ...prev, lawyerStamp: stamp }))}
                currentSignature={motionData.lawyerSignature}
                currentStamp={motionData.lawyerStamp}
                lawyerProfile={lawyerProfile}
              />
            </div>

          </div>
        </div>

        {/* LEFT COLUMN: LIVE OFFICIAL PAPER PREVIEW */}
        <div className={`lg:col-span-6 sticky top-20 ${activeTab !== 'preview' ? 'hidden lg:block' : ''}`}>
          
          <div className="bg-slate-800 text-white rounded-t-2xl px-4 py-2.5 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>معاينة حية لورقة المحكمة الرسمية (A4)</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={motionData.includeSignature}
                  onChange={(e) => setMotionData((prev) => ({ ...prev, includeSignature: e.target.checked }))}
                  className="rounded text-amber-500"
                />
                <span>التوقيع</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={motionData.includeStamp}
                  onChange={(e) => setMotionData((prev) => ({ ...prev, includeStamp: e.target.checked }))}
                  className="rounded text-amber-500"
                />
                <span>الختم</span>
              </label>
            </div>
          </div>

          {/* Paper Document Preview Container */}
          <div className="bg-slate-200/80 rounded-b-2xl p-3 sm:p-4 max-h-[calc(100vh-140px)] overflow-y-auto border border-slate-300 shadow-inner">
            <DocumentPaperPreview data={motionData} template={template} />
          </div>

        </div>

      </div>

    </div>
  );
};
