export type LocatorStrategy =
  | 'data-attr'
  | 'aria'
  | 'role'
  | 'text'
  | 'css'
  | 'xpath';

  // locator-brain/models/LocatorCandidate.ts
export interface LocatorCandidate {
  strategy: LocatorStrategy;
  selector: string;

  // metadata
  tagName?: string;
  text?: string;
  attributes?: Record<string, string>;

  // runtime info
  matchCount?: number;
  score?: number;
}
