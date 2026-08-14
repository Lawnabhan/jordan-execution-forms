import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExecutionMotionData } from '../types';

/**
 * Export the visual legal document directly to a high-resolution PDF file.
 * Uses high-legibility Arabic web fonts (Cairo / Tajawal / Tahoma) with zero glyph-clipping,
 * proper letter connection, and clean margin spacing.
 */
export async function exportMotionToPdf(
  elementId: string,
  data: ExecutionMotionData
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('لم يتم العثور على عنصر المحضر القضائي');
  }

  // Ensure document fonts are loaded before capturing
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check skipped', e);
    }
  }

  const caseYear = data.executionCaseYear || new Date().getFullYear();
  const caseNum = data.executionCaseNumber || 'جديد';
  const safeFilename = `طلب_تنفيذي_${caseNum}_${caseYear}.pdf`;

  const originalShadow = element.style.boxShadow;
  element.style.boxShadow = 'none';

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // Crisp 250+ DPI for legal printouts
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1050,
      onclone: (clonedDoc) => {
        // Inject dedicated, rock-solid font & layout stylesheet into the clone
        const customStyle = clonedDoc.createElement('style');
        customStyle.innerHTML = `
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap');
          
          * {
            box-sizing: border-box !important;
            letter-spacing: 0 !important;
            word-spacing: 1px !important;
            text-rendering: geometricPrecision !important;
            -webkit-font-smoothing: antialiased !important;
            font-feature-settings: "liga" 1, "calt" 1 !important;
          }
          
          body, .legal-document-paper, .legal-document-paper * {
            font-family: 'Cairo', 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif !important;
            color: #0f172a !important;
            direction: rtl !important;
          }

          .legal-document-paper {
            width: 820px !important;
            max-width: 820px !important;
            min-height: auto !important;
            padding: 48px 56px !important;
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 24px !important;
            text-align: right !important;
          }

          /* Prevent canvas justification from breaking arabic ligatures */
          .text-justify, .text-right, p, span, div {
            text-align: right !important;
            text-justify: none !important;
          }
          .text-center { text-align: center !important; }
          .text-left { text-align: left !important; }

          .font-bold { font-weight: 700 !important; }
          .font-normal { font-weight: 500 !important; }

          .text-base { font-size: 16.5px !important; }
          .text-lg { font-size: 18.5px !important; }
          .text-xl { font-size: 21px !important; }

          .leading-relaxed { line-height: 1.95 !important; }
          .leading-loose { line-height: 2.2 !important; }

          .flex { display: flex !important; }
          .justify-between { justify-content: space-between !important; }
          .items-start { align-items: flex-start !important; }
          .items-center { align-items: center !important; }

          .pt-10 { padding-top: 40px !important; }
          .pt-3 { padding-top: 12px !important; }
          .pt-1 { padding-top: 4px !important; }
          .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }

          img { max-width: 100% !important; display: block !important; }
        `;
        clonedDoc.head.appendChild(customStyle);

        const clonedTarget = clonedDoc.getElementById(elementId);
        if (clonedTarget) {
          clonedTarget.style.boxShadow = 'none';
          clonedTarget.style.border = '1px solid #cbd5e1';
          clonedTarget.style.backgroundColor = '#ffffff';
          clonedTarget.style.width = '820px';
          clonedTarget.style.padding = '48px 56px';
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4 dimensions in mm (210 x 297)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 12; // 12mm page margins
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    const maxPageHeight = pageHeight - (margin * 2);

    if (contentHeight <= maxPageHeight) {
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight, undefined, 'FAST');
    } else {
      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= maxPageHeight;

      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
        heightLeft -= maxPageHeight;
      }
    }

    pdf.save(safeFilename);
  } catch (err) {
    console.error('Canvas capture failed, falling back to clean print:', err);
    window.print();
  } finally {
    element.style.boxShadow = originalShadow;
  }
}
