import React, { useState } from 'react';
import { ExecutionMotionData, ExecutionTemplate } from '../types';
import { Printer } from 'lucide-react';
import { JordanFlag } from './JordanFlag';
import { JusticeEmblem } from './JusticeEmblem';

interface DocumentPaperPreviewProps {
  data: ExecutionMotionData;
  template?: ExecutionTemplate;
  onDirectTextChange?: (text: string) => void;
}

export const DocumentPaperPreview: React.FC<DocumentPaperPreviewProps> = ({
  data,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  const caseYear = data.executionCaseYear || new Date().getFullYear();
  const caseNum = data.executionCaseNumber || '........';
  const caseRef = `${caseNum}/ ${caseYear}`;
  
  const isFemale = data.lawyerGender === 'female';
  const lawyerPrefix = isFemale ? 'المحامية' : 'المحامي';
  const speechVerb = isFemale ? 'قالت' : 'وقال';
  
  const attendingRole = data.attendingRole || 'وكيل المحكوم له';
  
  // Extract pure lawyer name if it has prefixes
  let cleanLawyerName = (data.applicantLawyer || '').trim();
  cleanLawyerName = cleanLawyerName.replace(/^(المحامي|المحامية|الأستاذ|الأستاذة)\s+/g, '');
  if (!cleanLawyerName) {
    cleanLawyerName = '................................';
  }

  // Attendance Line: حضر وكيل المحكوم له المحامي [...] وقال:
  const attendanceLine = `حضر ${attendingRole} ${lawyerPrefix} ${cleanLawyerName} ${speechVerb}:`;

  // Direct single paragraph construction
  const singleParagraph = (data.directSingleParagraph && data.directSingleParagraph.trim().length > 0)
    ? data.directSingleParagraph
    : data.requests.join(' و ') || 'ألتمس اتخاذ الإجراءات القانونية اللازمة وفقاً لأحكام قانون التنفيذ الأردني وتسطير الكتب اللازمة حسب الأصول.';

  return (
    <div className="w-full flex flex-col items-center py-1 space-y-3">
      
      {/* Paper Top Toolbar */}
      <div className="w-full max-w-[820px] bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-2.5 rounded-xl border-2 border-amber-500/40 flex flex-wrap items-center justify-between gap-2 text-xs no-print shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-amber-400/30">
            <JordanFlag width={18} height={12} />
            <JusticeEmblem size={16} variant="gold" />
          </div>
          <span className="text-amber-300 font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span>محضر تنفيذ أردني رسمي (ما بعد في الوسط - مأمور التنفيذ يساراً)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
            className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-amber-200 hover:text-white rounded-lg border border-amber-500/30 text-[11px] font-mono transition"
            title="تبديل حجم الخط"
          >
            {fontSize === 'normal' ? 'حجم الخط: عادي' : 'حجم الخط: كبير'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة الورقة</span>
          </button>
        </div>
      </div>

      {/* The Authentic Minimalist Legal Paper */}
      <div 
        id="legal-document-to-print"
        className={`legal-document-paper w-full max-w-[820px] min-h-[960px] bg-white text-slate-950 p-8 sm:p-14 shadow-2xl rounded-sm border border-slate-300 relative text-right flex flex-col justify-start space-y-6 ${
          fontSize === 'large' ? 'text-lg sm:text-xl leading-loose' : 'text-base sm:text-lg leading-relaxed'
        }`}
        style={{ 
          direction: 'rtl',
          textAlign: 'right',
          fontFamily: "'Amiri', 'Traditional Arabic', 'Simplified Arabic', serif",
        }}
      >
        
        {/* 1. رقم القضية : الرقم هنا/ السنة هنا */}
        <div className="text-right">
          <p className="text-slate-950 font-bold text-base sm:text-lg">
            رقم القضية : {caseRef}
          </p>
        </div>

        {/* 2. ما بعد في منتصف الصفحة */}
        <div className="text-center py-2">
          <p className="text-slate-950 font-bold text-base sm:text-lg inline-block">
            ما بعد
          </p>
        </div>

        {/* 3. حضر وكيل المحكوم له او عليه المحامي / المحامية و قال او قالت: */}
        <div className="text-right">
          <p className="text-slate-950 font-bold text-base sm:text-lg">
            {attendanceLine}
          </p>
        </div>

        {/* 4. (Optional) وردت مشروحات صادرة .... */}
        {data.hasAttachments && (
          <div className="text-right">
            <p className="text-slate-950 text-base sm:text-lg font-normal text-justify">
              {data.attachmentsText 
                ? `وردت مشروحات صادرة ${data.attachmentsText}`
                : 'وردت مشروحات صادرة ومرفقة طياً مع هذا الطلب.'}
            </p>
          </div>
        )}

        {/* 5. هنا يوضع الطلب بشكل مباشر بفقرة واحدة */}
        <div className="text-right">
          <p className="text-slate-950 text-base sm:text-lg font-normal leading-relaxed text-justify">
            {singleParagraph}
          </p>
        </div>

        {/* 6. و عليه ترفع الاوراق لرئاسة التنفيذ لاجراء المقتضى القانوني حسب الاصول */}
        <div className="text-right pt-3">
          <p className="text-slate-950 font-bold text-base sm:text-lg leading-relaxed">
            و عليه ترفع الاوراق لرئاسة التنفيذ لاجراء المقتضى القانوني حسب الاصول
          </p>
        </div>

        {/* 7. تحريرا بتاريخ : يوضع التاريخ هنا */}
        <div className="text-right pt-1">
          <p className="text-slate-950 font-bold text-base sm:text-lg">
            تحريرا بتاريخ : {data.motionDate || new Date().toISOString().split('T')[0]}
          </p>
        </div>

        {/* 8. التوقيعات - توقيع الوكيل على اليمين وتوقيع مأمور التنفيذ على اليسار */}
        <div className="pt-10 flex items-start justify-between">
          
          {/* الجانب الأيمن: توقيع الوكيل */}
          <div className="text-right space-y-1">
            <p className="font-bold text-slate-950 text-base sm:text-lg">
              توقيع {attendingRole}
            </p>
            <p className="font-bold text-slate-950 text-base sm:text-lg">
              {lawyerPrefix} {cleanLawyerName}
            </p>

            {/* Signature image drawn by mouse or touch, placed right below lawyer name */}
            {data.includeSignature && data.lawyerSignature && (
              <div className="h-16 w-36 pt-1.5 flex items-center justify-start">
                <img
                  src={data.lawyerSignature}
                  alt="توقيع المحامي"
                  className="max-h-full max-w-full object-contain filter contrast-125"
                />
              </div>
            )}

            {data.includeStamp && data.lawyerStamp && (
              <div className="w-16 h-16 pt-1">
                <img
                  src={data.lawyerStamp}
                  alt="ختم الوكيل"
                  className="w-full h-full object-contain opacity-85"
                />
              </div>
            )}
          </div>

          {/* الجانب الأيسر: توقيع مأمور التنفيذ */}
          <div className="text-left space-y-1" style={{ direction: 'ltr', textAlign: 'left' }}>
            <p className="font-bold text-slate-950 text-base sm:text-lg" style={{ direction: 'rtl', textAlign: 'left' }}>
              توقيع مامور التنفيذ
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
