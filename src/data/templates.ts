import { ExecutionTemplate, TemplateCategoryId } from '../types';
import { TEMPLATES_PART_1 } from './templatesPart1';
import { TEMPLATES_PART_2 } from './templatesPart2';
import { TEMPLATES_PART_3 } from './templatesPart3';

export const ALL_EXECUTION_TEMPLATES: ExecutionTemplate[] = [
  ...TEMPLATES_PART_1,
  ...TEMPLATES_PART_2,
  ...TEMPLATES_PART_3,
];

export function getTemplateById(id: number): ExecutionTemplate | undefined {
  return ALL_EXECUTION_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategoryId | 'all'): ExecutionTemplate[] {
  if (category === 'all') return ALL_EXECUTION_TEMPLATES;
  return ALL_EXECUTION_TEMPLATES.filter((t) => t.category === category);
}

export function searchTemplates(query: string, category: TemplateCategoryId | 'all' = 'all'): ExecutionTemplate[] {
  const normalized = query.trim().toLowerCase();
  const baseList = category === 'all' ? ALL_EXECUTION_TEMPLATES : getTemplatesByCategory(category);
  
  if (!normalized) return baseList;

  return baseList.filter((t) => {
    const inTitle = t.title.toLowerCase().includes(normalized);
    const inDesc = t.description.toLowerCase().includes(normalized);
    const inTags = t.tags.some((tag) => tag.toLowerCase().includes(normalized));
    const inSubject = t.defaultSubject.toLowerCase().includes(normalized);
    const inLegal = t.legalBasis.toLowerCase().includes(normalized);
    const inId = t.id.toString() === normalized;
    return inTitle || inDesc || inTags || inSubject || inLegal || inId;
  });
}
