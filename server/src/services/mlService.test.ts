import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyComplaint } from './mlService.js';

test('classifies overflowing garbage with a medium priority', () => {
  const result = classifyComplaint({
    title: 'Overflowing garbage bin',
    description: 'Waste has been lying near the market for two days.',
  });

  assert.equal(result.department, 'Sanitation Department');
  assert.equal(result.priority, 'Medium');
  assert.equal(result.method, 'rule-based');
  assert.match(result.departmentReason, /garbage or waste/);
});

test('classifies an urgent safety issue as high priority', () => {
  const result = classifyComplaint({
    title: 'Dangerous pothole after accident',
    description: 'A collapsed section is putting drivers at immediate danger.',
  });

  assert.equal(result.department, 'Public Safety Department');
  assert.equal(result.priority, 'High');
  assert.match(result.priorityReason, /accident|danger|collapsed/);
});

test('uses a safe, explainable default for ambiguous descriptions', () => {
  const result = classifyComplaint({ description: 'Please look into this issue.' });

  assert.equal(result.department, 'Municipal Corporation');
  assert.equal(result.priority, 'Low');
  assert.match(result.departmentReason, /No department-specific keyword/);
});

test('handles empty input without throwing', () => {
  const result = classifyComplaint({});

  assert.equal(result.category, 'General Civic Issue');
  assert.equal(result.priority, 'Low');
  assert.deepEqual(result.matchedKeywords, []);
});
