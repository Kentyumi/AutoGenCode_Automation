import { Page } from 'playwright';
import { LocatorCandidate } from '../models/LocatorCandidate';
import { scoreCandidate } from './scoreCandidate';

export async function rankCandidates(
  page: Page,
  candidates: LocatorCandidate[]
): Promise<LocatorCandidate[]> {

  for (const c of candidates) {
    await scoreCandidate(page, c);
  }

  return candidates
    .filter(c => c.score !== undefined)
    .sort((a, b) => (b.score! - a.score!));
}
