import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Search, 
  PenTool, 
  FolderOpen,
  BookOpen,
  FileCheck,
  FileDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExecutionMotionData, LawyerProfile, TemplateCategoryId } from '../types';
import { ALL_EXECUTION_TEMPLATES, getTemplateById } from '../data/templates';
import { TEMPLATE_CATEGORIES } from '../data/categories';
import { COMMON_EXECUTION_REQUESTS } from '../data/commonRequests';
import { exportMotionToDocx } from '../utils/docxExport';
import { exportMotionToPdf } from '../utils/pdfExport';
import { DocumentPaperPreview } from './DocumentPaperPreview';
import { InlineSignaturePad } from './InlineSignaturePad';
import { JordanFlag } from './JordanFlag';
import { JusticeEmblem } from './JusticeEmblem';

interface UnifiedExecutionWorkbenchProps {
  lawyerProfile: LawyerProfile;
  onSaveDraft: (data: ExecutionMotionData) => void;
  onOpenGuide: () => void;
  onOpenDrafts: () => void;
  onOpenProfile: () => void;
  savedDraftsCount: number;
}

// Generate direct single paragraph from template facts and requests
function generateDirectSingleParagraph(template: ReturnType<typeof getTemplateById>): string {
  if (!template) {
    return 'ألتمس اتخاذ الإجراءات القانونية اللازمة وتسطير الكتب حسب الأصول.';
  }
  
  // Clean direct formulation in a single paragraph
  const combinedRequests = template.defaultRequests.join('، و');
  return `ألتمس من مقام رئاسة التنفيذ الموقرة ${combinedRequests} سنداً لأحكام ${template.legalBasis || 'قانون التنفيذ الأردني'} وتسطير الكتب اللازمة للجهات ذات العلاقة حسب الأصول.`;
}

export const UnifiedExecutionWorkbench: React.FC<UnifiedExecutionWorkbenchProps> = ({
  lawyerProfile,
  onSaveDraft,
  onOpenGuide,
  onOpenDrafts,
  onOpenProfile,
  savedDraftsCount,
}) => {
  // Selected Template (defaults to first popular template)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(1);
  const selectedTemplate = useMemo(() => {
    return getTemplateById(selectedTemplateId) || ALL_EXECUTION_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Search & Category Filter for Templates
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<TemplateCategoryId | 'all'>('all');

  // Motion Data State configured for the exact minimal direct minute
  const [motionData, setMotionData] = useState<ExecutionMotionData>(() => {
    const initialTmpl = ALL_EXECUTION_TEMPLATES[0];
    const initialDirectParagraph = generateDirectSingleParagraph(initialTmpl);

    return {
      courtId: 'amman_palace',
      courtName: 'دائرة تنفيذ عمان',
      executionCaseNumber: '',
      executionCaseYear: new Date().getFullYear().toString(),
      
      applicantName: '',
      applicantCapacity: 'المحكوم له',
      applicantLawyer: lawyerProfile.name || '',
      
      respondentName: '',
      respondentCapacity: 'المحكوم عليه',
      
      attendingRole: 'وكيل المحكوم له',
      lawyerGender: 'male',
      
      hasAttachments: false,
      attachmentsText: 'صادرة عن إدارة ترخيص السواقين والمركبات / البنك المركزي الأردني',
      
      directSingleParagraph: initialDirectParagraph,
      
      motionDate: new Date().toISOString().split('T')[0],
      subject: initialTmpl.defaultSubject,
      legalBasis: initialTmpl.legalBasis,
      
      facts: [...initialTmpl.defaultFacts],
      requests: [...initialTmpl.defaultRequests],
      
      customFieldValues: {},
      
      lawyerSignature: lawyerProfile.signatureDataUrl || '',
      lawyerStamp: lawyerProfile.stampDataUrl || '',
      includeStamp: true,
      includeSignature: true,
    };
  });

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [selectedPredefinedRequest, setSelectedPredefinedRequest] = useState('');
  const [requestAddedFeedback, setRequestAddedFeedback] = useState(false);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return ALL_EXECUTION_TEMPLATES.filter((tmpl) => {
      const matchesCat = selectedCategoryFilter === 'all' || tmpl.category === selectedCategoryFilter;
      const matchesQuery = 
        !templateSearchQuery ||
        tmpl.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        tmpl.legalBasis.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        tmpl.tags.some(t => t.toLowerCase().includes(templateSearchQuery.toLowerCase()));
      return matchesCat && matchesQuery;
    });
  }, [selectedCategoryFilter, templateSearchQuery]);

  // Sync lawyer profile when updated
  useEffect(() => {
    if (lawyerProfile.name && !motionData.applicantLawyer) {
      setMotionData((prev) => ({
        ...prev,
        applicantLawyer: lawyerProfile.name,
        lawyerSignature: prev.lawyerSignature || lawyerProfile.signatureDataUrl || '',
        lawyerStamp: prev.lawyerStamp || lawyerProfile.stampDataUrl || '',
      }));
    }
  }, [lawyerProfile]);

  // Handle template switch (updates direct paragraph immediately)
  const handleTemplateChange = (newTmplId: number) => {
    const tmpl = getTemplateById(newTmplId);
    if (!tmpl) return;

    setSelectedTemplateId(tmpl.id);
    const directText = generateDirectSingleParagraph(tmpl);

    setMotionData((prev) => ({
      ...prev,
      subject: tmpl.defaultSubject,
      legalBasis: tmpl.legalBasis,
      facts: [...tmpl.defaultFacts],
      requests: [...tmpl.defaultRequests],
      directSingleParagraph: directText,
    }));
  };

  // Add Predefined procedural request to the direct paragraph
  const handleAddPredefinedRequest = (reqText: string) => {
    if (!reqText) return;
    setMotionData((prev) => {
      const current = (prev.directSingleParagraph || '').trim();
      const updated = current 
        ? `${current}، وكذلك ألتمس ${reqText}`
        : `ألتمس ${reqText}`;
      return {
        ...prev,
        directSingleParagraph: updated,
        requests: [...prev.requests, reqText],
      };
    });
    setRequestAddedFeedback(true);
    setTimeout(() => setRequestAddedFeedback(false), 2000);
  };

  // Reset direct paragraph to default template text
  const handleResetDirectText = () => {
    const directText = generateDirectSingleParagraph(selectedTemplate);
    setMotionData((prev) => ({
      ...prev,
      directSingleParagraph: directText,
      requests: [...selectedTemplate.defaultRequests],
    }));
  };

  // Export to Word (DOCX) matching the minimal direct format
  const handleExportWord = async () => {
    try {
      setIsExportingWord(true);
      await exportMotionToDocx(motionData, selectedTemplate);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.error('Failed to export DOCX:', error);
      alert('حدث خطأ أثناء تصدير ملف الوورد');
    } finally {
      setIsExportingWord(false);
    }
  };

  // Export to PDF directly matching the exact paper preview
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportMotionToPdf('legal-document-to-print', motionData);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('حدث خطأ أثناء تصدير ملف PDF، يمكنك استخدام خيار الطباعة واختيار حفظ كـ PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Copy Legal Text (Exact match to the template)
  const handleCopyText = () => {
    const caseYear = motionData.executionCaseYear || new Date().getFullYear();
    const caseNum = motionData.executionCaseNumber || '........';
    const caseRef = `${caseNum}/ ${caseYear}`;
    
    const isFemale = motionData.lawyerGender === 'female';
    const lawyerPrefix = isFemale ? 'المحامية' : 'المحامي';
    const speechVerb = isFemale ? 'قالت' : 'وقال';
    const cleanLawyerName = (motionData.applicantLawyer || '').replace(/^(المحامي|المحامية|الأستاذ|الأستاذة)\s+/g, '') || '................................';
    
    const attendingRole = motionData.attendingRole || 'وكيل المحكوم له';
    const attendanceLine = `حضر ${attendingRole} ${lawyerPrefix} ${cleanLawyerName} ${speechVerb}:`;

    const attachmentsLine = motionData.hasAttachments 
      ? `\nوردت مشروحات صادرة ${motionData.attachmentsText || '...'}\n` 
      : '';

    const singleParagraph = motionData.directSingleParagraph || motionData.requests.join(' و ') || '';

    const text = `
رقم القضية : ${caseRef}
ما بعد
${attendanceLine}${attachmentsLine}
${singleParagraph}

و عليه ترفع الاوراق لرئاسة التنفيذ لاجراء المقتضى القانوني حسب الاصول
تحريرا بتاريخ : ${motionData.motionDate || new Date().toISOString().split('T')[0]}

توقيع ${attendingRole}
${lawyerPrefix} ${cleanLawyerName}
توقيع مامور التنفيذ
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Save Draft
  const handleSave = () => {
    setIsSaving(true);
    onSaveDraft(motionData);
    setTimeout(() => setIsSaving(false), 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Fast Navigation */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-400/40 shadow-inner hidden sm:flex items-center justify-center">
            <JusticeEmblem size={44} variant="gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1.5 shadow-xs">
                <JordanFlag width={16} height={10} />
                <span>إهداء من مجموعة فرسان العدالة ⚖️</span>
              </span>
              <span className="text-xs text-amber-200/80 hidden sm:inline font-medium">
                المحاميان محمد نبهان &amp; براءة النسور
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
              <span>طلبات دائرة التنفيذ بكل سهولة</span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              محضر التنفيذ القضائي المعتمد وفقاً لأحدث تعديلات قانون التنفيذ الأردني
            </p>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex-1 md:flex-none px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-amber-200 hover:text-white rounded-xl text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-1.5 transition shadow-xs"
            title="إعداد التوقيع والختم"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>الختم والتوقيع</span>
          </button>

          <button
            type="button"
            onClick={onOpenDrafts}
            className="flex-1 md:flex-none px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition relative shadow-xs"
            title="المسودات المحفوظة"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>المسودات</span>
            {savedDraftsCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {savedDraftsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="flex-1 md:flex-none px-3.5 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 rounded-xl text-xs font-bold border border-emerald-600/50 flex items-center justify-center gap-1.5 transition shadow-xs"
            title="دليل التقديم الإلكتروني"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span>دليل التقديم</span>
          </button>
        </div>
      </div>

      {/* Main Single-Screen Grid: Form on Right, Live Direct Preview on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT COLUMN: The Interactive Control Panel (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card: Primary Inputs matching user request */}
          <div className="bg-white border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>بيانات محضر الطلب المباشر</span>
              </h2>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ١٠٧ نماذج معتمدة
              </span>
            </div>

            {/* 1. خانة رقم القضية + 2. خانة السنة */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              {/* 1. خانة رقم القضية */}
              <div className="sm:col-span-7">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  رقم القضية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: 4521"
                  value={motionData.executionCaseNumber}
                  onChange={(e) => setMotionData({ ...motionData, executionCaseNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition font-mono"
                  dir="ltr"
                />
              </div>

              {/* 2. خانة السنة */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  السنة <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="2026"
                  value={motionData.executionCaseYear}
                  onChange={(e) => setMotionData({ ...motionData, executionCaseYear: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition font-mono text-center"
                  dir="ltr"
                />
              </div>
            </div>

            {/* 3. قائمة أنواع الطلبات */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>نوع الطلب</span>
                  <span className="text-[11px] text-slate-500 font-normal">({ALL_EXECUTION_TEMPLATES.length} نموذج)</span>
                </label>

                {/* Category quick filter selector */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value as any)}
                  className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-300 rounded-lg px-2 py-0.5 focus:border-amber-500 outline-none"
                >
                  <option value="all">جميع الفئات ({ALL_EXECUTION_TEMPLATES.length})</option>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search within templates */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث باسم الطلب (حبس، حجز بنوك، مركبات، إخلاء، منع سفر)..."
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  className="w-full pr-8 pl-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none mb-1"
                />
              </div>

              {/* Template dropdown */}
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 bg-amber-50/60 border-2 border-amber-400/80 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-300 transition"
              >
                {filteredTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id}. {t.title} — [{t.legalBasis || t.categoryName}]
                  </option>
                ))}
              </select>
            </div>

            {/* 4. قائمة صفتك في القضية */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-900">
                صفتك في القضية <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMotionData({ ...motionData, attendingRole: 'وكيل المحكوم له' })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition flex items-center justify-center gap-1.5 ${
                    motionData.attendingRole === 'وكيل المحكوم له'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${motionData.attendingRole === 'وكيل المحكوم له' ? 'opacity-100' : 'opacity-0'}`} />
                  <span>وكيل المحكوم له</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMotionData({ ...motionData, attendingRole: 'وكيل المحكوم عليه' })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition flex items-center justify-center gap-1.5 ${
                    motionData.attendingRole === 'وكيل المحكوم عليه'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${motionData.attendingRole === 'وكيل المحكوم عليه' ? 'opacity-100' : 'opacity-0'}`} />
                  <span>وكيل المحكوم عليه</span>
                </button>
              </div>

              {/* Other Roles Dropdown */}
              <select
                value={motionData.attendingRole}
                onChange={(e) => setMotionData({ ...motionData, attendingRole: e.target.value as any })}
                className="w-full px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-lg focus:border-amber-500 outline-none"
              >
                <option value="وكيل المحكوم له">وكيل المحكوم له</option>
                <option value="وكيل المحكوم عليه">وكيل المحكوم عليه</option>
                <option value="المحكوم له بالذات">المحكوم له بالذات</option>
                <option value="المحكوم عليه بالذات">المحكوم عليه بالذات</option>
                <option value="وكيل الكفيل">وكيل الكفيل</option>
              </select>
            </div>

            {/* Lawyer Name & Gender Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  اسم المحامي / المحامية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="محمد نبهان"
                  value={motionData.applicantLawyer}
                  onChange={(e) => setMotionData({ ...motionData, applicantLawyer: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  الصيغة
                </label>
                <select
                  value={motionData.lawyerGender || 'male'}
                  onChange={(e) => setMotionData({ ...motionData, lawyerGender: e.target.value as any })}
                  className="w-full px-2 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="male">المحامي / وقال</option>
                  <option value="female">المحامية / وقالت</option>
                </select>
              </div>
            </div>

          </div>

          {/* Card: المرفقات والمشروحات (اختياري) + نص الطلب المباشر بفقرة واحدة */}
          <div className="bg-white border border-slate-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            
            {/* Attachments Toggle (بند المشروحات في حال وجود مرفقات مع الطلب) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!motionData.hasAttachments}
                    onChange={(e) => setMotionData({ ...motionData, hasAttachments: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    يوجد مشروحات أو مرفقات مع الطلب
                  </span>
                </label>
                <span className="text-[11px] text-slate-500">
                  (إذا لم توجد تلغى الفقرة تلقائياً)
                </span>
              </div>

              {motionData.hasAttachments && (
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    الجهة الصادرة عنها المشروحات / تفاصيل المرفق:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: عن إدارة ترخيص السواقين والمركبات / البنك المركزي / كشف رواتب..."
                    value={motionData.attachmentsText || ''}
                    onChange={(e) => setMotionData({ ...motionData, attachmentsText: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900"
                  />
                </div>
              )}
            </div>

            {/* Direct Single Paragraph Editor (هنا يوضع الطلب بشكل مباشر بفقرة واحدة) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-900">
                  نص الطلب بشكل مباشر بفقرة واحدة <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleResetDirectText}
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                  title="استعادة النص الافتراضي لهذا النموذج"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط النص</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={motionData.directSingleParagraph}
                onChange={(e) => setMotionData({ ...motionData, directSingleParagraph: e.target.value })}
                placeholder="اكتب نص الطلب التنفيذي المباشر هنا بفقرة واحدة..."
                className="w-full px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-amber-50/40 border-2 border-amber-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-200 leading-relaxed"
              />

              {/* Fast Common Execution Request Adder */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>إضافة بند إجرائي شائع للطلب مباشرة:</span>
                  </span>
                  {requestAddedFeedback && (
                    <span className="text-emerald-600 font-bold animate-pulse">
                      تمت الإضافة بنجاح ✓
                    </span>
                  )}
                </div>

                <select
                  value={selectedPredefinedRequest}
                  onChange={(e) => {
                    handleAddPredefinedRequest(e.target.value);
                    setSelectedPredefinedRequest('');
                  }}
                  className="w-full px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-lg focus:border-amber-500 outline-none"
                >
                  <option value="">-- اختر بنداً إجرائياً لإضافته للفقرة --</option>
                  {COMMON_EXECUTION_REQUESTS.map((group, gIdx) => (
                    <optgroup key={gIdx} label={group.groupName}>
                      {group.items.map((item, iIdx) => (
                        <option key={iIdx} value={item}>
                          • {item.length > 70 ? item.substring(0, 70) + '...' : item}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Signature Settings */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={motionData.includeSignature}
                    onChange={(e) => setMotionData({ ...motionData, includeSignature: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>إدراج التوقيع في النتيجة النهائية</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={motionData.includeStamp}
                    onChange={(e) => setMotionData({ ...motionData, includeStamp: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>الختم</span>
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">تحريراً بتاريخ:</span>
                <input
                  type="date"
                  value={motionData.motionDate}
                  onChange={(e) => setMotionData({ ...motionData, motionDate: e.target.value })}
                  className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

          </div>

          {/* Interactive Lawyer Signature Pad (Mouse or Touch) */}
          <InlineSignaturePad
            signature={motionData.lawyerSignature}
            onSaveSignature={(signatureDataUrl) => {
              setMotionData({
                ...motionData,
                lawyerSignature: signatureDataUrl,
                includeSignature: !!signatureDataUrl,
              });
            }}
            attendingRole={motionData.attendingRole}
            lawyerName={motionData.applicantLawyer}
            isExpandedDefault={!motionData.lawyerSignature}
          />

        </div>

        {/* LEFT COLUMN: The Live Authentic Document Preview (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3 sticky top-4">
          
          {/* Action Ribbon Bar directly above the preview */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-amber-500/30 rounded-2xl p-3 text-white shadow-lg flex flex-wrap items-center justify-between gap-2">
            
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                <JusticeEmblem size={18} variant="gold" />
                <span>المعاينة الحية الفورية للطلب</span>
              </span>
            </div>

            {/* Main Export & Print Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopyText}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition shadow-xs"
                title="نسخ النص كاملاً"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                <span className="sm:hidden">{copied ? 'تم' : 'نسخ'}</span>
              </button>

              {/* Save Draft */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition shadow-xs"
                title="حفظ كمسودة"
              >
                <Save className="w-3.5 h-3.5 text-blue-400" />
                <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ'}</span>
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition shadow-xs"
                title="طباعة الورقة مباشرة"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">طباعة</span>
              </button>

              {/* Export PDF */}
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md border border-red-400/60 active:scale-95"
                title="تصدير وتحميل ملف PDF فوري عالي الدقة"
              >
                <FileDown className="w-3.5 h-3.5 text-red-100" />
                <span>{isExportingPdf ? 'جارِ إنشاء PDF...' : 'تنزيل PDF'}</span>
              </button>

              {/* Export Word (DOCX) */}
              <button
                type="button"
                onClick={handleExportWord}
                disabled={isExportingWord}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md border border-amber-300 active:scale-95"
                title="تصدير ملف مايكروسوفت وورد Word DOCX"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>{isExportingWord ? 'جارِ التصدير...' : 'تصدير Word'}</span>
              </button>

            </div>

          </div>

          {/* The Live Judicial Document Paper */}
          <div className="overflow-x-auto pb-4">
            <DocumentPaperPreview
              data={motionData}
              template={selectedTemplate}
              onExportPdf={handleExportPdf}
              isExportingPdf={isExportingPdf}
              onExportWord={handleExportWord}
              isExportingWord={isExportingWord}
            />
          </div>

        </div>

      </div>

    </div>
  );
};
