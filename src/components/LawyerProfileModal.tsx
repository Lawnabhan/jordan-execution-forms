import React, { useState } from 'react';
import { X, UserCheck, Shield, Phone, Mail, MapPin, Check, Save } from 'lucide-react';
import { LawyerProfile } from '../types';
import { JORDANIAN_COURTS } from '../data/courts';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { JordanFlag } from './JordanFlag';
import { JusticeEmblem } from './JusticeEmblem';

interface LawyerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: LawyerProfile;
  onSaveProfile: (updated: LawyerProfile) => void;
}

export const LawyerProfileModal: React.FC<LawyerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<LawyerProfile>(profile);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-amber-500/40 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 flex items-center justify-between border-b-2 border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold">
              <JusticeEmblem size={32} variant="gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">الملف المهني للمحامي والختم</h3>
                <JordanFlag width={20} height={13} />
              </div>
              <p className="text-xs text-amber-200/80">تُعبأ هذه البيانات وتوقيع المحامي تلقائياً في خانة الوكيل وكافة المحاضر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
            
            {/* Lawyer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                اسم المحامي (الاسم الرباعي أو الثلاثي)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: محمد نبهان / براءة النسور"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
              />
            </div>

            {/* Bar Registration Number & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  رقم القيد بنقابة المحامين
                </label>
                <input
                  type="text"
                  value={formData.barNumber || ''}
                  onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                  placeholder="مثال: 12940"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  رقم الهاتف للتواصل
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="079XXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Default Court */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                دائرة التنفيذ المفضلة / الأساسية
              </label>
              <select
                value={formData.defaultCourtId}
                onChange={(e) => setFormData({ ...formData, defaultCourtId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-medium bg-slate-50"
              >
                {JORDANIAN_COURTS.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name} ({court.governorate})
                  </option>
                ))}
              </select>
            </div>

            {/* Signature and Stamp Editor */}
            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-bold text-slate-900 mb-2">
                التوقيع المعتمد والختم الرسمي الدائم:
              </label>
              <DigitalSignaturePad
                onSaveSignature={(sig) => setFormData((prev) => ({ ...prev, signatureDataUrl: sig }))}
                onSaveStamp={(stamp) => setFormData((prev) => ({ ...prev, stampDataUrl: stamp }))}
                currentSignature={formData.signatureDataUrl}
                currentStamp={formData.stampDataUrl}
                lawyerProfile={formData}
              />
            </div>

          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-sm"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'تم الحفظ بنجاح!' : 'حفظ البيانات والختم'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
