export interface CourtInfo {
  id: string;
  name: string;
  governorate: string;
  judgeTitle: string;
}

export type TemplateCategoryId = 
  | 'seizure' // الحجز والتحفظ
  | 'auction_sale' // البيع والمزادات والإحالة
  | 'detention_settlement' // الحبس والإفراج والتسوية
  | 'eviction_possession' // الإخلاء ووضع اليد
  | 'notifications' // التبليغات والنشر
  | 'expertise' // الخبرة والتقدير
  | 'appeals_objections' // الطعون والاستئناف والاعتراضات
  | 'release_cancel' // كف الطلب ورفع الإشارات
  | 'financial_accounts' // الحسابات والمالية والبنوك
  | 'procedural_motions'; // المطالعات والإجراءات التنفيذية

export interface TemplateCategory {
  id: TemplateCategoryId;
  name: string;
  description: string;
  iconName: string;
  badgeColor: string;
  count: number;
}

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  required?: boolean;
  helpText?: string;
}

export interface ExecutionTemplate {
  id: number;
  slug: string;
  title: string;
  category: TemplateCategoryId;
  categoryName: string;
  description: string;
  legalBasis: string;
  defaultSubject: string;
  defaultApplicantRole: 'المحكوم له' | 'المحكوم عليه' | 'الكفيل' | 'المزاود الأخير' | 'الغير';
  defaultRespondentRole: 'المحكوم عليه' | 'المحكوم له' | 'الكفيل' | 'الخبير';
  defaultFacts: string[];
  defaultRequests: string[];
  customFields?: CustomFieldDefinition[];
  tags: string[];
}

export interface ExecutionMotionData {
  courtId: string;
  courtName: string;
  customCourtName?: string;
  executionCaseNumber: string; // e.g. '4521'
  executionCaseYear: string;   // e.g. '2026'
  
  applicantName: string;      // المحكوم له
  applicantCapacity: string;  // المحكوم له، المزاود، إلخ
  applicantLawyer: string;    // اسم المحامي الوكيل
  
  respondentName: string;     // المحكوم عليه
  respondentCapacity: string; // المحكوم عليه، الكفيل، إلخ
  respondentLawyer?: string;
  
  guarantorName?: string;     // الكفيل
  
  attendingRole: 'وكيل المحكوم له' | 'وكيل المحكوم عليه' | 'المحكوم له بالذات' | 'المحكوم عليه بالذات' | 'وكيل الكفيل';
  lawyerGender?: 'male' | 'female'; // المحامي / المحامية - وقال / وقالت
  hasAttachments?: boolean; // هل يوجد مرفقات/مشروحات
  attachmentsText?: string; // مشروحات صادرة ...
  directSingleParagraph?: string; // نص الطلب المباشر بفقرة واحدة
  
  motionDate: string;
  subject: string;
  legalBasis: string;
  
  facts: string[];
  requests: string[];
  
  customFieldValues: Record<string, string>;
  
  lawyerSignature: string; // Data URL / Base64
  lawyerStamp: string; // Data URL / Base64
  includeStamp: boolean;
  includeSignature: boolean;
  notes?: string;
}

export interface SavedMotionRecord {
  id: string;
  templateId: number;
  templateTitle: string;
  category: TemplateCategoryId;
  createdAt: string;
  updatedAt: string;
  data: ExecutionMotionData;
}

export interface LawyerProfile {
  name: string;
  title: string;
  barNumber: string; // رقم التسجيل بالنقابة
  phone: string;
  email: string;
  officeAddress: string;
  defaultCourtId: string;
  signatureDataUrl?: string;
  stampDataUrl?: string;
}
