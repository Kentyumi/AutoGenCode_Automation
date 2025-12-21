// locator-brain/candidate-generator.ts
// Generate possible locators from DOM element info

export interface DomElementInfo {
  id?: string;
  name?: string;
  text?: string;
  attributes: Record<string, string>;
}

export interface LocatorCandidate {
  strategy: string;
  value: string;
}

export function generateCandidates(element: DomElementInfo): LocatorCandidate[] {
  const candidates: LocatorCandidate[] = [];

  if (element.attributes['data-testid']) {
    candidates.push({
      strategy: 'data-testid',
      value: `[data-testid="${element.attributes['data-testid']}"]`,
    });
  }

  if (element.id) {
    candidates.push({
      strategy: 'id',
      value: `#${element.id}`,
    });
  }

  if (element.name) {
    candidates.push({
      strategy: 'name',
      value: `[name="${element.name}"]`,
    });
  }

  if (element.text) {
    candidates.push({
      strategy: 'text',
      value: element.text,
    });
  }

  return candidates;
}
