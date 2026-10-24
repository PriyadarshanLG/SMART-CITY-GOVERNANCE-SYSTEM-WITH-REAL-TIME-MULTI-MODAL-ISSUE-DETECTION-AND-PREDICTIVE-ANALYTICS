export type ComplaintPriority = 'High' | 'Medium' | 'Low';

export interface ComplaintClassificationInput {
  title?: string;
  description?: string;
}

export interface ComplaintClassification {
  category: string;
  department: string;
  priority: ComplaintPriority;
  departmentReason: string;
  priorityReason: string;
  matchedKeywords: string[];
  method: 'rule-based';
}

interface DepartmentRule {
  department: string;
  category: string;
  keywords: string[];
  reason: string;
}

export const departmentRules: DepartmentRule[] = [
  {
    department: 'Sanitation Department',
    category: 'Garbage',
    keywords: ['garbage', 'waste', 'rubbish', 'litter', 'dump', 'overflowing bin', 'swachh'],
    reason: 'the complaint mentions garbage or waste',
  },
  {
    department: 'Roads and Infrastructure',
    category: 'Road Damage',
    keywords: ['pothole', 'road', 'pavement', 'bridge', 'footpath', 'sidewalk', 'street damage'],
    reason: 'the complaint mentions a road or infrastructure problem',
  },
  {
    department: 'Water Supply Department',
    category: 'Water Supply',
    keywords: ['water', 'pipeline', 'pipe burst', 'leakage', 'no supply', 'tap', 'sewage', 'drainage'],
    reason: 'the complaint mentions water, pipeline, sewage, or drainage',
  },
  {
    department: 'Electricity Department',
    category: 'Electricity',
    keywords: ['electricity', 'power cut', 'power outage', 'street light', 'streetlight', 'transformer', 'wire'],
    reason: 'the complaint mentions electricity or lighting',
  },
  {
    department: 'Public Safety Department',
    category: 'Public Safety',
    keywords: ['traffic signal', 'accident', 'unsafe', 'danger', 'fire', 'crime', 'stray dog', 'emergency'],
    reason: 'the complaint mentions a safety risk or emergency',
  },
];

export const highPriorityKeywords = ['emergency', 'danger', 'accident', 'fire', 'flood', 'injury', 'injured', 'life threatening', 'collapsed', 'sparking'];
export const mediumPriorityKeywords = ['overflowing', 'blocked', 'broken', 'leak', 'leakage', 'outage', 'pothole', 'open manhole', 'unsafe'];

function findMatches(text: string, keywords: string[]): string[] {
  return keywords.filter((keyword) => text.includes(keyword));
}

export function classifyComplaint(input: ComplaintClassificationInput): ComplaintClassification {
  const text = `${input.title || ''} ${input.description || ''}`.trim().toLowerCase();
  const rankedRules = departmentRules
    .map((rule, index) => ({ rule, index, matches: findMatches(text, rule.keywords) }))
    .filter(({ matches }) => matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length || a.index - b.index);
  const selected = rankedRules[0];
  const matchedKeywords = selected?.matches || [];

  const highMatches = findMatches(text, highPriorityKeywords);
  const mediumMatches = findMatches(text, mediumPriorityKeywords);
  const priority: ComplaintPriority = highMatches.length > 0
    ? 'High'
    : mediumMatches.length > 0
      ? 'Medium'
      : 'Low';

  return {
    category: selected?.rule.category || 'General Civic Issue',
    department: selected?.rule.department || 'Municipal Corporation',
    priority,
    departmentReason: selected
      ? `Suggested ${selected.rule.department} because ${selected.rule.reason}.`
      : 'No department-specific keyword was found, so the complaint is routed to Municipal Corporation for review.',
    priorityReason: highMatches.length > 0
      ? `Suggested High priority because it mentions ${highMatches.join(', ')}.`
      : mediumMatches.length > 0
        ? `Suggested Medium priority because it mentions ${mediumMatches.join(', ')}.`
        : 'Suggested Low priority because no urgent or elevated-severity indicator was found.',
    matchedKeywords,
    method: 'rule-based',
  };
}
