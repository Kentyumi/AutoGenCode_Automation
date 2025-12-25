import { LocatorCandidate } from './LocatorCandidate';

export interface ResolvedLocator {
  targetName: string;
  chosen: LocatorCandidate;
  fallbacks: LocatorCandidate[];
}
