import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UnifiedExecutionWorkbench } from './components/UnifiedExecutionWorkbench';
import { EJusticeGuideModal } from './components/EJusticeGuideModal';
import { SavedDraftsModal } from './components/SavedDraftsModal';
import { LawyerProfileModal } from './components/LawyerProfileModal';
import { ExecutionMotionData, LawyerProfile } from './types';
import { JordanFlag } from './components/JordanFlag';
import { JusticeEmblem } from './components/JusticeEmblem';

const STORAGE_KEY_PROFILE = 'jo_lawyer_profile_v1';
const STORAGE_KEY_DRAFTS = 'jo_motion_drafts_v1';

export default function App() {
  // Lawyer Profile State
  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      name: '',
      title: 'محامي وأستاذ',
      barNumber: '',
      phone: '',
      email: '',
      officeAddress: '',
      defaultCourtId: 'amman_palace',
      signatureDataUrl: '',
      stampDataUrl: '',
    };
  });

  // Saved Drafts
  const [drafts, setDrafts] = useState<{ id: string; savedAt: string; data: ExecutionMotionData; templateId: number }[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Modal States
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(lawyerProfile));
    } catch (e) {
      console.error(e);
    }
  }, [lawyerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts));
    } catch (e) {
      console.error(e);
    }
  }, [drafts]);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save Draft
  const handleSaveDraft = (data: ExecutionMotionData) => {
    const newDraft = {
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      data,
      templateId: 1,
    };
    setDrafts((prev) => [newDraft, ...prev.filter((d) => d.data.executionCaseNumber !== data.executionCaseNumber || !data.executionCaseNumber)]);
    showToast('تم حفظ مسودة الطلب بنجاح 💾');
  };

  // Load Draft
  const handleLoadDraft = (draft: { data: ExecutionMotionData; templateId: number }) => {
    setIsDraftsOpen(false);
    showToast(`تم استرجاع المسودة: ${draft.data.subject || 'طلب تنفيذي'}`);
  };

  // Delete Draft
  const handleDeleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    showToast('تم حذف المسودة');
  };

  return (
    <div className="min-h-screen bg-slate-900/5 bg-[radial-gradient(#065f46_1px,transparent_1px)] [background-size:24px_24px] text-slate-900 flex flex-col font-tajawal antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-950 to-slate-950 text-amber-400 font-bold px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-500/60 text-xs sm:text-sm flex items-center gap-2 animate-bounce">
          <JusticeEmblem size={18} variant="gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView="builder"
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenDrafts={() => setIsDraftsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSelectCatalog={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lawyerProfile={lawyerProfile}
        savedDraftsCount={drafts.length}
      />

      {/* Main Single-Screen Application Workbench */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        <UnifiedExecutionWorkbench
          lawyerProfile={lawyerProfile}
          onSaveDraft={handleSaveDraft}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenDrafts={() => setIsDraftsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          savedDraftsCount={drafts.length}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 text-slate-300 text-xs py-7 border-t-2 border-amber-500/40 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-slate-900 border border-amber-400/40 shadow-xs">
              <JusticeEmblem size={28} variant="gold" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm flex items-center gap-2">
                <span>طلبات دائرة التنفيذ بكل سهولة</span>
                <JordanFlag width={18} height={12} />
              </p>
              <p className="text-amber-300/90 mt-0.5 font-medium text-[11px]">
                إهداء من مجموعة فرسان العدالة للزملاء الكرام • إعداد المحاميان محمد نبهان و براءة النسور
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <button onClick={() => setIsGuideOpen(true)} className="hover:text-amber-400 transition font-medium">
              دليل التقديم الإلكتروني
            </button>
            <span>•</span>
            <button onClick={() => setIsProfileOpen(true)} className="hover:text-amber-400 transition font-medium">
              الختم والتوقيع
            </button>
            <span>•</span>
            <button onClick={() => setIsDraftsOpen(true)} className="hover:text-amber-400 transition font-medium">
              المسودات ({drafts.length})
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EJusticeGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <SavedDraftsModal
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        drafts={drafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
      />
      <LawyerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={lawyerProfile}
        onSaveProfile={(updated) => {
          setLawyerProfile(updated);
          showToast('تم تحديث بيانات المحامي والتوقيع بنجاح');
        }}
      />

    </div>
  );
}
