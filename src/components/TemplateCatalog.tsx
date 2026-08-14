import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Scale, 
  Sparkles, 
  ArrowLeft, 
  FileText, 
  Lock, 
  Gavel, 
  Home, 
  Send, 
  AlertTriangle, 
  Unlock, 
  CreditCard, 
  Layers,
  CheckCircle2,
  Bookmark,
  Zap,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { ExecutionTemplate, TemplateCategoryId } from '../types';
import { TEMPLATE_CATEGORIES } from '../data/categories';
import { ALL_EXECUTION_TEMPLATES, searchTemplates, getTemplateById } from '../data/templates';

interface TemplateCatalogProps {
  onSelectTemplate: (template: ExecutionTemplate) => void;
  favorites: number[];
  onToggleFavorite: (templateId: number) => void;
}

export const TemplateCatalog: React.FC<TemplateCatalogProps> = ({
  onSelectTemplate,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<TemplateCategoryId | 'all'>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered Templates based on category & search for the select menu
  const availableTemplates = useMemo(() => {
    let list = ALL_EXECUTION_TEMPLATES;
    if (selectedCategoryId !== 'all') {
      list = list.filter((t) => t.category === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.id.toString() === q
      );
    }
    return list;
  }, [selectedCategoryId, searchQuery]);

  // Selected Template Object
  const currentSelectedTemplate = useMemo(() => {
    if (typeof selectedTemplateId === 'number') {
      return getTemplateById(selectedTemplateId) || null;
    }
    return null;
  }, [selectedTemplateId]);

  // Handle direct launch
  const handleLaunchTemplate = (templateId: number) => {
    const tmpl = getTemplateById(templateId);
    if (tmpl) {
      onSelectTemplate(tmpl);
    }
  };

  const getCategoryIcon = (categoryId: TemplateCategoryId) => {
    switch (categoryId) {
      case 'seizure': return <Lock className="w-4 h-4 text-emerald-600" />;
      case 'auction_sale': return <Gavel className="w-4 h-4 text-blue-600" />;
      case 'detention_settlement': return <Scale className="w-4 h-4 text-amber-600" />;
      case 'eviction_possession': return <Home className="w-4 h-4 text-indigo-600" />;
      case 'notifications': return <Send className="w-4 h-4 text-purple-600" />;
      case 'expertise': return <Search className="w-4 h-4 text-teal-600" />;
      case 'appeals_objections': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'release_cancel': return <Unlock className="w-4 h-4 text-cyan-600" />;
      case 'financial_accounts': return <CreditCard className="w-4 h-4 text-sky-600" />;
      case 'procedural_motions': return <FileText className="w-4 h-4 text-slate-600" />;
      default: return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  // Popular Quick Action Motions
  const popularMotions = [
    { id: 1, label: 'حبس المحكوم عليه (المادة 22)', badge: 'الأكثر استخداماً', color: 'border-amber-400 bg-amber-50/70 text-amber-950' },
    { id: 11, label: 'حجز حسابات وأرصدة البنوك والآيبان', badge: 'بنوك', color: 'border-emerald-400 bg-emerald-50/70 text-emerald-950' },
    { id: 25, label: 'حجز وبيع المركبات لدى الترخيص', badge: 'مركبات', color: 'border-indigo-400 bg-indigo-50/70 text-indigo-950' },
    { id: 41, label: 'حجز الحصص العقارية وبيعها', badge: 'أراضي وعقارات', color: 'border-blue-400 bg-blue-50/70 text-blue-950' },
    { id: 60, label: 'إخلاء المأجور وتسليمه بالقوة الجبرية', badge: 'إخلاء', color: 'border-purple-400 bg-purple-50/70 text-purple-950' },
    { id: 68, label: 'منع المحكوم عليه من السفر', badge: 'إقامة وحدود', color: 'border-rose-400 bg-rose-50/70 text-rose-950' },
    { id: 85, label: 'كف الطلب ورفع إشارات الحجز', badge: 'تسديد وتسوية', color: 'border-cyan-400 bg-cyan-50/70 text-cyan-950' },
    { id: 77, label: 'تعيين خبير لتقدير القيمة البيعية', badge: 'خبرة', color: 'border-teal-400 bg-teal-50/70 text-teal-950' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>إهداء من مجموعة فرسان العدالة للزملاء الكرام ⚖️</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
            طلبات دائرة التنفيذ بكل سهولة
          </h2>
          <p className="text-amber-200 text-sm font-semibold mt-1">
            إعداد: المحاميان محمد نبهان و براءة النسور
          </p>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed max-w-3xl">
            اختر الطلب المطلوب من بين ١٠٧ نموذج تنفيذي معتمد، وقم بتعبئة بيانات الدعوى والخصوم واختيار طلباتك الإجرائية بضغطة زر وتوقيعها وتصديرها بصيغة Word و PDF للتقديم المباشر عبر بوابة وزارة العدل الإلكترونية.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-center sm:text-right">
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-3 border border-slate-700">
              <span className="text-amber-400 font-extrabold text-2xl font-tajawal">١٠٧</span>
              <p className="text-slate-300 text-xs mt-0.5">نموذج تنفيذي بالقائمة</p>
            </div>
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-3 border border-slate-700">
              <span className="text-emerald-400 font-extrabold text-2xl font-tajawal">١٠</span>
              <p className="text-slate-300 text-xs mt-0.5">أبواب وتصنيفات قانونية</p>
            </div>
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-3 border border-slate-700">
              <span className="text-indigo-400 font-extrabold text-2xl font-tajawal">٢٨</span>
              <p className="text-slate-300 text-xs mt-0.5">محكمة ودائرة تنفيذ</p>
            </div>
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-3 border border-slate-700">
              <span className="text-rose-400 font-extrabold text-2xl font-tajawal">100%</span>
              <p className="text-slate-300 text-xs mt-0.5">إلكتروني معتمد</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Motion Selector Card (مركز اختيار وصياغة الطلب التنفيذي) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-indigo-100 space-y-6">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                قائمة اختيار الطلبات والنماذج التنفيذية
              </h3>
              <p className="text-xs text-slate-500">
                حدد القسم القانوني ثم اختر الطلب من القائمة للبدء في صياغته فوراً
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold px-3 py-1 rounded-full">
            ١٠٧ نماذج معتمدة
          </span>
        </div>

        {/* Step 1: Category Filter Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">١</span>
            <span>تصفية بحسب الباب القانوني (اختياري):</span>
          </label>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId('all');
                setSelectedTemplateId('');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedCategoryId === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              كافة الأبواب (١٠٧ نماذج)
            </button>

            {TEMPLATE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedTemplateId('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-indigo-900 text-white border-indigo-900 shadow-sm font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Search & The Master Dropdown Selector */}
        <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 space-y-4">
          
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedTemplateId('');
              }}
              placeholder="ابحث بالاسم أو الرقم لتصفية القائمة (مثال: إخلاء، حجز بنوك، مركبات، حبس، مزاد، خبير)..."
              className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 bg-slate-200 px-2 py-0.5 rounded-md"
              >
                مسح
              </button>
            )}
          </div>

          {/* Master Select Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="master-motion-select" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] flex items-center justify-center font-bold">٢</span>
                <span>اختر الطلب التنفيذي المطلوب من القائمة:</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                ({availableTemplates.length} نموذج متاح)
              </span>
            </div>

            <select
              id="master-motion-select"
              value={selectedTemplateId}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val) {
                  setSelectedTemplateId(val);
                }
              }}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-indigo-300 text-sm font-bold bg-white text-indigo-950 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
            >
              <option value="" disabled>-- اضغط هنا لفتح القائمة واختيار النموذج التنفيذي المطلوب --</option>
              {selectedCategoryId === 'all' && !searchQuery.trim() ? (
                TEMPLATE_CATEGORIES.map((cat) => (
                  <optgroup key={cat.id} label={`📂 ${cat.name} (${cat.count} نماذج)`}>
                    {ALL_EXECUTION_TEMPLATES.filter((t) => t.category === cat.id).map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.id}] {t.title}
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (
                availableTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.id}] {t.title} ({t.categoryName})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Template Preview Card & Action Button (if selected) */}
          {currentSelectedTemplate ? (
            <div className="bg-white rounded-2xl p-5 border-2 border-amber-400 shadow-md space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center font-tajawal shadow-sm">
                    {currentSelectedTemplate.id}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {currentSelectedTemplate.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full mt-0.5">
                      {getCategoryIcon(currentSelectedTemplate.category)}
                      {currentSelectedTemplate.categoryName}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTemplate(currentSelectedTemplate)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-md flex items-center justify-center gap-2"
                >
                  <span>بدء صياغة وتعبئة هذا الطلب</span>
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <strong className="text-slate-800 block mb-1">وصف الطلب والغرض الإجرائي منه:</strong>
                <p>{currentSelectedTemplate.description}</p>
                
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-[11px] text-slate-500 font-mono">
                  <span>صفة المستدعي: <strong>{currentSelectedTemplate.defaultApplicantRole}</strong></span>
                  <span>صفة المستدعى ضده: <strong>{currentSelectedTemplate.defaultRespondentRole}</strong></span>
                  <span>عدد الوقائع النموذجية: <strong>{currentSelectedTemplate.defaultFacts.length}</strong></span>
                  <span>عدد الطلبات الافتراضية: <strong>{currentSelectedTemplate.defaultRequests.length}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-500 font-medium">
              اختر أي نموذج من القائمة المنسدلة أعلاه أو انقر على أحد الطلبات السريعة أدناه للبدء فوراً.
            </div>
          )}

        </div>

        {/* Step 3: Quick 1-Click Common Action Motions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>طلبات سريعة ومباشرة بنقرة واحدة (الأكثر تكراراً):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {popularMotions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLaunchTemplate(item.id)}
                className={`p-3 rounded-2xl border text-right transition hover:scale-[1.02] hover:shadow-sm flex flex-col justify-between gap-2 group ${item.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 border border-current/20">
                    {item.badge}
                  </span>
                  <span className="text-xs font-black font-tajawal opacity-75">
                    نموذج #{item.id}
                  </span>
                </div>

                <div className="font-extrabold text-xs leading-snug group-hover:text-amber-800 transition">
                  {item.label}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 group-hover:text-slate-950 pt-1">
                  <span>فتح النموذج</span>
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* How it works Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/30">
            ١
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-100">اختر من القائمة المعتمدة</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ١٠٧ نموذج تنفيذي مجهز بكافة السندات والمواد القانونية المعتمدة أمام دوائر التنفيذ.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/30">
            ٢
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-100">تعبئة وتوقيع إلكتروني</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              أدخل رقم الدعوى واختَر طلباتك من القوائم الجاهزة، وأضف توقيعك وختمك فورياً.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/30">
            ٣
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-100">تصدير Word و PDF بدون ورق</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تصدير ملف رسمي موقع ومختوم للتقديم الفوري عبر بوابة وزارة العدل الإلكترونية.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
