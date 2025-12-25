import { Page } from '@playwright/test';
import { LocatorCandidate } from '../models/LocatorCandidate';
import { genByDataAttr } from '../generator/strategies/dataAttr';
import { genByAria } from '../generator/strategies/aria';
import { genByText } from '../generator/strategies/text';
import { genByRole } from '../generator/strategies/role';
import { genByCss } from '../generator/strategies/css';

export async function generateCandidates(
  page: Page,
  targetName: string
): Promise<LocatorCandidate[]> {
  const candidates: LocatorCandidate[] = [];

  candidates.push(...await genByDataAttr(page, targetName));
  candidates.push(...await genByAria(page, targetName));
  candidates.push(...await genByRole(page, targetName));
  candidates.push(...await genByText(page, targetName));
  candidates.push(...await genByCss(page, targetName));

  // remove duplicate selectors
  return dedupe(candidates);
}

function dedupe(list: LocatorCandidate[]): LocatorCandidate[] {
  const map = new Map<string, LocatorCandidate>();
  list.forEach(l => map.set(l.selector, l));
  return Array.from(map.values());
}
