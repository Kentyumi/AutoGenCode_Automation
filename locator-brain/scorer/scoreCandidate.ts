import { Page } from 'playwright';
import { LocatorCandidate } from '../models/LocatorCandidate';

export async function scoreCandidate(
  page: Page,
  candidate: LocatorCandidate
): Promise<number> {

  const uniqueScore = await scoreUniqueness(page, candidate);
  const stabilityScore = scoreStability(candidate);
  const readabilityScore = scoreReadability(candidate);

  const total =
    uniqueScore * 0.5 +
    stabilityScore * 0.3 +
    readabilityScore * 0.2;

  candidate.score = Number(total.toFixed(3));
  return candidate.score;
}

/* ---------- sub scorers ---------- */

async function scoreUniqueness(page: Page, c: LocatorCandidate): Promise<number> {
  if (!c.selector) return 0;

  const count = await page.locator(normalizeSelector(c)).count();
  c.matchCount = count;

  if (count === 1) return 1;
  if (count <= 3) return 0.6;
  return 0;
}

function scoreStability(c: LocatorCandidate): number {
  if (!c.selector) return 0;

  if (c.strategy === 'data-attr') return 1;
  if (c.strategy === 'aria' || c.strategy === 'role') return 0.9;
  if (c.strategy === 'text') return 0.6;
  if (c.strategy === 'css') return 0.4;

  return 0.2;
}

function scoreReadability(c: LocatorCandidate): number {
  const len = c.selector.length;

  if (len < 30) return 1;
  if (len < 60) return 0.7;
  if (len < 100) return 0.4;
  return 0.2;
}

function normalizeSelector(c: LocatorCandidate): string {
  if (c.strategy === 'role') {
    // role locator handled specially later
    return '*';
  }
  return c.selector;
}
