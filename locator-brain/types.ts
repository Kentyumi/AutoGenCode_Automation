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
  type?: string; // input type, e.g., text, submit
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
  action?: ActionType; // optional, action type for this decision
}

/** Metadata for logging and codegen */
export interface LocatorMeta {
  logicalName: string;
  locator: string;
  strategy: string;
  score: number;
  strength: 'STRONG' | 'OK' | 'WEAK';
}

/** Action type for smart locator logic */
export type ActionType = 'type' | 'click' | 'assert';
