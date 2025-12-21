// locator-brain/decision-engine.ts
import { LocatorCandidate, LocatorDecision } from './types';

/**
 * Convert string to simple 26-dim vector (a-z frequency)
 */
function stringToVector(s: string): number[] {
  const vec = Array(26).fill(0);
  for (let c of s.toLowerCase()) {
    const code = c.charCodeAt(0);
    if (code >= 97 && code <= 122) vec[code - 97] += 1;
  }
  return vec;
}

/**
 * Cosine similarity between two vectors
 */
function cosineSim(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB + 1e-6);
}

/**
 * decideLocator selects the best locator among candidates using simple AI-free scoring
 */
export function decideLocator(
  logicalName: string,
  candidates: LocatorCandidate[]
): LocatorDecision {

  const logicalVec = stringToVector(logicalName);

  const scored = candidates.map(candidate => {
    // base heuristic score by strategy
    let score = 0;
    switch (candidate.strategy) {
      case 'id': score += 50; break;
      case 'data-testid': score += 40; break;
      case 'name': score += 30; break;
      case 'placeholder': score += 20; break;
      case 'aria-label': score += 20; break;
      case 'class': score += 10; break;
      case 'text': score += 5; break;
      case 'xpath': score += 1; break;
    }

    // AI-free semantic similarity bonus
    score += cosineSim(logicalVec, stringToVector(candidate.value)) * 50; // scale to match heuristic

    return { ...candidate, score };
  });

  const sorted = scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return {
    target: logicalName,
    chosen: sorted[0],
    alternatives: sorted.slice(1)
  };
}
