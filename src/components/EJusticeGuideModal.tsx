import React from 'react';
import { X, ExternalLink, CheckCircle2, ShieldCheck, PenTool, UploadCloud, FileCheck, ArrowUpRight } from 'lucide-react';
import { JordanFlag } from './JordanFlag';
import { JusticeEmblem } from './JusticeEmblem';

interface EJusticeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EJusticeGuideModal: React.FC<EJusticeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '١',
      title: 'اختيار وتعبئة النموذج إلكترونياً',
      desc: 'اختر النموذج المناسب من بين الـ ١٠٧ نموذج المعتمدة، وقم باختيار دائرة التنفيذ ورقم الدعوى، وتعبئة بيانات المحكوم له والمحكوم عليه بدقة عبر المنظومة.',
      icon: <FileCheck className="w-5 h-5 text-amber-500" />,
    },
    {
      step: '٢',
      title: 'التوقيع الإلكتروني وإدراج الختم (بدون طباعة)',
      desc: 'استخدم لوحة التوقيع الرقمية للرسم أو ارفع توقيعك وختمك الرسمي، ليتم دمجهما فورياً في أسفل المحضر دون الحاجة لطباعة الورقة أو استخدام الماسح الضوئي (سكانر).',
      icon: <PenTool className="w-5 h-5 text-indigo-500" />,
    },
    {
      step: '٣',
      title: 'تصدير الملف بصيغة Word (.docx) أو PDF',
      desc: 'اضغط على زر "تصدير Word" أو "طباعة / PDF" لتحميل الملف الجاهز والمطابق لتنسيقات ومعايير قصر العدل ودوائر التنفيذ الأردنية.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    },
    {
      step: '٤',
      title: 'الدخول إلى بوابة وزارة العدل الإلكترونية (services.moj.gov.jo)',
      desc: 'سجل الدخول بحسابك في نقابة المحامين، وتوجه إلى (خدمات التنفيذ القضائي ➔ تقديم طلب تنفيذي ➔ إدخال رقم الدعوى التنفيذية).',
      icon: <ExternalLink className="w-5 h-5 text-blue-500" />,
    },
    {
      step: '٥',
      title: 'إرفاق الطلب ومتابعة قرار رئيس التنفيذ',
      desc: 'قم برفع ملف الـ PDF/Word في خانة المرفقات، وسداد أي رسوم إن وجدت إلكترونياً عبر إي فواتيركم، ثم متابعة قرار قاضي/رئيس التنفيذ خلال ساعات الدوام الرسمي.',
      icon: <UploadCloud className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-amber-500/40 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 flex items-center justify-between border-b-2 border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-400/30">
              <JusticeEmblem size={30} variant="gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  100% إلكتروني وبدون ورق
                </span>
                <JordanFlag width={18} height={12} />
              </div>
              <h3 className="text-xl font-bold text-white mt-1">دليل التقديم الإلكتروني أمام دوائر التنفيذ الأردنية</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
            💡 <strong>ملاحظة هامة للزملاء المحامين:</strong> تتيح وزارة العدل الأردنية تقديم كافة طلبات التنفيذ بصيغة PDF أو Word موقعة ومختومة إلكترونياً، مما يوفر عناء الحضور لقصر العدل ويوفر تكاليف الطباعة والورق.
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((s) => (
              <div key={s.step} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-white text-slate-900 font-extrabold flex items-center justify-center shadow-xs border border-slate-200 font-tajawal shrink-0">
                  {s.step}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Official Links */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-bold text-slate-900 text-xs mb-2">روابط وخدمات رسمية مفيدة:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="https://services.moj.gov.jo"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                <span>بوابة خدمات وزارة العدل الأردنية</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </a>

              <a
                href="https://jba.org.jo"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                <span>نقابة المحامين النظاميين الأردنيين</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
          >
            فهمت، إغلاق الدليل
          </button>
        </div>

      </div>
    </div>
  );
};
