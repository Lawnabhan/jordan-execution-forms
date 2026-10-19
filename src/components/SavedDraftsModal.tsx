import React from 'react';
import { X, FileText, Trash2, ArrowLeft, Download, FileDown, Clock, Calendar } from 'lucide-react';
import { ExecutionMotionData } from '../types';
import { exportMotionToDocx } from '../utils/docxExport';
import { exportMotionToPdf } from '../utils/pdfExport';
import { getTemplateById } from '../data/templates';
import { JordanFlag } from './JordanFlag';
import { JusticeEmblem } from './JusticeEmblem';

interface SavedDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: { id: string; savedAt: string; data: ExecutionMotionData; templateId: number }[];
  onLoadDraft: (draft: { data: ExecutionMotionData; templateId: number }) => void;
  onDeleteDraft: (id: string) => void;
}

export const SavedDraftsModal: React.FC<SavedDraftsModalProps> = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-amber-500/40 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 flex items-center justify-between border-b-2 border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-400/30">
              <JusticeEmblem size={28} variant="gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">المسودات والطلبات المحفوظة</h3>
                <JordanFlag width={18} height={12} />
              </div>
              <p className="text-xs text-amber-200/80">الطلبات التي قمت بحفظها محلياً على هذا الجهاز ({drafts.length})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3">
          {drafts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-sm text-slate-700">لا توجد مسودات محفوظة حالياً</p>
              <p className="text-xs text-slate-400 mt-1">عند تعبئة أي طلب، يمكنك الضغط على "حفظ مسودة" لحفظه والرجوع إليه لاحقاً.</p>
            </div>
          ) : (
            drafts.map((d) => {
              const tmpl = getTemplateById(d.templateId);
              return (
                <div
                  key={d.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-900 text-amber-300 text-xs font-bold flex items-center justify-center font-tajawal">
                        {d.templateId}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{d.data.subject || tmpl?.title}</h4>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p>
                        دعوى رقم: <strong>{d.data.executionCaseNumber || '—'} / {d.data.executionCaseYear || '—'}</strong> | المحكوم له: {d.data.applicantName || '—'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(d.savedAt).toLocaleString('ar-JO')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => exportMotionToDocx(d.data, tmpl)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 border border-amber-500/30 flex items-center gap-1 text-xs font-bold transition"
                      title="تحميل كملف Word DOCX"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-700" />
                      <span>Word</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportMotionToPdf(d.data, tmpl)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-900 border border-rose-500/30 flex items-center gap-1 text-xs font-bold transition"
                      title="تحميل كملف PDF"
                    >
                      <FileDown className="w-3.5 h-3.5 text-rose-700" />
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteDraft(d.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      title="حذف المسودة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadDraft(d);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      <span>فتح وتعديل</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
