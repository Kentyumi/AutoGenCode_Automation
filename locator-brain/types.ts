// locator-brain/types.ts

/** Represents a DOM element scanned from page */
export interface DomElementInfo {
  tag: string;
  id?: string;
  name?: string;
  className?: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  attributes: Record<string, string>;
}

/** Represents a locator candidate for an element */
export interface LocatorCandidate {
  strategy: string; // e.g., 'id', 'name', 'data-testid', 'placeholder', 'class', 'text', 'xpath'
  value: string;
  score?: number; // optional, for ranking in decideLocator
}

/** Represents the decision for an element locator */
export interface LocatorDecision {
  target: string; // logical name
  chosen: LocatorCandidate; // the selected locator
  alternatives: LocatorCandidate[]; // remaining candidates
}

export interface LocatorMeta {
  logicalName: string;
  locator: string;
  strategy: string;
  score: number;
  strength: 'STRONG' | 'OK' | 'WEAK';
}
