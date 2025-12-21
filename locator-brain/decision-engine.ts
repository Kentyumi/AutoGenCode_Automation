// locator-brain/decision-engine.ts
// Decide the best locator from candidates using simple scoring

import { LocatorCandidate } from './candidate-generator';

export interface LocatorDecision {
  target: string;
  chosen: LocatorCandidate;
  alternatives: LocatorCandidate[];
}

/** Simple scoring: id > data-testid > name > text */
export function score(candidate: LocatorCandidate): number {
  switch (candidate.strategy) {
    case 'id': return 100;
    case 'data-testid': return 90;
    case 'name': return 70;
    case 'text': return 50;
    default: return 10;
  }
}

export function decideLocator(target: string, candidates: LocatorCandidate[]): LocatorDecision {
  const scored = candidates.map(c => ({ ...c, score: score(c) }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return {
    target,
    chosen: scored[0],
    alternatives: scored.slice(1),
  };
}
