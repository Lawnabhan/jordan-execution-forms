import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun
} from 'docx';
import { saveAs } from 'file-saver';
import { ExecutionMotionData, ExecutionTemplate } from '../types';

// Convert base64 Data URL to Uint8Array buffer
function dataUrlToUint8Array(dataUrl: string): Uint8Array | null {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    const raw = atob(parts[1]);
    const u8 = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      u8[i] = raw.charCodeAt(i);
    }
    return u8;
  } catch (e) {
    console.error('Failed to convert image to buffer:', e);
    return null;
  }
}

export async function exportMotionToDocx(
  data: ExecutionMotionData,
  template?: ExecutionTemplate
): Promise<void> {
  const caseYear = data.executionCaseYear || new Date().getFullYear();
  const caseNum = data.executionCaseNumber || '........';
  const caseRef = `${caseNum}/ ${caseYear}`;

  const isFemale = data.lawyerGender === 'female';
  const lawyerPrefix = isFemale ? 'المحامية' : 'المحامي';
  const speechVerb = isFemale ? 'قالت' : 'وقال';
  const attendingRole = data.attendingRole || 'وكيل المحكوم له';

  let cleanLawyerName = (data.applicantLawyer || '').trim();
  cleanLawyerName = cleanLawyerName.replace(/^(المحامي|المحامية|الأستاذ|الأستاذة)\s+/g, '');
  if (!cleanLawyerName) {
    cleanLawyerName = '................................';
  }

  const attendanceLine = `حضر ${attendingRole} ${lawyerPrefix} ${cleanLawyerName} ${speechVerb}:`;
  const singleParagraph = (data.directSingleParagraph && data.directSingleParagraph.trim().length > 0)
    ? data.directSingleParagraph
    : data.requests.join(' و ') || 'ألتمس اتخاذ الإجراءات القانونية اللازمة وفقاً لأحكام قانون التنفيذ الأردني وتسطير الكتب اللازمة حسب الأصول.';

  // Prepare signature image buffer if available
  let signatureImageRun: ImageRun | null = null;
  if (data.includeSignature && data.lawyerSignature) {
    const sigBuffer = dataUrlToUint8Array(data.lawyerSignature);
    if (sigBuffer) {
      signatureImageRun = new ImageRun({
        data: sigBuffer,
        transformation: {
          width: 140,
          height: 60,
        },
        type: 'png',
      });
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { 
              cs: 'Traditional Arabic', 
              ascii: 'Traditional Arabic', 
              hAnsi: 'Traditional Arabic' 
            },
            rightToLeft: true,
            language: { bidirectional: 'ar-JO', value: 'ar-JO' },
            size: 32, // 16pt in Arabic
          },
          paragraph: {
            spacing: { line: 360, before: 100, after: 100 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // 1. رقم القضية : الرقم هنا/ السنة هنا (يبدأ من اليمين)
          new Paragraph({
            bidirectional: true,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `رقم القضية : ${caseRef}`,
                bold: true,
                size: 32,
                rightToLeft: true,
              }),
            ],
          }),

          // 2. ما بعد (في منتصف الصفحة)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            spacing: { before: 140, after: 220 },
            children: [
              new TextRun({
                text: 'ما بعد',
                bold: true,
                size: 32,
                rightToLeft: true,
              }),
            ],
          }),

          // 3. حضر وكيل المحكوم له او عليه المحامي / المحامية و قال او قالت:
          new Paragraph({
            bidirectional: true,
            spacing: { before: 120, after: 160 },
            children: [
              new TextRun({
                text: attendanceLine,
                bold: true,
                size: 32,
                rightToLeft: true,
              }),
            ],
          }),

          // 4. (اختياري) وردت مشروحات صادرة .... في حال وجود مرفقات
          ...(data.hasAttachments ? [
            new Paragraph({
              bidirectional: true,
              spacing: { before: 100, after: 150 },
              children: [
                new TextRun({
                  text: data.attachmentsText 
                    ? `وردت مشروحات صادرة ${data.attachmentsText}`
                    : 'وردت مشروحات صادرة ومرفقة طياً مع هذا الطلب.',
                  size: 32,
                  rightToLeft: true,
                }),
              ],
            }),
          ] : []),

          // 5. هنا يوضع الطلب بشكل مباشر بفقرة واحدة
          new Paragraph({
            bidirectional: true,
            spacing: { before: 140, after: 220 },
            children: [
              new TextRun({
                text: singleParagraph,
                size: 32,
                rightToLeft: true,
              }),
            ],
          }),

          // 6. و عليه ترفع الاوراق لرئاسة التنفيذ لاجراء المقتضى القانوني حسب الاصول
          new Paragraph({
            bidirectional: true,
            spacing: { before: 200, after: 160 },
            children: [
              new TextRun({
                text: 'و عليه ترفع الاوراق لرئاسة التنفيذ لاجراء المقتضى القانوني حسب الاصول',
                bold: true,
                size: 32,
                rightToLeft: true,
              }),
            ],
          }),

          // 7. تحريرا بتاريخ : يوضع التاريخ هنا
          new Paragraph({
            bidirectional: true,
            spacing: { before: 160, after: 400 },
            children: [
              new TextRun({
                text: `تحريرا بتاريخ : ${data.motionDate || new Date().toISOString().split('T')[0]}`,
                bold: true,
                size: 32,
                rightToLeft: true,
              }),
            ],
          }),

          // 8. جدول التوقيعات بدون إطار (توقيع الوكيل على اليمين وتوقيع مأمور التنفيذ على اليسار)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            visuallyRightToLeft: true,
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            },
            rows: [
              new TableRow({
                children: [
                  // الخلية اليمنى: توقيع الوكيل
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        bidirectional: true,
                        spacing: { before: 200, after: 80 },
                        children: [
                          new TextRun({
                            text: `توقيع ${attendingRole}`,
                            bold: true,
                            size: 32,
                            rightToLeft: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        bidirectional: true,
                        spacing: { after: 120 },
                        children: [
                          new TextRun({
                            text: `${lawyerPrefix} ${cleanLawyerName}`,
                            bold: true,
                            size: 32,
                            rightToLeft: true,
                          }),
                        ],
                      }),
                      // إدراج صورة التوقيع المرسوم أسفل اسم المحامي مباشرة إذا كان موجوداً
                      ...(signatureImageRun ? [
                        new Paragraph({
                          bidirectional: true,
                          spacing: { before: 80, after: 120 },
                          children: [signatureImageRun],
                        }),
                      ] : []),
                    ],
                  }),

                  // الخلية اليسرى: توقيع مأمور التنفيذ
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        bidirectional: true,
                        spacing: { before: 200, after: 100 },
                        children: [
                          new TextRun({
                            text: 'توقيع مامور التنفيذ',
                            bold: true,
                            size: 32,
                            rightToLeft: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `طلب_تنفيذي_${data.executionCaseNumber || 'جديد'}_${caseYear}.docx`;
  saveAs(blob, safeFilename);
}
