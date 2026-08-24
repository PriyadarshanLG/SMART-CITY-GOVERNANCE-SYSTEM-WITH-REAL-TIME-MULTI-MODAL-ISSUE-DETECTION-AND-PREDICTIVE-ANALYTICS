import axios from 'axios';
import { env } from '../config/env.js';

export interface ComplaintClassificationInput {
  title: string;
  description: string;
}

const keywordMap: Array<[string, { category: string; department: string; priority: 'High' | 'Medium' | 'Low' }]> = [
  ['road', { category: 'Road Damage', department: 'Public Works Department', priority: 'Medium' }],
  ['garbage', { category: 'Garbage', department: 'Sanitation Department', priority: 'Medium' }],
  ['water leakage', { category: 'Water Leakage', department: 'Water Supply Department', priority: 'High' }],
  ['drainage', { category: 'Drainage', department: 'Drainage Department', priority: 'High' }],
  ['street light', { category: 'Street Light', department: 'Electricity Department', priority: 'Low' }],
  ['electricity', { category: 'Electricity', department: 'Electricity Department', priority: 'High' }],
  ['traffic signal', { category: 'Traffic Signal', department: 'Traffic Police', priority: 'High' }],
  ['sewage', { category: 'Sewage', department: 'Drainage Department', priority: 'High' }],
  ['park', { category: 'Park Maintenance', department: 'Parks Department', priority: 'Low' }],
  ['animal', { category: 'Animal Control', department: 'Veterinary Department', priority: 'Medium' }],
];

export async function classifyComplaint(input: ComplaintClassificationInput) {
  try {
    const response = await axios.post(`${env.ML_API_URL}/predict`, input, {
      timeout: 10000,
    });

    return response.data as {
      category: string;
      department: string;
      priority: 'High' | 'Medium' | 'Low';
    };
  } catch {
    const text = `${input.title} ${input.description}`.toLowerCase();
    const matched = keywordMap.find(([keyword]) => text.includes(keyword));

    if (matched) {
      return matched[1];
    }

    return {
      category: 'Public Property Damage',
      department: 'Municipal Engineering',
      priority: 'Medium',
    };
  }
}
