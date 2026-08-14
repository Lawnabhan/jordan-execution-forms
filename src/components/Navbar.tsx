import React from 'react';
import { BookOpen, FileCheck, UserCheck, Search } from 'lucide-react';
import { LawyerProfile } from '../types';
import { JordanFlag } from './JordanFlag';
import { JusticeEmblem } from './JusticeEmblem';

interface NavbarProps {
  currentView: 'catalog' | 'builder';
  onOpenGuide: () => void;
  onOpenDrafts: () => void;
  onOpenProfile: () => void;
  onSelectCatalog: () => void;
  lawyerProfile: LawyerProfile;
  savedDraftsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onOpenGuide,
  onOpenDrafts,
  onOpenProfile,
  onSelectCatalog,
  lawyerProfile,
  savedDraftsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white shadow-2xl border-b-2 border-amber-500/60">
      {/* Top Banner / Jordan Legal Royal Ribbon */}
      <div className="bg-gradient-to-r from-emerald-900 via-amber-700 to-emerald-900 text-amber-50 text-xs px-4 py-1.5 font-medium border-b border-amber-400/30">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <JordanFlag width={22} height={14} />
            <span className="bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-200 border border-amber-300/30 flex items-center gap-1.5">
              <span>المملكة الأردنية الهاشمية 🇯🇴</span>
              <span className="text-amber-400">•</span>
              <span>مجموعة فرسان العدالة</span>
            </span>
            <span className="hidden md:inline text-amber-100/90 font-medium text-[11px]">
              إعداد: المحاميان محمد نبهان &amp; براءة النسور
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="bg-emerald-800/80 text-emerald-100 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ١٠٧ نماذج تنفيذية رسمية معتمدة 2026
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand with Jordanian Justice Emblem */}
          <div 
            id="brand-logo-btn"
            onClick={onSelectCatalog}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Scales of Justice Royal Emblem */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-950/40 border border-amber-300/50 group-hover:scale-105 transition-all duration-200">
              <JusticeEmblem size={34} variant="gold" className="text-slate-950" />
              <div className="absolute -bottom-1 -left-1">
                <JordanFlag width={16} height={10} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-white flex items-center gap-2 drop-shadow-xs">
                  <span>طلبات دائرة التنفيذ بكل سهولة</span>
                </h1>
                <span className="bg-emerald-900/80 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1 hidden xs:inline-flex shadow-xs">
                  <JusticeEmblem size={13} variant="emerald" />
                  <span>فرسان العدالة</span>
                </span>
              </div>
              <p className="text-xs text-amber-200/80 hidden sm:flex items-center gap-1 font-medium">
                <span>المحاكم النظامية الأردنية</span>
                <span>•</span>
                <span>إهداء للزملاء الكرام من المحاميان محمد نبهان و براءة النسور</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* View Switcher / Catalog Button */}
            {currentView === 'builder' && (
              <button
                id="nav-catalog-btn"
                onClick={onSelectCatalog}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-200 text-xs font-semibold border border-amber-500/30 transition shadow-xs"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">فهرس النماذج (١٠٧)</span>
                <span className="md:hidden">النماذج</span>
              </button>
            )}

            {/* Electronic Submission Guide */}
            <button
              id="nav-guide-btn"
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-800/90 text-emerald-100 text-xs font-semibold border border-emerald-600/50 transition shadow-xs"
              title="شرح التوقيع والتقديم لبوابة وزارة العدل"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span className="hidden lg:inline">دليل التقديم الإلكتروني</span>
              <span className="lg:hidden">الدليل</span>
            </button>

            {/* Saved Drafts */}
            <button
              id="nav-drafts-btn"
              onClick={onOpenDrafts}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shadow-xs"
              title="المسودات والطلبات المحفوظة"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">مسوداتي</span>
              {savedDraftsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                  {savedDraftsCount}
                </span>
              )}
            </button>

            {/* Lawyer Profile & Stamp */}
            <button
              id="nav-profile-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold transition shadow-md border border-amber-300"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline truncate max-w-[130px]">
                {lawyerProfile.name ? `الأستاذ ${lawyerProfile.name}` : 'بيانات المحامي والختم'}
              </span>
              <span className="sm:hidden">المحامي</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
