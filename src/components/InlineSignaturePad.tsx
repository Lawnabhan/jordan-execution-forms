import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Check, RefreshCw } from 'lucide-react';

interface InlineSignaturePadProps {
  signature?: string;
  onSaveSignature: (dataUrl: string) => void;
  attendingRole?: string;
  lawyerName?: string;
  isExpandedDefault?: boolean;
}

export const InlineSignaturePad: React.FC<InlineSignaturePadProps> = ({
  signature,
  onSaveSignature,
  attendingRole = 'وكيل المحكوم له',
  lawyerName = '',
  isExpandedDefault = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a'); // Royal Blue by default
  const [hasDrawn, setHasDrawn] = useState(!!signature);
  const [isOpen, setIsOpen] = useState(isExpandedDefault || !!signature);

  // Initialize canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 2;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (signature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = signature;
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Allow DOM layout to settle before sizing canvas
      const timer = setTimeout(() => {
        initCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, signature]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top,
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
    ctx.lineWidth = 2.8;
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

  return (
    <div className="bg-slate-50 border-2 border-dashed border-amber-300 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-900 flex items-center justify-center">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              خانة توقيع المحامي (بالماوس أو باللمس)
            </h4>
            <p className="text-[11px] text-slate-600">
              تظهر بعد التوقيع أسفل اسم {attendingRole} في المحضر النهائي
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
        >
          {isOpen ? 'إخفاء اللوحة' : (signature ? 'تعديل التوقيع' : 'فتح لوحة التوقيع')}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-2.5 pt-1">
          {/* Controls: Color & Clear */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-700">لون الحبر:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { color: '#1e3a8a', label: 'أزرق ملكي (معتمد)' },
                  { color: '#0f172a', label: 'أسود' },
                  { color: '#047857', label: 'أخضر' },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setPenColor(c.color)}
                    className={`w-5 h-5 rounded-full border-2 transition ${
                      penColor === c.color ? 'border-amber-600 scale-110 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition"
              >
                <Eraser className="w-3 h-3" />
                <span>مسح التوقيع</span>
              </button>
            </div>
          </div>

          {/* Touch & Mouse Canvas Area */}
          <div className="relative w-full h-32 bg-white border-2 border-slate-300 rounded-xl overflow-hidden cursor-crosshair shadow-inner flex items-center justify-center">
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
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1 select-none">
                <PenTool className="w-5 h-5 opacity-40" />
                <span className="text-xs font-semibold">ارسم توقيعك هنا بالماوس أو بإصبعك على شاشة اللمس</span>
                <span className="text-[10px] text-slate-400">سيتم حفظه وإدراجه تلقائياً أسفل اسم المحامي</span>
              </div>
            )}
          </div>

          {signature && (
            <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
              <span className="flex items-center gap-1 font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                تم حفظ التوقيع بنجاح وهو مدرج الآن في النتيجة النهائية أسفل اسم المحامي.
              </span>
              <span className="text-slate-500 font-mono text-[10px]">جاهز للطباعة والوورد</span>
            </div>
          )}
        </div>
      )}

      {/* Mini Preview if closed but has signature */}
      {!isOpen && signature && (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 border border-slate-100 bg-slate-50 rounded flex items-center justify-center p-0.5">
              <img src={signature} alt="التوقيع المحفوظ" className="max-h-full max-w-full object-contain" />
            </div>
            <span className="font-bold text-slate-800 text-xs">توقيع المحامي مفعل</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">✓ يظهر في المحضر</span>
        </div>
      )}
    </div>
  );
};
