import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Download, CheckCircle, Image as ImageIcon, ShieldCheck, RefreshCw } from 'lucide-react';
import { LawyerProfile } from '../types';

interface DigitalSignaturePadProps {
  onSaveSignature: (signatureDataUrl: string) => void;
  onSaveStamp: (stampDataUrl: string) => void;
  currentSignature?: string;
  currentStamp?: string;
  lawyerProfile: LawyerProfile;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  onSaveSignature,
  onSaveStamp,
  currentSignature,
  currentStamp,
  lawyerProfile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a'); // Royal Blue by default for Jordanian legal signatures
  const [penSize, setPenSize] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [activeTab, setActiveTab] = useState<'draw' | 'stamp_gen' | 'upload'>('draw');

  // Stamp Generator Canvas
  const stampCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If currentSignature exists, load it into canvas
    if (currentSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = currentSignature;
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSaveSignature('');
  };

  // Generate Lawyer Seal / Stamp Canvas
  const generateLawyerStamp = () => {
    const canvas = stampCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;
    ctx.clearRect(0, 0, 300, 300);

    const centerX = 150;
    const centerY = 150;
    const radius = 135;

    // Outer circle
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Dotted circle
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Lawyer details text inside stamp
    ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top Arc text simulation
    ctx.font = 'bold 15px Cairo, sans-serif';
    ctx.fillText('نقابة المحامين النظاميين الأردنيين', centerX, 60);

    ctx.font = 'bold 13px Cairo, sans-serif';
    ctx.fillText('المملكة الأردنية الهاشمية', centerX, 90);

    // Center icon/scales
    ctx.font = 'bold 22px serif';
    ctx.fillText('⚖️', centerX, 125);

    // Lawyer Name
    ctx.font = 'bold 16px Cairo, sans-serif';
    ctx.fillText(`المحامي ${lawyerProfile.name || 'محمد نبهان'}`, centerX, 165);

    // Bar Number
    ctx.font = '13px Cairo, sans-serif';
    ctx.fillText(`رقم القيد: ${lawyerProfile.barNumber || '١٢٣٤٥'}`, centerX, 195);

    // Bottom note
    ctx.font = '12px Cairo, sans-serif';
    ctx.fillText('مجموعة محامي قصر العدل', centerX, 225);

    const stampUrl = canvas.toDataURL('image/png');
    onSaveStamp(stampUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'signature' | 'stamp') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'signature') {
        onSaveSignature(dataUrl);
      } else {
        onSaveStamp(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">التوقيع الإلكتروني والختم الرسمي</h3>
            <p className="text-xs text-slate-500">لإدراجهما مباشرة في محضر التنفيذ دون طباعة وورق</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            id="tab-draw-sig"
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`px-3 py-1 rounded-md transition ${activeTab === 'draw' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            رسم التوقيع
          </button>
          <button
            id="tab-gen-stamp"
            type="button"
            onClick={() => {
              setActiveTab('stamp_gen');
              setTimeout(generateLawyerStamp, 100);
            }}
            className={`px-3 py-1 rounded-md transition ${activeTab === 'stamp_gen' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            ختم المحامي
          </button>
          <button
            id="tab-upload-sig"
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-md transition ${activeTab === 'upload' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            رفع صورة
          </button>
        </div>
      </div>

      {/* DRAWING SIGNATURE TAB */}
      {activeTab === 'draw' && (
        <div>
          <div className="flex items-center justify-between mb-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-medium">لون الحبر:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { color: '#1e3a8a', label: 'أزرق ملكي' },
                  { color: '#0f172a', label: 'أسود' },
                  { color: '#047857', label: 'أخضر رسمي' },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setPenColor(c.color)}
                    className={`w-5 h-5 rounded-full border-2 transition ${penColor === c.color ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="clear-signature-btn"
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition text-xs"
              >
                <Eraser className="w-3.5 h-3.5" />
                مسح التوقيع
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/70 overflow-hidden cursor-crosshair h-36 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full touch-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1">
                <PenTool className="w-5 h-5 opacity-60" />
                <span className="text-xs">وقّع هنا باستخدام الفأرة أو شاشة اللمس</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
            يتم حفظ التوقيع تلقائياً وإدراجه في أسفل الطلب بجانب اسم المحامي الوكيل.
          </p>
        </div>
      )}

      {/* GENERATE LAWYER STAMP TAB */}
      {activeTab === 'stamp_gen' && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="w-36 h-36 border border-slate-200 rounded-xl bg-white p-1 flex items-center justify-center shadow-inner">
            <canvas ref={stampCanvasRef} className="w-full h-full" />
          </div>

          <div className="flex-1 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              ختم المحامي النظامي الإلكتروني
            </div>
            <p className="text-slate-600 leading-relaxed">
              ختم رسمي يحمل اسمك ورقم القيد بنقابة المحامين الأردنيين لإضفاء طابع الاعتماد الرسمي على الطلب الإلكتروني.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={generateLawyerStamp}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تحديث بيانات الختم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD IMAGES TAB */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Upload Signature */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col items-center justify-center text-center">
            <span className="font-semibold text-slate-700 mb-1">صورة التوقيع (PNG شفافة)</span>
            <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-indigo-700 hover:bg-indigo-50 font-medium transition flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              اختيار ملف التوقيع
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'signature')}
                className="hidden"
              />
            </label>
            {currentSignature && <span className="text-[10px] text-emerald-600 font-bold mt-1.5">✓ تم رفع التوقيع</span>}
          </div>

          {/* Upload Stamp */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col items-center justify-center text-center">
            <span className="font-semibold text-slate-700 mb-1">صورة الختم الرسمي (PNG)</span>
            <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-indigo-700 hover:bg-indigo-50 font-medium transition flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              اختيار ملف الختم
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'stamp')}
                className="hidden"
              />
            </label>
            {currentStamp && <span className="text-[10px] text-emerald-600 font-bold mt-1.5">✓ تم رفع الختم</span>}
          </div>
        </div>
      )}
    </div>
  );
};
