// locator-brain/candidate-generator.ts
// Generate possible locators from DOM element info

import { DomElementInfo, LocatorCandidate } from './types';

/**
 * Generate multiple locator candidates from a DOM element
 */
export function generateCandidates(element: DomElementInfo): LocatorCandidate[] {
  const candidates: LocatorCandidate[] = [];

  if (element.id) {
    candidates.push({
      strategy: 'id',
      value: `#${element.id}`
    });
  }

  if (element.attributes['data-testid']) {
    candidates.push({
      strategy: 'data-testid',
      value: `[data-testid="${element.attributes['data-testid']}"]`
    });
  }

  if (element.name) {
    candidates.push({
      strategy: 'name',
      value: `[name="${element.name}"]`
    });
  }

  if (element.placeholder) {
    candidates.push({
      strategy: 'placeholder',
      value: `[placeholder="${element.placeholder}"]`
    });
  }

  if (element.ariaLabel) {
    candidates.push({
      strategy: 'aria-label',
      value: `[aria-label="${element.ariaLabel}"]`
    });
  }

  if (element.className) {
    const classes = element.className.split(' ').filter(c => c);
    if (classes.length) {
      candidates.push({
        strategy: 'class',
        value: `.${classes.join('.')}`
      });
    }
  }

  if (element.text) {
    candidates.push({
      strategy: 'text',
      value: element.text
    });
  }

  // Optional: generate XPath heuristic
  const tag = element.tag;
  const idPart = element.id ? `[@id='${element.id}']` : '';
  candidates.push({
    strategy: 'xpath',
    value: `//${tag}${idPart}`
  });

  return candidates;
}