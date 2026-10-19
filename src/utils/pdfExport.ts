import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExecutionMotionData, ExecutionTemplate } from '../types';
import { downloadBlob } from './downloadHelper';

/**
 * Cleanly export the legal motion document to a high-resolution PDF file.
 * Uses an isolated sandbox iframe to completely eliminate Tailwind v4 oklch() color issues,
 * and downloads the PDF directly to the user's computer.
 */
export async function exportMotionToPdf(
  data: ExecutionMotionData,
  template?: ExecutionTemplate,
  fontFamily: 'cairo' | 'tajawal' | 'tahoma' = 'cairo'
): Promise<void> {
  const caseYear = data.executionCaseYear || new Date().getFullYear();
  const caseNum = data.executionCaseNumber || '........';
  const caseRef = `${caseNum} / ${caseYear}`;
  const motionDate = data.motionDate || new Date().toISOString().split('T')[0];

  const lawyerPrefix = data.lawyerGender === 'female' ? 'المحامية' : 'المحامي';
  const attendedVerb = data.lawyerGender === 'female' ? 'قالت' : 'قال';
  const attendingRole = data.attendingRole || 'وكيل المحكوم له';
  const cleanLawyerName = data.applicantLawyer 
    ? data.applicantLawyer.replace(/^(المحامي|المحامية|الأستاذ|الأستاذة)\s*/, '') 
    : '................................';
  const attendanceLine = `حضر ${attendingRole} ${lawyerPrefix} ${cleanLawyerName} و${attendedVerb}:`;

  const singleParagraph = data.directSingleParagraph?.trim()
    ? data.directSingleParagraph
    : data.requests.join(' و ') || 'ألتمس اتخاذ الإجراءات القانونية اللازمة وفقاً لأحكام قانون التنفيذ الأردني وتسطير الكتب اللازمة حسب الأصول.';

  const fontStack = fontFamily === 'cairo'
    ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif"
    : fontFamily === 'tajawal'
    ? "'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif"
    : "Tahoma, Arial, sans-serif";

  // Create an isolated iframe to prevent main-page Tailwind CSS v4 (oklch colors) from breaking html2canvas
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-99999';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';

  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Unable to create rendering sandbox iframe');
    }

    // Pure self-contained HTML with standard hex colors only
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>طلب تنفيذي</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&display=swap');
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            background-color: #ffffff;
            color: #000000;
            font-family: ${fontStack};
            padding: 50px 55px;
            direction: rtl;
            text-align: right;
            width: 794px;
            min-height: 1123px;
            font-size: 17px;
            line-height: 1.8;
            -webkit-font-smoothing: antialiased;
          }
          .case-header {
            font-weight: 700;
            font-size: 19px;
            margin-bottom: 24px;
            color: #000000;
          }
          .section-divider {
            text-align: center;
            font-weight: 700;
            font-size: 19px;
            margin-bottom: 24px;
            color: #000000;
          }
          .attendance-row {
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 22px;
            color: #000000;
          }
          .attachments-row {
            font-size: 17px;
            margin-bottom: 22px;
            color: #000000;
            line-height: 1.8;
          }
          .request-body {
            font-size: 17px;
            line-height: 1.85;
            margin-bottom: 26px;
            color: #000000;
            text-align: justify;
          }
          .routing-footer {
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 24px;
            color: #000000;
          }
          .date-row {
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 45px;
            color: #000000;
          }
          .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .signatures-table td {
            vertical-align: top;
            border: none;
            padding: 0;
          }
          .lawyer-col {
            text-align: right;
            width: 50%;
          }
          .officer-col {
            text-align: left;
            width: 50%;
            direction: ltr;
          }
          .sig-title {
            font-weight: 700;
            font-size: 18px;
            color: #000000;
            margin-bottom: 4px;
          }
          .sig-name {
            font-weight: 700;
            font-size: 18px;
            color: #000000;
            margin-bottom: 10px;
          }
          .sig-img {
            max-height: 65px;
            max-width: 150px;
            display: block;
            margin-top: 6px;
          }
          .stamp-img {
            max-height: 70px;
            max-width: 70px;
            display: block;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        <div id="capture-target">
          <!-- 1. Case Number -->
          <div class="case-header">
            رقم القضية : ${caseRef}
          </div>

          <!-- 2. ما بعد -->
          <div class="section-divider">
            ما بعد
          </div>

          <!-- 3. Attendance Line -->
          <div class="attendance-row">
            ${attendanceLine}
          </div>

          <!-- 4. Optional Attachments Note -->
          ${data.hasAttachments ? `
            <div class="attachments-row">
              ${data.attachmentsText ? `وردت مشروحات صادرة ${data.attachmentsText}` : 'وردت مشروحات صادرة ومرفقة طياً مع هذا الطلب.'}
            </div>
          ` : ''}

          <!-- 5. Single Direct Motion Paragraph -->
          <div class="request-body">
            ${singleParagraph}
          </div>

          <!-- 6. Legal Routing Formula -->
          <div class="routing-footer">
            و عليه ترفع الاوراق لرئاسة التنفيذ لاجراء المقتضى القانوني حسب الاصول
          </div>

          <!-- 7. Date -->
          <div class="date-row">
            تحريرا بتاريخ : ${motionDate}
          </div>

          <!-- 8. Signatures Block -->
          <table class="signatures-table">
            <tr>
              <td class="lawyer-col">
                <div class="sig-title">توقيع ${attendingRole}</div>
                <div class="sig-name">${lawyerPrefix} ${cleanLawyerName}</div>
                ${data.includeSignature && data.lawyerSignature ? `
                  <img src="${data.lawyerSignature}" alt="التوقيع" class="sig-img" />
                ` : ''}
                ${data.includeStamp && data.lawyerStamp ? `
                  <img src="${data.lawyerStamp}" alt="الختم" class="stamp-img" />
                ` : ''}
              </td>
              <td class="officer-col">
                <div class="sig-title" style="direction: rtl; text-align: left;">توقيع مامور التنفيذ</div>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for fonts & images inside the iframe
    if (iframeDoc.fonts && iframeDoc.fonts.ready) {
      await iframeDoc.fonts.ready;
    }

    // Give images in iframe a moment to render
    const images = iframeDoc.querySelectorAll('img');
    if (images.length > 0) {
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          });
        })
      );
    }

    // Slight delay for font layout engine
    await new Promise((resolve) => setTimeout(resolve, 80));

    const targetElement = iframeDoc.getElementById('capture-target') || iframeDoc.body;

    const canvas = await html2canvas(targetElement, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // Strip any unexpected external stylesheets in the clone
        const styles = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
        styles.forEach((el) => {
          if (!el.getAttribute('href')?.includes('fonts.googleapis.com')) {
            el.remove();
          }
        });
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
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

    const safeFilename = `طلب_تنفيذي_${caseNum}_${caseYear}.pdf`;
    const pdfBlob = pdf.output('blob');
    downloadBlob(pdfBlob, safeFilename);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    // In case of any browser canvas security limitation, fallback to printing
    alert('تعذر إنشاء الـ PDF تلقائياً عبر المتصفح، جاري تحويلك لخيار الطباعة لحفظ الملف كـ PDF...');
    window.print();
  } finally {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }
}
