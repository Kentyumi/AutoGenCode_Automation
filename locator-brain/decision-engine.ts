// locator-brain/decision-engine.ts
import type { LocatorCandidate, LocatorDecision, ActionType } from './types'

/**
 * Convert string to simple 26-dim vector (a-z frequency)
 */
function stringToVector(s: string): number[] {
  const vec = Array(26).fill(0)
  for (const c of s.toLowerCase()) {
    const code = c.charCodeAt(0)
    if (code >= 97 && code <= 122) vec[code - 97] += 1
  }
  return vec
}

/**
 * Cosine similarity between two vectors
 */
function cosineSim(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dot / (magA * magB + 1e-6)
}

/**
 * Base heuristic score by strategy
 */
function strategyScore(strategy: string): number {
  switch (strategy) {
    case 'id': return 50
    case 'data-testid': return 40
    case 'name': return 30
    case 'placeholder': return 20
    case 'aria-label': return 20
    case 'class': return 10
    case 'text': return 5
    case 'xpath': return 1
    default: return 0
  }
}

/**
 * Decide best locator from candidates using action-aware scoring
 */
export function decideLocator(
  logicalName: string,
  candidates: LocatorCandidate[],
  action?: ActionType
): LocatorDecision {

  const logicalVec = stringToVector(logicalName)

  const scored = candidates.map(candidate => {
    let score = strategyScore(candidate.strategy)
    score += cosineSim(logicalVec, stringToVector(candidate.value)) * 50

    // action-aware adjustment: prefer id/class for click, input name for type
    if (action === 'click' && ['id', 'class', 'text'].includes(candidate.strategy)) score += 5
    if (action === 'type' && ['id', 'name', 'placeholder'].includes(candidate.strategy)) score += 5

    return { ...candidate, score }
  })

  const sorted = scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  return {
    target: logicalName,
    chosen: sorted[0],
    alternatives: sorted.slice(1),
    action
  }
}
